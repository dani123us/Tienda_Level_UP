import { useState } from 'react'

function ImagenProducto({ producto, miniatura = false }) {
  const [fallo, setFallo] = useState(false)
  const clases = miniatura ? 'imagen-producto miniatura' : 'imagen-producto'

  if (!producto.imagen || fallo) {
    return (
      <div className={`${clases} sin-foto`} role="img" aria-label={producto.nombre}>
        {producto.icono || '🎮'}
      </div>
    )
  }

  return (
    <div className={clases}>
      <img src={producto.imagen} alt={producto.nombre} loading="lazy" onError={() => setFallo(true)} />
    </div>
  )
}

export default ImagenProducto
