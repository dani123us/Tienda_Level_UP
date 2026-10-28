import { useEffect, useState } from 'react'
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
import NoEncontrado from './pages/NoEncontrado.jsx'
import PanelAdmin from './pages/admin/PanelAdmin.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import AdminProductos from './pages/admin/AdminProductos.jsx'
import AdminUsuarios from './pages/admin/AdminUsuarios.jsx'

import { productosIniciales } from './data/productos.js'
import { usuariosIniciales } from './data/usuarios.js'
import { CLAVES, leerDatos, guardarDatos } from './services/almacenamiento.js'
import {
  agregarProducto,
  cambiarCantidad,
  contarUnidades,
  descontarStock,
  puedeAgregar,
  quitarProducto,
} from './utils/carrito.js'
import { siguienteId } from './utils/productos.js'
import { crearSesion } from './utils/usuarios.js'

function App() {
  const navigate = useNavigate()

  const [productos, setProductos] = useState(() => leerDatos(CLAVES.productos, productosIniciales))
  const [usuarios, setUsuarios] = useState(() => leerDatos(CLAVES.usuarios, usuariosIniciales))
  const [carrito, setCarrito] = useState(() => leerDatos(CLAVES.carrito, []))
  const [sesion, setSesion] = useState(() => leerDatos(CLAVES.sesion, null))
  const [aviso, setAviso] = useState(null)

  useEffect(() => { guardarDatos(CLAVES.productos, productos) }, [productos])
  useEffect(() => { guardarDatos(CLAVES.usuarios, usuarios) }, [usuarios])
  useEffect(() => { guardarDatos(CLAVES.carrito, carrito) }, [carrito])
  useEffect(() => { guardarDatos(CLAVES.sesion, sesion) }, [sesion])

  function agregarAlCarrito(producto) {
    if (!puedeAgregar(carrito, producto)) {
      setAviso({ tipo: 'error', mensaje: `No hay más stock disponible de ${producto.nombre}.` })
      return
    }
    setCarrito(agregarProducto(carrito, producto))
    setAviso({ tipo: 'exito', mensaje: `${producto.nombre} fue añadido a tu carrito.` })
  }

  function pagarCompra() {
    setProductos(descontarStock(productos, carrito))
    setCarrito([])
  }

  function iniciarSesion(usuario) {
    setSesion(crearSesion(usuario))
    setAviso({ tipo: 'exito', mensaje: `¡Bienvenido, ${usuario.nombre}!` })
  }

  function cerrarSesion() {
    setSesion(null)
    navigate('/')
  }

  function registrarUsuario(datosUsuario) {
    setUsuarios([...usuarios, { ...datosUsuario, id: siguienteId(usuarios) }])
  }

  function eliminarUsuario(id) {
    setUsuarios(usuarios.filter((u) => u.id !== id))
  }

  function agregarNuevoProducto(datosProducto) {
    setProductos([...productos, { ...datosProducto, id: siguienteId(productos) }])
  }

  function eliminarProducto(id) {
    setProductos(productos.filter((p) => p.id !== id))
    setCarrito(quitarProducto(carrito, id))
  }

  return (
    <>
      <SubirAlInicio />
      <Encabezado cantidadCarrito={contarUnidades(carrito)} usuario={sesion} onCerrarSesion={cerrarSesion} />

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Inicio productos={productos} onAgregarCarrito={agregarAlCarrito} />} />
          <Route path="/productos" element={<Productos productos={productos} onAgregarCarrito={agregarAlCarrito} />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/login" element={<Login usuarios={usuarios} onIniciarSesion={iniciarSesion} />} />
          <Route path="/registro" element={<Registro usuarios={usuarios} onRegistrar={registrarUsuario} />} />
          <Route
            path="/carrito"
            element={
              <Carrito
                items={carrito}
                usuario={sesion}
                onCambiarCantidad={(id, cambio) => setCarrito(cambiarCantidad(carrito, id, cambio))}
                onQuitar={(id) => setCarrito(quitarProducto(carrito, id))}
                onPagar={pagarCompra}
              />
            }
          />

          <Route
            path="/admin"
            element={
              <RutaProtegida usuario={sesion}>
                <PanelAdmin />
              </RutaProtegida>
            }
          >
            <Route index element={<Dashboard productos={productos} usuarios={usuarios} />} />
            <Route
              path="productos"
              element={
                <AdminProductos
                  productos={productos}
                  onAgregarProducto={agregarNuevoProducto}
                  onEliminarProducto={eliminarProducto}
                />
              }
            />
            <Route
              path="usuarios"
              element={
                <AdminUsuarios
                  usuarios={usuarios}
                  usuarioActual={sesion}
                  onAgregarUsuario={registrarUsuario}
                  onEliminarUsuario={eliminarUsuario}
                />
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
