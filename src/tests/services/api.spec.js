import {
  alExpirarSesion,
  authApi,
  boletasApi,
  ErrorApi,
  guardarTokens,
  limpiarTokens,
  obtenerAccessToken,
  obtenerRefreshToken,
  peticion,
  productosApi,
} from '../../services/api.js'
import { respuesta, simularApi } from '../ayudantes.jsx'

const tokens = (acceso, refresh) => ({ accessToken: acceso, refreshToken: refresh, expiraEnSegundos: 900 })

describe('Cliente de la API (api.js)', () => {
  afterEach(() => {
    limpiarTokens()
    alExpirarSesion(() => {})
    localStorage.clear()
  })

  it('agrega el header Authorization: Bearer con el token de acceso', async () => {
    guardarTokens(tokens('acceso-1', 'refresh-1'))
    const fetch = simularApi({ 'GET /boletas/mias': [] })

    await boletasApi.mias()

    const [url, opciones] = fetch.calls.mostRecent().args
    expect(url).toContain('/boletas/mias')
    expect(opciones.headers.Authorization).toBe('Bearer acceso-1')
    expect(opciones.headers['Content-Type']).toBe('application/json')
  })

  it('las rutas públicas no envían el token', async () => {
    guardarTokens(tokens('acceso-1', 'refresh-1'))
    const fetch = simularApi({ 'GET /productos': [] })

    await productosApi.listar()

    expect(fetch.calls.mostRecent().args[1].headers.Authorization).toBeUndefined()
  })

  it('el login guarda el refresh en localStorage y el acceso solo en memoria', async () => {
    simularApi({ 'POST /auth/login': () => [200, { ...tokens('acceso-A', 'refresh-A'), usuario: { nombre: 'Ana' } }] })

    const datos = await authApi.login('ana@gmail.com', 'clave1')

    expect(datos.usuario.nombre).toBe('Ana')
    expect(obtenerAccessToken()).toBe('acceso-A')
    expect(obtenerRefreshToken()).toBe('refresh-A')
    expect(Object.values(localStorage)).not.toContain('acceso-A')
  })

  it('ante un 401 renueva el token una vez y reintenta la petición', async () => {
    guardarTokens(tokens('vencido', 'refresh-1'))
    let intentos = 0
    const fetch = simularApi({
      'GET /auth/me': (cuerpo, opciones) => {
        intentos++
        return opciones.headers.Authorization === 'Bearer nuevo' ? [200, { correo: 'ana@gmail.com' }] : [401, {}]
      },
      'POST /auth/refresh': (cuerpo) => {
        expect(cuerpo.refreshToken).toBe('refresh-1')
        return [200, tokens('nuevo', 'refresh-2')]
      },
    })

    const usuario = await authApi.me()

    expect(usuario.correo).toBe('ana@gmail.com')
    expect(intentos).toBe(2)
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(obtenerRefreshToken()).toBe('refresh-2') // rotación
  })

  it('si la renovación falla, cierra la sesión y lanza un 401', async () => {
    guardarTokens(tokens('vencido', 'refresh-malo'))
    const alExpirar = jasmine.createSpy('alExpirar')
    alExpirarSesion(alExpirar)
    simularApi({ 'GET /usuarios': () => [401, {}], 'POST /auth/refresh': () => [401, { mensaje: 'vencido' }] })

    await expectAsync(peticion('/usuarios')).toBeRejectedWith(jasmine.objectContaining({ estado: 401 }))

    expect(alExpirar).toHaveBeenCalled()
    expect(obtenerRefreshToken()).toBeNull()
    expect(obtenerAccessToken()).toBeNull()
  })

  it('un error del backend se convierte en ErrorApi con estado, mensaje y campos', async () => {
    simularApi({
      'POST /auth/registro': () => [400, { mensaje: 'Hay datos inválidos', campos: { correo: 'Correo no válido' } }],
    })

    try {
      await authApi.registro({})
      fail('debía lanzar un error')
    } catch (error) {
      expect(error instanceof ErrorApi).toBeTrue()
      expect(error.estado).toBe(400)
      expect(error.message).toBe('Hay datos inválidos')
      expect(error.campos.correo).toBe('Correo no válido')
    }
  })

  it('si el servidor está apagado lanza un error de conexión', async () => {
    spyOn(window, 'fetch').and.rejectWith(new TypeError('Failed to fetch'))
    await expectAsync(productosApi.listar()).toBeRejectedWith(jasmine.objectContaining({ estado: 0 }))
  })

  it('una respuesta 204 devuelve null y un error sin JSON usa un mensaje genérico', async () => {
    guardarTokens(tokens('a', 'r'))
    spyOn(window, 'fetch').and.returnValues(
      Promise.resolve(respuesta(204)),
      Promise.resolve(new Response('no es json', { status: 500 })),
    )
    expect(await productosApi.eliminar(1)).toBeNull()
    await expectAsync(productosApi.listar()).toBeRejectedWith(jasmine.objectContaining({ estado: 500 }))
  })

  it('programa la renovación automática un minuto antes de que venza el token', async () => {
    jasmine.clock().install()
    try {
      const fetch = simularApi({ 'POST /auth/refresh': () => [200, tokens('renovado', 'refresh-2')] })
      guardarTokens({ accessToken: 'a', refreshToken: 'refresh-1', expiraEnSegundos: 120 })

      jasmine.clock().tick(59000)
      expect(fetch).not.toHaveBeenCalled()
      jasmine.clock().tick(2000)
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch.calls.mostRecent().args[0]).toContain('/auth/refresh')
    } finally {
      jasmine.clock().uninstall()
    }
  })
})
