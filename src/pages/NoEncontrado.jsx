import { Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function NoEncontrado() {
  return (
    <Container as="section" className="py-5 text-center">
      <p className="display-1 texto-verde fuente-titulos mb-0">404</p>
      <h1 className="h3 mb-3">GAME OVER: página no encontrada</h1>
      <p className="texto-suave">La página que buscas no existe o fue movida.</p>
      <Link to="/" className="btn btn-neon">
        Volver al inicio
      </Link>
    </Container>
  )
}

export default NoEncontrado
