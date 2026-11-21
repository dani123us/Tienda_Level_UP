import { screen, fireEvent, waitFor } from '@testing-library/react'
import Registro from '../../pages/Registro.jsx'
import { ErrorApi } from '../../services/api.js'
import { crearSesion, renderConRouter, escribir, usuarioCliente, esperarValor } from '../ayudantes.jsx'

function llenarFormulario(cambios = {}) {
  const datos = {
    'RUN * (sin puntos ni guion)': '211234567',
    'NOMBRES *': 'Camila',
    'APELLIDOS *': 'Pérez',
    'CORREO *': 'camila@gmail.com',
    'FECHA DE NACIMIENTO *': '2000-01-01',
    'CONTRASEÑA *': 'clave1',
    'CONFIRMAR CONTRASEÑA *': 'clave1',
    'DIRECCIÓN *': 'Av. Siempre Viva 123',
    ...cambios,
  }
  Object.entries(datos).forEach(([etiqueta, valor]) => escribir(screen.getByLabelText(etiqueta), valor))
  fireEvent.change(screen.getByLabelText('Región *'), { target: { value: 'Región Metropolitana' } })
  fireEvent.change(screen.getByLabelText('Comuna *'), { target: { value: 'Santiago' } })
}

describe('Página Registro', () => {
  it('valida RUN, correo, edad y que las contraseñas coincidan', () => {
    const sesion = crearSesion()
    renderConRouter(<Registro />, { sesion })

    llenarFormulario({
      'RUN * (sin puntos ni guion)': '12.345',
      'CORREO *': 'camila@hotmail.com',
      'FECHA DE NACIMIENTO *': '2015-01-01',
      'CONFIRMAR CONTRASEÑA *': 'otra',
    })
    fireEvent.click(screen.getByText('REGISTRAR'))

    ;['RUN * (sin puntos ni guion)', 'CORREO *', 'FECHA DE NACIMIENTO *', 'CONFIRMAR CONTRASEÑA *'].forEach((campo) =>
      expect(screen.getByLabelText(campo).classList).toContain('is-invalid'),
    )
    expect(sesion.registrar).not.toHaveBeenCalled()
  })

  it('con datos correctos registra al cliente y lo lleva al inicio', async () => {
    const sesion = crearSesion()
    sesion.registrar.and.resolveTo(usuarioCliente)
    renderConRouter(<Registro />, { ruta: '/registro', sesion })

    llenarFormulario()
    fireEvent.click(screen.getByText('REGISTRAR'))

    await esperarValor(() => screen.getByTestId('ubicacion').textContent, '/')
    expect(sesion.registrar).toHaveBeenCalledWith(
      jasmine.objectContaining({ run: '211234567', correo: 'camila@gmail.com', region: 'Región Metropolitana' }),
    )
    expect(sesion.registrar.calls.mostRecent().args[0].confirmPassword).toBeUndefined()
  })

  it('si el correo ya existe (409) lo marca en el campo', async () => {
    const sesion = crearSesion()
    sesion.registrar.and.rejectWith(new ErrorApi(409, 'El correo camila@gmail.com ya está registrado'))
    renderConRouter(<Registro />, { ruta: '/registro', sesion })

    llenarFormulario()
    fireEvent.click(screen.getByText('REGISTRAR'))

    await esperarValor(() => screen.getByLabelText('CORREO *').classList.contains('is-invalid'), true)
    expect(screen.getByTestId('ubicacion').textContent).toBe('/registro')
  })

  it('si el RUN ya existe (409) lo marca en el campo RUN', async () => {
    const sesion = crearSesion()
    sesion.registrar.and.rejectWith(new ErrorApi(409, 'El RUN 211234567 ya está registrado'))
    renderConRouter(<Registro />, { sesion })

    llenarFormulario()
    fireEvent.click(screen.getByText('REGISTRAR'))

    await esperarValor(() => screen.getByLabelText('RUN * (sin puntos ni guion)').classList.contains('is-invalid'), true)
  })
})
