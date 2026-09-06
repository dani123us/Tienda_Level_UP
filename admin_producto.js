document.getElementById('formNuevoProducto').addEventListener('submit', function(e) {
    e.preventDefault();
    let isValid = true;

    // Obtener valores
    const codigo = document.getElementById('codigo').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const precio = document.getElementById('precio').value;
    const categoria = document.getElementById('categoria').value;
    const stock = document.getElementById('stock').value;
    const stockCritico = document.getElementById('stockCritico').value;

    // Resetear mensajes
    document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
    document.getElementById('alert-stock').style.display = 'none';

    // 1. Código: Requerido, Texto, Min: 3[cite: 6]
    if (codigo === "" || codigo.length < 3) {
        document.getElementById('err-codigo').style.display = 'block';
        isValid = false;
    }

    // 2. Nombre: Requerido, Max: 100[cite: 6]
    if (nombre === "" || nombre.length > 100) {
        document.getElementById('err-nombre').style.display = 'block';
        isValid = false;
    }

    // 3. Descripción: Opcional, Max: 500[cite: 6]
    if (descripcion.length > 500) {
        document.getElementById('err-descripcion').style.display = 'block';
        isValid = false;
    }

    // 4. Precio: Requerido, Min: 0, Permite decimales[cite: 6]
    if (precio === "" || parseFloat(precio) < 0) {
        document.getElementById('err-precio').style.display = 'block';
        isValid = false;
    }

    // 5. Categoría: Requerido, Select[cite: 6]
    if (categoria === "") {
        document.getElementById('err-categoria').style.display = 'block';
        isValid = false;
    }

    // 6. Stock: Requerido, Min: 0, Solo números enteros[cite: 6]
    if (stock === "" || !Number.isInteger(Number(stock)) || parseInt(stock) < 0) {
        document.getElementById('err-stock').style.display = 'block';
        isValid = false;
    }

    // 7. Stock Crítico: Opcional, Min: 0, Solo enteros[cite: 6]
    if (stockCritico !== "") {
        if (!Number.isInteger(Number(stockCritico)) || parseInt(stockCritico) < 0) {
            document.getElementById('err-stockCritico').style.display = 'block';
            isValid = false;
        } else if (isValid && parseInt(stock) <= parseInt(stockCritico)) {
            // Mostrar mensaje de alerta si el stock es igual o inferior[cite: 6]
            document.getElementById('alert-stock').style.display = 'block';
        }
    }

    if (isValid) {
        alert("Producto guardado exitosamente en el sistema.");
        document.getElementById('formNuevoProducto').reset();
    }
});