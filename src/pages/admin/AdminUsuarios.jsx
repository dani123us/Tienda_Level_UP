import { useState } from 'react'
import { Row, Col, Form, Button, Alert, Table, Badge } from 'react-bootstrap'
import CampoFormulario from '../../components/CampoFormulario.jsx'
import SelectorRegionComuna from '../../components/SelectorRegionComuna.jsx'
import { rolesUsuario } from '../../data/usuarios.js'
import { validarUsuario, hayErrores } from '../../utils/validaciones.js'

const formularioVacio = {
  run: '',
  rol: '',
  nombre: '',
  apellidos: '',
  correo: '',
  password: '',
  fechaNacimiento: '',
  region: '',
  comuna: '',
  direccion: '',
}

function AdminUsuarios({ usuarios, usuarioActual, onAgregarUsuario, onEliminarUsuario }) {
  const [datos, setDatos] = useState(formularioVacio)
  const [errores, setErrores] = useState({})
  const [guardado, setGuardado] = useState(false)

  function manejarCambio(evento) {
    setDatos({ ...datos, [evento.target.name]: evento.target.value })
  }

  function guardar(evento) {
    evento.preventDefault()
    const nuevosErrores = validarUsuario(datos, usuarios)
    setErrores(nuevosErrores)
    setGuardado(false)
    if (hayErrores(nuevosErrores)) return

    onAgregarUsuario({
      ...datos,
      run: datos.run.trim().toUpperCase(),
      nombre: datos.nombre.trim(),
      apellidos: datos.apellidos.trim(),
      correo: datos.correo.trim().toLowerCase(),
      direccion: datos.direccion.trim(),
      telefono: '',
    })
    setGuardado(true)
    setDatos(formularioVacio)
  }

  return (
    <>
      <h1 className="h3 border-bottom border-secondary pb-2 mb-4">USUARIOS</h1>

      <Form noValidate onSubmit={guardar} className="panel p-4 mb-5">
        <h2 className="h5 texto-azul mb-3">Nuevo usuario</h2>

        {guardado && (
          <Alert variant="success" onClose={() => setGuardado(false)} dismissible>
            Usuario creado exitosamente.
          </Alert>
        )}

        <Row>
          <Col md={6}>
            <CampoFormulario id="run" etiqueta="RUN * (sin puntos ni guion)" placeholder="Ej: 19011022K"
              value={datos.run} error={errores.run} onChange={manejarCambio} />
          </Col>
          <Col md={6}>
            <CampoFormulario id="rol" etiqueta="Tipo de usuario *" opciones={rolesUsuario}
              textoVacio="-- Seleccionar rol --" value={datos.rol} error={errores.rol} onChange={manejarCambio} />
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <CampoFormulario id="nombre" etiqueta="Nombres *" placeholder="Máx. 50 caracteres"
              value={datos.nombre} error={errores.nombre} onChange={manejarCambio} />
          </Col>
          <Col md={6}>
            <CampoFormulario id="apellidos" etiqueta="Apellidos *" placeholder="Máx. 100 caracteres"
              value={datos.apellidos} error={errores.apellidos} onChange={manejarCambio} />
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <CampoFormulario id="correo" etiqueta="Correo electrónico *" type="email" placeholder="correo@duoc.cl"
              value={datos.correo} error={errores.correo} onChange={manejarCambio} />
          </Col>
          <Col md={6}>
            <CampoFormulario id="password" etiqueta="Contraseña *" type="password" placeholder="4 a 10 caracteres"
              autoComplete="new-password" value={datos.password} error={errores.password} onChange={manejarCambio} />
          </Col>
        </Row>
        <CampoFormulario id="fechaNacimiento" etiqueta="Fecha de nacimiento (opcional)" type="date"
          value={datos.fechaNacimiento} onChange={manejarCambio} />
        <SelectorRegionComuna region={datos.region} comuna={datos.comuna} errores={errores}
          onCambiar={(cambios) => setDatos({ ...datos, ...cambios })} />
        <CampoFormulario id="direccion" etiqueta="Dirección *" placeholder="Máx. 300 caracteres"
          value={datos.direccion} error={errores.direccion} onChange={manejarCambio} />

        <Button type="submit" variant="neon" className="w-100">
          CREAR USUARIO
        </Button>
      </Form>

      <h2 className="h5 texto-azul mb-3">Usuarios registrados ({usuarios.length})</h2>
      <Table responsive variant="dark" hover className="align-middle">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Comuna</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{`${u.nombre} ${u.apellidos}`.trim()}</td>
              <td>{u.correo}</td>
              <td>
                <Badge bg={u.rol === 'Administrador' ? 'primary' : 'secondary'}>{u.rol}</Badge>
              </td>
              <td>{u.comuna}</td>
              <td className="text-end">
                <Button size="sm" variant="outline-danger" disabled={u.id === usuarioActual?.id}
                  onClick={() => onEliminarUsuario(u.id)} aria-label={`Eliminar ${u.correo}`}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}

export default AdminUsuarios
