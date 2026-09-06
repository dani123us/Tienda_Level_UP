const productos = [
    {
        id: 1,
        nombre: "PlayStation 5",
        precio: 549990,
        imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcnt6Gls9W-3fXm0LcNv4nCJXqRRUyFArPmsSD0n9Ihw&s=10", // Cambia esto por tus imágenes locales
        categoria: "Consolas"
    },
    {
        id: 2,
        nombre: "Teclado Mecanico Attack Shark X68",
        precio: 79990,
        imagen: "https://media.falabella.com/falabellaCL/150984594_01/w=1500,h=1500,fit=cover",
        categoria: "Accesorios"
    },
    {
        id: 3,
        nombre: "Mouse Gamer Logitech G502 HERO",
        precio: 49990,
        imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCGGDP1InUme74QM_Omxn9OcE-lwQL6aBGZ8ELdgq3QA&s=10",
        categoria: "Mouse"
    },
    {
        id: 4,
        nombre: "Audífonos Gamer ASUS TUF Gaming H1 Gen II Hatsune Miku Edition",
        precio: 119990,
        imagen: "https://media.spdigital.cl/thumbnails/products/1773677662593-audtuf1_df230968_07b34a49_thumbnail_512.jpg",
        categoria: "Sillas Gamers"
    }
];

let carrito = JSON.parse(localStorage.getItem('carritoLevelUp')) || [];

function renderizarProductos() {
    const contenedorCatalogo = document.getElementById('contenedor-productos');
    const contenedorHome = document.getElementById('contenedor-productos-home');

    const crearTarjeta = (producto) => {
        const article = document.createElement('article');
        article.className = 'producto-card';
        const precioFormateado = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(producto.precio);
        
        article.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" style="max-width: 100%; border-radius: 8px; background-color: #FFFFFF; padding: 15px;">
            <h4 style="margin-top: 15px;">${producto.nombre}</h4>
            <p class="precio">${precioFormateado}</p>
            <button class="btn-primary" onclick="agregarAlCarrito(${producto.id})">Añadir al carrito</button>
        `;
        return article;
    };

    if (contenedorCatalogo) {
        contenedorCatalogo.innerHTML = "";
        productos.forEach(producto => {
            contenedorCatalogo.appendChild(crearTarjeta(producto));
        });
    }

    if (contenedorHome) {
        contenedorHome.innerHTML = "";
        const destacados = productos.slice(0, 2); 
        destacados.forEach(producto => {
            contenedorHome.appendChild(crearTarjeta(producto));
        });
    }
    
    actualizarContadorCarrito();
}

function agregarAlCarrito(idProducto) {
    const productoSeleccionado = productos.find(p => p.id === idProducto);
    const productoExiste = carrito.find(p => p.id === idProducto);
    
    if (productoExiste) {
        productoExiste.cantidad++;
    } else {
        carrito.push({ ...productoSeleccionado, cantidad: 1 });
    }

    localStorage.setItem('carritoLevelUp', JSON.stringify(carrito));
    actualizarContadorCarrito();
    alert(`${productoSeleccionado.nombre} fue añadido a tu carrito.`);
}

function actualizarContadorCarrito() {
    const counters = document.querySelectorAll('.cart-icon');
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    
    counters.forEach(counter => {
        counter.innerText = `🛒 Cart (${totalItems})`;
    });
}

document.addEventListener('DOMContentLoaded', renderizarProductos);