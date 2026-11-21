import { useState } from 'react'
import { Container, Row, Col, Form, Button, Alert, Table } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CampoFormulario from '../components/CampoFormulario.jsx'
import SelectorRegionComuna from '../components/SelectorRegionComuna.jsx'
import { useSesion } from '../context/SesionContext.jsx'
import { boletasApi } from '../services/api.js'
import { calcularResumen, esCorreoDuoc } from '../utils/carrito.js'
import { formatearPrecio } from '../utils/formato.js'
import { hayErrores, soloDigitos, validarCheckout } from '../utils/validaciones.js'

const METODOS_PAGO = ['Crédito', 'Débito']

function datosIniciales(usuario, previos) {
  return {
    nombre: `${usuario?.nombre ?? ''} ${usuario?.apellidos ?? ''}`.trim(),
    correo: usuario?.correo ?? '',
    telefono: usuario?.telefono ?? '',
    direccion: usuario?.direccion ?? '',
    region: usuario?.region ?? '',
    comuna: usuario?.comuna ?? '',
    indicaciones: '',
    ...previos, // al reintentar un pago se recuperan los datos de despacho
    metodoPago: previos?.metodoPago ?? 'Crédito',
    numeroTarjeta: '',
    titular: '',
    vencimiento: '',
    cvv: '',
  }
}

