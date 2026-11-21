import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App.jsx'
import { SesionContext } from '../context/SesionContext.jsx'
import { crearProducto, crearSesion, escribir, simularApi, usuarioAdmin, usuarioVendedor, esperarValor } from './ayudantes.jsx'

const productos = [
  crearProducto({ id: 1, nombre: 'PlayStation 5', categoria: 'Consolas', stock: 2 }),
  crearProducto({ id: 2, nombre: 'Polera Gamer', categoria: 'Poleras', destacado: false }),
]

function renderApp(ruta = '/', sesion = crearSesion()) {
  return render(
    <SesionContext.Provider value={sesion}>
      <MemoryRouter initialEntries={[ruta]}>
        <App />
      </MemoryRouter>
    </SesionContext.Provider>,
  )
}

describe('App', () => {
  beforeEach(() => {
    spyOn(window, 'scrollTo')
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('carga el catálogo desde la API y guarda en el carrito solo {id, cantidad}', async () => {
    simularApi({ 'GET /productos': productos })
    renderApp('/productos')

    fireEvent.click((await screen.findAllByText('Añadir al carrito'))[0])

    expect(screen.getByTestId('contador-carrito').textContent).toBe('1')
    expect(JSON.parse(localStorage.getItem('carritoLevelUp'))).toEqual([{ id: 1, cantidad: 1 }])
  })

  it('rehidrata el carrito guardado con los datos frescos del backend', async () => {
    localStorage.setItem('carritoLevelUp', JSON.stringify([{ id: 1, cantidad: 5 }, { id: 99, cantidad: 1 }]))
    simularApi({ 'GET /productos': productos })
    renderApp('/carrito')

    // El producto 99 ya no existe y la cantidad se ajusta al stock actual (2).
    await esperarValor(() => screen.getByTestId('contador-carrito').textContent, '2')
    expect(screen.getByText('PlayStation 5')).toBeTruthy()
  })

  it('no deja agregar más unidades que el stock', async () => {
    simularApi({ 'GET /productos': [crearProducto({ id: 1, stock: 1 })] })
    renderApp('/')

    const boton = (await screen.findAllByText('Añadir al carrito'))[0]
    fireEvent.click(boton)
    fireEvent.click(boton)

    expect(screen.getByTestId('contador-carrito').textContent).toBe('1')
    expect(await screen.findByText(/No hay más stock/)).toBeTruthy()
  })

  it('si el backend no responde muestra el error y permite reintentar', async () => {
    const fetch = spyOn(window, 'fetch').and.rejectWith(new TypeError('Failed to fetch'))
    renderApp('/productos')

    expect(await screen.findByText(/No se pudo conectar con el servidor/)).toBeTruthy()
    fireEvent.click(screen.getByText('Reintentar'))
    await esperarValor(() => fetch.calls.count(), 2)
  })

  it('el Vendedor entra al panel y ve su menú', async () => {
    simularApi({ 'GET /productos': productos, 'GET /boletas': [] })
    renderApp('/admin', crearSesion({ usuario: usuarioVendedor }))

    expect(await screen.findByText('DASHBOARD')).toBeTruthy()
    expect(screen.getByText('PANEL VENDEDOR')).toBeTruthy()
    expect(screen.queryByText('Usuarios')).toBeNull()
  })

  it('el Vendedor no puede entrar a /admin/usuarios', async () => {
    simularApi({ 'GET /productos': productos })
    renderApp('/admin/usuarios', crearSesion({ usuario: usuarioVendedor }))
    expect(await screen.findByText('Acceso denegado')).toBeTruthy()
  })

  it('cerrar sesión vacía el carrito y vuelve al inicio', async () => {
    localStorage.setItem('carritoLevelUp', JSON.stringify([{ id: 1, cantidad: 1 }]))
    simularApi({ 'GET /productos': productos, 'GET /boletas': [], 'GET /usuarios': [] })
    const sesion = crearSesion({ usuario: usuarioAdmin })
    renderApp('/admin', sesion)
    await esperarValor(() => screen.getByTestId('contador-carrito').textContent, '1')

    fireEvent.click(screen.getByText('Cerrar sesión'))

    expect(sesion.cerrarSesion).toHaveBeenCalled()
    await esperarValor(() => screen.getByTestId('contador-carrito').textContent, '0')
    expect(await screen.findByText('Cerraste sesión correctamente.')).toBeTruthy()
  })

  it('el catálogo filtra por categoría y búsqueda', async () => {
    simularApi({ 'GET /productos': productos })
    renderApp('/productos')

    fireEvent.click(await screen.findByRole('button', { name: 'Poleras' }))
    expect(screen.getByText('Mostrando 1 de 2 productos')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Todas' }))
    escribir(screen.getByLabelText('Buscar producto'), 'zzz')
    expect(screen.getByText('No encontramos productos con ese filtro.')).toBeTruthy()
  })

  it('muestra las páginas informativas y el 404', async () => {
    simularApi({ 'GET /productos': productos })
    const paginas = [
      ['/nosotros', 'SOBRE NOSOTROS'],
      ['/blogs', 'NOTICIAS IMPORTANTES'],
      ['/contacto', 'FORMULARIO DE CONTACTO'],
      ['/no-existe', 'GAME OVER: página no encontrada'],
    ]
    for (const [ruta, titulo] of paginas) {
      const { unmount } = renderApp(ruta)
      expect(await screen.findByText(titulo)).toBeTruthy()
      unmount()
    }
  })

  it('en Blogs abre y cierra el detalle de una noticia', async () => {
    simularApi({ 'GET /productos': productos })
    renderApp('/blogs')

    fireEvent.click((await screen.findAllByText('VER CASO'))[0])
    expect(await screen.findByText('Cerrar')).toBeTruthy()
    fireEvent.click(screen.getByText('Cerrar'))
  })

  it('el formulario de contacto valida y confirma el envío', async () => {
    simularApi({ 'GET /productos': productos })
    renderApp('/contacto')

    fireEvent.click(await screen.findByText('ENVIAR MENSAJE'))
    expect(screen.getByLabelText('NOMBRE COMPLETO').classList).toContain('is-invalid')

    escribir(screen.getByLabelText('NOMBRE COMPLETO'), 'Ana')
    escribir(screen.getByLabelText('CORREO'), 'ana@gmail.com')
    escribir(screen.getByLabelText('COMENTARIO / MENSAJE'), 'Hola, ¿tienen PS5?')
    fireEvent.click(screen.getByText('ENVIAR MENSAJE'))
    expect(screen.getByText(/Tu mensaje fue enviado correctamente/)).toBeTruthy()
  })

  it('en el carrito se pueden sumar, restar y quitar productos', async () => {
    localStorage.setItem('carritoLevelUp', JSON.stringify([{ id: 1, cantidad: 1 }, { id: 2, cantidad: 1 }]))
    simularApi({ 'GET /productos': productos })
    renderApp('/carrito')

    fireEvent.click(await screen.findByLabelText('Sumar una unidad de PlayStation 5'))
    expect(screen.getByTestId('contador-carrito').textContent).toBe('3')
    fireEvent.click(screen.getByLabelText('Restar una unidad de PlayStation 5'))
    expect(screen.getByTestId('contador-carrito').textContent).toBe('2')
    fireEvent.click(screen.getAllByText('Quitar')[1])
    expect(screen.getByTestId('contador-carrito').textContent).toBe('1')
  })
})
