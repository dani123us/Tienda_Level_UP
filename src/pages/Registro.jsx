import { useState } from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import CampoFormulario from '../components/CampoFormulario.jsx'
import SelectorRegionComuna from '../components/SelectorRegionComuna.jsx'
import { validarRegistro, hayErrores } from '../utils/validaciones.js'

const formularioVacio = {
  nombre: '',
  correo: '',
  fechaNacimiento: '',
  password: '',
  confirmPassword: '',
  telefono: '',
  region: '',
  comuna: '',
}

function Registro({ usuarios, onRegistrar }) {
  const navigate = useNavigate()
  const [datos, setDatos] = useState(formularioVacio)
  const [errores, setErrores] = useState({})

  function manejarCambio(evento) {
    setDatos({ ...datos, [evento.target.name]: evento.target.value })
  }

  function enviar(evento) {
    evento.preventDefault()
    const nuevosErrores = validarRegistro(datos, usuarios)
    setErrores(nuevosErrores)
    if (hayErrores(nuevosErrores)) return

    onRegistrar({
      run: '',
      nombre: datos.nombre.trim(),
      apellidos: '',
      correo: datos.correo.trim().toLowerCase(),
      password: datos.password,
      rol: 'Cliente',
      fechaNacimiento: datos.fechaNacimiento,
      region: datos.region,
      comuna: datos.comuna,
      direccion: '',
      telefono: datos.telefono.trim(),
    })
    navigate('/login', {
      state: { mensaje: '¡Registro exitoso! Bienvenido a Level-Up Gamer, ya puedes iniciar sesión.', tipo: 'success' },
    })
  }

  return (
    <Container as="section" className="py-5" style={{ maxWidth: 680 }}>
      <div className="panel-formulario p-4 p-md-5">
        <h1 className="titulo-seccion text-center h3 mb-4">Registro de Usuario</h1>

        <Form noValidate onSubmit={enviar}>
          <CampoFormulario
            id="nombre"
            etiqueta="NOMBRE COMPLETO *"
            placeholder="Ej: Juan Pérez"
            value={datos.nombre}
            error={errores.nombre}
            onChange={manejarCambio}
          />
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

          <Button type="submit" variant="neon" className="w-100 mt-2">
            REGISTRAR
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
