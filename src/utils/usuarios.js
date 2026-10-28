export function autenticar(usuarios, correo, password) {
  const correoNormalizado = correo.trim().toLowerCase()
  return (
    usuarios.find((u) => u.correo.toLowerCase() === correoNormalizado && u.password === password) ??
    null
  )
}

export function crearSesion(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
  }
}
