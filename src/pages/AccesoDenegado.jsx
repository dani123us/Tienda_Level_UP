import { Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function AccesoDenegado() {
  return (
    <Container as="section" className="py-5 text-center">
      <p className="display-1 texto-verde fuente-titulos mb-0">403</p>
      <h1 className="h3 mb-3">Acceso denegado</h1>
      <p className="texto-suave">Tu cuenta no tiene permisos para ver esta sección.</p>
      <Link to="/" className="btn btn-neon">
        Volver al inicio
      </Link>
    </Container>
  )
}

export default AccesoDenegado
