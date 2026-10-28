import { Row, Col, Alert } from 'react-bootstrap'
import TarjetaProducto from './TarjetaProducto.jsx'

function Catalogo({ productos, onAgregarCarrito, mensajeVacio = 'No hay productos para mostrar.' }) {
  if (productos.length === 0) {
    return <Alert variant="warning">{mensajeVacio}</Alert>
  }

  return (
    <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
      {productos.map((producto) => (
        <Col key={producto.id}>
          <TarjetaProducto producto={producto} onAgregarCarrito={onAgregarCarrito} />
        </Col>
      ))}
    </Row>
  )
}

export default Catalogo
