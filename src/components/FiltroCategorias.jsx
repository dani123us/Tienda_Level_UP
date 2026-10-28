import { Button } from 'react-bootstrap'

function FiltroCategorias({ categorias, seleccionada, onSeleccionar }) {
  const opciones = ['Todas', ...categorias]

  return (
    <div className="d-flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
      {opciones.map((categoria) => (
        <Button
          key={categoria}
          size="sm"
          variant={categoria === seleccionada ? 'azul' : 'outline-azul'}
          aria-pressed={categoria === seleccionada}
          onClick={() => onSeleccionar(categoria)}
        >
          {categoria}
        </Button>
      ))}
    </div>
  )
}

export default FiltroCategorias
