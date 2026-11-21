import { Alert, Button, Spinner } from 'react-bootstrap'

/** Muestra un spinner mientras se cargan datos de la API, o el error con un botón para reintentar. */
function EstadoCarga({ cargando, error, onReintentar, children }) {
  if (cargando) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" variant="info">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </div>
    )
  }
  if (error) {
    return (
      <Alert variant="danger" className="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <span>{error}</span>
        {onReintentar && (
          <Button variant="outline-light" size="sm" onClick={onReintentar}>
            Reintentar
          </Button>
        )}
      </Alert>
    )
  }
  return children
}

export default EstadoCarga
