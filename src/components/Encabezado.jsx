import { useState } from 'react'
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap'
import { Link, NavLink } from 'react-router-dom'

const enlaces = [
  { ruta: '/', texto: 'Home' },
  { ruta: '/productos', texto: 'Productos' },
  { ruta: '/nosotros', texto: 'Nosotros' },
  { ruta: '/blogs', texto: 'Blogs' },
  { ruta: '/contacto', texto: 'Contacto' },
]

function Encabezado({ cantidadCarrito, usuario, onCerrarSesion }) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const cerrarMenu = () => setMenuAbierto(false)

  function cerrarSesion() {
    cerrarMenu()
    onCerrarSesion()
  }

  return (
    <Navbar
      expand="lg"
      sticky="top"
      className="barra-navegacion py-3"
      expanded={menuAbierto}
      onToggle={setMenuAbierto}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" onClick={cerrarMenu}>
          LEVEL-UP GAMER
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="menu-principal" />
        <Navbar.Collapse id="menu-principal">
          <Nav className="me-auto">
            {enlaces.map((enlace) => (
              <Nav.Link
                key={enlace.ruta}
                as={NavLink}
                to={enlace.ruta}
                end={enlace.ruta === '/'}
                onClick={cerrarMenu}
              >
                {enlace.texto}
              </Nav.Link>
            ))}
          </Nav>

          <Nav className="align-items-lg-center gap-lg-2">
            {usuario ? (
              <>
                <Navbar.Text className="me-lg-1">
                  Hola, <strong className="texto-verde">{usuario.nombre}</strong>
                </Navbar.Text>
                {usuario.rol === 'Administrador' && (
                  <Nav.Link as={NavLink} to="/admin" onClick={cerrarMenu}>
                    Panel admin
                  </Nav.Link>
                )}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="align-self-start align-self-lg-center my-2 my-lg-0"
                  onClick={cerrarSesion}
                >
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login" onClick={cerrarMenu}>
                  Iniciar sesión
                </Nav.Link>
                <Nav.Link as={NavLink} to="/registro" onClick={cerrarMenu}>
                  Registrar usuario
                </Nav.Link>
              </>
            )}
            <Link
              to="/carrito"
              className="btn btn-outline-azul align-self-start align-self-lg-center mt-2 mt-lg-0"
              onClick={cerrarMenu}
            >
              🛒 Carrito{' '}
              <Badge pill className="badge-carrito" data-testid="contador-carrito">
                {cantidadCarrito}
              </Badge>
            </Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Encabezado
