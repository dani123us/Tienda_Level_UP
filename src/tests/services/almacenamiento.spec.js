import { leerDatos } from '../../services/almacenamiento.js'

describe('Lectura de localStorage', () => {
  it('convierte el texto guardado en un arreglo', () => {
    spyOn(Storage.prototype, 'getItem').and.returnValue('[{"id":1,"cantidad":2}]')

    expect(leerDatos('carritoLevelUp', [])).toEqual([{ id: 1, cantidad: 2 }])
    expect(Storage.prototype.getItem).toHaveBeenCalledWith('carritoLevelUp')
  })

  it('si el dato guardado está dañado devuelve el valor por defecto', () => {
    spyOn(Storage.prototype, 'getItem').and.returnValue('{dañado')
    expect(leerDatos('carritoLevelUp', [])).toEqual([])
  })
})
