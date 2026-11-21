import { screen, fireEvent, waitFor } from '@testing-library/react'
import AdminProductos from '../../../pages/admin/AdminProductos.jsx'
import DetalleProducto from '../../../pages/admin/DetalleProducto.jsx'
import { Routes, Route } from 'react-router-dom'
import {
  crearProducto,
  crearSesion,
  escribir,
  renderConRouter,
  simularApi,
  usuarioAdmin,
  usuarioVendedor, esperarValor } from '../../ayudantes.jsx'

const productos = [
  crearProducto({ id: 1, codigo: 'CO001', nombre: 'PlayStation 5', categoria: 'Consolas', stock: 10, stockCritico: 3 }),
  crearProducto({ id: 2, codigo: 'MP001', nombre: 'Mousepad XL', categoria: 'Mousepad', stock: 0, stockCritico: 2 }),
]
const categorias = [{ id: 1, nombre: 'Consolas' }, { id: 2, nombre: 'Mousepad' }]

async function llenarNuevo() {
  await screen.findByRole('option', { name: 'Consolas' })
  escribir(screen.getByLabelText('Código *'), 'ts900')
  escribir(screen.getByLabelText('Nombre *'), 'Control Pro')
  escribir(screen.getByLabelText('Precio *'), '19990')
  fireEvent.change(screen.getByLabelText('Categoría *'), { target: { value: 'Consolas' } })
  escribir(screen.getByLabelText('Stock *'), '1')
  escribir(screen.getByLabelText('Stock crítico (opcional)'), '2')
}

