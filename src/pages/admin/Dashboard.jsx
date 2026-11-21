import { useEffect, useState } from 'react'
import { Row, Col, Table, Badge, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useSesion } from '../../context/SesionContext.jsx'
import { boletasApi, usuariosApi } from '../../services/api.js'
import { productosEnStockCritico } from '../../utils/productos.js'
import { formatearPrecio } from '../../utils/formato.js'

/**
 * Resumen del panel con datos reales del backend.
 * El Vendedor ve solo indicadores de productos y órdenes; el Administrador también ve usuarios.
 */
function Dashboard({ productos }) {
  const { tieneRol } = useSesion()
  const esAdmin = tieneRol('Administrador')
  const [boletas, setBoletas] = useState([])
  const [totalUsuarios, setTotalUsuarios] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    boletasApi
      .listar()
      .then((datos) => activo && setBoletas(datos))
      .catch((e) => activo && setError(e.message))
    if (esAdmin) {
      usuariosApi
        .listar()
        .then((datos) => activo && setTotalUsuarios(datos.length))
        .catch(() => {})
    }
    return () => {
      activo = false
    }
  }, [esAdmin])

  const criticos = productosEnStockCritico(productos)
  const pagadas = boletas.filter((b) => b.estado === 'PAGADA')
  const montoVendido = pagadas.reduce((suma, b) => suma + b.total, 0)

  const indicadores = [
    { titulo: 'Productos', valor: productos.length },
    { titulo: 'Stock crítico', valor: criticos.length },
    { titulo: 'Órdenes pagadas', valor: pagadas.length },
    { titulo: 'Monto vendido', valor: formatearPrecio(montoVendido) },
  ]
  if (esAdmin && totalUsuarios !== null) {
    indicadores.push({ titulo: 'Usuarios', valor: totalUsuarios })
  }

  return (
    <>
      <h1 className="h3 border-bottom border-secondary pb-2 mb-4">DASHBOARD</h1>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row xs={2} md={esAdmin ? 5 : 4} className="g-3 mb-4">
        {indicadores.map((indicador) => (
          <Col key={indicador.titulo}>
            <div className="tarjeta-indicador rounded-3 p-3 h-100">
              <div className="small texto-suave">{indicador.titulo}</div>
              <div className="numero" data-testid={`indicador-${indicador.titulo}`}>
                {indicador.valor}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <h2 className="h5 texto-azul mb-3">Productos en stock crítico</h2>
      {criticos.length === 0 ? (
        <Alert variant="success">Todos los productos tienen stock suficiente.</Alert>
      ) : (
        <Table responsive variant="dark" hover className="align-middle">
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th className="text-end">Stock</th>
              <th className="text-end">Crítico</th>
            </tr>
          </thead>
          <tbody>
            {criticos.map((p) => (
              <tr key={p.id}>
                <td>{p.codigo}</td>
                <td>
                  <Link to={`/admin/productos/${p.id}`}>{p.nombre}</Link>
                </td>
                <td className="text-end">
                  <Badge bg={p.stock === 0 ? 'danger' : 'warning'} text={p.stock === 0 ? undefined : 'dark'}>
                    {p.stock}
                  </Badge>
                </td>
                <td className="text-end">{p.stockCritico}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <h2 className="h5 texto-azul mt-4 mb-3">Últimas órdenes</h2>
      {boletas.length === 0 ? (
        <Alert variant="secondary">Todavía no hay órdenes.</Alert>
      ) : (
        <Table responsive variant="dark" hover size="sm" className="align-middle">
          <tbody>
            {boletas.slice(0, 5).map((b) => (
              <tr key={b.id}>
                <td>
                  <Link to={`/admin/ordenes/${b.id}`}>N° {b.id}</Link>
                </td>
                <td>{b.nombreCliente}</td>
                <td>
                  <Badge bg={b.estado === 'PAGADA' ? 'success' : 'danger'}>{b.estado}</Badge>
                </td>
                <td className="text-end">{formatearPrecio(b.total)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}

export default Dashboard
