// Solo se guardan en localStorage el carrito (ids y cantidades) y el refresh token.
// Los productos y usuarios vienen del backend; la contraseña y el usuario completo nunca se guardan.
export const CLAVES = {
  carrito: 'carritoLevelUp',
  refresh: 'refreshLevelUp',
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

export function borrarDato(clave) {
  try {
    localStorage.removeItem(clave)
  } catch {
    // Si el almacenamiento no está disponible no hay nada que borrar.
  }
}
