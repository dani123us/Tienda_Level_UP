export const CLAVES = {
  carrito: 'carritoLevelUp',
  productos: 'productosLevelUp',
  usuarios: 'usuariosLevelUp',
  sesion: 'sesionLevelUp',
}

export function leerDatos(clave, valorPorDefecto) {
  try {
    const texto = localStorage.getItem(clave)
    return texto === null ? valorPorDefecto : JSON.parse(texto)
  } catch {
    return valorPorDefecto
  }
}

export function guardarDatos(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
    return true
  } catch {
    return false
  }
}
