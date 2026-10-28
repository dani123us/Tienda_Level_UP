import { agregarProducto, calcularResumen } from '../../utils/carrito.js'
import { crearProducto } from '../ayudantes.jsx'

describe('Lógica del carrito', () => {
  const mouse = crearProducto({ id: 1, nombre: 'Mouse', precio: 20000, stock: 2 })

  it('agrega un producto nuevo con cantidad 1', () => {
    const carrito = agregarProducto([], mouse)
    expect(carrito.length).toBe(1)
    expect(carrito[0].cantidad).toBe(1)
  })

  it('si el producto ya está, suma 1 a la cantidad', () => {
    let carrito = agregarProducto([], mouse)
    carrito = agregarProducto(carrito, mouse)
    expect(carrito.length).toBe(1)
    expect(carrito[0].cantidad).toBe(2)
  })

  it('no deja agregar más unidades que el stock', () => {
    const lleno = [{ ...mouse, cantidad: 2 }]
    expect(agregarProducto(lleno, mouse)[0].cantidad).toBe(2)
  })

  it('aplica el 20% Duoc y el cupón al total', () => {
    const carrito = [{ ...mouse, cantidad: 5 }]
    const resumen = calcularResumen(carrito, { esDuoc: true, porcentajeCupon: 10 })
    expect(resumen.total).toBe(70000)
  })
})