describe('AdminProductos', () => {
  const admin = () => crearSesion({ usuario: usuarioAdmin })

  it('crear llama a POST /productos con el código en mayúsculas y avisa stock crítico', async () => {
    let enviado
    simularApi({
      'GET /categorias': categorias,
      'POST /productos': (cuerpo) => { enviado = cuerpo; return [201, { ...cuerpo, id: 3 }] },
    })
    const onCambio = jasmine.createSpy('onCambio')
    renderConRouter(<AdminProductos productos={productos} onCambio={onCambio} />, { sesion: admin() })

    await llenarNuevo()
    fireEvent.click(screen.getByText('GUARDAR PRODUCTO'))

    expect(await screen.findByText('Producto guardado exitosamente en el sistema.')).toBeTruthy()
    expect(screen.getByText(/el stock actual es igual o inferior/)).toBeTruthy()
    expect(enviado).toEqual(jasmine.objectContaining({ codigo: 'TS900', precio: 19990, categoria: 'Consolas', stock: 1 }))
    expect(onCambio).toHaveBeenCalled()
  })

  it('permite crear una categoría nueva escribiéndola', async () => {
    let enviado
    simularApi({ 'GET /categorias': categorias, 'POST /productos': (cuerpo) => { enviado = cuerpo; return [201, cuerpo] } })
    renderConRouter(<AdminProductos productos={productos} />, { sesion: admin() })

    await llenarNuevo()
    fireEvent.change(screen.getByLabelText('Categoría *'), { target: { value: '__otra__' } })
    escribir(screen.getByLabelText('Nombre de la nueva categoría *'), 'Notebooks')
    fireEvent.click(screen.getByText('GUARDAR PRODUCTO'))

    await esperarValor(() => enviado?.categoria, 'Notebooks')
  })

  it('editar carga el formulario y llama a PUT /productos/{id}', async () => {
    let enviado
    simularApi({ 'GET /categorias': categorias, 'PUT /productos/1': (cuerpo) => { enviado = cuerpo; return [200, cuerpo] } })
    renderConRouter(<AdminProductos productos={productos} />, { sesion: admin() })

    fireEvent.click(screen.getByLabelText('Editar PlayStation 5'))
    expect(screen.getByLabelText('Código *').value).toBe('CO001')
    expect(screen.getByText('Cancelar')).toBeTruthy()

    escribir(screen.getByLabelText('Precio *'), '499990')
    fireEvent.click(screen.getByText('Guardar cambios'))

    expect(await screen.findByText('Producto actualizado correctamente.')).toBeTruthy()
    expect(enviado.precio).toBe(499990)
    expect(enviado.codigo).toBe('CO001')
  })

  it('cancelar la edición limpia el formulario', () => {
    simularApi({ 'GET /categorias': categorias })
    renderConRouter(<AdminProductos productos={productos} />, { sesion: admin() })

    fireEvent.click(screen.getByLabelText('Editar PlayStation 5'))
    fireEvent.click(screen.getByText('Cancelar'))

    expect(screen.getByLabelText('Código *').value).toBe('')
    expect(screen.getByText('Nuevo producto')).toBeTruthy()
  })

  it('eliminar pide confirmación y llama a DELETE /productos/{id}', async () => {
    const fetch = simularApi({ 'GET /categorias': categorias, 'DELETE /productos/2': () => [204] })
    const onCambio = jasmine.createSpy('onCambio')
    const confirmar = spyOn(window, 'confirm').and.returnValues(false, true)
    renderConRouter(<AdminProductos productos={productos} onCambio={onCambio} />, { sesion: admin() })

    fireEvent.click(screen.getByLabelText('Eliminar Mousepad XL'))
    expect(fetch.calls.allArgs().some(([url]) => url.endsWith('/productos/2'))).toBeFalse()

    fireEvent.click(screen.getByLabelText('Eliminar Mousepad XL'))
    await esperarValor(() => onCambio.calls.any(), true)
    expect(confirmar).toHaveBeenCalledTimes(2)
  })

  it('muestra los errores del backend (código duplicado)', async () => {
    simularApi({ 'GET /categorias': categorias, 'POST /productos': () => [409, { mensaje: 'Ya existe un producto con el código TS900' }] })
    renderConRouter(<AdminProductos productos={productos} />, { sesion: admin() })

    await llenarNuevo()
    fireEvent.click(screen.getByText('GUARDAR PRODUCTO'))

    expect(await screen.findByText('Ya existe un producto con el código TS900')).toBeTruthy()
  })

  it('valida en el front que el código no se repita', async () => {
    simularApi({ 'GET /categorias': categorias })
    renderConRouter(<AdminProductos productos={productos} />, { sesion: admin() })

    await llenarNuevo()
    escribir(screen.getByLabelText('Código *'), 'co001')
    fireEvent.click(screen.getByText('GUARDAR PRODUCTO'))

    expect(screen.getByText('Ya existe un producto con este código.')).toBeTruthy()
  })

  it('el Vendedor ve la lista en solo lectura: sin formulario ni botones de acción', () => {
    const fetch = simularApi({})
    renderConRouter(<AdminProductos productos={productos} />, { sesion: crearSesion({ usuario: usuarioVendedor }) })

    expect(screen.getByText('PlayStation 5')).toBeTruthy()
    expect(screen.getByText(/solo lectura/)).toBeTruthy()
    expect(screen.queryByText('GUARDAR PRODUCTO')).toBeNull()
    expect(screen.queryByText('Editar')).toBeNull()
    expect(screen.queryByText('Eliminar')).toBeNull()
    expect(screen.getAllByText('Ver').length).toBe(2)
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('DetalleProducto (panel)', () => {
  it('muestra los datos del producto pedido a la API', async () => {
    simularApi({ 'GET /productos/1': crearProducto({ enStockCritico: true }) })
    renderConRouter(
      <Routes>
        <Route path="/admin/productos/:id" element={<DetalleProducto />} />
      </Routes>,
      { ruta: '/admin/productos/1', sesion: crearSesion({ usuario: usuarioVendedor }) },
    )
    expect(await screen.findByText('Control Inalámbrico')).toBeTruthy()
    expect(screen.getByText('TS001')).toBeTruthy()
    expect(screen.getByText('Stock crítico', { selector: '.badge' })).toBeTruthy()
  })
})
