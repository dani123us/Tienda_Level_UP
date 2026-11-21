import { Table, Badge, Row, Col } from 'react-bootstrap'
import { formatearFecha, formatearPrecio } from '../utils/formato.js'

/** Muestra una boleta completa: datos, despacho, productos y totales. */
function DetalleBoleta({ boleta }) {
  const pagada = boleta.estado === 'PAGADA'

  return (
    <div className="panel p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="h5 mb-0">Boleta N° {boleta.id}</h2>
        <Badge bg={pagada ? 'success' : 'danger'} data-testid="estado-boleta">
          {boleta.estado}
        </Badge>
      </div>

      <Row className="g-3 mb-3 small">
        <Col md={6}>
          <div className="texto-suave">Fecha</div>
          <div>{formatearFecha(boleta.fecha)}</div>
          <div className="texto-suave mt-2">Cliente</div>
          <div>
            {boleta.nombreCliente} · {boleta.correoCliente}
          </div>
          {boleta.telefono && <div>{boleta.telefono}</div>}
        </Col>
        <Col md={6}>
          <div className="texto-suave">Dirección de despacho</div>
          <div>{boleta.direccion}</div>
          <div>
            {boleta.comuna}, {boleta.region}
          </div>
          {boleta.indicaciones && <div className="fst-italic">{boleta.indicaciones}</div>}
          <div className="texto-suave mt-2">Pago</div>
          <div>
            {boleta.metodoPago} terminada en {boleta.ultimosDigitosTarjeta}
          </div>
        </Col>
      </Row>

      {boleta.motivoRechazo && <p className="text-danger small">Motivo del rechazo: {boleta.motivoRechazo}</p>}

      <Table responsive variant="dark" size="sm" className="align-middle">
        <thead>
          <tr>
            <th>Código</th>
            <th>Producto</th>
            <th className="text-end">Cantidad</th>
            <th className="text-end">Precio</th>
            <th className="text-end">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {boleta.detalles.map((d) => (
            <tr key={d.id}>
              <td>{d.codigoProducto}</td>
              <td>{d.nombreProducto}</td>
              <td className="text-end">{d.cantidad}</td>
              <td className="text-end">{formatearPrecio(d.precioUnitario)}</td>
              <td className="text-end">{formatearPrecio(d.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="ms-auto" style={{ maxWidth: 320 }}>
        <div className="d-flex justify-content-between">
          <span>Subtotal</span>
          <span>{formatearPrecio(boleta.subtotal)}</span>
        </div>
        {boleta.descuento > 0 && (
          <div className="d-flex justify-content-between text-success">
            <span>
              Descuento ({boleta.porcentajeDescuento}%{boleta.cupon ? ` · cupón ${boleta.cupon}` : ''})
            </span>
            <span>-{formatearPrecio(boleta.descuento)}</span>
          </div>
        )}
        <div className="d-flex justify-content-between fw-bold fs-5 mt-1">
          <span>Total</span>
          <span data-testid="total-boleta">{formatearPrecio(boleta.total)}</span>
        </div>
      </div>
    </div>
  )
}

export default DetalleBoleta
