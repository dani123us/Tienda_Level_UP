export function formatearPrecio(valor) {
  return Number(valor).toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
  })
}

export function formatearFecha(fechaIso) {
  if (!fechaIso) return ''
  return new Date(fechaIso).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })
}
