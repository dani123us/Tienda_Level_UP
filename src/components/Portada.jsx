import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import banner from '../assets/banner.jpg'

function Portada() {
  return (
    <section className="portada py-5">
      <Container>
        <Row className="align-items-center gy-4">
          <Col lg={7} className="text-center text-lg-start">
            <h1 className="display-5 fw-bold mb-3">DESAFÍA TUS LÍMITES</h1>
            <p className="lead texto-suave mb-4">
              Conviértete en el héroe de tu propia historia y únete a nuestra comunidad de
              jugadores. ¡Explora, juega y gana con nosotros!
            </p>
            <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-lg-start">
              <Link to="/productos" className="btn btn-neon btn-lg">
                Ver productos
              </Link>
              <Link to="/registro" className="btn btn-outline-azul btn-lg">
                Únete con 20% Duoc
              </Link>
            </div>
          </Col>
          <Col lg={5} className="text-center">
            <img src={banner} alt="Banner Level-Up Gamer" className="portada-imagen" />
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default Portada
