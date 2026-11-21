import { screen, fireEvent, waitFor } from '@testing-library/react'
import Carrito from '../../pages/Carrito.jsx'
import Checkout from '../../pages/Checkout.jsx'
import {
  crearBoleta,
  crearProducto,
  crearSesion,
  escribir,
  renderConRouter,
  simularApi,
  usuarioCliente, esperarValor } from '../ayudantes.jsx'

const items = [crearProducto({ id: 1, precio: 10000, cantidad: 2 })]

describe('Página Carrito', () => {
  function renderCarrito(props = {}) {
    const onCambiarCupon = jasmine.createSpy('onCambiarCupon')
    renderConRouter(
      <Carrito items={items} usuario={null} cupon={null} onCambiarCupon={onCambiarCupon}
        onCambiarCantidad={() => {}} onQuitar={() => {}} {...props} />,
      { ruta: '/carrito' },
    )
    return { onCambiarCupon }
  }

  it('aplica un cupón válido y rechaza uno inválido', () => {
    const { onCambiarCupon } = renderCarrito()

    escribir(screen.getByPlaceholderText('Ingresa tu cupón'), 'gamer15')
    fireEvent.click(screen.getByText('Aplicar'))
    expect(onCambiarCupon).toHaveBeenCalledWith({ codigo: 'GAMER15', porcentaje: 15 })

    escribir(screen.getByPlaceholderText('Ingresa tu cupón'), 'falso')
    fireEvent.click(screen.getByText('Aplicar'))
    expect(screen.getByText('Cupón inválido o expirado.')).toBeTruthy()
  })

  it('muestra el total con el descuento Duoc y el cupón', () => {
    renderCarrito({ usuario: { ...usuarioCliente, correo: 'alumno@duoc.cl' }, cupon: { codigo: 'LEVELUP10', porcentaje: 10 } })
    expect(screen.getByTestId('total').textContent).toContain('14.000')
  })

  it('"Ir a pagar" lleva al checkout y avisa que hay que iniciar sesión', () => {
    renderCarrito()
    expect(screen.getByText(/Para pagar necesitas/)).toBeTruthy()
    fireEvent.click(screen.getByText('Ir a pagar'))
    expect(screen.getByTestId('ubicacion').textContent).toBe('/checkout')
  })

  it('con el carrito vacío no deja pagar', () => {
    renderCarrito({ items: [] })
    expect(screen.getByText(/Tu carrito está vacío/)).toBeTruthy()
    expect(screen.getByText('Ir a pagar').disabled).toBeTrue()
  })
})

describe('Página Checkout', () => {
  const sesion = () => crearSesion({ usuario: usuarioCliente })

  function llenarTarjeta({ numero = '4242 4242 4242 4242', vencimiento = '12/30', cvv = '123' } = {}) {
    escribir(screen.getByLabelText('Número de tarjeta *'), numero)
    escribir(screen.getByLabelText('Titular de la tarjeta *'), 'Camila Pérez')
    escribir(screen.getByLabelText('Vencimiento (MM/AA) *'), vencimiento)
    escribir(screen.getByLabelText('CVV *'), cvv)
  }

  it('precarga los datos del cliente y valida la tarjeta y el vencimiento', () => {
    const fetch = simularApi({})
    renderConRouter(<Checkout items={items} cupon={null} onCompraPagada={() => {}} />, { sesion: sesion() })

    expect(screen.getByLabelText('Nombre completo *').value).toBe('Camila Pérez')
    expect(screen.getByLabelText('Dirección *').value).toBe('Av. España 8')

    llenarTarjeta({ numero: '1234', vencimiento: '01/20', cvv: '12' })
    fireEvent.click(screen.getByText(/^Pagar/))

    expect(screen.getByLabelText('Número de tarjeta *').classList).toContain('is-invalid')
    expect(screen.getByLabelText('Vencimiento (MM/AA) *').classList).toContain('is-invalid')
    expect(screen.getByLabelText('CVV *').classList).toContain('is-invalid')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('pago aprobado: envía solo los últimos 4 dígitos, vacía el carrito y va a compra exitosa', async () => {
    let enviado
    simularApi({ 'POST /boletas': (cuerpo) => { enviado = cuerpo; return [201, crearBoleta({ id: 15 })] } })
    const onCompraPagada = jasmine.createSpy('onCompraPagada')
    renderConRouter(<Checkout items={items} cupon={{ codigo: 'LEVELUP10', porcentaje: 10 }} onCompraPagada={onCompraPagada} />,
      { ruta: '/checkout', sesion: sesion() })

    llenarTarjeta()
    fireEvent.click(screen.getByText(/^Pagar/))

    await esperarValor(() => screen.getByTestId('ubicacion').textContent, '/compra-exitosa/15')
    expect(onCompraPagada).toHaveBeenCalled()
    expect(enviado.ultimosDigitosTarjeta).toBe('4242')
    expect(JSON.stringify(enviado)).not.toContain('4242 4242')
    expect(enviado.cupon).toBe('LEVELUP10')
    expect(enviado.items).toEqual([{ productoId: 1, cantidad: 2 }])
  })

  it('pago rechazado: mantiene el carrito y va a compra fallida', async () => {
    simularApi({ 'POST /boletas': () => [201, crearBoleta({ id: 16, estado: 'RECHAZADA', motivoRechazo: 'Rechazado' })] })
    const onCompraPagada = jasmine.createSpy('onCompraPagada')
    renderConRouter(<Checkout items={items} cupon={null} onCompraPagada={onCompraPagada} />, { ruta: '/checkout', sesion: sesion() })

    llenarTarjeta({ numero: '4242424242420000' })
    fireEvent.click(screen.getByText(/^Pagar/))

    await esperarValor(() => screen.getByTestId('ubicacion').textContent, '/compra-fallida/16')
    expect(onCompraPagada).not.toHaveBeenCalled()
  })

  it('si no hay stock (409) muestra la alerta y se queda en el checkout', async () => {
    simularApi({ 'POST /boletas': () => [409, { mensaje: 'Stock insuficiente para Control Inalámbrico: quedan 1 unidades' }] })
    renderConRouter(<Checkout items={items} cupon={null} onCompraPagada={() => {}} />, { ruta: '/checkout', sesion: sesion() })

    llenarTarjeta()
    fireEvent.click(screen.getByText(/^Pagar/))

    expect(await screen.findByText(/Stock insuficiente/)).toBeTruthy()
    expect(screen.getByTestId('ubicacion').textContent).toBe('/checkout')
  })

  it('al reintentar recupera los datos de despacho y con el carrito vacío avisa', () => {
    const { unmount } = renderConRouter(<Checkout items={items} cupon={null} onCompraPagada={() => {}} />, {
      sesion: sesion(),
      estado: { datos: { direccion: 'Calle Reintento 9', metodoPago: 'Débito' } },
    })
    expect(screen.getByLabelText('Dirección *').value).toBe('Calle Reintento 9')
    expect(screen.getByLabelText('Método de pago *').value).toBe('Débito')
    unmount()

    renderConRouter(<Checkout items={[]} cupon={null} onCompraPagada={() => {}} />, { sesion: sesion() })
    expect(screen.getByText(/Tu carrito está vacío/)).toBeTruthy()
  })
})
