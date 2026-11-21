import { useState } from 'react'
import { Button, Form, InputGroup, Badge } from 'react-bootstrap'
import { formatearPrecio } from '../utils/formato.js'
import { DESCUENTO_DUOC } from '../utils/carrito.js'

function ResumenCompra({ resumen, esDuoc, cupon, errorCupon, onAplicarCupon, onPagar, sinProductos }) {
  const [codigo, setCodigo] = useState('')

  function aplicar(evento) {
    evento.preventDefault()
    onAplicarCupon(codigo)
  }

  return (
    <aside className="panel p-4">
      <h2 className="h5 mb-3">Resumen de compra</h2>

      <div className="d-flex justify-content-between mb-1">
        <span>Subtotal</span>
        <span data-testid="subtotal">{formatearPrecio(resumen.subtotal)}</span>
      </div>
      {esDuoc && (
        <div className="d-flex justify-content-between small text-success mb-1">
          <span>Beneficio Duoc</span>
          <Badge bg="success" text="dark">-{DESCUENTO_DUOC}%</Badge>
        </div>
      )}
      {cupon && (
        <div className="d-flex justify-content-between small text-success mb-1">
          <span>Cupón {cupon.codigo}</span>
          <Badge bg="success" text="dark">-{cupon.porcentaje}%</Badge>
        </div>
      )}
      {resumen.descuento > 0 && (
        <div className="d-flex justify-content-between mb-1">
          <span>Descuento</span>
          <span data-testid="descuento">-{formatearPrecio(resumen.descuento)}</span>
        </div>
      )}

      <hr />
      <div className="mb-3">
        <div className="small texto-suave">TOTAL</div>
        <div className="total-compra" data-testid="total">
          {formatearPrecio(resumen.total)}
        </div>
      </div>

      <Form onSubmit={aplicar} className="mb-3" noValidate>
        <Form.Label htmlFor="cupon" className="visually-hidden">
          Cupón de descuento
        </Form.Label>
        <InputGroup hasValidation>
          <Form.Control
            id="cupon"
            placeholder="Ingresa tu cupón"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            isInvalid={Boolean(errorCupon)}
            disabled={sinProductos}
          />
          <Button type="submit" variant="outline-azul" disabled={sinProductos}>
            Aplicar
          </Button>
          <Form.Control.Feedback type="invalid">{errorCupon}</Form.Control.Feedback>
        </InputGroup>
      </Form>

      <Button variant="neon" size="lg" className="w-100" onClick={onPagar} disabled={sinProductos}>
        Ir a pagar
      </Button>
      {!esDuoc && (
        <p className="small texto-suave mt-3 mb-0">
          ¿Estudias o trabajas en Duoc? Inicia sesión con tu correo @duoc.cl y obtén {DESCUENTO_DUOC}% de
          descuento.
        </p>
      )}
    </aside>
  )
}

export default ResumenCompra
