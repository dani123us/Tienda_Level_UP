import { Navigate, useLocation } from 'react-router-dom'
import { Container, Spinner } from 'react-bootstrap'
import { useSesion } from '../context/SesionContext.jsx'

/**
 * Protege una ruta en el frontend.
 * - Mientras se restaura la sesión (recarga de página) muestra un spinner, así no salta al login.
 * - Sin sesión: manda al login y guarda a dónde quería ir para volver después.
 * - Con un rol que no corresponde: manda a "Acceso denegado".
 * Ojo: esto solo OCULTA lo que no corresponde. La seguridad real está en el backend (responde 401/403).
 */
function RutaProtegida({ roles, children }) {
  const { usuario, cargando } = useSesion()
  const location = useLocation()

  if (cargando) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="info">
          <span className="visually-hidden">Cargando sesión...</span>
        </Spinner>
      </Container>
    )
  }

  if (!usuario) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ mensaje: 'Debes iniciar sesión para continuar.', desde: location.pathname }}
      />
    )
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/acceso-denegado" replace state={{ desde: location.pathname }} />
  }

  return children
}

export default RutaProtegida
