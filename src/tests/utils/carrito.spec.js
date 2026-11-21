import { agregarProducto, aIdsCantidades, calcularResumen, hidratarCarrito } from '../../utils/carrito.js'
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

describe('Carrito guardado en localStorage', () => {
  it('guarda solo el id y la cantidad', () => {
    const items = [crearProducto({ id: 3, cantidad: 2 })]
    expect(aIdsCantidades(items)).toEqual([{ id: 3, cantidad: 2 }])
  })

  it('al rehidratar descarta productos eliminados y ajusta al stock actual', () => {
    const productos = [crearProducto({ id: 1, stock: 2 }), crearProducto({ id: 2, stock: 0 })]
    const carrito = hidratarCarrito([{ id: 1, cantidad: 5 }, { id: 2, cantidad: 1 }, { id: 9, cantidad: 1 }], productos)
    expect(carrito.length).toBe(1)
    expect(carrito[0].cantidad).toBe(2)
    expect(carrito[0].nombre).toBe('Control Inalámbrico')
  })
})