function Checkout({ items, cupon, onCompraPagada }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario } = useSesion()
  const [datos, setDatos] = useState(() => datosIniciales(usuario, location.state?.datos))
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)

  const esDuoc = esCorreoDuoc(usuario?.correo)
  const resumen = calcularResumen(items, { esDuoc, porcentajeCupon: cupon?.porcentaje ?? 0 })

  function manejarCambio(evento) {
    setDatos({ ...datos, [evento.target.name]: evento.target.value })
  }

  async function pagar(evento) {
    evento.preventDefault()
    const nuevosErrores = validarCheckout(datos)
    setErrores(nuevosErrores)
    setErrorGeneral('')
    if (hayErrores(nuevosErrores)) return

    setEnviando(true)
    try {
      const boleta = await boletasApi.crear({
        items: items.map((item) => ({ productoId: item.id, cantidad: item.cantidad })),
        nombreCliente: datos.nombre.trim(),
        correoCliente: datos.correo.trim(),
        telefono: datos.telefono.trim(),
        direccion: datos.direccion.trim(),
        region: datos.region,
        comuna: datos.comuna,
        indicaciones: datos.indicaciones.trim(),
        cupon: cupon?.codigo ?? null,
        metodoPago: datos.metodoPago,
        // Por seguridad al backend solo viajan los últimos 4 dígitos de la tarjeta.
        ultimosDigitosTarjeta: soloDigitos(datos.numeroTarjeta).slice(-4),
      })
      if (boleta.estado === 'PAGADA') {
        onCompraPagada()
        navigate(`/compra-exitosa/${boleta.id}`, { state: { boleta } })
      } else {
        // Pago rechazado: el carrito se mantiene para poder reintentar.
        navigate(`/compra-fallida/${boleta.id}`, { state: { boleta } })
      }
    } catch (error) {
      // 409: stock insuficiente o cupón inválido. 400: datos inválidos.
      if (error.campos) setErrores(error.campos)
      setErrorGeneral(error.message)
      setEnviando(false)
    }
  }

  if (items.length === 0) {
    return (
      <Container as="section" className="py-5" style={{ maxWidth: 700 }}>
        <Alert variant="secondary">
          Tu carrito está vacío. <Alert.Link as={Link} to="/productos">Ve a la sección de productos</Alert.Link>.
        </Alert>
      </Container>
    )
  }

  return (
    <Container as="section" className="py-5">
      <h1 className="h2 mb-4">Checkout</h1>
      {errorGeneral && <Alert variant="danger">{errorGeneral}</Alert>}

      <Row className="g-4">
        <Col lg={7}>
          <Form noValidate onSubmit={pagar} className="panel p-4" id="formulario-checkout">
            <h2 className="h5 texto-azul mb-3">Datos de despacho</h2>
            <CampoFormulario id="nombre" etiqueta="Nombre completo *" value={datos.nombre}
              error={errores.nombre} onChange={manejarCambio} />
            <Row>
              <Col md={6}>
                <CampoFormulario id="correo" etiqueta="Correo *" type="email" value={datos.correo}
                  error={errores.correo} onChange={manejarCambio} />
              </Col>
              <Col md={6}>
                <CampoFormulario id="telefono" etiqueta="Teléfono" type="tel" placeholder="+56 9 1234 5678"
                  value={datos.telefono} error={errores.telefono} onChange={manejarCambio} />
              </Col>
            </Row>
            <CampoFormulario id="direccion" etiqueta="Dirección *" placeholder="Calle, número, depto."
              value={datos.direccion} error={errores.direccion} onChange={manejarCambio} />
            <SelectorRegionComuna region={datos.region} comuna={datos.comuna} errores={errores}
              onCambiar={(cambios) => setDatos({ ...datos, ...cambios })} />
            <CampoFormulario id="indicaciones" etiqueta="Indicaciones para la entrega (opcional)" as="textarea"
              rows={2} value={datos.indicaciones} error={errores.indicaciones} onChange={manejarCambio} />

            <h2 className="h5 texto-azul mt-4 mb-3">Pago</h2>
            <Alert variant="info" className="small py-2">
              Tarjeta de prueba: cualquier número que termine en <strong>0000</strong> será rechazado.
            </Alert>
            <CampoFormulario id="metodoPago" etiqueta="Método de pago *" opciones={METODOS_PAGO}
              value={datos.metodoPago} error={errores.metodoPago} onChange={manejarCambio} />
            <CampoFormulario id="numeroTarjeta" etiqueta="Número de tarjeta *" inputMode="numeric"
              placeholder="1234 5678 9012 3456" maxLength={19} autoComplete="cc-number"
              value={datos.numeroTarjeta} error={errores.numeroTarjeta} onChange={manejarCambio} />
            <CampoFormulario id="titular" etiqueta="Titular de la tarjeta *" autoComplete="cc-name"
              value={datos.titular} error={errores.titular} onChange={manejarCambio} />
            <Row>
              <Col xs={6}>
                <CampoFormulario id="vencimiento" etiqueta="Vencimiento (MM/AA) *" placeholder="08/28"
                  maxLength={5} autoComplete="cc-exp" value={datos.vencimiento} error={errores.vencimiento}
                  onChange={manejarCambio} />
              </Col>
              <Col xs={6}>
                <CampoFormulario id="cvv" etiqueta="CVV *" type="password" inputMode="numeric" maxLength={3}
                  autoComplete="cc-csc" value={datos.cvv} error={errores.cvv} onChange={manejarCambio} />
              </Col>
            </Row>
            <Button type="submit" variant="neon" size="lg" className="w-100 mt-2" disabled={enviando}>
              {enviando ? 'Procesando pago...' : `Pagar ${formatearPrecio(resumen.total)}`}
            </Button>
          </Form>
        </Col>

        <Col lg={5}>
          <aside className="panel p-4">
            <h2 className="h5 mb-3">Resumen del pedido</h2>
            <Table variant="dark" size="sm" className="small">
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.nombre} × {item.cantidad}
                    </td>
                    <td className="text-end">{formatearPrecio(item.precio * item.cantidad)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="d-flex justify-content-between">
              <span>Subtotal</span>
              <span>{formatearPrecio(resumen.subtotal)}</span>
            </div>
            {resumen.descuento > 0 && (
              <div className="d-flex justify-content-between text-success">
                <span>
                  Descuento ({resumen.porcentaje}%{cupon ? ` · ${cupon.codigo}` : ''})
                </span>
                <span>-{formatearPrecio(resumen.descuento)}</span>
              </div>
            )}
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-5">
              <span>Total</span>
              <span data-testid="total-checkout">{formatearPrecio(resumen.total)}</span>
            </div>
            <p className="small texto-suave mt-2 mb-0">El total final lo calcula el servidor con los precios vigentes.</p>
          </aside>
        </Col>
      </Row>
    </Container>
  )
}

export default Checkout
