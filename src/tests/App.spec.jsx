import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App.jsx'

describe('App', () => {
  it('al agregar un producto sube el contador del carrito y se guarda en localStorage', () => {
    spyOn(Storage.prototype, 'getItem').and.returnValue(null)
    const guardar = spyOn(Storage.prototype, 'setItem')
    spyOn(window, 'scrollTo')

    render(
      <MemoryRouter initialEntries={['/productos']}>
        <App />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getAllByText('Añadir al carrito')[0])

    expect(screen.getByTestId('contador-carrito').textContent).toBe('1')
    expect(guardar).toHaveBeenCalledWith('carritoLevelUp', jasmine.stringContaining('PlayStation 5'))
  })
})
