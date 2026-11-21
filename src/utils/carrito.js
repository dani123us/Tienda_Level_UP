export const DESCUENTO_DUOC = 20
export const CUPONES = {
  LEVELUP10: 10,
  GAMER15: 15,
}

export function contarUnidades(carrito) {
  return carrito.reduce((suma, item) => suma + item.cantidad, 0)
}

export function calcularSubtotal(carrito) {
  return carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0)
}

export function puedeAgregar(carrito, producto) {
  if (producto.stock <= 0) return false
  const item = carrito.find((i) => i.id === producto.id)
  return !item || item.cantidad < producto.stock
}

export function agregarProducto(carrito, producto) {
  if (!puedeAgregar(carrito, producto)) return carrito

  const existe = carrito.some((item) => item.id === producto.id)
  if (existe) {
    return carrito.map((item) =>
      item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item,
    )
  }
  return [...carrito, { ...producto, cantidad: 1 }]
}

export function cambiarCantidad(carrito, id, cambio) {
  return carrito
    .map((item) => {
      if (item.id !== id) return item
      const maximo = item.stock ?? Infinity
      const nuevaCantidad = Math.min(item.cantidad + cambio, maximo)
      return { ...item, cantidad: nuevaCantidad }
    })
    .filter((item) => item.cantidad > 0)
}

export function quitarProducto(carrito, id) {
  return carrito.filter((item) => item.id !== id)
}

export function esCorreoDuoc(correo) {
  return /@(duoc\.cl|profesor\.duoc\.cl)$/i.test(correo ?? '')
}

export function obtenerDescuentoCupon(codigo) {
  return CUPONES[(codigo ?? '').trim().toUpperCase()] ?? 0
}

export function calcularResumen(carrito, { esDuoc = false, porcentajeCupon = 0 } = {}) {
  const subtotal = calcularSubtotal(carrito)
  const porcentaje = (esDuoc ? DESCUENTO_DUOC : 0) + porcentajeCupon
  const descuento = Math.round((subtotal * porcentaje) / 100)
  return { subtotal, porcentaje, descuento, total: subtotal - descuento }
}

/** Lo que se guarda en localStorage: solo el id y la cantidad de cada producto. */
export function aIdsCantidades(items) {
  return items.map(({ id, cantidad }) => ({ id, cantidad }))
}

/**
 * Rehidrata el carrito guardado ({id, cantidad}) con los datos frescos de los productos del backend.
 * Los productos que ya no existen se descartan y la cantidad no puede superar el stock actual.
 */
export function hidratarCarrito(guardado, productos) {
  return guardado
    .map(({ id, cantidad }) => {
      const producto = productos.find((p) => p.id === id)
      if (!producto) return null
      return { ...producto, cantidad: Math.min(cantidad, producto.stock) }
    })
    .filter((item) => item && item.cantidad > 0)
}
