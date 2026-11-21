const REGEX_CORREO = /^[a-zA-Z0-9._%+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/
const REGEX_RUN = /^[0-9]{6,8}[0-9kK]$/

export const MENSAJES = {
  correo: 'Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com (máx. 100 caracteres).',
  password: 'La contraseña debe tener entre 4 y 10 caracteres.',
  run: 'Requerido. Entre 7 y 9 caracteres, sin puntos ni guion.',
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

const textoRequerido = (valor, maximo) => {
  const limpio = (valor ?? '').trim()
  return limpio !== '' && limpio.length <= maximo
}

/** En el login solo se exige que la contraseña venga; si es correcta lo decide el backend (401). */
export function validarLogin({ correo, password }) {
  const errores = {}
  if (!validarCorreo(correo)) errores.correo = MENSAJES.correo
  if (!password) errores.password = 'Ingresa tu contraseña.'
  return errores
}

/** Validaciones del registro público. Que el correo o RUN no estén repetidos lo revisa el backend (409). */
export function validarRegistro(datos) {
  const errores = {}

  if (!validarRun(datos.run)) errores.run = MENSAJES.run
  if (!textoRequerido(datos.nombre, 50)) {
    errores.nombre = 'El nombre es requerido (máx. 50 caracteres).'
  }
  if (!textoRequerido(datos.apellidos, 100)) {
    errores.apellidos = 'Los apellidos son requeridos (máx. 100 caracteres).'
  }
  if (!validarCorreo(datos.correo)) errores.correo = MENSAJES.correo
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
  if (!textoRequerido(datos.direccion, 300)) {
    errores.direccion = 'La dirección es requerida (máx. 300 caracteres).'
  }
  return errores
}

export function validarContacto({ nombre, correo, comentario }) {
  const errores = {}
  if (!textoRequerido(nombre, 100)) {
    errores.nombre = 'El nombre es requerido (máx. 100 caracteres).'
  }
  if (!validarCorreo(correo)) errores.correo = MENSAJES.correo
  if (!textoRequerido(comentario, 500)) {
    errores.comentario = 'El comentario es requerido (máx. 500 caracteres).'
  }
  return errores
}

const esEnteroNoNegativo = (valor) =>
  valor !== '' && Number.isInteger(Number(valor)) && Number(valor) >= 0

/**
 * @param productos lista actual para revisar que el código no se repita
 * @param idEditando id del producto que se está editando (se excluye de la revisión)
 */
export function validarProducto(datos, productos = [], idEditando = null) {
  const errores = {}
  const codigo = datos.codigo.trim()
  const otros = productos.filter((p) => p.id !== idEditando)

  if (codigo.length < 3 || codigo.length > 20) {
    errores.codigo = 'Requerido. Entre 3 y 20 caracteres.'
  } else if (otros.some((p) => p.codigo.toLowerCase() === codigo.toLowerCase())) {
    errores.codigo = 'Ya existe un producto con este código.'
  }
  if (!textoRequerido(datos.nombre, 100)) {
    errores.nombre = 'Requerido. Máximo 100 caracteres.'
  }
  if ((datos.descripcion ?? '').trim().length > 500) {
    errores.descripcion = 'Máximo 500 caracteres.'
  }
  if (!esEnteroNoNegativo(datos.precio)) {
    errores.precio = 'Requerido. Debe ser un número entero mayor o igual a 0.'
  }
  if (!(datos.categoria ?? '').trim()) errores.categoria = 'Debe seleccionar o escribir una categoría.'
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

/**
 * Validación del formulario de usuarios del panel.
 * Al editar, la contraseña es opcional (si queda vacía se mantiene la anterior).
 */
export function validarUsuario(datos, usuarios = [], idEditando = null) {
  const errores = {}
  const otros = usuarios.filter((u) => u.id !== idEditando)
  const editando = idEditando !== null

  if (!validarRun(datos.run)) {
    errores.run = MENSAJES.run
  } else if (otros.some((u) => u.run && u.run.toUpperCase() === datos.run.trim().toUpperCase())) {
    errores.run = 'Ya existe un usuario con este RUN.'
  }
  if (datos.rol === '') errores.rol = 'Debe seleccionar un rol.'
  if (!textoRequerido(datos.nombre, 50)) errores.nombre = 'Requerido. Máximo 50 caracteres.'
  if (!textoRequerido(datos.apellidos, 100)) errores.apellidos = 'Requerido. Máximo 100 caracteres.'
  if (!validarCorreo(datos.correo)) {
    errores.correo = MENSAJES.correo
  } else if (otros.some((u) => u.correo.toLowerCase() === datos.correo.trim().toLowerCase())) {
    errores.correo = 'Este correo ya está registrado.'
  }
  const sinPassword = datos.password === ''
  if (!(editando && sinPassword) && !validarPassword(datos.password)) {
    errores.password = editando ? 'Déjala vacía para mantenerla, o usa entre 4 y 10 caracteres.' : MENSAJES.password
  }
  if (datos.region === '') errores.region = 'Debe seleccionar una región.'
  if (datos.comuna === '') errores.comuna = 'Debe seleccionar una comuna.'
  if (!textoRequerido(datos.direccion, 300)) errores.direccion = 'Requerido. Máximo 300 caracteres.'
  return errores
}

// ---------- Checkout ----------

export function soloDigitos(texto) {
  return (texto ?? '').replace(/\D/g, '')
}

/** Vencimiento en formato MM/AA. No vencida: vale hasta el último día de ese mes. */
export function vencimientoValido(vencimiento, hoy = new Date()) {
  const coincide = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec((vencimiento ?? '').trim())
  if (!coincide) return false
  const mes = Number(coincide[1])
  const anio = 2000 + Number(coincide[2])
  const mesActual = hoy.getFullYear() * 12 + hoy.getMonth()
  return anio * 12 + (mes - 1) >= mesActual
}

export function validarCheckout(datos, hoy = new Date()) {
  const errores = {}
  if (!textoRequerido(datos.nombre, 150)) errores.nombre = 'El nombre es requerido.'
  if (!validarCorreo(datos.correo)) errores.correo = MENSAJES.correo
  if (!validarTelefono(datos.telefono)) errores.telefono = 'Ingresa un teléfono válido.'
  if (!textoRequerido(datos.direccion, 300)) errores.direccion = 'La dirección es requerida.'
  if (datos.region === '') errores.region = 'Selecciona una región.'
  if (datos.comuna === '') errores.comuna = 'Selecciona una comuna.'
  if ((datos.indicaciones ?? '').length > 300) errores.indicaciones = 'Máximo 300 caracteres.'

  if (datos.metodoPago === '') errores.metodoPago = 'Selecciona el método de pago.'
  if (soloDigitos(datos.numeroTarjeta).length !== 16) {
    errores.numeroTarjeta = 'El número de tarjeta debe tener 16 dígitos.'
  }
  if (!textoRequerido(datos.titular, 100)) errores.titular = 'Ingresa el nombre del titular.'
  if (!vencimientoValido(datos.vencimiento, hoy)) {
    errores.vencimiento = 'Usa el formato MM/AA y una tarjeta que no esté vencida.'
  }
  if (!/^\d{3}$/.test(datos.cvv ?? '')) errores.cvv = 'El CVV tiene 3 dígitos.'
  return errores
}
