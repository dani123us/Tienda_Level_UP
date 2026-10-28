export function obtenerCategorias(productos) {
  return [...new Set(productos.map((p) => p.categoria))].sort((a, b) => a.localeCompare(b))
}

export function filtrarProductos(productos, { categoria = 'Todas', busqueda = '' } = {}) {
  const texto = busqueda.trim().toLowerCase()
  return productos.filter(
    (p) =>
      (categoria === 'Todas' || p.categoria === categoria) &&
      p.nombre.toLowerCase().includes(texto),
  )
}

export function productosEnStockCritico(productos) {
  return productos.filter((p) => p.stock <= p.stockCritico)
}

export function siguienteId(lista) {
  return lista.reduce((mayor, elemento) => Math.max(mayor, elemento.id), 0) + 1
}
