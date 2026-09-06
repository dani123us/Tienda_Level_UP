document.getElementById('loginForm').addEventListener('submit', function(event) {

    event.preventDefault();

    let isValid = true;

    const correo = document.getElementById('correo').value.trim();
    const pass = document.getElementById('pass').value;

    document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');

    const correoValido = /^[a-zA-Z0-9._%+-]+@(duoc\.cl|gmail\.com)$/;
    if (correo === "" || correo.length > 100 || !correoValido.test(correo)) {
        document.getElementById('error-correo').style.display = 'block';
        isValid = false;
    }

    if (pass === "" || pass.length < 4 || pass.length > 10) {
        document.getElementById('error-pass').style.display = 'block';
        isValid = false;
    }

    if (isValid) {
        alert('¡Inicio de sesión exitoso! Redirigiendo a tu cuenta...');
        window.location.href = "index.html"; 
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