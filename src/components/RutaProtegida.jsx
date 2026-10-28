import { Navigate } from 'react-router-dom'

function RutaProtegida({ usuario, children }) {
  if (!usuario || usuario.rol !== 'Administrador') {
    return (
      <Navigate to="/login" replace state={{ mensaje: 'Debes iniciar sesión como administrador.' }} />
    )
  }
  return children
}

export default RutaProtegida
