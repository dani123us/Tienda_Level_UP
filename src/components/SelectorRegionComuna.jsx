import { Row, Col } from 'react-bootstrap'
import CampoFormulario from './CampoFormulario.jsx'
import { regiones } from '../data/regiones.js'

function SelectorRegionComuna({ region, comuna, errores = {}, onCambiar }) {
  const comunas = region ? regiones[region] : []

  return (
    <Row>
      <Col md={6}>
        <CampoFormulario
          id="region"
          etiqueta="Región *"
          textoVacio="-- Seleccione la región --"
          opciones={Object.keys(regiones)}
          value={region}
          error={errores.region}
          onChange={(e) => onCambiar({ region: e.target.value, comuna: '' })}
        />
      </Col>
      <Col md={6}>
        <CampoFormulario
          id="comuna"
          etiqueta="Comuna *"
          textoVacio="-- Seleccione la comuna --"
          opciones={comunas}
          value={comuna}
          error={errores.comuna}
          disabled={!region}
          onChange={(e) => onCambiar({ comuna: e.target.value })}
        />
      </Col>
    </Row>
  )
}

export default SelectorRegionComuna
