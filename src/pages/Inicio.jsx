import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Portada from '../components/Portada.jsx'
import Catalogo from '../components/Catalogo.jsx'
import EstadoCarga from '../components/EstadoCarga.jsx'

const beneficios = [
  { icono: '🎓', titulo: '20% Duoc', texto: 'Regístrate con tu correo @duoc.cl y obtén descuento permanente.' },
  { icono: '🚚', titulo: 'Todo Chile', texto: 'Despachamos a cualquier región del país, sin tienda física.' },
  { icono: '🏆', titulo: 'Comunidad', texto: 'Tus compras apoyan eventos y torneos gamer locales.' },
]

function Inicio({ productos, cargando, error, onReintentar, onAgregarCarrito }) {
  const destacados = productos.filter((p) => p.destacado).slice(0, 4)

  return (
    <>
      <Portada />

      <Container as="section" className="py-5">
        <h2 className="titulo-seccion text-center mb-4">Productos Destacados</h2>
        <EstadoCarga cargando={cargando} error={error} onReintentar={onReintentar}>
          <Catalogo productos={destacados} onAgregarCarrito={onAgregarCarrito} />
        </EstadoCarga>
        <div className="text-center mt-4">
          <Link to="/productos" className="btn btn-outline-azul">
            Ver catálogo completo
          </Link>
        </div>
      </Container>

      <Container as="section" className="pb-5">
        <Row xs={1} md={3} className="g-3">
          {beneficios.map((b) => (
            <Col key={b.titulo}>
              <div className="panel h-100 p-4 text-center">
                <div className="fs-1 mb-2" aria-hidden="true">{b.icono}</div>
                <h3 className="h5 texto-azul">{b.titulo}</h3>
                <p className="texto-suave mb-0">{b.texto}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  )
}

export default Inicio
