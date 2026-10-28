import { Container, Row, Col, Card } from 'react-bootstrap'
import { equipo } from '../data/equipo.js'

function Nosotros() {
  return (
    <Container as="section" className="py-5" style={{ maxWidth: 1000 }}>
      <h1 className="text-center mb-5">SOBRE NOSOTROS</h1>

      <div className="panel seccion-borde p-4 mb-4">
        <h2 className="h4 texto-azul">Nuestra Historia</h2>
        <p className="mb-0">
          Level-Up Gamer es una tienda online dedicada a satisfacer las necesidades de los entusiastas de
          los videojuegos en Chile. Lanzada hace dos años como respuesta a la creciente demanda durante
          la pandemia, ofrecemos una amplia gama de productos para gamers, desde consolas y accesorios
          hasta computadores y sillas especializadas. Aunque no contamos con ubicación física, llegamos
          a todo el país.
        </p>
      </div>

      <Row xs={1} md={2} className="g-4 mb-5">
        <Col>
          <div className="panel seccion-borde azul p-4 h-100">
            <h2 className="h4 texto-azul">Misión</h2>
            <p className="mb-0">
              Proporcionar productos de alta calidad para gamers en todo Chile, ofreciendo una
              experiencia de compra única y personalizada, con un enfoque en la satisfacción del cliente
              y el crecimiento de la comunidad gamer.
            </p>
          </div>
        </Col>
        <Col>
          <div className="panel seccion-borde azul p-4 h-100">
            <h2 className="h4 texto-azul">Visión</h2>
            <p className="mb-0">
              Ser la tienda online líder en productos para gamers en Chile, reconocida por su innovación,
              servicio al cliente excepcional, y un programa de fidelización basado en gamificación que
              recompense a nuestros clientes más fieles.
            </p>
          </div>
        </Col>
      </Row>

      <h2 className="h4 texto-azul text-center mb-4">Nuestro Equipo de Desarrollo</h2>
      <Row xs={1} md={2} className="g-4">
        {equipo.map((integrante) => (
          <Col key={integrante.nombre}>
            <Card className="tarjeta-producto h-100 text-center">
              <Card.Body>
                <Card.Title as="h3" className="texto-verde fuente-titulos">
                  {integrante.nombre}
                </Card.Title>
                <Card.Subtitle className="mb-2 texto-suave">{integrante.rol}</Card.Subtitle>
                <Card.Text className="fst-italic texto-suave">{integrante.descripcion}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  )
}

export default Nosotros
