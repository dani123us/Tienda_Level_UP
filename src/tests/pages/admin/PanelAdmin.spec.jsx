import { screen, fireEvent, waitFor } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import AdminUsuarios from '../../../pages/admin/AdminUsuarios.jsx'
import AdminCategorias from '../../../pages/admin/AdminCategorias.jsx'
import AdminOrdenes from '../../../pages/admin/AdminOrdenes.jsx'
import DetalleOrden from '../../../pages/admin/DetalleOrden.jsx'
import Dashboard from '../../../pages/admin/Dashboard.jsx'
import {
  crearBoleta,
  crearProducto,
  crearSesion,
  escribir,
  renderConRouter,
  simularApi,
  usuarioAdmin,
  usuarioCliente,
  usuarioVendedor, esperarValor } from '../../ayudantes.jsx'

const admin = () => crearSesion({ usuario: usuarioAdmin })

describe('AdminUsuarios', () => {
  it('lista usuarios y crea uno nuevo con POST /usuarios', async () => {
    let enviado
    simularApi({
      'GET /usuarios': [usuarioAdmin, usuarioCliente],
      'POST /usuarios': (cuerpo) => { enviado = cuerpo; return [201, { ...cuerpo, id: 9 }] },
    })
    renderConRouter(<AdminUsuarios />, { sesion: admin() })
    expect(await screen.findByText('camila@gmail.com')).toBeTruthy()
    expect(screen.getByLabelText('Eliminar admin@duoc.cl').disabled).toBeTrue() // no puede eliminarse a sí mismo

    escribir(screen.getByLabelText('RUN * (sin puntos ni guion)'), '98765432')
    fireEvent.change(screen.getByLabelText('Tipo de usuario *'), { target: { value: 'Vendedor' } })
    escribir(screen.getByLabelText('Nombres *'), 'Nuevo')
    escribir(screen.getByLabelText('Apellidos *'), 'Vendedor')
    escribir(screen.getByLabelText('Correo electrónico *'), 'nuevo@duoc.cl')
    escribir(screen.getByLabelText('Contraseña *'), 'clave12')
    fireEvent.change(screen.getByLabelText('Región *'), { target: { value: 'Región Metropolitana' } })
    fireEvent.change(screen.getByLabelText('Comuna *'), { target: { value: 'Santiago' } })
    escribir(screen.getByLabelText('Dirección *'), 'Calle 1')
    fireEvent.click(screen.getByText('CREAR USUARIO'))

    expect(await screen.findByText('Usuario creado exitosamente.')).toBeTruthy()
    expect(enviado).toEqual(jasmine.objectContaining({ correo: 'nuevo@duoc.cl', rol: 'Vendedor', fechaNacimiento: null }))
  })

  it('editar permite dejar la contraseña vacía y usa PUT /usuarios/{id}', async () => {
    let enviado
    simularApi({
      'GET /usuarios': [usuarioAdmin, usuarioCliente],
      'PUT /usuarios/3': (cuerpo) => { enviado = cuerpo; return [200, cuerpo] },
    })
    renderConRouter(<AdminUsuarios />, { sesion: admin() })

    fireEvent.click(await screen.findByLabelText('Editar camila@gmail.com'))
    expect(screen.getByLabelText('Contraseña (opcional)').value).toBe('')
    escribir(screen.getByLabelText('Nombres *'), 'Camila Andrea')
    fireEvent.click(screen.getByText('Guardar cambios'))

    expect(await screen.findByText('Usuario actualizado correctamente.')).toBeTruthy()
    expect(enviado.password).toBe('')
    expect(enviado.nombre).toBe('Camila Andrea')
  })

  it('eliminar muestra el error del backend si el usuario tiene compras', async () => {
    simularApi({
      'GET /usuarios': [usuarioAdmin, usuarioCliente],
      'DELETE /usuarios/3': () => [409, { mensaje: 'No se puede eliminar porque tiene compras' }],
    })
    spyOn(window, 'confirm').and.returnValue(true)
    const onAviso = jasmine.createSpy('onAviso')
    renderConRouter(<AdminUsuarios onAviso={onAviso} />, { sesion: admin() })

    fireEvent.click(await screen.findByLabelText('Eliminar camila@gmail.com'))

    await esperarValor(() => onAviso.calls.any(), true)
    expect(onAviso).toHaveBeenCalledWith({ tipo: 'error', mensaje: 'No se puede eliminar porque tiene compras' })
  })
})

