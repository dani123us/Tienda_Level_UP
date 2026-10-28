import { screen, fireEvent } from '@testing-library/react'
import Login from '../../pages/Login.jsx'
import { renderConRouter, escribir, usuarioCliente } from '../ayudantes.jsx'

describe('Página Login', () => {
  it('con datos inválidos muestra errores y no inicia sesión', () => {
    const onIniciarSesion = jasmine.createSpy('onIniciarSesion')
    renderConRouter(<Login usuarios={[usuarioCliente]} onIniciarSesion={onIniciarSesion} />)

    escribir(screen.getByLabelText('CORREO'), 'correo@yahoo.com')
    fireEvent.click(screen.getByText('INGRESAR'))

    expect(screen.getByLabelText('CORREO').classList).toContain('is-invalid')
    expect(onIniciarSesion).not.toHaveBeenCalled()
  })

  it('con datos correctos inicia sesión y vuelve al inicio', () => {
    const onIniciarSesion = jasmine.createSpy('onIniciarSesion')
    renderConRouter(<Login usuarios={[usuarioCliente]} onIniciarSesion={onIniciarSesion} />, { ruta: '/login' })

    escribir(screen.getByLabelText('CORREO'), 'camila@gmail.com')
    escribir(screen.getByLabelText('CONTRASEÑA'), 'clave123')
    fireEvent.click(screen.getByText('INGRESAR'))

    expect(onIniciarSesion).toHaveBeenCalledWith(usuarioCliente)
    expect(screen.getByTestId('ubicacion').textContent).toBe('/')
  })
})
