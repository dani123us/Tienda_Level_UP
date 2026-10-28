import { Card, Button, Badge } from 'react-bootstrap'
import ImagenProducto from './ImagenProducto.jsx'
import { formatearPrecio } from '../utils/formato.js'

function TarjetaProducto({ producto, onAgregarCarrito }) {
  const { nombre, categoria, precio, stock, stockCritico, descripcion } = producto
  const agotado = stock === 0
  const ultimasUnidades = !agotado && stock <= stockCritico

  let textoStock = `Stock: ${stock} unidades`
  let claseStock = 'text-success'
  if (agotado) {
    textoStock = 'Sin stock'
    claseStock = 'text-danger'
  } else if (ultimasUnidades) {
    textoStock = `¡Últimas ${stock} unidades!`
    claseStock = 'text-warning'
  }

  return (
    <Card className="tarjeta-producto h-100">
      <ImagenProducto producto={producto} />
      <Card.Body className="d-flex flex-column">
        <Badge bg="secondary" className="align-self-start mb-2">
          {categoria}
        </Badge>
        <Card.Title as="h3">{nombre}</Card.Title>
        {descripcion && <Card.Text className="texto-suave small">{descripcion}</Card.Text>}
        <Card.Text className="precio mb-1">{formatearPrecio(precio)}</Card.Text>
        <Card.Text className={`small ${claseStock}`}>{textoStock}</Card.Text>
        <Button
          variant="neon"
          className="mt-auto"
          disabled={agotado}
          onClick={() => onAgregarCarrito(producto)}
        >
          {agotado ? 'Agotado' : 'Añadir al carrito'}
        </Button>
      </Card.Body>
    </Card>
  )
}

export default TarjetaProducto