describe('AdminCategorias', () => {
  it('crea, edita y elimina categorías', async () => {
    const llamadas = []
    simularApi({
      'GET /categorias': [{ id: 1, nombre: 'Consolas' }],
      'POST /categorias': (cuerpo) => { llamadas.push(['POST', cuerpo]); return [201, { id: 2, ...cuerpo }] },
      'PUT /categorias/1': (cuerpo) => { llamadas.push(['PUT', cuerpo]); return [200, { id: 1, ...cuerpo }] },
      'DELETE /categorias/1': () => [409, { mensaje: 'Tiene productos asociados' }],
    })
    spyOn(window, 'confirm').and.returnValue(true)
    const onAviso = jasmine.createSpy('onAviso')
    renderConRouter(<AdminCategorias onAviso={onAviso} />, { sesion: admin() })
    expect(await screen.findByText('Consolas')).toBeTruthy()

    fireEvent.click(screen.getByText('Agregar'))
    expect(screen.getByText(/El nombre es obligatorio/)).toBeTruthy()

    escribir(screen.getByPlaceholderText('Ej: Notebooks'), 'Notebooks')
    fireEvent.click(screen.getByText('Agregar'))
    await esperarValor(() => onAviso.calls.count(), 1) // espera a que termine de guardar
    expect(llamadas[0]).toEqual(['POST', { nombre: 'Notebooks' }])

    fireEvent.click(await screen.findByLabelText('Editar Consolas'))
    escribir(screen.getByPlaceholderText('Ej: Notebooks'), 'Consolas Retro')
    fireEvent.click(screen.getByText('Guardar cambios'))
    await esperarValor(() => onAviso.calls.count(), 2)
    expect(llamadas[1]).toEqual(['PUT', { nombre: 'Consolas Retro' }])

    fireEvent.click(await screen.findByLabelText('Eliminar Consolas'))
    await esperarValor(() => onAviso.calls.count(), 3)
    expect(onAviso).toHaveBeenCalledWith({ tipo: 'error', mensaje: 'Tiene productos asociados' })
  })
})

describe('Órdenes (Administrador y Vendedor)', () => {
  it('el Vendedor ve la lista de órdenes y entra al detalle', async () => {
    simularApi({ 'GET /boletas': [crearBoleta(), crearBoleta({ id: 8, estado: 'RECHAZADA' })] })
    renderConRouter(<AdminOrdenes />, { sesion: crearSesion({ usuario: usuarioVendedor }) })

    expect(await screen.findByText('RECHAZADA')).toBeTruthy()
    fireEvent.click(screen.getAllByText('Ver')[0])
    expect(screen.getByTestId('ubicacion').textContent).toBe('/admin/ordenes/7')
  })

  it('el detalle de la orden no ofrece eliminar al Vendedor, pero sí al Administrador', async () => {
    simularApi({ 'GET /boletas/7': crearBoleta(), 'DELETE /boletas/7': () => [204] })
    spyOn(window, 'confirm').and.returnValue(true)
    const ruta = (
      <Routes>
        <Route path="/admin/ordenes/:id" element={<DetalleOrden />} />
        <Route path="/admin/ordenes" element={<p>Lista</p>} />
      </Routes>
    )
    const { unmount } = renderConRouter(ruta, { ruta: '/admin/ordenes/7', sesion: crearSesion({ usuario: usuarioVendedor }) })
    expect(await screen.findByText('Boleta N° 7')).toBeTruthy()
    expect(screen.queryByText('Eliminar boleta')).toBeNull()
    unmount()

    renderConRouter(ruta, { ruta: '/admin/ordenes/7', sesion: admin() })
    fireEvent.click(await screen.findByText('Eliminar boleta'))
    await esperarValor(() => screen.getByTestId('ubicacion').textContent, '/admin/ordenes')
  })

  it('sin órdenes muestra un aviso', async () => {
    simularApi({ 'GET /boletas': [] })
    renderConRouter(<AdminOrdenes />, { sesion: admin() })
    expect(await screen.findByText(/no hay órdenes/)).toBeTruthy()
  })
})

describe('Dashboard', () => {
  const productos = [crearProducto({ id: 1, stock: 1, stockCritico: 3 }), crearProducto({ id: 2, stock: 9 })]

  it('el Administrador ve monto vendido (solo boletas PAGADAS) y usuarios', async () => {
    simularApi({
      'GET /boletas': [crearBoleta({ total: 18000 }), crearBoleta({ id: 8, estado: 'RECHAZADA', total: 50000 })],
      'GET /usuarios': [usuarioAdmin, usuarioCliente],
    })
    renderConRouter(<Dashboard productos={productos} />, { sesion: admin() })

    await esperarValor(() => screen.getByTestId('indicador-Usuarios').textContent, '2')
    expect(screen.getByTestId('indicador-Monto vendido').textContent).toContain('18.000')
    expect(screen.getByTestId('indicador-Órdenes pagadas').textContent).toBe('1')
    expect(screen.getByTestId('indicador-Stock crítico').textContent).toBe('1')
  })

  it('el Vendedor no ve el indicador de usuarios ni llama a /usuarios', async () => {
    const fetch = simularApi({ 'GET /boletas': [] })
    renderConRouter(<Dashboard productos={[]} />, { sesion: crearSesion({ usuario: usuarioVendedor }) })

    expect(await screen.findByText('Todavía no hay órdenes.')).toBeTruthy()
    expect(screen.queryByTestId('indicador-Usuarios')).toBeNull()
    expect(fetch.calls.allArgs().some(([url]) => url.includes('/usuarios'))).toBeFalse()
    expect(screen.getByText('Todos los productos tienen stock suficiente.')).toBeTruthy()
  })
})
