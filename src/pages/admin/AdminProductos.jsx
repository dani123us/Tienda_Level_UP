import { useState } from 'react'
import { Row, Col, Form, Button, Alert, Table, Badge } from 'react-bootstrap'
import CampoFormulario from '../../components/CampoFormulario.jsx'
import { categoriasProducto } from '../../data/productos.js'
import { validarProducto, hayErrores, esStockCritico } from '../../utils/validaciones.js'
import { formatearPrecio } from '../../utils/formato.js'

const formularioVacio = {
  codigo: '',
  nombre: '',
  descripcion: '',
  precio: '',
  categoria: '',
  stock: '',
  stockCritico: '',
  imagen: '',
}

function AdminProductos({ productos, onAgregarProducto, onEliminarProducto }) {
  const [datos, setDatos] = useState(formularioVacio)
  const [errores, setErrores] = useState({})
  const [resultado, setResultado] = useState(null)

  function manejarCambio(evento) {
    setDatos({ ...datos, [evento.target.name]: evento.target.value })
  }

  function guardar(evento) {
    evento.preventDefault()
    const nuevosErrores = validarProducto(datos, productos)
    setErrores(nuevosErrores)
    setResultado(null)
    if (hayErrores(nuevosErrores)) return

    onAgregarProducto({
      codigo: datos.codigo.trim().toUpperCase(),
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion.trim(),
      precio: Number(datos.precio),
      categoria: datos.categoria,
      stock: Number(datos.stock),
      stockCritico: datos.stockCritico === '' ? 0 : Number(datos.stockCritico),
      imagen: datos.imagen.trim(),
      icono: '🎮',
      destacado: false,
    })
    setResultado({ critico: esStockCritico(datos.stock, datos.stockCritico) })
    setDatos(formularioVacio)
  }

  return (
    <>
      <h1 className="h3 border-bottom border-secondary pb-2 mb-4">PRODUCTOS</h1>

      <Form noValidate onSubmit={guardar} className="panel p-4 mb-5">
        <h2 className="h5 texto-azul mb-3">Nuevo producto</h2>

        {resultado && (
          <Alert variant="success" onClose={() => setResultado(null)} dismissible>
            Producto guardado exitosamente en el sistema.
            {resultado.critico && (
              <div className="text-warning-emphasis mt-1">
                ⚠️ Alerta: el stock actual es igual o inferior al stock crítico.
              </div>
            )}
          </Alert>
        )}

        <Row>
          <Col md={4}>
            <CampoFormulario id="codigo" etiqueta="Código *" placeholder="Mínimo 3 caracteres"
              value={datos.codigo} error={errores.codigo} onChange={manejarCambio} />
          </Col>
          <Col md={8}>
            <CampoFormulario id="nombre" etiqueta="Nombre *" placeholder="Máx. 100 caracteres"
              value={datos.nombre} error={errores.nombre} onChange={manejarCambio} />
          </Col>
        </Row>
        <CampoFormulario id="descripcion" etiqueta="Descripción (opcional)" as="textarea" rows={3}
          placeholder="Máx. 500 caracteres" value={datos.descripcion} error={errores.descripcion}
          onChange={manejarCambio} />
        <Row>
          <Col md={6}>
            <CampoFormulario id="precio" etiqueta="Precio *" type="number" min="0" placeholder="Ej: 49990"
              value={datos.precio} error={errores.precio} onChange={manejarCambio} />
          </Col>
          <Col md={6}>
            <CampoFormulario id="categoria" etiqueta="Categoría *" opciones={categoriasProducto}
              value={datos.categoria} error={errores.categoria} onChange={manejarCambio} />
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <CampoFormulario id="stock" etiqueta="Stock *" type="number" min="0" step="1"
              placeholder="Cantidad entera" value={datos.stock} error={errores.stock} onChange={manejarCambio} />
          </Col>
          <Col md={6}>
            <CampoFormulario id="stockCritico" etiqueta="Stock crítico (opcional)" type="number" min="0"
              step="1" placeholder="Ej: 5" value={datos.stockCritico} error={errores.stockCritico}
              onChange={manejarCambio} />
          </Col>
        </Row>
        <CampoFormulario id="imagen" etiqueta="Imagen URL (opcional)" placeholder="https://..."
          value={datos.imagen} onChange={manejarCambio} />

        <Button type="submit" variant="neon" className="w-100">
          GUARDAR PRODUCTO
        </Button>
      </Form>

      <h2 className="h5 texto-azul mb-3">Inventario ({productos.length})</h2>
      <Table responsive variant="dark" hover className="align-middle">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th className="text-end">Precio</th>
            <th className="text-end">Stock</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.codigo}</td>
              <td>{p.nombre}</td>
              <td>{p.categoria}</td>
              <td className="text-end">{formatearPrecio(p.precio)}</td>
              <td className="text-end">
                {p.stock <= p.stockCritico ? (
                  <Badge bg="warning" text="dark" title="Stock crítico">{p.stock}</Badge>
                ) : (
                  p.stock
                )}
              </td>
              <td className="text-end">
                <Button size="sm" variant="outline-danger" onClick={() => onEliminarProducto(p.id)}
                  aria-label={`Eliminar ${p.nombre}`}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}

export default AdminProductos
