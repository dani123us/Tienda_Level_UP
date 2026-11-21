import { useEffect, useState } from 'react'
import { Row, Col, Badge } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import EstadoCarga from '../../components/EstadoCarga.jsx'
import ImagenProducto from '../../components/ImagenProducto.jsx'
import { productosApi } from '../../services/api.js'
import { formatearPrecio } from '../../utils/formato.js'

/** Detalle de un producto (Administrador y Vendedor). */
function DetalleProducto() {
  const { id } = useParams()
  const [producto, setProducto] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    productosApi
      .obtener(id)
      .then((datos) => activo && setProducto(datos))
      .catch((e) => activo && setError(e.message))
    return () => {
      activo = false
    }
  }, [id])

  return (
    <>
      <h1 className="h3 border-bottom border-secondary pb-2 mb-4">DETALLE DEL PRODUCTO</h1>
      <EstadoCarga cargando={!producto && !error} error={error}>
        {producto && (
          <div className="panel p-4">
            <Row className="g-4">
              <Col md={4}>
                <ImagenProducto producto={producto} />
              </Col>
              <Col md={8}>
                <Badge bg="secondary" className="mb-2">{producto.categoria}</Badge>
                <h2 className="h4">{producto.nombre}</h2>
                <p className="texto-suave">{producto.descripcion}</p>
                <dl className="row mb-0">
                  <dt className="col-5">Código</dt>
                  <dd className="col-7">{producto.codigo}</dd>
                  <dt className="col-5">Precio</dt>
                  <dd className="col-7">{formatearPrecio(producto.precio)}</dd>
                  <dt className="col-5">Stock</dt>
                  <dd className="col-7">
                    {producto.stock}{' '}
                    {producto.enStockCritico && <Badge bg="warning" text="dark">Stock crítico</Badge>}
                  </dd>
                  <dt className="col-5">Stock crítico</dt>
                  <dd className="col-7">{producto.stockCritico}</dd>
                  <dt className="col-5">Destacado</dt>
                  <dd className="col-7">{producto.destacado ? 'Sí' : 'No'}</dd>
                </dl>
              </Col>
            </Row>
          </div>
        )}
      </EstadoCarga>
      <Link to="/admin/productos" className="btn btn-outline-azul mt-3">
        ← Volver a productos
      </Link>
    </>
  )
}

export default DetalleProducto
