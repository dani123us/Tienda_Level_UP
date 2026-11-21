import { CLAVES, borrarDato } from './almacenamiento.js'

// URL del backend. Se puede cambiar con la variable VITE_API_URL (ver .env.example).
export const API_URL = import.meta.env?.VITE_API_URL ?? 'http://localhost:8080/api/v1'

// El token de acceso vive SOLO en memoria (no en localStorage): al recargar la página se pierde
// a propósito y se pide uno nuevo con el refresh token. Así no queda expuesto en el almacenamiento.
let accessToken = null
let temporizadorRenovacion = null
let renovacionEnCurso = null
let alExpirar = () => {}

/** Error de la API con el formato del ErrorResponse del backend. */
export class ErrorApi extends Error {
  constructor(estado, mensaje, campos = null) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.estado = estado
    this.campos = campos
  }
}

export function obtenerAccessToken() {
  return accessToken
}

export function obtenerRefreshToken() {
  try {
    return localStorage.getItem(CLAVES.refresh)
  } catch {
    return null
  }
}

/** Guarda el par de tokens y programa la renovación automática 1 minuto antes de que venza. */
export function guardarTokens({ accessToken: acceso, refreshToken, expiraEnSegundos }) {
  accessToken = acceso
  try {
    localStorage.setItem(CLAVES.refresh, refreshToken)
  } catch {
    // Sin almacenamiento la sesión solo dura mientras la pestaña esté abierta.
  }
  programarRenovacion(expiraEnSegundos)
}

export function limpiarTokens() {
  accessToken = null
  clearTimeout(temporizadorRenovacion)
  temporizadorRenovacion = null
  borrarDato(CLAVES.refresh)
}

/** Registra qué hacer cuando la sesión expira y no se puede renovar (lo usa SesionContext). */
export function alExpirarSesion(funcion) {
  alExpirar = funcion
}

function programarRenovacion(expiraEnSegundos) {
  clearTimeout(temporizadorRenovacion)
  if (!expiraEnSegundos) return
  const espera = Math.max(expiraEnSegundos - 60, 5) * 1000
  temporizadorRenovacion = setTimeout(() => {
    renovarTokens().catch(() => {
      limpiarTokens()
      alExpirar()
    })
  }, espera)
}

/**
 * Pide un par nuevo de tokens con el refresh token (rotación).
 * Si varias peticiones fallan con 401 al mismo tiempo, se hace una sola renovación.
 */
export function renovarTokens() {
  if (renovacionEnCurso) return renovacionEnCurso
  const refreshToken = obtenerRefreshToken()
  if (!refreshToken) return Promise.reject(new ErrorApi(401, 'No hay una sesión guardada.'))

  renovacionEnCurso = peticion('/auth/refresh', {
    metodo: 'POST',
    cuerpo: { refreshToken },
    autenticado: false,
  })
    .then((datos) => {
      guardarTokens(datos)
      return datos
    })
    .finally(() => {
      renovacionEnCurso = null
    })
  return renovacionEnCurso
}

async function leerError(respuesta) {
  try {
    const cuerpo = await respuesta.json()
    return new ErrorApi(respuesta.status, cuerpo.mensaje ?? 'Ocurrió un error inesperado.', cuerpo.campos ?? null)
  } catch {
    return new ErrorApi(respuesta.status, 'Ocurrió un error inesperado.')
  }
}

/**
 * Hace una petición a la API con fetch.
 * - Agrega Content-Type JSON y Authorization: Bearer con el token de acceso.
 * - Si responde 401, intenta UNA vez renovar el token y reintenta la petición.
 *   Si la renovación falla, cierra la sesión y lanza el error.
 */
export async function peticion(ruta, { metodo = 'GET', cuerpo, autenticado = true, reintentar = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (autenticado && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  let respuesta
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    })
  } catch {
    throw new ErrorApi(0, 'No se pudo conectar con el servidor. Revisa que el backend esté encendido.')
  }

  if (respuesta.status === 401 && autenticado && reintentar && obtenerRefreshToken()) {
    try {
      await renovarTokens()
    } catch {
      limpiarTokens()
      alExpirar()
      throw new ErrorApi(401, 'Tu sesión expiró. Inicia sesión nuevamente.')
    }
    return peticion(ruta, { metodo, cuerpo, autenticado, reintentar: false })
  }

  if (!respuesta.ok) {
    throw await leerError(respuesta)
  }
  if (respuesta.status === 204) return null
  return respuesta.json()
}

// ---------- Módulos por recurso ----------

export const authApi = {
  async login(correo, password) {
    const datos = await peticion('/auth/login', { metodo: 'POST', cuerpo: { correo, password }, autenticado: false })
    guardarTokens(datos)
    return datos
  },
  async registro(usuario) {
    const datos = await peticion('/auth/registro', { metodo: 'POST', cuerpo: usuario, autenticado: false })
    guardarTokens(datos)
    return datos
  },
  refresh: renovarTokens,
  me: () => peticion('/auth/me'),
}

export const productosApi = {
  listar: () => peticion('/productos', { autenticado: false }),
  obtener: (id) => peticion(`/productos/${id}`, { autenticado: false }),
  crear: (producto) => peticion('/productos', { metodo: 'POST', cuerpo: producto }),
  actualizar: (id, producto) => peticion(`/productos/${id}`, { metodo: 'PUT', cuerpo: producto }),
  eliminar: (id) => peticion(`/productos/${id}`, { metodo: 'DELETE' }),
}

export const categoriasApi = {
  listar: () => peticion('/categorias', { autenticado: false }),
  crear: (categoria) => peticion('/categorias', { metodo: 'POST', cuerpo: categoria }),
  actualizar: (id, categoria) => peticion(`/categorias/${id}`, { metodo: 'PUT', cuerpo: categoria }),
  eliminar: (id) => peticion(`/categorias/${id}`, { metodo: 'DELETE' }),
}

export const usuariosApi = {
  listar: () => peticion('/usuarios'),
  crear: (usuario) => peticion('/usuarios', { metodo: 'POST', cuerpo: usuario }),
  actualizar: (id, usuario) => peticion(`/usuarios/${id}`, { metodo: 'PUT', cuerpo: usuario }),
  eliminar: (id) => peticion(`/usuarios/${id}`, { metodo: 'DELETE' }),
}

export const boletasApi = {
  crear: (boleta) => peticion('/boletas', { metodo: 'POST', cuerpo: boleta }),
  mias: () => peticion('/boletas/mias'),
  listar: () => peticion('/boletas'),
  obtener: (id) => peticion(`/boletas/${id}`),
  eliminar: (id) => peticion(`/boletas/${id}`, { metodo: 'DELETE' }),
}
