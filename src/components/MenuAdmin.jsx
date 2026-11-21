import { Nav } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { useSesion } from '../context/SesionContext.jsx'
import { ROLES } from '../data/roles.js'

const opciones = [
  { ruta: '/admin', texto: 'Dashboard', roles: [ROLES.administrador, ROLES.vendedor], fin: true },
  { ruta: '/admin/productos', texto: 'Productos', roles: [ROLES.administrador, ROLES.vendedor] },
  { ruta: '/admin/ordenes', texto: 'Órdenes', roles: [ROLES.administrador, ROLES.vendedor] },
  { ruta: '/admin/categorias', texto: 'Categorías', roles: [ROLES.administrador] },
  { ruta: '/admin/usuarios', texto: 'Usuarios', roles: [ROLES.administrador] },
]

/** Menú lateral del panel: cada rol ve solo las opciones que le corresponden. */
function MenuAdmin() {
  const { usuario, tieneRol } = useSesion()
  const visibles = opciones.filter((opcion) => tieneRol(...opcion.roles))
  const titulo = usuario?.rol === ROLES.vendedor ? 'PANEL VENDEDOR' : 'PANEL ADMIN'

  return (
    <Nav variant="pills" className="menu-admin flex-lg-column p-2 gap-1" aria-label="Menú del panel">
      <p className="titulo-seccion small mb-2 px-2 d-none d-lg-block">{titulo}</p>
      {visibles.map((opcion) => (
        <Nav.Link key={opcion.ruta} as={NavLink} to={opcion.ruta} end={opcion.fin}>
          {opcion.texto}
        </Nav.Link>
      ))}
    </Nav>
  )
}

export default MenuAdmin
