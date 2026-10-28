import { Nav } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'

function MenuAdmin() {
  return (
    <Nav variant="pills" className="menu-admin flex-lg-column p-2 gap-1">
      <p className="titulo-seccion small mb-2 px-2 d-none d-lg-block">ADMIN PANEL</p>
      <Nav.Link as={NavLink} to="/admin" end>
        Dashboard
      </Nav.Link>
      <Nav.Link as={NavLink} to="/admin/productos">
        Productos
      </Nav.Link>
      <Nav.Link as={NavLink} to="/admin/usuarios">
        Usuarios
      </Nav.Link>
    </Nav>
  )
}

export default MenuAdmin
