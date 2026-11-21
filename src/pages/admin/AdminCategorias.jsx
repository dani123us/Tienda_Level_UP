import { useCallback, useEffect, useState } from 'react'
import { Form, Button, Alert, Table, InputGroup } from 'react-bootstrap'
import EstadoCarga from '../../components/EstadoCarga.jsx'
import { categoriasApi } from '../../services/api.js'

/** CRUD de categorías (solo Administrador). No se puede eliminar una categoría con productos (409). */
function AdminCategorias({ onCambio = () => {}, onAviso = () => {} }) {
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [nombre, setNombre] = useState('')
  const [editando, setEditando] = useState(null)
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    setErrorCarga('')
    try {
      setCategorias(await categoriasApi.listar())
    } catch (e) {
      setErrorCarga(e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  function cancelar() {
    setEditando(null)
    setNombre('')
    setError('')
  }

  async function guardar(evento) {
    evento.preventDefault()
    const limpio = nombre.trim()
    if (limpio === '' || limpio.length > 60) {
      setError('El nombre es obligatorio (máx. 60 caracteres).')
      return
    }
    try {
      if (editando) {
        await categoriasApi.actualizar(editando, { nombre: limpio })
        onAviso({ tipo: 'exito', mensaje: `Categoría actualizada a ${limpio}.` })
        onCambio() // los productos muestran el nombre nuevo
      } else {
        await categoriasApi.crear({ nombre: limpio })
        onAviso({ tipo: 'exito', mensaje: `Categoría ${limpio} creada.` })
      }
      cancelar()
      cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  async function eliminar(categoria) {
    if (!window.confirm(`¿Eliminar la categoría ${categoria.nombre}?`)) return
    try {
      await categoriasApi.eliminar(categoria.id)
      onAviso({ tipo: 'exito', mensaje: `Categoría ${categoria.nombre} eliminada.` })
      cargar()
    } catch (e) {
      onAviso({ tipo: 'error', mensaje: e.message })
    }
  }

  return (
    <>
      <h1 className="h3 border-bottom border-secondary pb-2 mb-4">CATEGORÍAS</h1>

      <Form noValidate onSubmit={guardar} className="panel p-4 mb-4">
        <Form.Label htmlFor="nombre-categoria" className="h6 texto-azul">
          {editando ? 'Editar categoría' : 'Nueva categoría'}
        </Form.Label>
        <InputGroup hasValidation>
          <Form.Control id="nombre-categoria" placeholder="Ej: Notebooks" value={nombre}
            isInvalid={Boolean(error)} onChange={(e) => setNombre(e.target.value)} />
          <Button type="submit" variant="neon">
            {editando ? 'Guardar cambios' : 'Agregar'}
          </Button>
          {editando && (
            <Button variant="outline-secondary" onClick={cancelar}>
              Cancelar
            </Button>
          )}
          <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
        </InputGroup>
      </Form>

      <EstadoCarga cargando={cargando} error={errorCarga} onReintentar={cargar}>
        {categorias.length === 0 ? (
          <Alert variant="secondary">No hay categorías.</Alert>
        ) : (
          <Table responsive variant="dark" hover className="align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.nombre}</td>
                  <td className="text-end text-nowrap">
                    <Button size="sm" variant="outline-warning" className="me-1" aria-label={`Editar ${c.nombre}`}
                      onClick={() => {
                        setEditando(c.id)
                        setNombre(c.nombre)
                        setError('')
                      }}>
                      Editar
                    </Button>
                    <Button size="sm" variant="outline-danger" aria-label={`Eliminar ${c.nombre}`}
                      onClick={() => eliminar(c)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </EstadoCarga>
    </>
  )
}

export default AdminCategorias
