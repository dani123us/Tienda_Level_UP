import { render, screen, fireEvent } from '@testing-library/react'
import TarjetaProducto from '../../components/TarjetaProducto.jsx'
import { crearProducto } from '../ayudantes.jsx'

describe('TarjetaProducto', () => {
  it('muestra el nombre y el precio del producto', () => {
    render(<TarjetaProducto producto={crearProducto({ precio: 49990 })} onAgregarCarrito={() => {}} />)

    expect(screen.getByText('Control Inalámbrico')).toBeTruthy()
    expect(screen.getByText('$49.990')).toBeTruthy()
  })

  it('al hacer clic en "Añadir al carrito" llama a la función que recibe por props', () => {
    const producto = crearProducto()
    const onAgregarCarrito = jasmine.createSpy('onAgregarCarrito')
    render(<TarjetaProducto producto={producto} onAgregarCarrito={onAgregarCarrito} />)

    fireEvent.click(screen.getByText('Añadir al carrito'))

    expect(onAgregarCarrito).toHaveBeenCalledWith(producto)
  })

  it('si no hay stock el botón queda deshabilitado', () => {
    render(<TarjetaProducto producto={crearProducto({ stock: 0 })} onAgregarCarrito={() => {}} />)

    expect(screen.getByText('Agotado').disabled).toBeTrue()
    expect(screen.getByText('Sin stock')).toBeTruthy()
  })
})
