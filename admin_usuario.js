const datosGeograficos = {
    "Región Metropolitana": ["Santiago", "Maipú", "Puente Alto", "Providencia"],
    "Región de Valparaíso": ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana"],
    "Región del Biobío": ["Concepción", "Talcahuano", "San Pedro de la Paz"]
};

const selectRegion = document.getElementById('region');
const selectComuna = document.getElementById('comuna');

document.addEventListener('DOMContentLoaded', () => {
    for (let region in datosGeograficos) {
        let option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        selectRegion.appendChild(option);
    }
});

selectRegion.addEventListener('change', function() {
    const regionSeleccionada = this.value;
    selectComuna.innerHTML = '<option value="">-- Seleccione Comuna --</option>'; 
    
    if (regionSeleccionada) {
        selectComuna.disabled = false;
        datosGeograficos[regionSeleccionada].forEach(comuna => {
            let option = document.createElement('option');
            option.value = comuna;
            option.textContent = comuna;
            selectComuna.appendChild(option);
        });
    } else {
        selectComuna.disabled = true;
    }
});

document.getElementById('formNuevoUsuario').addEventListener('submit', function(e) {
    e.preventDefault();
    let isValid = true;

    const run = document.getElementById('run').value.trim();
    const rol = document.getElementById('rol').value;
    const nombre = document.getElementById('nombre').value.trim();
    const apellidos = document.getElementById('apellidos').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const region = document.getElementById('region').value;
    const comuna = document.getElementById('comuna').value;
    const direccion = document.getElementById('direccion').value.trim();

    document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');

    const regexRun = /^[0-9]+[0-9kK]$/;
    if (run === "" || run.length < 7 || run.length > 9 || !regexRun.test(run)) {
        document.getElementById('err-run').style.display = 'block';
        isValid = false;
    }

    if (rol === "") {
        document.getElementById('err-rol').style.display = 'block';
        isValid = false;
    }

    if (nombre === "" || nombre.length > 50) {
        document.getElementById('err-nombre').style.display = 'block';
        isValid = false;
    }

    if (apellidos === "" || apellidos.length > 100) {
        document.getElementById('err-apellidos').style.display = 'block';
        isValid = false;
    }

    const correoValido = /^[a-zA-Z0-9._%+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/;
    if (correo === "" || correo.length > 100 || !correoValido.test(correo)) {
        document.getElementById('err-correo').style.display = 'block';
        isValid = false;
    }

    if (region === "") {
        document.getElementById('err-region').style.display = 'block';
        isValid = false;
    }
    if (comuna === "") {
        document.getElementById('err-comuna').style.display = 'block';
        isValid = false;
    }

    if (direccion === "" || direccion.length > 300) {
        document.getElementById('err-direccion').style.display = 'block';
        isValid = false;
    }

    if (isValid) {
        alert("Usuario creado exitosamente.");
        document.getElementById('formNuevoUsuario').reset();
        selectComuna.disabled = true;
    }
});