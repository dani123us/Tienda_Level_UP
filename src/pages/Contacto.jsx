import { useState } from 'react'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import CampoFormulario from '../components/CampoFormulario.jsx'
import { validarContacto, hayErrores } from '../utils/validaciones.js'

const formularioVacio = { nombre: '', correo: '', comentario: '' }

function Contacto() {
  const [datos, setDatos] = useState(formularioVacio)
  const [errores, setErrores] = useState({})
  const [enviado, setEnviado] = useState(false)

  function manejarCambio(evento) {
    setDatos({ ...datos, [evento.target.name]: evento.target.value })
  }

  function enviar(evento) {
    evento.preventDefault()
    const nuevosErrores = validarContacto(datos)
    setErrores(nuevosErrores)
    setEnviado(false)
    if (hayErrores(nuevosErrores)) return

    setEnviado(true)
    setDatos(formularioVacio)
  }

  return (
    <Container as="section" className="py-5" style={{ maxWidth: 640 }}>
      <div className="panel-formulario p-4 p-md-5">
        <h1 className="titulo-seccion text-center h3 mb-1">LEVEL-UP GAMER</h1>
        <h2 className="h6 text-center texto-suave mb-4 fuente-titulos">FORMULARIO DE CONTACTO</h2>

        {enviado && (
          <Alert variant="success" onClose={() => setEnviado(false)} dismissible>
            ¡Tu mensaje fue enviado correctamente! Nos pondremos en contacto contigo pronto.
          </Alert>
        )}

        <Form noValidate onSubmit={enviar}>
          <CampoFormulario
            id="nombre"
            etiqueta="NOMBRE COMPLETO"
            placeholder="Tu nombre"
            value={datos.nombre}
            error={errores.nombre}
            onChange={manejarCambio}
          />
          <CampoFormulario
            id="correo"
            etiqueta="CORREO"
            type="email"
            placeholder="correo@gmail.com"
            value={datos.correo}
            error={errores.correo}
            onChange={manejarCambio}
          />
          <CampoFormulario
            id="comentario"
            etiqueta="COMENTARIO / MENSAJE"
            as="textarea"
            rows={5}
            placeholder="Escribe tu mensaje aquí..."
            value={datos.comentario}
            error={errores.comentario}
            ayuda={`${datos.comentario.length}/500 caracteres`}
            onChange={manejarCambio}
          />
          <Button type="submit" variant="neon" className="w-100 mt-2">
            ENVIAR MENSAJE
          </Button>
        </Form>
      </div>
    </Container>
  )
}

export default Contacto
