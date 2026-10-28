import { useState } from 'react'
import { Container, Row, Col, Button, Modal } from 'react-bootstrap'
import { blogs } from '../data/blogs.js'

function Blogs() {
  const [blogAbierto, setBlogAbierto] = useState(null)

  return (
    <Container as="section" className="py-5" style={{ maxWidth: 1000 }}>
      <h1 className="text-center mb-5">NOTICIAS IMPORTANTES</h1>

      {blogs.map((blog, indice) => (
        <article key={blog.id} className="tarjeta-blog rounded-3 mb-4">
          <Row className="g-0">
            <Col md={6} className={indice % 2 === 1 ? 'order-md-2' : ''}>
              <img src={blog.imagen} alt={blog.titulo} />
            </Col>
            <Col md={6} className="p-4 p-lg-5 d-flex flex-column justify-content-center">
              <h3>{blog.titulo}</h3>
              <p className="texto-suave">{blog.resumen}</p>
              <Button variant="outline-azul" className="align-self-start" onClick={() => setBlogAbierto(blog)}>
                VER CASO
              </Button>
            </Col>
          </Row>
        </article>
      ))}

      <Modal show={blogAbierto !== null} onHide={() => setBlogAbierto(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="texto-azul fs-5">{blogAbierto?.titulo}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {blogAbierto?.contenido.map((parrafo) => (
            <p key={parrafo}>{parrafo}</p>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="neon" onClick={() => setBlogAbierto(null)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Blogs
