import { render, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { SesionContext } from '../context/SesionContext.jsx'
import { API_URL } from '../services/api.js'

function UbicacionActual() {
  const { pathname } = useLocation()
  return <p data-testid="ubicacion">{pathname}</p>
}

/** Sesión falsa para probar componentes sin llamar al backend. */
export function crearSesion({ usuario = null, cargando = false, ...cambios } = {}) {
  return {
    usuario,
    cargando,
    iniciarSesion: jasmine.createSpy('iniciarSesion'),
    registrar: jasmine.createSpy('registrar'),
    cerrarSesion: jasmine.createSpy('cerrarSesion'),
    tieneRol: (...roles) => Boolean(usuario) && roles.includes(usuario.rol),
    ...cambios,
  }
}

export function renderConRouter(ui, { ruta = '/', estado, sesion = crearSesion() } = {}) {
  return render(
    <SesionContext.Provider value={sesion}>
      <MemoryRouter initialEntries={[{ pathname: ruta, state: estado }]}>
        {ui}
        <UbicacionActual />
      </MemoryRouter>
    </SesionContext.Provider>,
  )
}

export function respuesta(estado, cuerpo) {
  if (estado === 204) return new Response(null, { status: 204 })
  return new Response(JSON.stringify(cuerpo), { status: estado, headers: { 'Content-Type': 'application/json' } })
}

/**
 * Simula el backend: reemplaza window.fetch.
 * `rutas` es un objeto { 'GET /productos': datos, 'POST /boletas': (cuerpo) => [201, datos] }.
 * Un valor puede ser datos (responde 200) o una función que devuelve [estado, cuerpo].
 */
export function simularApi(rutas = {}) {
  return spyOn(window, 'fetch').and.callFake(async (url, opciones = {}) => {
    const metodo = opciones.method ?? 'GET'
    const clave = `${metodo} ${url.replace(API_URL, '')}`
    if (!(clave in rutas)) return respuesta(404, { mensaje: `Ruta no simulada: ${clave}` })
    const valor = rutas[clave]
    if (typeof valor === 'function') {
      const [estado, cuerpo] = valor(opciones.body ? JSON.parse(opciones.body) : undefined, opciones)
      return respuesta(estado, cuerpo)
    }
    return respuesta(200, valor)
  })
}

export const crearProducto = (cambios = {}) => ({
  id: 1,
  codigo: 'TS001',
  nombre: 'Control Inalámbrico',
  descripcion: 'Control de prueba',
  precio: 10000,
  categoria: 'Accesorios',
  categoriaId: 1,
  stock: 5,
  stockCritico: 2,
  imagen: '',
  icono: '🎮',
  destacado: true,
  enStockCritico: false,
  ...cambios,
})

export const usuarioAdmin = {
  id: 1,
  run: '19011022K',
  nombre: 'Admin',
  apellidos: 'Level-Up',
  correo: 'admin@duoc.cl',
  rol: 'Administrador',
  fechaNacimiento: '1995-05-10',
  region: 'Región Metropolitana',
  comuna: 'Santiago',
  direccion: 'Av. España 8',
  telefono: '',
}

export const usuarioVendedor = { ...usuarioAdmin, id: 2, run: '187654321', nombre: 'Valentina', correo: 'vendedor@duoc.cl', rol: 'Vendedor' }

export const usuarioCliente = {
  ...usuarioAdmin,
  id: 3,
  run: '211234567',
  nombre: 'Camila',
  apellidos: 'Pérez',
  correo: 'camila@gmail.com',
  rol: 'Cliente',
}

export const crearBoleta = (cambios = {}) => ({
  id: 7,
  fecha: '2026-11-20T15:30:00',
  estado: 'PAGADA',
  usuarioId: 3,
  nombreCliente: 'Camila Pérez',
  correoCliente: 'camila@gmail.com',
  telefono: '+56912345678',
  direccion: 'Av. España 8',
  region: 'Región Metropolitana',
  comuna: 'Santiago',
  indicaciones: 'Dejar en conserjería',
  metodoPago: 'Crédito',
  ultimosDigitosTarjeta: '4242',
  motivoRechazo: null,
  cupon: 'LEVELUP10',
  subtotal: 20000,
  porcentajeDescuento: 10,
  descuento: 2000,
  total: 18000,
  detalles: [
    { id: 1, productoId: 1, codigoProducto: 'TS001', nombreProducto: 'Control Inalámbrico', cantidad: 2, precioUnitario: 10000, subtotal: 20000 },
  ],
  ...cambios,
})

export function escribir(elemento, valor) {
  fireEvent.change(elemento, { target: { value: valor } })
}

/**
 * Espera (hasta 2 s) a que obtener() devuelva el valor esperado y luego lo verifica.
 * En Jasmine `expect` no lanza excepciones, por eso no sirve usarlo directo dentro de waitFor.
 */
export async function esperarValor(obtener, esperado) {
  try {
    await waitFor(() => {
      if (obtener() !== esperado) throw new Error('Todavía no')
    }, { timeout: 2000 })
  } catch {
    // Si no llegó, el expect de abajo muestra el valor real.
  }
  expect(obtener()).toBe(esperado)
}
