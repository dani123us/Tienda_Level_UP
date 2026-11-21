import { useEffect, useState } from 'react'
import { Container, Table, Badge, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import EstadoCarga from '../components/EstadoCarga.jsx'
import { boletasApi } from '../services/api.js'
import { formatearFecha, formatearPrecio } from '../utils/formato.js'

function MisCompras() {
  const [boletas, setBoletas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    boletasApi
      .mias()
      .then((datos) => activo && setBoletas(datos))
      .catch((e) => activo && setError(e.message))
      .finally(() => activo && setCargando(false))
    return () => {
      activo = false
    }
  }, [])

  return (
    <Container as="section" className="py-5">
      <h1 className="h2 mb-4">Mis compras</h1>
      <EstadoCarga cargando={cargando} error={error}>
        {boletas.length === 0 ? (
          <Alert variant="secondary">
            Aún no tienes compras. <Alert.Link as={Link} to="/productos">Ve a la tienda</Alert.Link>.
          </Alert>
        ) : (
          <Table responsive variant="dark" hover className="align-middle">
            <thead>
              <tr>
                <th>N°</th>
                <th>Fecha</th>
                <th>Productos</th>
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
                  <td>{b.detalles.reduce((suma, d) => suma + d.cantidad, 0)}</td>
                  <td>
                    <Badge bg={b.estado === 'PAGADA' ? 'success' : 'danger'}>{b.estado}</Badge>
                  </td>
                  <td className="text-end">{formatearPrecio(b.total)}</td>
                  <td className="text-end">
                    <Link
                      to={`/${b.estado === 'PAGADA' ? 'compra-exitosa' : 'compra-fallida'}/${b.id}`}
                      state={{ boleta: b }}
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </EstadoCarga>
    </Container>
  )
}

export default MisCompras
