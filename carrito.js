let carrito = JSON.parse(localStorage.getItem('carritoLevelUp')) || [];

function renderizarCarrito() {
    const contenedor = document.getElementById('contenedor-items-carrito');
    const contenedorTotal = document.getElementById('precio-total');
    
    contenedor.innerHTML = "";
    let total = 0;

    if (carrito.length === 0) {
        contenedor.innerHTML = "<p>Tu carrito está vacío. ¡Ve a la sección de productos y añade algo!</p>";
        contenedorTotal.innerText = "$0 CLP";
        actualizarContadorCarrito();
        return;
    }
    
    carrito.forEach((producto, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        
        const precioFormateado = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(producto.precio);

        total += producto.precio * producto.cantidad;
        
        itemDiv.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <div class="item-details">
                <h4>${producto.nombre}</h4>
                <p class="item-price">${precioFormateado}</p>
            </div>
            <div class="item-quantity">
                <!-- Botones para modificar la cantidad -->
                <button onclick="cambiarCantidad(${index}, -1)">-</button>
                <span style="font-size: 1.2rem; font-weight: bold;">${producto.cantidad}</span>
                <button onclick="cambiarCantidad(${index}, 1)">+</button>
            </div>
        `;
        contenedor.appendChild(itemDiv);
    });

    const totalFormateado = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(total);
    contenedorTotal.innerText = totalFormateado;
    
    actualizarContadorCarrito();
}

function cambiarCantidad(index, cambio) {
    carrito[index].cantidad += cambio;

    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1); 
    }

    localStorage.setItem('carritoLevelUp', JSON.stringify(carrito));
    renderizarCarrito();
}

function actualizarContadorCarrito() {
    const counter = document.getElementById('cart-counter');
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    if(counter) {
        counter.innerText = `🛒 Cart (${totalItems})`;
    }
}

document.getElementById('btn-aplicar-cupon').addEventListener('click', () => {
    alert('Cupón inválido o expirado.');
});

document.getElementById('btn-pagar').addEventListener('click', () => {
    if(carrito.length === 0) {
        alert('No hay productos para pagar.');
        return;
    }
    alert('¡Gracias por tu compra en Level-Up Gamer!');
    
    carrito = [];
    localStorage.setItem('carritoLevelUp', JSON.stringify(carrito));
    renderizarCarrito();
});

document.addEventListener('DOMContentLoaded', renderizarCarrito);8