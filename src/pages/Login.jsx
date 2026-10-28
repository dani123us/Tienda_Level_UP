import { useState } from 'react'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CampoFormulario from '../components/CampoFormulario.jsx'
import { validarLogin, hayErrores } from '../utils/validaciones.js'
import { autenticar } from '../utils/usuarios.js'

function Login({ usuarios, onIniciarSesion }) {
  const navigate = useNavigate()
  const location = useLocation()
  const aviso = location.state?.mensaje
  const tipoAviso = location.state?.tipo ?? 'warning'

  const [datos, setDatos] = useState({ correo: '', password: '' })
  const [errores, setErrores] = useState({})
  const [errorAcceso, setErrorAcceso] = useState('')

  function manejarCambio(evento) {
    setDatos({ ...datos, [evento.target.name]: evento.target.value })
  }

  function enviar(evento) {
    evento.preventDefault()
    const nuevosErrores = validarLogin(datos)
    setErrores(nuevosErrores)
    setErrorAcceso('')
    if (hayErrores(nuevosErrores)) return

    const usuario = autenticar(usuarios, datos.correo, datos.password)
    if (!usuario) {
      setErrorAcceso('Correo o contraseña incorrectos.')
      return
    }
    onIniciarSesion(usuario)
    navigate(usuario.rol === 'Administrador' ? '/admin' : '/')
  }

  return (
    <Container as="section" className="py-5" style={{ maxWidth: 520 }}>
      <div className="panel-formulario p-4 p-md-5">
        <h1 className="titulo-seccion text-center h3 mb-1">LEVEL-UP GAMER</h1>
        <h2 className="h6 text-center texto-suave mb-4 fuente-titulos">INICIO DE SESIÓN</h2>

        {aviso && <Alert variant={tipoAviso}>{aviso}</Alert>}
        {errorAcceso && <Alert variant="danger">{errorAcceso}</Alert>}

        <Form noValidate onSubmit={enviar}>
          <CampoFormulario
            id="correo"
            etiqueta="CORREO"
            type="email"
            placeholder="correo@duoc.cl"
            autoComplete="email"
            value={datos.correo}
            error={errores.correo}
            onChange={manejarCambio}
          />
          <CampoFormulario
            id="password"
            etiqueta="CONTRASEÑA"
            type="password"
            placeholder="Ingresa tu contraseña"
            autoComplete="current-password"
            value={datos.password}
            error={errores.password}
            onChange={manejarCambio}
          />
          <Button type="submit" variant="neon" className="w-100 mt-2">
            INGRESAR
          </Button>
        </Form>

        <p className="text-center small mt-4 mb-0">
          ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
      </div>
    </Container>
  )
}

export default Login
