# Level-Up Gamer — Tienda online en React

Tienda online de productos gamer (DSY1104 – Desarrollo Fullstack II, Evaluación Parcial 2).
Es una **aplicación de una sola página (SPA)**: hay **un único `index.html`** y todo lo demás son
**componentes de React**. La navegación entre páginas la hace React Router sin recargar el sitio.

**Tecnologías:** React 19 · Vite · React Router · Bootstrap 5 + React-Bootstrap · Jasmine · Karma · Istanbul (cobertura)

---

## Requisitos

- [Node.js](https://nodejs.org) 20.19 o superior (recomendado 22 LTS)
- Google Chrome (lo usa Karma para ejecutar las pruebas)

## Cómo ejecutarlo

```bash
npm install        # instala las dependencias (solo la primera vez)
npm run dev        # abre la tienda en http://localhost:5173
```

| Comando              | Qué hace                                                                     |
|----------------------|------------------------------------------------------------------------------|
| `npm run dev`        | Servidor de desarrollo con recarga automática                                |
| `npm run build`      | Genera la versión final en la carpeta `dist/`                                |
| `npm run preview`    | Muestra la versión de `dist/` como quedaría publicada                        |
| `npm test`           | Ejecuta **todas las pruebas** una vez en Chrome (sin ventana) + cobertura    |
| `npm run test:watch` | Abre Chrome con el **reporte visual de Jasmine** (ideal para la presentación) |
| `npm run lint`       | Revisa el código con Oxlint                                                  |

### Datos para probar

- **Administrador:** `admin@duoc.cl` / `admin123` → entra al panel `/admin`
- **Cupones de descuento:** `LEVELUP10` (10%) y `GAMER15` (15%)
- **Beneficio Duoc:** los usuarios con correo `@duoc.cl` o `@profesor.duoc.cl` tienen 20% de descuento automático
- Los datos (carrito, usuarios, productos y sesión) se guardan en el `localStorage` del navegador

---

## Estructura del proyecto

```
index.html                 ← el ÚNICO archivo HTML (solo tiene <div id="root">)
src/
├── main.jsx               ← punto de entrada: monta <App /> dentro de #root
├── App.jsx                ← estado global (carrito, usuarios, productos, sesión) y rutas
├── index.css              ← identidad visual (colores y fuentes de la marca sobre Bootstrap)
├── assets/                ← imágenes
├── components/            ← piezas reutilizables
│   ├── Encabezado.jsx         barra de navegación responsiva (menú hamburguesa en celular)
│   ├── PiePagina.jsx
│   ├── Portada.jsx            sección principal (hero) del inicio
│   ├── Catalogo.jsx           grilla de productos
│   ├── TarjetaProducto.jsx    tarjeta de un producto
│   ├── ImagenProducto.jsx     foto del producto con ícono de respaldo
│   ├── FiltroCategorias.jsx
│   ├── ItemCarrito.jsx        fila del carrito con + / − / Quitar
│   ├── ResumenCompra.jsx      totales, cupón y botón pagar
│   ├── CampoFormulario.jsx    campo con etiqueta + mensaje de error
│   ├── SelectorRegionComuna.jsx  región → comunas
│   ├── Notificacion.jsx       mensajes flotantes (reemplazan los alert)
│   ├── MenuAdmin.jsx
│   ├── RutaProtegida.jsx      solo deja entrar al administrador
│   └── SubirAlInicio.jsx
├── pages/                 ← una "página" por cada ruta
│   ├── Inicio.jsx  Productos.jsx  Nosotros.jsx  Blogs.jsx  Contacto.jsx
│   ├── Login.jsx  Registro.jsx  Carrito.jsx  NoEncontrado.jsx
│   └── admin/  PanelAdmin.jsx  Dashboard.jsx  AdminProductos.jsx  AdminUsuarios.jsx
├── data/                  ← datos iniciales (productos, regiones, usuarios, blogs, equipo)
├── utils/                 ← lógica pura: validaciones, carrito, productos, usuarios, formato
├── services/              ← acceso a localStorage
└── tests/                 ← pruebas unitarias Jasmine (*.spec.js / *.spec.jsx)
karma.conf.cjs             ← configuración de Karma + cobertura
```

### Rutas

| Ruta | Página | Ruta | Página |
|------|--------|------|--------|
| `/` | Inicio | `/login` | Inicio de sesión |
| `/productos` | Catálogo con filtros | `/registro` | Registro de usuario |
| `/nosotros` | Nosotros | `/carrito` | Carrito de compras |
| `/blogs` | Blogs | `/admin` | Dashboard (solo administrador) |
| `/contacto` | Contacto | `/admin/productos`, `/admin/usuarios` | Gestión |

---

## Pruebas unitarias (Jasmine + Karma)

Las pruebas están en `src/tests/` y se dividen en:

- **Lógica** (`tests/utils`): validaciones de formularios y cálculo del carrito.
- **Mocks** (`tests/services`, `tests/App.spec.jsx`): `localStorage` simulado con `spyOn`,
  fecha simulada con `jasmine.clock()`, funciones de props simuladas con `jasmine.createSpy`.
- **Componentes y DOM** (`tests/components`, `tests/pages`): se dibuja el componente,
  se simulan clics y escritura, y se revisa lo que aparece en pantalla.

Son 15 pruebas en total. Después de `npm test`, el reporte de cobertura queda en **`coverage/index.html`** (ábrelo en el navegador).

### Si no tienes Google Chrome

Karma puede usar Microsoft Edge. En PowerShell, antes de `npm test`:

```powershell
$env:CHROME_BIN = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
```

---

## Equipo

- Daniel Muñoz — Desarrollador Fullstack
- Matias Lopez — Desarrollador Frontend
