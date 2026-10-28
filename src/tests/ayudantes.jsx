import { render, fireEvent } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'

function UbicacionActual() {
  const { pathname } = useLocation()
  return <p data-testid="ubicacion">{pathname}</p>
}

export function renderConRouter(ui, { ruta = '/', estado } = {}) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: ruta, state: estado }]}>
      {ui}
      <UbicacionActual />
    </MemoryRouter>,
  )
}

export const crearProducto = (cambios = {}) => ({
  id: 1,
  codigo: 'TS001',
  nombre: 'Control Inalámbrico',
  descripcion: 'Control de prueba',
  precio: 10000,
  categoria: 'Accesorios',
  stock: 5,
  stockCritico: 2,
  imagen: '',
  icono: '🎮',
  destacado: true,
  ...cambios,
})

export const usuarioAdmin = {
  id: 1,
  run: '19011022K',
  nombre: 'Admin',
  apellidos: 'Level-Up',
  correo: 'admin@duoc.cl',
  password: 'admin123',
  rol: 'Administrador',
  region: 'Región Metropolitana',
  comuna: 'Santiago',
  direccion: 'Av. España 8',
}

export const usuarioCliente = {
  ...usuarioAdmin,
  id: 2,
  run: '',
  nombre: 'Camila',
  correo: 'camila@gmail.com',
  password: 'clave123',
  rol: 'Cliente',
}

export function escribir(elemento, valor) {
  fireEvent.change(elemento, { target: { value: valor } })
}
