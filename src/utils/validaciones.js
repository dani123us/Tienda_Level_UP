const REGEX_CORREO = /^[a-zA-Z0-9._%+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/
const REGEX_RUN = /^[0-9]{6,8}[0-9kK]$/

export const MENSAJES = {
  correo: 'Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com (máx. 100 caracteres).',
  password: 'La contraseña debe tener entre 4 y 10 caracteres.',
}

export function validarCorreo(correo) {
  const valor = (correo ?? '').trim()
  return valor !== '' && valor.length <= 100 && REGEX_CORREO.test(valor)
}

export function validarPassword(password) {
  return typeof password === 'string' && password.length >= 4 && password.length <= 10
}

export function calcularEdad(fechaNacimiento, hoy = new Date()) {
  const [anio, mes, dia] = fechaNacimiento.split('-').map(Number)
  let edad = hoy.getFullYear() - anio
  const diferenciaMes = hoy.getMonth() + 1 - mes
  if (diferenciaMes < 0 || (diferenciaMes === 0 && hoy.getDate() < dia)) {
    edad--
  }
  return edad
}

export function esMayorDeEdad(fechaNacimiento, hoy = new Date()) {
  if (!fechaNacimiento) return false
  return calcularEdad(fechaNacimiento, hoy) >= 18
}

export function validarRun(run) {
  return REGEX_RUN.test((run ?? '').trim())
}

export function validarTelefono(telefono) {
  const valor = (telefono ?? '').trim()
  if (valor === '') return true
  if (!/^[\d\s+]+$/.test(valor)) return false
  const digitos = valor.replace(/\D/g, '')
  return digitos.length >= 8 && digitos.length <= 11
}

export function hayErrores(errores) {
  return Object.keys(errores).length > 0
}

const correoRegistrado = (lista, correo) =>
  lista.some((u) => u.correo.toLowerCase() === correo.trim().toLowerCase())

export function validarLogin({ correo, password }) {
  const errores = {}
  if (!validarCorreo(correo)) errores.correo = MENSAJES.correo
  if (!validarPassword(password)) errores.password = MENSAJES.password
  return errores
}

export function validarRegistro(datos, usuarios = []) {
  const errores = {}
  const nombre = datos.nombre.trim()

  if (nombre === '' || nombre.length > 100) {
    errores.nombre = 'El nombre es requerido (máx. 100 caracteres).'
  }
  if (!validarCorreo(datos.correo)) {
    errores.correo = MENSAJES.correo
  } else if (correoRegistrado(usuarios, datos.correo)) {
    errores.correo = 'Este correo ya está registrado.'
  }
  if (!esMayorDeEdad(datos.fechaNacimiento)) {
    errores.fechaNacimiento = 'Debes ser mayor de 18 años para registrarte.'
  }
  if (!validarPassword(datos.password)) errores.password = MENSAJES.password
  if (datos.confirmPassword === '' || datos.password !== datos.confirmPassword) {
    errores.confirmPassword = 'Las contraseñas no coinciden.'
  }
  if (!validarTelefono(datos.telefono)) {
    errores.telefono = 'Ingresa un teléfono válido, por ejemplo +56 9 1234 5678.'
  }
  if (datos.region === '') errores.region = 'Selecciona una región.'
  if (datos.comuna === '') errores.comuna = 'Selecciona una comuna.'
  return errores
}

export function validarContacto({ nombre, correo, comentario }) {
  const errores = {}
  if (nombre.trim() === '' || nombre.trim().length > 100) {
    errores.nombre = 'El nombre es requerido (máx. 100 caracteres).'
  }
  if (!validarCorreo(correo)) errores.correo = MENSAJES.correo
  if (comentario.trim() === '' || comentario.trim().length > 500) {
    errores.comentario = 'El comentario es requerido (máx. 500 caracteres).'
  }
  return errores
}

const esEnteroNoNegativo = (valor) =>
  valor !== '' && Number.isInteger(Number(valor)) && Number(valor) >= 0

export function validarProducto(datos, productos = []) {
  const errores = {}
  const codigo = datos.codigo.trim()

  if (codigo.length < 3) {
    errores.codigo = 'Requerido. Mínimo 3 caracteres.'
  } else if (productos.some((p) => p.codigo.toLowerCase() === codigo.toLowerCase())) {
    errores.codigo = 'Ya existe un producto con este código.'
  }
  if (datos.nombre.trim() === '' || datos.nombre.trim().length > 100) {
    errores.nombre = 'Requerido. Máximo 100 caracteres.'
  }
  if (datos.descripcion.trim().length > 500) {
    errores.descripcion = 'Máximo 500 caracteres.'
  }
  if (datos.precio === '' || Number.isNaN(Number(datos.precio)) || Number(datos.precio) < 0) {
    errores.precio = 'Requerido. Debe ser un número mayor o igual a 0.'
  }
  if (datos.categoria === '') errores.categoria = 'Debe seleccionar una categoría.'
  if (!esEnteroNoNegativo(datos.stock)) {
    errores.stock = 'Requerido. Debe ser un número entero mayor o igual a 0.'
  }
  if (datos.stockCritico !== '' && !esEnteroNoNegativo(datos.stockCritico)) {
    errores.stockCritico = 'Debe ser un número entero mayor o igual a 0.'
  }
  return errores
}

export function esStockCritico(stock, stockCritico) {
  if (stockCritico === '' || stockCritico === null || stockCritico === undefined) return false
  return Number(stock) <= Number(stockCritico)
}

export function validarUsuario(datos, usuarios = []) {
  const errores = {}
  if (!validarRun(datos.run)) {
    errores.run = 'Requerido. Entre 7 y 9 caracteres, sin puntos ni guion.'
  } else if (usuarios.some((u) => u.run && u.run.toUpperCase() === datos.run.trim().toUpperCase())) {
    errores.run = 'Ya existe un usuario con este RUN.'
  }
  if (datos.rol === '') errores.rol = 'Debe seleccionar un rol.'
  if (datos.nombre.trim() === '' || datos.nombre.trim().length > 50) {
    errores.nombre = 'Requerido. Máximo 50 caracteres.'
  }
  if (datos.apellidos.trim() === '' || datos.apellidos.trim().length > 100) {
    errores.apellidos = 'Requerido. Máximo 100 caracteres.'
  }
  if (!validarCorreo(datos.correo)) {
    errores.correo = MENSAJES.correo
  } else if (correoRegistrado(usuarios, datos.correo)) {
    errores.correo = 'Este correo ya está registrado.'
  }
  if (!validarPassword(datos.password)) errores.password = MENSAJES.password
  if (datos.region === '') errores.region = 'Debe seleccionar una región.'
  if (datos.comuna === '') errores.comuna = 'Debe seleccionar una comuna.'
  if (datos.direccion.trim() === '' || datos.direccion.trim().length > 300) {
    errores.direccion = 'Requerido. Máximo 300 caracteres.'
  }
  return errores
}
