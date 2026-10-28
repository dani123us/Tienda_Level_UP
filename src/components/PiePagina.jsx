import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const anio = new Date().getFullYear()

function PiePagina() {
  return (
    <footer className="pie-pagina py-4 mt-auto">
      <Container>
        <Row className="gy-3">
          <Col md={5}>
            <p className="titulo-seccion mb-1">LEVEL-UP GAMER</p>
            <p className="small mb-0">
              Impacto comunitario: tus compras apoyan a la comunidad gamer y eventos locales.
            </p>
          </Col>
          <Col xs={6} md={3}>
            <p className="fw-bold mb-1">Tienda</p>
            <ul className="list-unstyled small mb-0">
              <li><Link to="/productos">Productos</Link></li>
              <li><Link to="/blogs">Blogs</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
          </Col>
          <Col xs={6} md={4}>
            <p className="fw-bold mb-1">Contacto</p>
            <ul className="list-unstyled small mb-0">
              <li>contacto@levelupgamer.cl</li>
              <li>Envíos a todo Chile</li>
            </ul>
          </Col>
        </Row>
        <hr className="border-secondary" />
        <p className="small text-center mb-0">
          &copy; {anio} Level-Up Gamer. Todos los derechos reservados.
        </p>
      </Container>
    </footer>
  )
}

export default PiePagina
