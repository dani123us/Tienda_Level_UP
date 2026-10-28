import { Row, Col, Button } from 'react-bootstrap'
import ImagenProducto from './ImagenProducto.jsx'
import { formatearPrecio } from '../utils/formato.js'

function ItemCarrito({ item, onCambiarCantidad, onQuitar }) {
  const llegoAlStock = item.cantidad >= item.stock

  return (
    <div className="item-carrito p-3 mb-3">
      <Row className="align-items-center g-3">
        <Col xs={12} md={6} className="d-flex align-items-center gap-3">
          <ImagenProducto producto={item} miniatura />
          <div>
            <h3 className="h6 mb-1 fuente-titulos">{item.nombre}</h3>
            <span className="precio fs-6">{formatearPrecio(item.precio)}</span>
            {llegoAlStock && <div className="small text-warning">Máximo disponible</div>}
          </div>
        </Col>

        <Col xs={6} md={3} className="d-flex align-items-center gap-2 justify-content-md-center">
          <Button
            variant="azul"
            size="sm"
            aria-label={`Restar una unidad de ${item.nombre}`}
            onClick={() => onCambiarCantidad(item.id, -1)}
          >
            −
          </Button>
          <span className="fw-bold fs-5 px-2" data-testid="cantidad-item">
            {item.cantidad}
          </span>
          <Button
            variant="azul"
            size="sm"
            aria-label={`Sumar una unidad de ${item.nombre}`}
            disabled={llegoAlStock}
            onClick={() => onCambiarCantidad(item.id, 1)}
          >
            +
          </Button>
        </Col>

        <Col xs={6} md={3} className="text-end">
          <div className="small texto-suave">Subtotal</div>
          <strong className="d-block mb-1">{formatearPrecio(item.precio * item.cantidad)}</strong>
          <Button variant="outline-danger" size="sm" onClick={() => onQuitar(item.id)}>
            Quitar
          </Button>
        </Col>
      </Row>
    </div>
  )
}

export default ItemCarrito
