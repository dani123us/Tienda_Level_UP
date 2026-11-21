# Level-Up Gamer — Tienda online en React

Tienda online de productos gamer (DSY1104 – Desarrollo Fullstack II, Evaluación Parcial 3).
Es una **aplicación de una sola página (SPA)** hecha con React que consume la **API REST del backend**
(Spring Boot + MySQL + JWT): https://github.com/dani123us/Tienda_Level_UP_Backend

**Tecnologías:** React 19 · Vite · React Router · Bootstrap 5 + React-Bootstrap · fetch · Jasmine · Karma · Istanbul (cobertura)

---

## Requisitos

- [Node.js](https://nodejs.org) 20.19 o superior (recomendado 22 LTS)
- El **backend** corriendo en `http://localhost:8080` (ver su README)
- Google Chrome (lo usa Karma para ejecutar las pruebas)

## Cómo ejecutarlo

```bash
# 1. Levantar el backend (en el repo Tienda_Level_UP_Backend)
mvnw spring-boot:run            # con MySQL, o con PERFIL=h2 sin instalar nada

# 2. Levantar el frontend
npm install                     # solo la primera vez
npm run dev                     # http://localhost:5173
```

Si el backend está en otra URL, copia `.env.example` como `.env` y cambia `VITE_API_URL`.

| Comando              | Qué hace                                                                     |
|----------------------|------------------------------------------------------------------------------|
| `npm run dev`        | Servidor de desarrollo con recarga automática                                |
| `npm run build`      | Genera la versión final en la carpeta `dist/`                                |
| `npm test`           | Ejecuta **todas las pruebas** una vez en Chrome (sin ventana) + cobertura    |
| `npm run test:watch` | Abre Chrome con el **reporte visual de Jasmine**                             |
| `npm run lint`       | Revisa el código con Oxlint                                                  |

### Usuarios de prueba

| Rol | Correo | Contraseña | Qué puede hacer |
|---|---|---|---|
| Administrador | `admin@duoc.cl` | `admin123` | Todo: tienda y panel completo (productos, órdenes, categorías, usuarios) |
| Vendedor | `vendedor@duoc.cl` | `vendedor123` | Panel en modo lectura: lista y detalle de **productos** y **órdenes** |
| Cliente | `cliente@gmail.com` | `cliente123` | Tienda: comprar, checkout y "Mis compras" |

- **Tarjeta de prueba:** cualquier número de 16 dígitos que termine en `0000` es rechazado (pago fallido). Cualquier otro se aprueba.
- **Cupones:** `LEVELUP10` (10%) y `GAMER15` (15%). Los correos `@duoc.cl` / `@profesor.duoc.cl` tienen 20% extra.

---

## Integración con el backend

- `src/services/api.js`: cliente HTTP con **fetch**. Agrega `Authorization: Bearer <token>` y, si una petición responde **401**,
  renueva el token **una vez** con `/auth/refresh` y reintenta. Si no se puede renovar, cierra la sesión.
  Los errores llegan como `ErrorApi { estado, mensaje, campos }` (el `ErrorResponse` del backend).
- `src/context/SesionContext.jsx`: maneja la sesión (`usuario`, `cargando`, `iniciarSesion`, `registrar`, `cerrarSesion`, `tieneRol`).

### Sesión segura y persistente

- El **token de acceso** (15 min) se guarda **solo en memoria**: no queda expuesto en el almacenamiento.
- El **refresh token** (7 días) se guarda en `localStorage` (`refreshLevelUp`).
- **Al recargar la página**, si hay refresh token se pide un par nuevo y luego `/auth/me`: la sesión se restaura sola.
  Mientras tanto las rutas protegidas muestran un spinner (no saltan al login).
- La renovación también se **programa automáticamente** 1 minuto antes de que venza el token.
- **Nunca** se guarda la contraseña ni el usuario completo. Cerrar sesión borra los tokens y el carrito;
  si se cierra en otra pestaña, también se cierra en esta (evento `storage`).
- El **carrito** se guarda en `localStorage` como `{id, cantidad}` y se rehidrata con los datos frescos del backend.

### Restricciones por rol

| Ruta | Acceso |
|---|---|
| `/`, `/productos`, `/nosotros`, `/blogs`, `/contacto`, `/carrito` | Público |
| `/checkout` | Cliente o Administrador |
| `/compra-exitosa/:id`, `/compra-fallida/:id`, `/mis-compras` | Usuario con sesión |
| `/admin`, `/admin/productos`, `/admin/productos/:id`, `/admin/ordenes`, `/admin/ordenes/:id` | Administrador y Vendedor (el Vendedor sin botones de crear/editar/eliminar) |
| `/admin/categorias`, `/admin/usuarios` | Solo Administrador |

Al Vendedor no le aparecen Usuarios ni Categorías en el menú. El frontend solo **oculta** lo que no corresponde:
**la seguridad real está en el backend**, que responde 401/403 aunque alguien llame a la API directamente.

### Checkout

Carrito → **Ir a pagar** → `/checkout` (si no hay sesión pide iniciar sesión y vuelve) → formulario con datos de despacho
(precargados) y de pago (16 dígitos, MM/AA no vencida, CVV) → `POST /boletas` (solo viajan los **últimos 4 dígitos**) →

- `PAGADA`: se vacía el carrito, se recarga el stock y se muestra **/compra-exitosa/:id** con la boleta.
- `RECHAZADA`: el carrito se mantiene y se muestra **/compra-fallida/:id** con el motivo, "Reintentar pago" y "Volver al carrito".
- 409 (stock insuficiente o cupón inválido): alerta en el checkout.

---

## Estructura del proyecto

```
src/
├── main.jsx               ← monta <App /> dentro de BrowserRouter y SesionProvider
├── App.jsx                ← catálogo desde la API, carrito y rutas protegidas por rol
├── context/SesionContext.jsx
├── services/
│   ├── api.js             ← fetch + JWT + renovación del token + módulos por recurso
│   └── almacenamiento.js  ← localStorage (carrito y refresh token)
├── hooks/useBoleta.js
├── components/            ← Encabezado, MenuAdmin, RutaProtegida, EstadoCarga, DetalleBoleta, ...
├── pages/                 ← Inicio, Productos, Login, Registro, Carrito, Checkout, CompraExitosa,
│   │                         CompraFallida, MisCompras, AccesoDenegado, ...
│   └── admin/             ← PanelAdmin, Dashboard, AdminProductos, DetalleProducto, AdminOrdenes,
│                             DetalleOrden, AdminCategorias, AdminUsuarios
├── utils/                 ← validaciones, carrito, formato, productos
└── tests/                 ← pruebas Jasmine (*.spec.js / *.spec.jsx)
docs/
├── informe-cobertura.md   ← tabla de cobertura por archivo y análisis
└── cobertura-html/        ← reporte HTML de Istanbul (abrir index.html)
```

---

## Pruebas y cobertura

**99 pruebas** (Jasmine + Karma + React Testing Library). La API se simula con `spyOn(window, 'fetch')`.

| Métrica | EP2 | EP3 |
|---|---|---|
| Sentencias | 43% | **91,63%** |
| Líneas | – | **94,53%** |

El detalle por archivo y el análisis de lo que quedó sin cubrir están en [`docs/informe-cobertura.md`](docs/informe-cobertura.md).

### Si no tienes Google Chrome

Karma puede usar Microsoft Edge. En PowerShell, antes de `npm test`:

```powershell
$env:CHROME_BIN = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
```

---

## Equipo

- Daniel Muñoz — Desarrollador Fullstack
- Matias Lopez — Desarrollador Frontend
