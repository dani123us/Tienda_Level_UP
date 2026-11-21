import { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DetalleBoleta from '../../components/DetalleBoleta.jsx'
import EstadoCarga from '../../components/EstadoCarga.jsx'
import { useSesion } from '../../context/SesionContext.jsx'
import { boletasApi } from '../../services/api.js'

/** Detalle de una orden. El Vendedor solo la ve; el Administrador además puede eliminarla. */
function DetalleOrden({ onAviso = () => {} }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tieneRol } = useSesion()
  const [boleta, setBoleta] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    boletasApi
      .obtener(id)
      .then((datos) => activo && setBoleta(datos))
      .catch((e) => activo && setError(e.message))
    return () => {
      activo = false
    }
  }, [id])

  async function eliminar() {
    if (!window.confirm(`¿Eliminar la boleta N° ${id}? Esta acción no se puede deshacer.`)) return
    try {
      await boletasApi.eliminar(id)
      onAviso({ tipo: 'exito', mensaje: `Boleta N° ${id} eliminada.` })
      navigate('/admin/ordenes')
    } catch (e) {
      onAviso({ tipo: 'error', mensaje: e.message })
    }
  }

  return (
    <>
      <h1 className="h3 border-bottom border-secondary pb-2 mb-4">DETALLE DE LA ORDEN</h1>
      <EstadoCarga cargando={!boleta && !error} error={error}>
        {boleta && <DetalleBoleta boleta={boleta} />}
      </EstadoCarga>
      <div className="d-flex gap-2 mt-3">
        <Link to="/admin/ordenes" className="btn btn-outline-azul">
          ← Volver a órdenes
        </Link>
        {tieneRol('Administrador') && boleta && (
          <Button variant="outline-danger" onClick={eliminar}>
            Eliminar boleta
          </Button>
        )}
      </div>
    </>
  )
}

export default DetalleOrden
