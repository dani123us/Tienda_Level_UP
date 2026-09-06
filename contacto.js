document.getElementById('contactoForm').addEventListener('submit', function(event) {

    event.preventDefault();

    let isValid = true;

    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const comentario = document.getElementById('comentario').value.trim();

    document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');

    if (nombre === "" || nombre.length > 100) {
        document.getElementById('error-nombre').style.display = 'block';
        isValid = false;
    }

    const correoValido = /^[a-zA-Z0-9._%+-]+@(duoc\.cl|gmail\.com)$/;
    if (correo === "" || correo.length > 100 || !correoValido.test(correo)) {
        document.getElementById('error-correo').style.display = 'block';
        isValid = false;
    }

    if (comentario === "" || comentario.length > 500) {
        document.getElementById('error-comentario').style.display = 'block';
        isValid = false;
    }

    if (isValid) {
        alert('¡Tu mensaje ha sido enviado correctamente! Nos pondremos en contacto contigo pronto.');
        document.getElementById('contactoForm').reset(); 
    }
});

document.addEventListener('DOMContentLoaded', () => {
    let carrito = JSON.parse(localStorage.getItem('carritoLevelUp')) || [];
    const counter = document.getElementById('cart-counter');
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    
    if(counter) {
        counter.innerText = `🛒 Cart (${totalItems})`;
    }
});