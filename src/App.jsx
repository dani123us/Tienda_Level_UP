import { useCallback, useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'

import Encabezado from './components/Encabezado.jsx'
import PiePagina from './components/PiePagina.jsx'
import Notificacion from './components/Notificacion.jsx'
import RutaProtegida from './components/RutaProtegida.jsx'
import SubirAlInicio from './components/SubirAlInicio.jsx'

import Inicio from './pages/Inicio.jsx'
import Productos from './pages/Productos.jsx'
import Nosotros from './pages/Nosotros.jsx'
import Blogs from './pages/Blogs.jsx'
import Contacto from './pages/Contacto.jsx'
import Login from './pages/Login.jsx'
import Registro from './pages/Registro.jsx'
import Carrito from './pages/Carrito.jsx'
import Checkout from './pages/Checkout.jsx'
import CompraExitosa from './pages/CompraExitosa.jsx'
import CompraFallida from './pages/CompraFallida.jsx'
import MisCompras from './pages/MisCompras.jsx'
import AccesoDenegado from './pages/AccesoDenegado.jsx'
import NoEncontrado from './pages/NoEncontrado.jsx'
import PanelAdmin from './pages/admin/PanelAdmin.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import AdminProductos from './pages/admin/AdminProductos.jsx'
import DetalleProducto from './pages/admin/DetalleProducto.jsx'
import AdminOrdenes from './pages/admin/AdminOrdenes.jsx'
import DetalleOrden from './pages/admin/DetalleOrden.jsx'
import AdminUsuarios from './pages/admin/AdminUsuarios.jsx'
import AdminCategorias from './pages/admin/AdminCategorias.jsx'

import { useSesion } from './context/SesionContext.jsx'
import { productosApi } from './services/api.js'
import { CLAVES, leerDatos, guardarDatos } from './services/almacenamiento.js'
import { ROLES } from './data/roles.js'
import {
  agregarProducto,
  aIdsCantidades,
  cambiarCantidad,
  contarUnidades,
  hidratarCarrito,
  puedeAgregar,
  quitarProducto,
} from './utils/carrito.js'

const ADMIN = [ROLES.administrador]
const PERSONAL = [ROLES.administrador, ROLES.vendedor]
const COMPRADORES = [ROLES.cliente, ROLES.administrador]

function App() {
  const navigate = useNavigate()
  const { usuario, cerrarSesion } = useSesion()

  const [productos, setProductos] = useState([])
  const [cargandoProductos, setCargandoProductos] = useState(true)
  const [errorProductos, setErrorProductos] = useState('')
  // En localStorage solo se guarda {id, cantidad}; el resto se toma de los productos frescos del backend.
  const [carritoGuardado, setCarritoGuardado] = useState(() => leerDatos(CLAVES.carrito, []))
  const [cupon, setCupon] = useState(null)
  const [aviso, setAviso] = useState(null)

  const cargarProductos = useCallback(async () => {
    setCargandoProductos(true)
    setErrorProductos('')
    try {
      setProductos(await productosApi.listar())
    } catch (error) {
      setErrorProductos(error.message)
    } finally {
      setCargandoProductos(false)
    }
  }, [])

  useEffect(() => {
    cargarProductos()
  }, [cargarProductos])

  useEffect(() => {
    guardarDatos(CLAVES.carrito, carritoGuardado)
  }, [carritoGuardado])

  const carrito = hidratarCarrito(carritoGuardado, productos)
  const actualizarCarrito = (items) => setCarritoGuardado(aIdsCantidades(items))

  function agregarAlCarrito(producto) {
    if (!puedeAgregar(carrito, producto)) {
      setAviso({ tipo: 'error', mensaje: `No hay más stock disponible de ${producto.nombre}.` })
      return
    }
    actualizarCarrito(agregarProducto(carrito, producto))
    setAviso({ tipo: 'exito', mensaje: `${producto.nombre} fue añadido a tu carrito.` })
  }

  function vaciarCarrito() {
    setCarritoGuardado([])
    setCupon(null)
  }

  function compraPagada() {
    vaciarCarrito()
    cargarProductos() // el stock cambió en el backend
  }

  function salir() {
    cerrarSesion()
    vaciarCarrito()
    navigate('/')
    setAviso({ tipo: 'exito', mensaje: 'Cerraste sesión correctamente.' })
  }

  const catalogo = {
    productos,
    cargando: cargandoProductos,
    error: errorProductos,
    onReintentar: cargarProductos,
    onAgregarCarrito: agregarAlCarrito,
  }

  return (
    <>
      <SubirAlInicio />
      <Encabezado cantidadCarrito={contarUnidades(carrito)} usuario={usuario} onCerrarSesion={salir} />

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Inicio {...catalogo} />} />
          <Route path="/productos" element={<Productos {...catalogo} />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/login" element={<Login onAviso={setAviso} />} />
          <Route path="/registro" element={<Registro onAviso={setAviso} />} />
          <Route path="/acceso-denegado" element={<AccesoDenegado />} />
          <Route
            path="/carrito"
            element={
              <Carrito
                items={carrito}
                usuario={usuario}
                cupon={cupon}
                onCambiarCupon={setCupon}
                onCambiarCantidad={(id, cambio) => actualizarCarrito(cambiarCantidad(carrito, id, cambio))}
                onQuitar={(id) => actualizarCarrito(quitarProducto(carrito, id))}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <RutaProtegida roles={COMPRADORES}>
                <Checkout items={carrito} cupon={cupon} onCompraPagada={compraPagada} />
              </RutaProtegida>
            }
          />
          <Route
            path="/compra-exitosa/:id"
            element={
              <RutaProtegida>
                <CompraExitosa />
              </RutaProtegida>
            }
          />
          <Route
            path="/compra-fallida/:id"
            element={
              <RutaProtegida>
                <CompraFallida />
              </RutaProtegida>
            }
          />
          <Route
            path="/mis-compras"
            element={
              <RutaProtegida>
                <MisCompras />
              </RutaProtegida>
            }
          />

          <Route
            path="/admin"
            element={
              <RutaProtegida roles={PERSONAL}>
                <PanelAdmin />
              </RutaProtegida>
            }
          >
            <Route index element={<Dashboard productos={productos} />} />
            <Route
              path="productos"
              element={<AdminProductos productos={productos} onCambio={cargarProductos} onAviso={setAviso} />}
            />
            <Route path="productos/:id" element={<DetalleProducto />} />
            <Route path="ordenes" element={<AdminOrdenes />} />
            <Route path="ordenes/:id" element={<DetalleOrden onAviso={setAviso} />} />
            <Route
              path="categorias"
              element={
                <RutaProtegida roles={ADMIN}>
                  <AdminCategorias onCambio={cargarProductos} onAviso={setAviso} />
                </RutaProtegida>
              }
            />
            <Route
              path="usuarios"
              element={
                <RutaProtegida roles={ADMIN}>
                  <AdminUsuarios onAviso={setAviso} />
                </RutaProtegida>
              }
            />
          </Route>

          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </main>

      <PiePagina />
      <Notificacion aviso={aviso} onCerrar={() => setAviso(null)} />
    </>
  )
}

export default App
