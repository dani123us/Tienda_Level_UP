import { screen, fireEvent } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import RutaProtegida from '../../components/RutaProtegida.jsx'
import MenuAdmin from '../../components/MenuAdmin.jsx'
import Encabezado from '../../components/Encabezado.jsx'
import { crearSesion, renderConRouter, usuarioAdmin, usuarioCliente, usuarioVendedor } from '../ayudantes.jsx'

function rutas() {
  return (
    <Routes>
      <Route path="/login" element={<p>Pantalla login</p>} />
      <Route path="/acceso-denegado" element={<p>Pantalla acceso denegado</p>} />
      <Route
        path="/admin/usuarios"
        element={
          <RutaProtegida roles={['Administrador']}>
            <p>Gestión de usuarios</p>
          </RutaProtegida>
        }
      />
    </Routes>
  )
}

describe('RutaProtegida', () => {
  it('sin sesión redirige al login', () => {
    renderConRouter(rutas(), { ruta: '/admin/usuarios' })
    expect(screen.getByText('Pantalla login')).toBeTruthy()
    expect(screen.getByTestId('ubicacion').textContent).toBe('/login')
  })

  it('un Vendedor que entra a /admin/usuarios es redirigido a acceso denegado', () => {
    renderConRouter(rutas(), { ruta: '/admin/usuarios', sesion: crearSesion({ usuario: usuarioVendedor }) })
    expect(screen.queryByText('Gestión de usuarios')).toBeNull()
    expect(screen.getByTestId('ubicacion').textContent).toBe('/acceso-denegado')
  })

  it('el Administrador sí entra', () => {
    renderConRouter(rutas(), { ruta: '/admin/usuarios', sesion: crearSesion({ usuario: usuarioAdmin }) })
    expect(screen.getByText('Gestión de usuarios')).toBeTruthy()
  })

  it('mientras se restaura la sesión muestra un spinner en vez de redirigir', () => {
    renderConRouter(rutas(), { ruta: '/admin/usuarios', sesion: crearSesion({ cargando: true }) })
    expect(screen.getByText('Cargando sesión...')).toBeTruthy()
    expect(screen.getByTestId('ubicacion').textContent).toBe('/admin/usuarios')
  })
})

describe('MenuAdmin', () => {
  it('al Vendedor no le aparecen Usuarios ni Categorías', () => {
    renderConRouter(<MenuAdmin />, { sesion: crearSesion({ usuario: usuarioVendedor }) })
    expect(screen.getByText('Productos')).toBeTruthy()
    expect(screen.getByText('Órdenes')).toBeTruthy()
    expect(screen.queryByText('Usuarios')).toBeNull()
    expect(screen.queryByText('Categorías')).toBeNull()
    expect(screen.getByText('PANEL VENDEDOR')).toBeTruthy()
  })

  it('el Administrador ve todas las opciones', () => {
    renderConRouter(<MenuAdmin />, { sesion: crearSesion({ usuario: usuarioAdmin }) })
    ;['Dashboard', 'Productos', 'Órdenes', 'Categorías', 'Usuarios'].forEach((texto) =>
      expect(screen.getByText(texto)).toBeTruthy(),
    )
  })
})

describe('Encabezado', () => {
  it('sin sesión muestra iniciar sesión y registro', () => {
    renderConRouter(<Encabezado cantidadCarrito={2} usuario={null} onCerrarSesion={() => {}} />)
    expect(screen.getByText('Iniciar sesión')).toBeTruthy()
    expect(screen.getByTestId('contador-carrito').textContent).toBe('2')
  })

  it('el Vendedor ve el link a su panel y el Cliente ve Mis compras', () => {
    const { unmount } = renderConRouter(
      <Encabezado cantidadCarrito={0} usuario={usuarioVendedor} onCerrarSesion={() => {}} />,
    )
    expect(screen.getByText('Panel vendedor')).toBeTruthy()
    expect(screen.queryByText('Mis compras')).toBeNull()
    unmount()

    renderConRouter(<Encabezado cantidadCarrito={0} usuario={usuarioCliente} onCerrarSesion={() => {}} />)
    expect(screen.getByText('Mis compras')).toBeTruthy()
    expect(screen.queryByText(/Panel/)).toBeNull()
  })

  it('el botón cerrar sesión llama a la función recibida', () => {
    const onCerrarSesion = jasmine.createSpy('onCerrarSesion')
    renderConRouter(<Encabezado cantidadCarrito={0} usuario={usuarioAdmin} onCerrarSesion={onCerrarSesion} />)
    expect(screen.getByText('Panel admin')).toBeTruthy()
    fireEvent.click(screen.getByText('Cerrar sesión'))
    expect(onCerrarSesion).toHaveBeenCalled()
  })
})
