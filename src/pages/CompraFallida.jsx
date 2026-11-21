import { Container, Alert, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import DetalleBoleta from '../components/DetalleBoleta.jsx'
import EstadoCarga from '../components/EstadoCarga.jsx'
import { useBoleta } from '../hooks/useBoleta.js'

function CompraFallida() {
  const navigate = useNavigate()
  const { boleta, cargando, error } = useBoleta()

  // Vuelve al checkout con los datos de despacho ya llenos (los de la tarjeta se piden de nuevo).
  function reintentar() {
    navigate('/checkout', {
      state: {
        datos: {
          nombre: boleta.nombreCliente,
          correo: boleta.correoCliente,
          telefono: boleta.telefono ?? '',
          direccion: boleta.direccion,
          region: boleta.region,
          comuna: boleta.comuna,
          indicaciones: boleta.indicaciones ?? '',
          metodoPago: boleta.metodoPago,
        },
      },
    })
  }

  return (
    <Container as="section" className="py-5" style={{ maxWidth: 900 }}>
      <EstadoCarga cargando={cargando} error={error}>
        {boleta && (
          <>
            <Alert variant="danger" className="text-center p-4">
              <Alert.Heading className="fuente-titulos">El pago fue rechazado</Alert.Heading>
              <p className="mb-1">{boleta.motivoRechazo}</p>
              <p className="small mb-0">No se hizo ningún cobro y tu carrito sigue guardado.</p>
            </Alert>
            <div className="d-flex flex-wrap gap-2 justify-content-center mb-4">
              <Button variant="neon" onClick={reintentar}>
                Reintentar pago
              </Button>
              <Link to="/carrito" className="btn btn-outline-azul">
                Volver al carrito
              </Link>
            </div>
            <DetalleBoleta boleta={boleta} />
          </>
        )}
      </EstadoCarga>
    </Container>
  )
}

export default CompraFallida
