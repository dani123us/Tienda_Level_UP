import imagenRendimiento from '../assets/blog-rendimiento.jpg'
import imagenModding from '../assets/blog-modding.jpg'

export const blogs = [
  {
    id: 1,
    titulo: 'CASO CURIOSO #1: Optimizando el rendimiento',
    resumen:
      'Descubre los mejores consejos para configurar tu BIOS y ajustar tu sistema operativo en tu equipo Lenovo. Asegúrate de que tus juegos competitivos y emuladores corran a los FPS que necesitas sin cuello de botella.',
    contenido: [
      'Antes de pensar en cambiar piezas, revisa la configuración que ya tienes. En la BIOS activa el perfil XMP o EXPO para que la memoria RAM funcione a la velocidad para la que fue diseñada; muchos equipos vienen de fábrica a una frecuencia menor.',
      'En Windows elige el plan de energía de alto rendimiento, activa el Modo Juego y desactiva las aplicaciones que se abren al iniciar. Mantén actualizados los drivers de la tarjeta de video directamente desde el sitio del fabricante.',
      'Por último, vigila las temperaturas: un equipo que se calienta baja su rendimiento para protegerse. Limpiar los ventiladores y renovar la pasta térmica puede devolverte varios FPS.',
    ],
    imagen: imagenRendimiento,
  },
  {
    id: 2,
    titulo: 'CASO CURIOSO #2: Modding al límite',
    resumen:
      'Desde remapear teclados magnéticos hasta instalar mods de rendimiento gráfico. Conoce cómo la comunidad está modificando su hardware y software para llevar su experiencia de juego al siguiente nivel.',
    contenido: [
      'Los teclados con switches magnéticos permiten ajustar el punto de activación de cada tecla y usar funciones como Rapid Trigger, muy populares en shooters competitivos.',
      'En el software, la comunidad crea mods que mejoran texturas, iluminación o rendimiento. Antes de instalar uno, respalda tus partidas guardadas y descarga solo desde sitios confiables.',
      'El modding también es estético: cables trenzados, keycaps personalizados y tiras RGB sincronizadas transforman cualquier setup. ¡Comparte el tuyo con la comunidad Level-Up!',
    ],
    imagen: imagenModding,
  },
]
