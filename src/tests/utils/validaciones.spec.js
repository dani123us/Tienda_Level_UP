import {
  validarCorreo,
  validarRegistro,
  esMayorDeEdad,
  validarCheckout,
  vencimientoValido,
  validarUsuario,
  validarProducto,
  esStockCritico,
  validarTelefono,
} from '../../utils/validaciones.js'

describe('Validaciones de formularios', () => {
  it('solo acepta correos @duoc.cl, @profesor.duoc.cl y @gmail.com', () => {
    expect(validarCorreo('alumno@duoc.cl')).toBeTrue()
    expect(validarCorreo('gamer@gmail.com')).toBeTrue()
    expect(validarCorreo('gamer@hotmail.com')).toBeFalse()
    expect(validarCorreo('')).toBeFalse()
  })

  it('el registro marca los campos con errores', () => {
    const errores = validarRegistro({
      run: '',
      nombre: '',
      apellidos: 'Pérez',
      correo: 'malo',
      fechaNacimiento: '1999-01-01',
      password: '12',
      confirmPassword: '34',
      telefono: '',
      region: '',
      comuna: '',
      direccion: '',
    })
    expect(Object.keys(errores)).toEqual([
      'run', 'nombre', 'correo', 'password', 'confirmPassword', 'region', 'comuna', 'direccion',
    ])
  })

  it('el teléfono es opcional pero si viene debe ser válido', () => {
    expect(validarTelefono('')).toBeTrue()
    expect(validarTelefono('+56 9 1234 5678')).toBeTrue()
    expect(validarTelefono('abc')).toBeFalse()
    expect(validarTelefono('123')).toBeFalse()
  })

  describe('con la fecha de hoy simulada', () => {
    beforeEach(() => {
      jasmine.clock().install()
      jasmine.clock().mockDate(new Date(2026, 9, 27))
    })

    afterEach(() => {
      jasmine.clock().uninstall()
    })

    it('es mayor de edad si cumple 18 hoy, pero no si los cumple mañana', () => {
      expect(esMayorDeEdad('2008-10-27')).toBeTrue()
      expect(esMayorDeEdad('2008-10-28')).toBeFalse()
    })
  })

  describe('checkout', () => {
    const hoy = new Date(2026, 10, 21) // 21 de noviembre de 2026
    const datosValidos = {
      nombre: 'Ana', correo: 'ana@gmail.com', telefono: '', direccion: 'Calle 1', region: 'RM', comuna: 'Santiago',
      indicaciones: '', metodoPago: 'Crédito', numeroTarjeta: '4242 4242 4242 4242', titular: 'Ana', vencimiento: '11/26',
      cvv: '123',
    }

    it('una tarjeta vence al terminar su mes', () => {
      expect(vencimientoValido('11/26', hoy)).toBeTrue()
      expect(vencimientoValido('10/26', hoy)).toBeFalse()
      expect(vencimientoValido('13/30', hoy)).toBeFalse()
      expect(vencimientoValido('1/30', hoy)).toBeFalse()
    })

    it('acepta datos válidos y rechaza tarjeta, CVV y vencimiento incorrectos', () => {
      expect(validarCheckout(datosValidos, hoy)).toEqual({})
      const errores = validarCheckout({ ...datosValidos, numeroTarjeta: '4242', cvv: '1a3', vencimiento: '01/20', metodoPago: '' }, hoy)
      expect(Object.keys(errores)).toEqual(['metodoPago', 'numeroTarjeta', 'vencimiento', 'cvv'])
    })
  })

  describe('panel', () => {
    const usuarios = [{ id: 1, run: '19011022K', correo: 'admin@duoc.cl' }]
    const usuario = {
      run: '19011022K', rol: 'Administrador', nombre: 'Admin', apellidos: 'Level-Up', correo: 'admin@duoc.cl',
      password: '', region: 'RM', comuna: 'Santiago', direccion: 'Calle 1',
    }

    it('al editar un usuario la contraseña es opcional y no choca consigo mismo', () => {
      expect(validarUsuario(usuario, usuarios, 1)).toEqual({})
    })

    it('al crear exige contraseña y detecta RUN y correo repetidos', () => {
      const errores = validarUsuario(usuario, usuarios)
      expect(Object.keys(errores)).toEqual(['run', 'correo', 'password'])
    })

    it('un producto en edición puede mantener su código', () => {
      const productos = [{ id: 1, codigo: 'CO001' }]
      const datos = { codigo: 'CO001', nombre: 'PS5', descripcion: '', precio: '10', categoria: 'Consolas', stock: '1', stockCritico: '' }
      expect(validarProducto(datos, productos, 1)).toEqual({})
      expect(validarProducto(datos, productos).codigo).toBeDefined()
      expect(esStockCritico(1, '')).toBeFalse()
      expect(esStockCritico(1, 3)).toBeTrue()
    })
  })
})
