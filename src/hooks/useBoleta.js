import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { boletasApi } from '../services/api.js'

/**
 * Obtiene la boleta de la URL (/compra-exitosa/:id).
 * Si viene en el estado de la navegación (recién creada) la usa directo; si no (recarga), la pide a la API.
 */
export function useBoleta() {
  const { id } = useParams()
  const location = useLocation()
  const enEstado = location.state?.boleta
  const inicial = enEstado && String(enEstado.id) === id ? enEstado : null

  const [boleta, setBoleta] = useState(inicial)
  const [cargando, setCargando] = useState(!inicial)
  const [error, setError] = useState('')

  useEffect(() => {
    if (inicial) return
    let activo = true
    boletasApi
      .obtener(id)
      .then((datos) => activo && setBoleta(datos))
      .catch((e) => activo && setError(e.message))
      .finally(() => activo && setCargando(false))
    return () => {
      activo = false
    }
  }, [id, inicial])

  return { boleta, cargando, error }
}
