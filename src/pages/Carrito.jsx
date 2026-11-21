import { useState } from 'react'
import { Container, Row, Col, Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import ItemCarrito from '../components/ItemCarrito.jsx'
import ResumenCompra from '../components/ResumenCompra.jsx'
import { calcularResumen, esCorreoDuoc, obtenerDescuentoCupon } from '../utils/carrito.js'

function Carrito({ items, usuario, cupon, onCambiarCupon, onCambiarCantidad, onQuitar }) {
  const navigate = useNavigate()
  const [errorCupon, setErrorCupon] = useState('')

  const esDuoc = usuario ? esCorreoDuoc(usuario.correo) : false
  const resumen = calcularResumen(items, { esDuoc, porcentajeCupon: cupon?.porcentaje ?? 0 })

  function aplicarCupon(codigo) {
    const porcentaje = obtenerDescuentoCupon(codigo)
    if (porcentaje === 0) {
      onCambiarCupon(null)
      setErrorCupon('Cupón inválido o expirado.')
      return
    }
    onCambiarCupon({ codigo: codigo.trim().toUpperCase(), porcentaje })
    setErrorCupon('')
  }

  // Si no hay sesión, la ruta /checkout manda al login y luego vuelve al checkout.
  function irAPagar() {
    navigate('/checkout')
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
          {!usuario && items.length > 0 && (
            <Alert variant="info" className="small">
              Para pagar necesitas <Alert.Link as={Link} to="/login" state={{ desde: '/checkout' }}>iniciar sesión</Alert.Link>.
            </Alert>
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
              onPagar={irAPagar}
              sinProductos={items.length === 0}
            />
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default Carrito
