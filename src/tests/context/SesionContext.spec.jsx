import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { SesionProvider, useSesion } from '../../context/SesionContext.jsx'
import { limpiarTokens, obtenerAccessToken, obtenerRefreshToken } from '../../services/api.js'
import { simularApi, usuarioCliente, esperarValor } from '../ayudantes.jsx'

function MostrarSesion() {
  const { usuario, cargando, iniciarSesion, cerrarSesion, tieneRol, registrar } = useSesion()
  return (
    <div>
      <p data-testid="estado">{cargando ? 'cargando' : usuario ? usuario.correo : 'sin sesión'}</p>
      <p data-testid="es-cliente">{String(tieneRol('Cliente'))}</p>
      <button onClick={() => iniciarSesion('camila@gmail.com', 'clave1')}>entrar</button>
      <button onClick={() => registrar({ correo: 'nuevo@gmail.com' })}>registrar</button>
      <button onClick={cerrarSesion}>salir</button>
    </div>
  )
}

const tokens = { accessToken: 'acceso', refreshToken: 'refresh-nuevo', expiraEnSegundos: 900 }

describe('SesionContext', () => {
  afterEach(() => {
    limpiarTokens()
    localStorage.clear()
  })

  it('al recargar con un refresh token guardado restaura la sesión', async () => {
    localStorage.setItem('refreshLevelUp', 'refresh-viejo')
    simularApi({ 'POST /auth/refresh': () => [200, tokens], 'GET /auth/me': usuarioCliente })

    render(<SesionProvider><MostrarSesion /></SesionProvider>)

    expect(screen.getByTestId('estado').textContent).toBe('cargando')
    await esperarValor(() => screen.getByTestId('estado').textContent, 'camila@gmail.com')
    expect(screen.getByTestId('es-cliente').textContent).toBe('true')
    expect(obtenerAccessToken()).toBe('acceso')
  })

  it('si el refresh guardado ya no sirve, queda sin sesión y lo borra', async () => {
    localStorage.setItem('refreshLevelUp', 'refresh-vencido')
    simularApi({ 'POST /auth/refresh': () => [401, { mensaje: 'vencido' }] })

    render(<SesionProvider><MostrarSesion /></SesionProvider>)

    await esperarValor(() => screen.getByTestId('estado').textContent, 'sin sesión')
    expect(obtenerRefreshToken()).toBeNull()
  })

  it('iniciarSesion guarda el usuario y cerrarSesion limpia el almacenamiento', async () => {
    simularApi({ 'POST /auth/login': () => [200, { ...tokens, usuario: usuarioCliente }] })
    render(<SesionProvider><MostrarSesion /></SesionProvider>)
    expect(screen.getByTestId('estado').textContent).toBe('sin sesión')

    fireEvent.click(screen.getByText('entrar'))
    await esperarValor(() => screen.getByTestId('estado').textContent, 'camila@gmail.com')
    expect(localStorage.getItem('refreshLevelUp')).toBe('refresh-nuevo')

    fireEvent.click(screen.getByText('salir'))
    expect(screen.getByTestId('estado').textContent).toBe('sin sesión')
    expect(localStorage.getItem('refreshLevelUp')).toBeNull()
    expect(obtenerAccessToken()).toBeNull()
  })

  it('registrar deja al nuevo cliente con la sesión iniciada', async () => {
    simularApi({ 'POST /auth/registro': () => [201, { ...tokens, usuario: { ...usuarioCliente, correo: 'nuevo@gmail.com' } }] })
    render(<SesionProvider><MostrarSesion /></SesionProvider>)

    fireEvent.click(screen.getByText('registrar'))

    await esperarValor(() => screen.getByTestId('estado').textContent, 'nuevo@gmail.com')
  })

  it('si se cierra la sesión en otra pestaña, también se cierra aquí', async () => {
    simularApi({ 'POST /auth/login': () => [200, { ...tokens, usuario: usuarioCliente }] })
    render(<SesionProvider><MostrarSesion /></SesionProvider>)
    fireEvent.click(screen.getByText('entrar'))
    await esperarValor(() => screen.getByTestId('estado').textContent, 'camila@gmail.com')

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'refreshLevelUp', newValue: null }))
    })

    expect(screen.getByTestId('estado').textContent).toBe('sin sesión')
  })

  it('useSesion fuera del proveedor lanza un error claro', () => {
    spyOn(console, 'error')
    expect(() => render(<MostrarSesion />)).toThrowError(/SesionProvider/)
  })
})
