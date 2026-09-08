document.getElementById('formNuevoProducto').addEventListener('submit', function(e) {
    e.preventDefault();
    let isValid = true;

    const codigo = document.getElementById('codigo').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const precio = document.getElementById('precio').value;
    const categoria = document.getElementById('categoria').value;
    const stock = document.getElementById('stock').value;
    const stockCritico = document.getElementById('stockCritico').value;

    document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
    document.getElementById('alert-stock').style.display = 'none';


    if (codigo === "" || codigo.length < 3) {
        document.getElementById('err-codigo').style.display = 'block';
        isValid = false;
    }

    if (nombre === "" || nombre.length > 100) {
        document.getElementById('err-nombre').style.display = 'block';
        isValid = false;
    }

    if (descripcion.length > 500) {
        document.getElementById('err-descripcion').style.display = 'block';
        isValid = false;
    }

    if (precio === "" || parseFloat(precio) < 0) {
        document.getElementById('err-precio').style.display = 'block';
        isValid = false;
    }

    if (categoria === "") {
        document.getElementById('err-categoria').style.display = 'block';
        isValid = false;
    }

    if (stock === "" || !Number.isInteger(Number(stock)) || parseInt(stock) < 0) {
        document.getElementById('err-stock').style.display = 'block';
        isValid = false;
    }

    if (stockCritico !== "") {
        if (!Number.isInteger(Number(stockCritico)) || parseInt(stockCritico) < 0) {
            document.getElementById('err-stockCritico').style.display = 'block';
            isValid = false;
        } else if (isValid && parseInt(stock) <= parseInt(stockCritico)) {
            document.getElementById('alert-stock').style.display = 'block';
        }
    }

    if (isValid) {
        alert("Producto guardado exitosamente en el sistema.");
        document.getElementById('formNuevoProducto').reset();
    }
});