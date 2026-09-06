document.getElementById('registroForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let isValid = true;

    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const fechaNacimiento = document.getElementById('fechaNacimiento').value;
    const pass = document.getElementById('pass').value;
    const confirmPass = document.getElementById('confirmPass').value;

    document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');

    if (nombre === "") {
        document.getElementById('error-nombre').style.display = 'block';
        isValid = false;
    }

    const correoValido = /^[a-zA-Z0-9._%+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/;
    if (correo === "" || correo.length > 100 || !correoValido.test(correo)) {
        document.getElementById('error-correo').style.display = 'block';
        isValid = false;
    }

    if (pass === "" || pass.length < 4 || pass.length > 10) {
        document.getElementById('error-pass').style.display = 'block';
        isValid = false;
    }

    if (pass !== confirmPass || confirmPass === "") {
        document.getElementById('error-confirmPass').style.display = 'block';
        isValid = false;
    }

    if (fechaNacimiento === "") {
        document.getElementById('error-edad').style.display = 'block';
        isValid = false;
    } else {
        const fechaNac = new Date(fechaNacimiento);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mes = hoy.getMonth() - fechaNac.getMonth();
        
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--;
        }

        if (edad < 18) {
            document.getElementById('error-edad').style.display = 'block';
            isValid = false;
        }
    }

    if (isValid) {
        alert('¡Registro exitoso! Bienvenido a Level-Up Gamer.');
        window.location.href = "login.html";
    }
});