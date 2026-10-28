import { validarCorreo, validarRegistro, esMayorDeEdad } from '../../utils/validaciones.js'

describe('Validaciones de formularios', () => {
  it('solo acepta correos @duoc.cl, @profesor.duoc.cl y @gmail.com', () => {
    expect(validarCorreo('alumno@duoc.cl')).toBeTrue()
    expect(validarCorreo('gamer@gmail.com')).toBeTrue()
    expect(validarCorreo('gamer@hotmail.com')).toBeFalse()
    expect(validarCorreo('')).toBeFalse()
  })

  it('el registro marca los campos con errores', () => {
    const errores = validarRegistro({
      nombre: '',
      correo: 'malo',
      fechaNacimiento: '1999-01-01',
      password: '12',
      confirmPassword: '34',
      telefono: '',
      region: '',
      comuna: '',
    })
    expect(Object.keys(errores)).toEqual(['nombre', 'correo', 'password', 'confirmPassword', 'region', 'comuna'])
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
})
