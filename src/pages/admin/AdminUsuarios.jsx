import { useCallback, useEffect, useState } from 'react'
import { Row, Col, Form, Button, Alert, Table, Badge } from 'react-bootstrap'
import CampoFormulario from '../../components/CampoFormulario.jsx'
import EstadoCarga from '../../components/EstadoCarga.jsx'
import SelectorRegionComuna from '../../components/SelectorRegionComuna.jsx'
import { useSesion } from '../../context/SesionContext.jsx'
import { rolesUsuario } from '../../data/roles.js'
import { usuariosApi } from '../../services/api.js'
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
  telefono: '',
}

function aFormulario(u) {
  return {
    run: u.run ?? '',
    rol: u.rol,
    nombre: u.nombre,
    apellidos: u.apellidos ?? '',
    correo: u.correo,
    password: '',
    fechaNacimiento: u.fechaNacimiento ?? '',
    region: u.region ?? '',
    comuna: u.comuna ?? '',
    direccion: u.direccion ?? '',
    telefono: u.telefono ?? '',
  }
}

/** CRUD de usuarios (solo Administrador). Al editar, la contraseña es opcional. */
function AdminUsuarios({ onAviso = () => {} }) {
  const { usuario: usuarioActual } = useSesion()
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [datos, setDatos] = useState(formularioVacio)
  const [editando, setEditando] = useState(null)
  const [errores, setErrores] = useState({})
  const [errorApi, setErrorApi] = useState('')
  const [guardado, setGuardado] = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    setErrorCarga('')
    try {
      setUsuarios(await usuariosApi.listar())
    } catch (e) {
      setErrorCarga(e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  function manejarCambio(evento) {
    setDatos({ ...datos, [evento.target.name]: evento.target.value })
  }

  function empezarEdicion(u) {
    setEditando(u.id)
    setDatos(aFormulario(u))
    setErrores({})
    setErrorApi('')
    setGuardado('')
    window.scrollTo(0, 0)
  }

  function cancelarEdicion() {
    setEditando(null)
    setDatos(formularioVacio)
    setErrores({})
  }

  async function guardar(evento) {
    evento.preventDefault()
    const nuevosErrores = validarUsuario(datos, usuarios, editando)
    setErrores(nuevosErrores)
    setGuardado('')
    setErrorApi('')
    if (hayErrores(nuevosErrores)) return

    const cuerpo = {
      ...datos,
      run: datos.run.trim().toUpperCase(),
      nombre: datos.nombre.trim(),
      apellidos: datos.apellidos.trim(),
      correo: datos.correo.trim().toLowerCase(),
      direccion: datos.direccion.trim(),
      telefono: datos.telefono.trim(),
      fechaNacimiento: datos.fechaNacimiento || null,
    }
    try {
      if (editando) {
        await usuariosApi.actualizar(editando, cuerpo)
        setGuardado('Usuario actualizado correctamente.')
      } else {
        await usuariosApi.crear(cuerpo)
        setGuardado('Usuario creado exitosamente.')
      }
      setEditando(null)
      setDatos(formularioVacio)
      cargar()
    } catch (e) {
      if (e.campos) setErrores(e.campos)
      setErrorApi(e.message)
    }
  }

  async function eliminar(u) {
    if (!window.confirm(`¿Eliminar al usuario ${u.correo}? Esta acción no se puede deshacer.`)) return
    try {
      await usuariosApi.eliminar(u.id)
      onAviso({ tipo: 'exito', mensaje: `Usuario ${u.correo} eliminado.` })
      cargar()
    } catch (e) {
      onAviso({ tipo: 'error', mensaje: e.message })
    }
  }

  return (
    <>
      <h1 className="h3 border-bottom border-secondary pb-2 mb-4">USUARIOS</h1>

      <Form noValidate onSubmit={guardar} className="panel p-4 mb-5">
        <h2 className="h5 texto-azul mb-3">{editando ? `Editando: ${datos.correo}` : 'Nuevo usuario'}</h2>

        {guardado && (
          <Alert variant="success" onClose={() => setGuardado('')} dismissible>
            {guardado}
          </Alert>
        )}
        {errorApi && <Alert variant="danger">{errorApi}</Alert>}

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
            <CampoFormulario id="password" etiqueta={editando ? 'Contraseña (opcional)' : 'Contraseña *'}
              type="password" placeholder={editando ? 'Vacía = mantener la actual' : '4 a 10 caracteres'}
              autoComplete="new-password" value={datos.password} error={errores.password} onChange={manejarCambio} />
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <CampoFormulario id="fechaNacimiento" etiqueta="Fecha de nacimiento (opcional)" type="date"
              value={datos.fechaNacimiento} onChange={manejarCambio} />
          </Col>
          <Col md={6}>
            <CampoFormulario id="telefono" etiqueta="Teléfono (opcional)" type="tel"
              value={datos.telefono} error={errores.telefono} onChange={manejarCambio} />
          </Col>
        </Row>
        <SelectorRegionComuna region={datos.region} comuna={datos.comuna} errores={errores}
          onCambiar={(cambios) => setDatos({ ...datos, ...cambios })} />
        <CampoFormulario id="direccion" etiqueta="Dirección *" placeholder="Máx. 300 caracteres"
          value={datos.direccion} error={errores.direccion} onChange={manejarCambio} />

        <div className="d-flex flex-wrap gap-2">
          <Button type="submit" variant="neon" className="flex-grow-1">
            {editando ? 'Guardar cambios' : 'CREAR USUARIO'}
          </Button>
          {editando && (
            <Button variant="outline-secondary" onClick={cancelarEdicion}>
              Cancelar
            </Button>
          )}
        </div>
      </Form>

      <h2 className="h5 texto-azul mb-3">Usuarios registrados ({usuarios.length})</h2>
      <EstadoCarga cargando={cargando} error={errorCarga} onReintentar={cargar}>
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
                  <Badge bg={u.rol === 'Administrador' ? 'primary' : u.rol === 'Vendedor' ? 'info' : 'secondary'}>
                    {u.rol}
                  </Badge>
                </td>
                <td>{u.comuna}</td>
                <td className="text-end text-nowrap">
                  <Button size="sm" variant="outline-warning" className="me-1" onClick={() => empezarEdicion(u)}
                    aria-label={`Editar ${u.correo}`}>
                    Editar
                  </Button>
                  <Button size="sm" variant="outline-danger" disabled={u.id === usuarioActual?.id}
                    onClick={() => eliminar(u)} aria-label={`Eliminar ${u.correo}`}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </EstadoCarga>
    </>
  )
}

export default AdminUsuarios
