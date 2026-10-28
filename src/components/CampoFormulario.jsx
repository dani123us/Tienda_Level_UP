import { Form } from 'react-bootstrap'

function CampoFormulario({
  id,
  etiqueta,
  error,
  ayuda,
  opciones,
  textoVacio = '-- Seleccionar --',
  className = 'mb-3',
  ...propsDelControl
}) {
  const invalido = Boolean(error)

  return (
    <Form.Group className={className} controlId={id}>
      <Form.Label>{etiqueta}</Form.Label>
      {opciones ? (
        <Form.Select name={id} isInvalid={invalido} {...propsDelControl}>
          <option value="">{textoVacio}</option>
          {opciones.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </Form.Select>
      ) : (
        <Form.Control name={id} isInvalid={invalido} {...propsDelControl} />
      )}
      {ayuda && <Form.Text className="texto-suave">{ayuda}</Form.Text>}
      <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
    </Form.Group>
  )
}

export default CampoFormulario
