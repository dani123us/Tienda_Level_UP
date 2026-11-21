import { useEffect, useState } from 'react'
import { Table, Badge, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import EstadoCarga from '../../components/EstadoCarga.jsx'
import { boletasApi } from '../../services/api.js'
import { formatearFecha, formatearPrecio } from '../../utils/formato.js'

/** Lista de órdenes (boletas). La ven el Administrador y el Vendedor. */
function AdminOrdenes() {
  const [boletas, setBoletas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    boletasApi
      .listar()
      .then((datos) => activo && setBoletas(datos))
      .catch((e) => activo && setError(e.message))
      .finally(() => activo && setCargando(false))
    return () => {
      activo = false
    }
  }, [])

  return (
    <>
      <h1 className="h3 border-bottom border-secondary pb-2 mb-4">ÓRDENES</h1>
      <EstadoCarga cargando={cargando} error={error}>
        {boletas.length === 0 ? (
          <Alert variant="secondary">Todavía no hay órdenes registradas.</Alert>
        ) : (
          <Table responsive variant="dark" hover className="align-middle">
            <thead>
              <tr>
                <th>N°</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th className="text-end">Total</th>
                <th className="text-end">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {boletas.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{formatearFecha(b.fecha)}</td>
                  <td>
                    {b.nombreCliente}
                    <div className="small texto-suave">{b.correoCliente}</div>
                  </td>
                  <td>
                    <Badge bg={b.estado === 'PAGADA' ? 'success' : 'danger'}>{b.estado}</Badge>
                  </td>
                  <td className="text-end">{formatearPrecio(b.total)}</td>
                  <td className="text-end">
                    <Link to={`/admin/ordenes/${b.id}`} className="btn btn-sm btn-outline-info">
                      Ver
                    </Link>
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

export default AdminOrdenes
