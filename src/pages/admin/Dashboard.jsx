import { Row, Col, Table, Badge, Alert } from 'react-bootstrap'
import { productosEnStockCritico } from '../../utils/productos.js'

function Dashboard({ productos, usuarios }) {
  const criticos = productosEnStockCritico(productos)
  const unidades = productos.reduce((suma, p) => suma + p.stock, 0)

  const indicadores = [
    { titulo: 'Productos', valor: productos.length },
    { titulo: 'Unidades en stock', valor: unidades },
    { titulo: 'Usuarios', valor: usuarios.length },
    { titulo: 'Stock crítico', valor: criticos.length },
  ]

  return (
    <>
      <h1 className="h3 border-bottom border-secondary pb-2 mb-4">DASHBOARD</h1>

      <Row xs={2} md={4} className="g-3 mb-4">
        {indicadores.map((indicador) => (
          <Col key={indicador.titulo}>
            <div className="tarjeta-indicador rounded-3 p-3 h-100">
              <div className="small texto-suave">{indicador.titulo}</div>
              <div className="numero">{indicador.valor}</div>
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
                <td>{p.nombre}</td>
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
    </>
  )
}

export default Dashboard
