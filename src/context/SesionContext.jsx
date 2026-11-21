import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  alExpirarSesion,
  authApi,
  limpiarTokens,
  obtenerRefreshToken,
  renovarTokens,
} from '../services/api.js'
import { CLAVES } from '../services/almacenamiento.js'

export const SesionContext = createContext(null)

/**
 * Maneja la sesión del usuario en toda la app.
 * - Al recargar la página: si hay refresh token, lo renueva y pide /auth/me para restaurar la sesión.
 * - Mientras restaura, `cargando` es true (las rutas protegidas muestran un spinner en vez de mandar al login).
 * - Si se cierra sesión en otra pestaña (evento storage), también se cierra aquí.
 */
export function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(() => Boolean(obtenerRefreshToken()))

  useEffect(() => {
    alExpirarSesion(() => setUsuario(null))

    if (!obtenerRefreshToken()) return
    let activo = true
    renovarTokens()
      .then(() => authApi.me())
      .then((datos) => {
        if (activo) setUsuario(datos)
      })
      .catch(() => {
        limpiarTokens()
        if (activo) setUsuario(null)
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [])

  useEffect(() => {
    function alCambiarAlmacenamiento(evento) {
      if (evento.key === CLAVES.refresh && !evento.newValue) {
        limpiarTokens()
        setUsuario(null)
      }
    }
    window.addEventListener('storage', alCambiarAlmacenamiento)
    return () => window.removeEventListener('storage', alCambiarAlmacenamiento)
  }, [])

  const iniciarSesion = useCallback(async (correo, password) => {
    const datos = await authApi.login(correo, password)
    setUsuario(datos.usuario)
    return datos.usuario
  }, [])

  const registrar = useCallback(async (datosRegistro) => {
    const datos = await authApi.registro(datosRegistro)
    setUsuario(datos.usuario)
    return datos.usuario
  }, [])

  const cerrarSesion = useCallback(() => {
    limpiarTokens()
    setUsuario(null)
  }, [])

  const tieneRol = useCallback((...roles) => Boolean(usuario) && roles.includes(usuario.rol), [usuario])

  const valor = useMemo(
    () => ({ usuario, cargando, iniciarSesion, registrar, cerrarSesion, tieneRol }),
    [usuario, cargando, iniciarSesion, registrar, cerrarSesion, tieneRol],
  )

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
}

export function useSesion() {
  const contexto = useContext(SesionContext)
  if (!contexto) {
    throw new Error('useSesion debe usarse dentro de <SesionProvider>')
  }
  return contexto
}
