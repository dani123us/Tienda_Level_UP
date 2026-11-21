import { screen, fireEvent, waitFor } from '@testing-library/react'
import Login from '../../pages/Login.jsx'
import { ErrorApi } from '../../services/api.js'
import { crearSesion, renderConRouter, escribir, usuarioCliente, usuarioVendedor, esperarValor } from '../ayudantes.jsx'

function llenar(correo, password) {
  escribir(screen.getByLabelText('CORREO'), correo)
  escribir(screen.getByLabelText('CONTRASEÑA'), password)
  fireEvent.click(screen.getByText('INGRESAR'))
}

describe('Página Login', () => {
  it('con datos inválidos muestra errores y no llama al backend', () => {
    const sesion = crearSesion()
    renderConRouter(<Login />, { sesion })

    escribir(screen.getByLabelText('CORREO'), 'correo@yahoo.com')
    fireEvent.click(screen.getByText('INGRESAR'))

    expect(screen.getByLabelText('CORREO').classList).toContain('is-invalid')
    expect(sesion.iniciarSesion).not.toHaveBeenCalled()
  })

  it('un Cliente con datos correctos inicia sesión y vuelve al inicio', async () => {
    const sesion = crearSesion()
    sesion.iniciarSesion.and.resolveTo(usuarioCliente)
    const onAviso = jasmine.createSpy('onAviso')
    renderConRouter(<Login onAviso={onAviso} />, { ruta: '/login', sesion })

    llenar('Camila@gmail.com', 'clave123')

    await esperarValor(() => screen.getByTestId('ubicacion').textContent, '/')
    expect(sesion.iniciarSesion).toHaveBeenCalledWith('camila@gmail.com', 'clave123')
    expect(onAviso).toHaveBeenCalledWith(jasmine.objectContaining({ tipo: 'exito' }))
  })

  it('un Vendedor entra directo a su panel', async () => {
    const sesion = crearSesion()
    sesion.iniciarSesion.and.resolveTo(usuarioVendedor)
    renderConRouter(<Login />, { ruta: '/login', sesion })

    llenar('vendedor@duoc.cl', 'vende123')

    await esperarValor(() => screen.getByTestId('ubicacion').textContent, '/admin')
  })

  it('si venía del checkout, vuelve al checkout', async () => {
    const sesion = crearSesion()
    sesion.iniciarSesion.and.resolveTo(usuarioCliente)
    renderConRouter(<Login />, { ruta: '/login', sesion, estado: { mensaje: 'Debes iniciar sesión', desde: '/checkout' } })

    expect(screen.getByText('Debes iniciar sesión')).toBeTruthy()
    llenar('camila@gmail.com', 'clave123')

    await esperarValor(() => screen.getByTestId('ubicacion').textContent, '/checkout')
  })

  it('muestra el mensaje 401 del backend si la contraseña es incorrecta', async () => {
    const sesion = crearSesion()
    sesion.iniciarSesion.and.rejectWith(new ErrorApi(401, 'Correo o contraseña incorrectos'))
    renderConRouter(<Login />, { ruta: '/login', sesion })

    llenar('camila@gmail.com', 'mala1')

    expect(await screen.findByText('Correo o contraseña incorrectos')).toBeTruthy()
    expect(screen.getByTestId('ubicacion').textContent).toBe('/login')
  })
})
