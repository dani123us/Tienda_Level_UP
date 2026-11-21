# Informe de cobertura de pruebas – Frontend Level-Up Gamer (EP3)

**Herramientas:** Jasmine 4 + Karma 6 (Chrome Headless) + Istanbul (`karma-coverage`) + React Testing Library.
**Comando:** `npm test`
**Reporte HTML:** `docs/cobertura-html/index.html` (copia del reporte generado en `coverage/`).
**Resultado:** 99 pruebas, 99 exitosas, 0 fallidas.

## 1. Resumen

| Métrica | EP2 | EP3 | Diferencia |
|---|---|---|---|
| Pruebas | 15 | **99** | +84 |
| Sentencias (statements) | 43% | **91,63%** (854/932) | +48,6 pts |
| Ramas (branches) | – | **81,49%** (524/643) | |
| Funciones | – | **92,30%** (276/299) | |
| Líneas | – | **94,53%** (795/841) | |

El objetivo de la corrección de la EP2 era llegar al **80% de sentencias**; se superó con 91,63%.

## 2. Cobertura por archivo

| Archivo | % Sentencias | % Ramas | % Funciones | % Líneas |
|---|---|---|---|---|
| **src/App.jsx** | 93,18 | 100 | 84,61 | 92,85 |
| **components/** (17 archivos) | 97,61 | 93,90 | 97,29 | 97,56 |
| CampoFormulario, Catalogo, Encabezado, EstadoCarga, FiltroCategorias, ItemCarrito, MenuAdmin, Notificacion, PiePagina, Portada, ResumenCompra, RutaProtegida, SubirAlInicio, TarjetaProducto | 100 | 100 | 100 | 100 |
| DetalleBoleta.jsx | 100 | 91,66 | 100 | 100 |
| SelectorRegionComuna.jsx | 100 | 66,66 | 100 | 100 |
| ImagenProducto.jsx | 66,66 | 66,66 | 50 | 66,66 |
| **context/SesionContext.jsx** | 97,91 | 75 | 94,44 | 100 |
| **hooks/useBoleta.js** | 100 | 100 | 100 | 100 |
| **data/** (blogs, equipo, regiones, roles) | 100 | 100 | 100 | 100 |
| **pages/** | 95,75 | 85,32 | 92,30 | 96,79 |
| AccesoDenegado, Carrito, CompraExitosa, Inicio, NoEncontrado, Nosotros, Productos | 100 | 100 | 100 | 100 |
| CompraFallida.jsx | 100 | 66,66 | 100 | 100 |
| Login.jsx | 96,55 | 94,73 | 100 | 100 |
| Registro.jsx | 96,55 | 88,23 | 100 | 96,42 |
| Checkout.jsx | 94,44 | 75 | 87,5 | 96,96 |
| Contacto.jsx | 93,33 | 100 | 75 | 92,85 |
| MisCompras.jsx | 92,85 | 83,33 | 87,5 | 92,85 |
| Blogs.jsx | 85,71 | 100 | 83,33 | 85,71 |
| **pages/admin/** | 88,88 | 79,78 | 85,71 | 91,17 |
| PanelAdmin.jsx | 100 | 100 | 100 | 100 |
| Dashboard.jsx | 96,29 | 80,76 | 83,33 | 96 |
| AdminProductos.jsx | 92,85 | 85 | 88,88 | 95,23 |
| AdminOrdenes.jsx | 92,30 | 80 | 85,71 | 92,30 |
| DetalleProducto.jsx | 90,90 | 75 | 80 | 90,90 |
| AdminCategorias.jsx | 89,36 | 88,88 | 91,66 | 91,30 |
| DetalleOrden.jsx | 85 | 78,57 | 85,71 | 89,47 |
| AdminUsuarios.jsx | 80,95 | 69,76 | 80 | 85 |
| **services/** | 93,20 | 88,57 | 94,87 | 95,95 |
| api.js | 93,47 | 87,87 | 94,44 | 96,59 |
| almacenamiento.js | 90,90 | 100 | 100 | 90,90 |
| **utils/** | 85,91 | 74,01 | 96,49 | 93,20 |
| carrito.js | 97,67 | 72,41 | 100 | 100 |
| validaciones.js | 83,33 | 75,44 | 100 | 91,73 |
| productos.js | 80 | 50 | 77,77 | 83,33 |
| formato.js | 75 | 50 | 100 | 100 |

## 3. Qué se prueba

| Archivo de pruebas | Qué cubre |
|---|---|
| `services/api.spec.js` | Header `Authorization: Bearer`, rutas públicas sin token, refresh guardado en `localStorage` y acceso solo en memoria, **401 → renovar → reintentar**, **renovación fallida → cierre de sesión**, `ErrorApi` con `estado/mensaje/campos`, servidor apagado, respuesta 204, renovación programada con `jasmine.clock()`. |
| `context/SesionContext.spec.jsx` | **Restaurar la sesión al recargar** con un refresh token, refresh vencido, login/registro, `cerrarSesion` limpia el almacenamiento, cierre de sesión desde otra pestaña (evento `storage`). |
| `components/RolesYNavegacion.spec.jsx` | `RutaProtegida`: sin sesión → login, **Vendedor en /admin/usuarios → acceso denegado**, Admin entra, spinner mientras carga. `MenuAdmin`: **el Vendedor no ve Usuarios ni Categorías**. `Encabezado` según el rol. |
| `pages/Login.spec.jsx` | Validaciones, redirección según rol, volver a la página pedida, mensaje 401 del backend. |
| `pages/Registro.spec.jsx` | Validaciones (**RUN, correo, edad, contraseñas iguales**), envío, 409 de correo y RUN repetidos. |
| `pages/CarritoYCheckout.spec.jsx` | Cupones, total con descuento Duoc, "Ir a pagar". Checkout: **validación de tarjeta, CVV y vencimiento**, **pago exitoso → /compra-exitosa** (solo se envían los últimos 4 dígitos), **pago rechazado → /compra-fallida manteniendo el carrito**, 409 de stock. |
| `pages/Compras.spec.jsx` | Pantallas de pago exitoso y fallido (incluido "Reintentar pago"), recarga de la página, Mis compras. |
| `pages/admin/AdminProductos.spec.jsx` | **Crear (POST), editar (PUT) y eliminar (DELETE con confirmación)**, nueva categoría, errores del backend, **el Vendedor no ve el formulario ni los botones**. |
| `pages/admin/PanelAdmin.spec.jsx` | CRUD de usuarios (contraseña opcional al editar), CRUD de categorías, órdenes y detalle para Vendedor/Admin, Dashboard por rol. |
| `App.spec.jsx` | Catálogo desde la API, carrito guardado como `{id, cantidad}` y rehidratado, tope de stock, error con "Reintentar", páginas informativas, contacto y 404. |
| `utils/*.spec.js`, `components/TarjetaProducto.spec.jsx`, `services/almacenamiento.spec.js` | Lógica pura: validaciones, descuentos, carrito y almacenamiento. |

La API se simula con `spyOn(window, 'fetch')` (ayudante `simularApi` en `src/tests/ayudantes.jsx`), así las pruebas no necesitan el backend encendido.

## 4. Análisis de lo que quedó sin cubrir

1. **`ImagenProducto.jsx` (66%)** – Las líneas 15-17 se ejecutan cuando una imagen externa falla al cargar (`onError`). En las pruebas los productos no tienen URL de imagen, por lo que siempre se muestra el ícono de respaldo. Probarlo requiere simular la carga fallida de una imagen remota, y el beneficio es bajo.
2. **`AdminUsuarios.jsx` (81%)** – Falta el camino de error al cargar la lista y al guardar con errores de validación del backend (400 con `campos`). La validación se cubre en `validaciones.spec.js` y el manejo de `campos` se prueba en Login y Checkout, que usan el mismo patrón.
3. **`validaciones.js` (83%)** – Quedan algunas ramas de mensajes de error de largo máximo (por ejemplo, descripción > 500 caracteres o nombre > 100). Son casos borde con la misma lógica que los casos ya probados.
4. **`productos.js` y `formato.js` (75-80%)** – `siguienteId` ya no se usa (los ids ahora los genera la base de datos) y `formatearFecha('')` solo se ejecuta si el backend no envía la fecha.
5. **Ramas de limpieza en efectos** (`activo = false`, `.catch` de cargas secundarias): se ejecutan cuando el usuario sale de la página antes de que llegue la respuesta. Son defensivas y difíciles de forzar en una prueba sin volverla frágil.
6. **`SesionContext` (ramas 75%)** – Las ramas `if (activo)` del efecto de restauración cubren el caso en que el componente se desmonta durante la recarga.

## 5. Comparación con la EP2

En la EP2 había 15 pruebas y 43% de sentencias: solo se probaban validaciones, el carrito y dos componentes.
En la EP3, además de conectar el frontend al backend, se agregaron pruebas de **toda la integración**: cliente HTTP con renovación de token, sesión persistente, rutas protegidas por rol, panel de administración (incluida la edición de productos) y el flujo completo de checkout con pago exitoso y fallido. La cobertura subió a **91,63% de sentencias y 94,53% de líneas**, por sobre el 80% pedido.
