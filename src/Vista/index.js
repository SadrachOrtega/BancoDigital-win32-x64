document.getElementById('btnCargarArchivo').addEventListener('click', cargarArchivo);

function cargarArchivo() {
    const input = document.getElementById('fileInput');
    if (input.files.length === 0) {
        alert('Selecciona un archivo.');
        return;
    }
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const contenido = e.target.result;
        localStorage.setItem('saveBanco', contenido);
        window.location.href = "dashboard.html";
    };
    reader.readAsText(file);
}