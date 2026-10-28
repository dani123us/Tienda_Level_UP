import { useState } from 'react'
import { Container, Row, Col, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import ItemCarrito from '../components/ItemCarrito.jsx'
import ResumenCompra from '../components/ResumenCompra.jsx'
import { formatearPrecio } from '../utils/formato.js'
import {
  calcularResumen,
  contarUnidades,
  esCorreoDuoc,
  obtenerDescuentoCupon,
} from '../utils/carrito.js'

function Carrito({ items, usuario, onCambiarCantidad, onQuitar, onPagar }) {
  const [cupon, setCupon] = useState(null)
  const [errorCupon, setErrorCupon] = useState('')
  const [compraFinalizada, setCompraFinalizada] = useState(null)

  const esDuoc = usuario ? esCorreoDuoc(usuario.correo) : false
  const resumen = calcularResumen(items, { esDuoc, porcentajeCupon: cupon?.porcentaje ?? 0 })

  function aplicarCupon(codigo) {
    const porcentaje = obtenerDescuentoCupon(codigo)
    if (porcentaje === 0) {
      setCupon(null)
      setErrorCupon('Cupón inválido o expirado.')
      return
    }
    setCupon({ codigo: codigo.trim().toUpperCase(), porcentaje })
    setErrorCupon('')
  }

  function pagar() {
    setCompraFinalizada({ total: resumen.total, unidades: contarUnidades(items) })
    setCupon(null)
    onPagar()
  }

  if (compraFinalizada) {
    return (
      <Container as="section" className="py-5" style={{ maxWidth: 700 }}>
        <Alert variant="success" className="text-center p-4">
          <Alert.Heading className="fuente-titulos">¡Gracias por tu compra en Level-Up Gamer!</Alert.Heading>
          <p className="mb-0">
            Pagaste <strong>{formatearPrecio(compraFinalizada.total)}</strong> por{' '}
            {compraFinalizada.unidades} {compraFinalizada.unidades === 1 ? 'producto' : 'productos'}.
          </p>
        </Alert>
        <div className="text-center">
          <Link to="/productos" className="btn btn-neon">
            Seguir comprando
          </Link>
        </div>
      </Container>
    )
  }

  return (
    <Container as="section" className="py-5">
      <h1 className="h2 mb-4">Mi carrito de compras</h1>
      <Row className="g-4">
        <Col lg={8}>
          {items.length === 0 ? (
            <Alert variant="secondary">
              Tu carrito está vacío. <Alert.Link as={Link} to="/productos">Ve a la sección de productos</Alert.Link>{' '}
              y añade algo.
            </Alert>
          ) : (
            items.map((item) => (
              <ItemCarrito key={item.id} item={item} onCambiarCantidad={onCambiarCantidad} onQuitar={onQuitar} />
            ))
          )}
        </Col>
        <Col lg={4}>
          <div className="sticky-lg-top" style={{ top: 100 }}>
            <ResumenCompra
              resumen={resumen}
              esDuoc={esDuoc}
              cupon={cupon}
              errorCupon={errorCupon}
              onAplicarCupon={aplicarCupon}
              onPagar={pagar}
              sinProductos={items.length === 0}
            />
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default Carrito
