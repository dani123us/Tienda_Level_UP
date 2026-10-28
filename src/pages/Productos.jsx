import { useState } from 'react'
import { Container, Row, Col, Form } from 'react-bootstrap'
import Catalogo from '../components/Catalogo.jsx'
import FiltroCategorias from '../components/FiltroCategorias.jsx'
import { obtenerCategorias, filtrarProductos } from '../utils/productos.js'

function Productos({ productos, onAgregarCarrito }) {
  const [categoria, setCategoria] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')

  const categorias = obtenerCategorias(productos)
  const visibles = filtrarProductos(productos, { categoria, busqueda })

  return (
    <Container as="section" className="py-5">
      <h1 className="titulo-seccion text-center mb-4">Catálogo Completo</h1>

      <Row className="g-3 align-items-center mb-4">
        <Col lg={8}>
          <FiltroCategorias categorias={categorias} seleccionada={categoria} onSeleccionar={setCategoria} />
        </Col>
        <Col lg={4}>
          <Form.Control
            type="search"
            placeholder="Buscar producto..."
            aria-label="Buscar producto"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </Col>
      </Row>

      <p className="texto-suave small" aria-live="polite">
        Mostrando {visibles.length} de {productos.length} productos
      </p>
      <Catalogo
        productos={visibles}
        onAgregarCarrito={onAgregarCarrito}
        mensajeVacio="No encontramos productos con ese filtro."
      />
    </Container>
  )
}

export default Productos
