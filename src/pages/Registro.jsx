import { useState } from 'react'
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import CampoFormulario from '../components/CampoFormulario.jsx'
import SelectorRegionComuna from '../components/SelectorRegionComuna.jsx'
import { useSesion } from '../context/SesionContext.jsx'
import { validarRegistro, hayErrores } from '../utils/validaciones.js'

const formularioVacio = {
  run: '',
  nombre: '',
  apellidos: '',
  correo: '',
  fechaNacimiento: '',
  password: '',
  confirmPassword: '',
  telefono: '',
  region: '',
  comuna: '',
  direccion: '',
}

function Registro({ onAviso = () => {} }) {
  const navigate = useNavigate()
  const { registrar } = useSesion()
  const [datos, setDatos] = useState(formularioVacio)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)

  function manejarCambio(evento) {
    setDatos({ ...datos, [evento.target.name]: evento.target.value })
  }

  async function enviar(evento) {
    evento.preventDefault()
    const nuevosErrores = validarRegistro(datos)
    setErrores(nuevosErrores)
    setErrorGeneral('')
    if (hayErrores(nuevosErrores)) return

    setEnviando(true)
    try {
      const usuario = await registrar({
        run: datos.run.trim().toUpperCase(),
        nombre: datos.nombre.trim(),
        apellidos: datos.apellidos.trim(),
        correo: datos.correo.trim().toLowerCase(),
        password: datos.password,
        fechaNacimiento: datos.fechaNacimiento,
        region: datos.region,
        comuna: datos.comuna,
        direccion: datos.direccion.trim(),
        telefono: datos.telefono.trim(),
      })
      onAviso({ tipo: 'exito', mensaje: `¡Registro exitoso! Bienvenido a Level-Up Gamer, ${usuario.nombre}.` })
      navigate('/')
    } catch (error) {
      // 409: correo o RUN repetido. 400: errores de validación por campo.
      if (error.campos) {
        setErrores(error.campos)
      } else if (error.estado === 409 && /correo/i.test(error.message)) {
        setErrores({ correo: error.message })
      } else if (error.estado === 409 && /run/i.test(error.message)) {
        setErrores({ run: error.message })
      }
      setErrorGeneral(error.message)
      setEnviando(false)
    }
  }

  return (
    <Container as="section" className="py-5" style={{ maxWidth: 720 }}>
      <div className="panel-formulario p-4 p-md-5">
        <h1 className="titulo-seccion text-center h3 mb-4">Registro de Usuario</h1>

        {errorGeneral && <Alert variant="danger">{errorGeneral}</Alert>}

        <Form noValidate onSubmit={enviar}>
          <CampoFormulario
            id="run"
            etiqueta="RUN * (sin puntos ni guion)"
            placeholder="Ej: 19011022K"
            value={datos.run}
            error={errores.run}
            onChange={manejarCambio}
          />
          <Row>
            <Col md={6}>
              <CampoFormulario
                id="nombre"
                etiqueta="NOMBRES *"
                placeholder="Ej: Juan"
                value={datos.nombre}
                error={errores.nombre}
                onChange={manejarCambio}
              />
            </Col>
            <Col md={6}>
              <CampoFormulario
                id="apellidos"
                etiqueta="APELLIDOS *"
                placeholder="Ej: Pérez Soto"
                value={datos.apellidos}
                error={errores.apellidos}
                onChange={manejarCambio}
              />
            </Col>
          </Row>
          <CampoFormulario
            id="correo"
            etiqueta="CORREO *"
            type="email"
            placeholder="correo@duoc.cl"
            ayuda="Con un correo @duoc.cl obtienes 20% de descuento en todas tus compras."
            value={datos.correo}
            error={errores.correo}
            onChange={manejarCambio}
          />
          <CampoFormulario
            id="fechaNacimiento"
            etiqueta="FECHA DE NACIMIENTO *"
            type="date"
            ayuda="Debes ser mayor de 18 años."
            value={datos.fechaNacimiento}
            error={errores.fechaNacimiento}
            onChange={manejarCambio}
          />
          <Row>
            <Col md={6}>
              <CampoFormulario
                id="password"
                etiqueta="CONTRASEÑA *"
                type="password"
                placeholder="4 a 10 caracteres"
                autoComplete="new-password"
                value={datos.password}
                error={errores.password}
                onChange={manejarCambio}
              />
            </Col>
            <Col md={6}>
              <CampoFormulario
                id="confirmPassword"
                etiqueta="CONFIRMAR CONTRASEÑA *"
                type="password"
                autoComplete="new-password"
                value={datos.confirmPassword}
                error={errores.confirmPassword}
                onChange={manejarCambio}
              />
            </Col>
          </Row>
          <CampoFormulario
            id="telefono"
            etiqueta="TELÉFONO (opcional)"
            type="tel"
            placeholder="+56 9 1234 5678"
            value={datos.telefono}
            error={errores.telefono}
            onChange={manejarCambio}
          />
          <SelectorRegionComuna
            region={datos.region}
            comuna={datos.comuna}
            errores={errores}
            onCambiar={(cambios) => setDatos({ ...datos, ...cambios })}
          />
          <CampoFormulario
            id="direccion"
            etiqueta="DIRECCIÓN *"
            placeholder="Calle, número, depto."
            value={datos.direccion}
            error={errores.direccion}
            onChange={manejarCambio}
          />

          <Button type="submit" variant="neon" className="w-100 mt-2" disabled={enviando}>
            {enviando ? 'REGISTRANDO...' : 'REGISTRAR'}
          </Button>
        </Form>

        <p className="text-center small mt-4 mb-0">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </Container>
  )
}

export default Registro
