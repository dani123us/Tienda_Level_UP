import { useEffect, useState } from 'react'
import { Row, Col, Form, Button, Alert, Table, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import CampoFormulario from '../../components/CampoFormulario.jsx'
import { useSesion } from '../../context/SesionContext.jsx'
import { categoriasApi, productosApi } from '../../services/api.js'
import { validarProducto, hayErrores, esStockCritico } from '../../utils/validaciones.js'
import { formatearPrecio } from '../../utils/formato.js'

const OTRA_CATEGORIA = '__otra__'

const formularioVacio = {
  codigo: '',
  nombre: '',
  descripcion: '',
  precio: '',
  categoria: '',
  categoriaNueva: '',
  stock: '',
  stockCritico: '',
  imagen: '',
  icono: '🎮',
  destacado: false,
}

function aFormulario(producto) {
  return {
    codigo: producto.codigo,
    nombre: producto.nombre,
    descripcion: producto.descripcion ?? '',
    precio: String(producto.precio),
    categoria: producto.categoria,
    categoriaNueva: '',
    stock: String(producto.stock),
    stockCritico: String(producto.stockCritico),
    imagen: producto.imagen ?? '',
    icono: producto.icono ?? '🎮',
    destacado: producto.destacado,
  }
}

/**
 * Administrador: crear, editar y eliminar productos.
 * Vendedor: solo ve la lista (sin formulario ni botones de acción).
 */
function AdminProductos({ productos, onCambio = () => {}, onAviso = () => {} }) {
  const { tieneRol } = useSesion()
  const esAdmin = tieneRol('Administrador')

  const [categorias, setCategorias] = useState([])
  const [datos, setDatos] = useState(formularioVacio)
  const [editando, setEditando] = useState(null)
  const [errores, setErrores] = useState({})
  const [resultado, setResultado] = useState(null)
  const [errorApi, setErrorApi] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!esAdmin) return
    categoriasApi
      .listar()
      .then((lista) => setCategorias(lista.map((c) => c.nombre)))
      .catch(() => setCategorias([]))
  }, [esAdmin])

  function manejarCambio(evento) {
    const { name, value, type, checked } = evento.target
    setDatos({ ...datos, [name]: type === 'checkbox' ? checked : value })
  }

  function empezarEdicion(producto) {
    setEditando(producto.id)
    setDatos(aFormulario(producto))
    setErrores({})
    setResultado(null)
    setErrorApi('')
    window.scrollTo(0, 0)
  }

  function cancelarEdicion() {
    setEditando(null)
    setDatos(formularioVacio)
    setErrores({})
  }

  async function guardar(evento) {
    evento.preventDefault()
    const categoria = datos.categoria === OTRA_CATEGORIA ? datos.categoriaNueva.trim() : datos.categoria
    const nuevosErrores = validarProducto({ ...datos, categoria }, productos, editando)
    setErrores(nuevosErrores)
    setResultado(null)
    setErrorApi('')
    if (hayErrores(nuevosErrores)) return

    const producto = {
      codigo: datos.codigo.trim().toUpperCase(),
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion.trim(),
      precio: Number(datos.precio),
      categoria,
      stock: Number(datos.stock),
      stockCritico: datos.stockCritico === '' ? 0 : Number(datos.stockCritico),
      imagen: datos.imagen.trim(),
      icono: datos.icono || '🎮',
      destacado: datos.destacado,
    }

    setGuardando(true)
    try {
      if (editando) {
        await productosApi.actualizar(editando, producto)
      } else {
        await productosApi.crear(producto)
      }
      setResultado({ editado: Boolean(editando), critico: esStockCritico(producto.stock, producto.stockCritico) })
      onAviso({ tipo: 'exito', mensaje: `Producto ${producto.nombre} guardado.` })
      setEditando(null)
      setDatos(formularioVacio)
      if (!categorias.includes(categoria)) setCategorias([...categorias, categoria].sort())
      onCambio()
    } catch (error) {
      if (error.campos) setErrores(error.campos)
      setErrorApi(error.message)
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar(producto) {
    if (!window.confirm(`¿Eliminar el producto ${producto.nombre}? Esta acción no se puede deshacer.`)) return
    try {
      await productosApi.eliminar(producto.id)
      onAviso({ tipo: 'exito', mensaje: `Producto ${producto.nombre} eliminado.` })
      if (editando === producto.id) cancelarEdicion()
      onCambio()
    } catch (error) {
      onAviso({ tipo: 'error', mensaje: error.message })
    }
  }

  return (
    <>
      <h1 className="h3 border-bottom border-secondary pb-2 mb-4">PRODUCTOS</h1>

      {esAdmin && (
        <Form noValidate onSubmit={guardar} className="panel p-4 mb-5">
          <h2 className="h5 texto-azul mb-3">{editando ? `Editando: ${datos.nombre}` : 'Nuevo producto'}</h2>

          {resultado && (
            <Alert variant="success" onClose={() => setResultado(null)} dismissible>
              {resultado.editado ? 'Producto actualizado correctamente.' : 'Producto guardado exitosamente en el sistema.'}
              {resultado.critico && (
                <div className="text-warning-emphasis mt-1">
                  ⚠️ Alerta: el stock actual es igual o inferior al stock crítico.
                </div>
              )}
            </Alert>
          )}
          {errorApi && <Alert variant="danger">{errorApi}</Alert>}

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
              <Form.Group className="mb-3" controlId="categoria">
                <Form.Label>Categoría *</Form.Label>
                <Form.Select name="categoria" value={datos.categoria} onChange={manejarCambio}
                  isInvalid={Boolean(errores.categoria) && datos.categoria !== OTRA_CATEGORIA}>
                  <option value="">-- Seleccionar --</option>
                  {[...new Set([...categorias, ...(datos.categoria && datos.categoria !== OTRA_CATEGORIA ? [datos.categoria] : [])])]
                    .map((c) => <option key={c} value={c}>{c}</option>)}
                  <option value={OTRA_CATEGORIA}>+ Nueva categoría...</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errores.categoria}</Form.Control.Feedback>
              </Form.Group>
              {datos.categoria === OTRA_CATEGORIA && (
                <CampoFormulario id="categoriaNueva" etiqueta="Nombre de la nueva categoría *"
                  value={datos.categoriaNueva} error={errores.categoria} onChange={manejarCambio} />
              )}
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
          <Row>
            <Col md={8}>
              <CampoFormulario id="imagen" etiqueta="Imagen URL (opcional)" placeholder="https://..."
                value={datos.imagen} error={errores.imagen} onChange={manejarCambio} />
            </Col>
            <Col md={4}>
              <CampoFormulario id="icono" etiqueta="Ícono" maxLength={4} value={datos.icono}
                onChange={manejarCambio} />
            </Col>
          </Row>
          <Form.Check className="mb-3" id="destacado" name="destacado" label="Mostrar como destacado en el inicio"
            checked={datos.destacado} onChange={manejarCambio} />

          <div className="d-flex flex-wrap gap-2">
            <Button type="submit" variant="neon" className="flex-grow-1" disabled={guardando}>
              {editando ? 'Guardar cambios' : 'GUARDAR PRODUCTO'}
            </Button>
            {editando && (
              <Button variant="outline-secondary" onClick={cancelarEdicion}>
                Cancelar
              </Button>
            )}
          </div>
        </Form>
      )}

      {!esAdmin && (
        <Alert variant="secondary" className="small">
          Vista de solo lectura: como Vendedor puedes revisar el catálogo y su stock.
        </Alert>
      )}

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
              <td className="text-end text-nowrap">
                <Link to={`/admin/productos/${p.id}`} className="btn btn-sm btn-outline-info me-1">
                  Ver
                </Link>
                {esAdmin && (
                  <>
                    <Button size="sm" variant="outline-warning" className="me-1" onClick={() => empezarEdicion(p)}
                      aria-label={`Editar ${p.nombre}`}>
                      Editar
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => eliminar(p)}
                      aria-label={`Eliminar ${p.nombre}`}>
                      Eliminar
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}

export default AdminProductos
