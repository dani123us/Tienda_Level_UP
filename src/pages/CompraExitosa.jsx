import { Container, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import DetalleBoleta from '../components/DetalleBoleta.jsx'
import EstadoCarga from '../components/EstadoCarga.jsx'
import { useBoleta } from '../hooks/useBoleta.js'

function CompraExitosa() {
  const { boleta, cargando, error } = useBoleta()

  return (
    <Container as="section" className="py-5" style={{ maxWidth: 900 }}>
      <EstadoCarga cargando={cargando} error={error}>
        {boleta && (
          <>
            <Alert variant="success" className="text-center p-4">
              <Alert.Heading className="fuente-titulos">¡Pago exitoso!</Alert.Heading>
              <p className="mb-0">
                Gracias por tu compra en Level-Up Gamer. Tu boleta es la N° <strong>{boleta.id}</strong> y la
                enviaremos a {boleta.direccion}, {boleta.comuna}.
              </p>
            </Alert>
            <DetalleBoleta boleta={boleta} />
          </>
        )}
      </EstadoCarga>
      <div className="d-flex flex-wrap gap-2 justify-content-center mt-4">
        <Link to="/productos" className="btn btn-neon">
          Seguir comprando
        </Link>
        <Link to="/mis-compras" className="btn btn-outline-azul">
          Ver mis compras
        </Link>
      </div>
    </Container>
  )
}

export default CompraExitosa
