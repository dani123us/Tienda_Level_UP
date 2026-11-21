import { screen, fireEvent, waitFor } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import CompraExitosa from '../../pages/CompraExitosa.jsx'
import CompraFallida from '../../pages/CompraFallida.jsx'
import MisCompras from '../../pages/MisCompras.jsx'
import AccesoDenegado from '../../pages/AccesoDenegado.jsx'
import { crearBoleta, crearSesion, renderConRouter, simularApi, usuarioCliente } from '../ayudantes.jsx'

const sesion = () => crearSesion({ usuario: usuarioCliente })

function enRuta(patron, elemento) {
  return (
    <Routes>
      <Route path={patron} element={elemento} />
      <Route path="*" element={null} />
    </Routes>
  )
}

describe('Resultado de la compra', () => {
  it('compra exitosa: muestra número, detalle, descuento y total con la boleta recién creada', () => {
    const fetch = simularApi({})
    renderConRouter(enRuta('/compra-exitosa/:id', <CompraExitosa />), {
      ruta: '/compra-exitosa/7',
      estado: { boleta: crearBoleta() },
      sesion: sesion(),
    })

    expect(screen.getByText('¡Pago exitoso!')).toBeTruthy()
    expect(screen.getByText('Boleta N° 7')).toBeTruthy()
    expect(screen.getByText(/cupón LEVELUP10/)).toBeTruthy()
    expect(screen.getByTestId('total-boleta').textContent).toContain('18.000')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('al recargar la página de compra exitosa pide la boleta a la API', async () => {
    simularApi({ 'GET /boletas/7': crearBoleta() })
    renderConRouter(enRuta('/compra-exitosa/:id', <CompraExitosa />), { ruta: '/compra-exitosa/7', sesion: sesion() })

    expect(await screen.findByText('Boleta N° 7')).toBeTruthy()
  })

  it('compra fallida: muestra el motivo y "Reintentar pago" vuelve al checkout', async () => {
    simularApi({ 'GET /boletas/8': crearBoleta({ id: 8, estado: 'RECHAZADA', motivoRechazo: 'El banco emisor rechazó el pago.' }) })
    renderConRouter(enRuta('/compra-fallida/:id', <CompraFallida />), { ruta: '/compra-fallida/8', sesion: sesion() })

    expect(await screen.findByText('El pago fue rechazado')).toBeTruthy()
    expect(screen.getAllByText(/El banco emisor rechazó el pago/).length).toBeGreaterThan(0)
    expect(screen.getByTestId('estado-boleta').textContent).toBe('RECHAZADA')

    fireEvent.click(screen.getByText('Reintentar pago'))
    expect(screen.getByTestId('ubicacion').textContent).toBe('/checkout')
  })

  it('si la boleta no existe muestra el error', async () => {
    simularApi({ 'GET /boletas/99': () => [404, { mensaje: 'Boleta con id 99 no existe' }] })
    renderConRouter(enRuta('/compra-exitosa/:id', <CompraExitosa />), { ruta: '/compra-exitosa/99', sesion: sesion() })
    expect(await screen.findByText('Boleta con id 99 no existe')).toBeTruthy()
  })
})

describe('Mis compras', () => {
  it('lista las compras del cliente con su estado', async () => {
    simularApi({ 'GET /boletas/mias': [crearBoleta(), crearBoleta({ id: 8, estado: 'RECHAZADA' })] })
    renderConRouter(<MisCompras />, { sesion: sesion() })

    expect(await screen.findByText('PAGADA')).toBeTruthy()
    expect(screen.getByText('RECHAZADA')).toBeTruthy()
    fireEvent.click(screen.getAllByText('Ver')[1])
    expect(screen.getByTestId('ubicacion').textContent).toBe('/compra-fallida/8')
  })

  it('sin compras muestra un aviso', async () => {
    simularApi({ 'GET /boletas/mias': [] })
    renderConRouter(<MisCompras />, { sesion: sesion() })
    await waitFor(() => expect(screen.getByText(/Aún no tienes compras/)).toBeTruthy())
  })

  it('la página de acceso denegado ofrece volver al inicio', () => {
    renderConRouter(<AccesoDenegado />)
    expect(screen.getByText('Acceso denegado')).toBeTruthy()
  })
})
