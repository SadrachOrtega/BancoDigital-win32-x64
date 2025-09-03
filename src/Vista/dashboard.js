let saldo = 0;
let nombreCliente = '';

function inicializarDashboard() {
    const contenido = localStorage.getItem('saveBanco');
    if (contenido) {
        const lineas = contenido.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const nombre = lineas[0] || '';
        const capital = lineas[1] || '0';
        saldo = parseFloat(capital) || 0;
        nombreCliente = nombre || '';
        actualizarInfoCliente(nombre, "$" + saldo.toLocaleString('es-CL'), obtenerFechaActual());

        document.getElementById('listaMovimientos').innerHTML = '';

        for (let i = 2; i < lineas.length; i++) {
            const partes = lineas[i].split(',');
            if (partes.length === 5) {
                const [numero, tipo, monto, detalle, fecha] = partes;
                agregarMovimiento(numero, tipo, monto, detalle, fecha);
            }
        }
    }

    const formIngreso = document.getElementById('formIngreso');
    const formRetiro = document.getElementById('formRetiro');
    const btnGuardar = document.getElementById('btnGuardar');

    if (formIngreso) formIngreso.addEventListener('submit', manejarIngreso);
    if (formRetiro) formRetiro.addEventListener('submit', manejarRetiro);
    if (btnGuardar) btnGuardar.addEventListener('click', guardarDatos);
}

function guardarDatos() {
    const nombre = document.getElementById('nombreCliente').textContent.trim();
    const capital = saldo.toString();

    const lista = document.getElementById('listaMovimientos');
    let movimientos = [];
    for (let li of lista.children) {
        const spans = li.querySelectorAll('span');
        if (spans.length === 5) {
            const numero = spans[0].textContent.replace('#', '').trim();
            const tipo = spans[1].textContent.trim();
            const monto = spans[2].textContent.trim();
            const detalle = spans[3].textContent.trim();
            const fecha = spans[4].textContent.trim();
            movimientos.push(`${numero},${tipo},${monto},${detalle},${fecha}`);
        }
    }

    movimientos.sort((a, b) => {
        const numA = parseInt(a.split(',')[0], 10);
        const numB = parseInt(b.split(',')[0], 10);
        return numA - numB;
    });

    const contenido = [nombre, capital, ...movimientos].join('\n');

    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'Capital.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function manejarIngreso(event) {
    event.preventDefault();

    const input = document.getElementById('montoIngreso');
    const monto = parseFloat(input.value);
    const detalle = document.getElementById('detalleIngreso').value.trim();

    if (!isNaN(monto) && monto > 0) {
        saldo += monto;
        agregarMovimiento(generarNumeroMovimiento(), "Ingreso", monto, detalle, obtenerFechaActual());
        actualizarInfoCliente(document.getElementById('nombreCliente').textContent, "$" + saldo.toLocaleString('es-CL'), obtenerFechaActual());
        limpiarFormularios();
        input.setCustomValidity("");
        input.classList.remove("input-error");
    } else {
        input.setCustomValidity("Monto inválido. Debe ser un número mayor que 0.");
        input.reportValidity();
        input.classList.add("input-error");
    }
}

function manejarRetiro(event) {
    event.preventDefault();

    const input = document.getElementById('montoRetiro');
    const monto = parseFloat(input.value);
    const detalle = document.getElementById('detalleRetiro').value.trim();

    if (!isNaN(monto) && monto > 0) {
        saldo -= monto;
        agregarMovimiento(generarNumeroMovimiento(), "Egreso", monto, detalle, obtenerFechaActual());
        actualizarInfoCliente(document.getElementById('nombreCliente').textContent, "$" + saldo.toLocaleString('es-CL'), obtenerFechaActual());
        limpiarFormularios();
        input.setCustomValidity("");
        input.classList.remove("input-error");
    } else {
        input.setCustomValidity("Monto inválido. Debe ser un número mayor que 0.");
        input.reportValidity();
        input.classList.add("input-error");
    }
}

function actualizarInfoCliente(nombre, capital, fecha) {
    document.getElementById('nombreCliente').textContent = nombre;
    document.getElementById('capitalCliente').textContent = capital;
    document.getElementById('fechaChile').textContent = fecha;
}

function agregarMovimiento(numero, tipo, monto, detalle, fecha) {
    const lista = document.getElementById('listaMovimientos');
    const li = document.createElement('li');
    li.className = "movimientos-row";
    let claseTipo = "";
    if (tipo.trim().toLowerCase() === "ingreso") claseTipo = "ingreso";
    if (tipo.trim().toLowerCase() === "egreso") claseTipo = "egreso";
    li.innerHTML = `
        <span>${numero}</span>
        <span class="${claseTipo}">${tipo}</span>
        <span>${monto}</span>
        <span>${detalle}</span>
        <span>${fecha}</span>
    `;
    lista.insertBefore(li, lista.firstChild);
}

function limpiarFormularios() {
    document.getElementById('formIngreso').reset();
    document.getElementById('formRetiro').reset();
}

function generarNumeroMovimiento() {
    const lista = document.getElementById('listaMovimientos');
    return lista.children.length + 1;
}

function obtenerFechaActual() {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

function convertirFechaADDMMAAAA(fechaISO) {
    const partes = fechaISO.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return fechaISO;
}

function fechaDDMMAAAAaDate(fecha) {
    const partes = fecha.split('/');
    return new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
}

document.addEventListener('DOMContentLoaded', function() {
    inicializarDashboard();

    document.getElementById('btnGenerarCartola').onclick = function() {
        document.getElementById('cartolaModal').style.display = 'flex';
    };
    document.getElementById('closeCartola').onclick = function() {
        document.getElementById('cartolaModal').style.display = 'none';
    };
    window.onclick = function(event) {
        if (event.target == document.getElementById('cartolaModal')) {
            document.getElementById('cartolaModal').style.display = 'none';
        }
    };

    document.getElementById('formCartola').onsubmit = function(e) {
        e.preventDefault();

        const fechaIniISO = document.getElementById('fechaInicial').value;
        const fechaFinISO = document.getElementById('fechaFinal').value;  
        const incluirIngreso = document.getElementById('chkIngreso').checked;
        const incluirEgreso = document.getElementById('chkEgreso').checked;

        if (!fechaIniISO || !fechaFinISO || (!incluirIngreso && !incluirEgreso)) {
            alert("Complete todos los campos y seleccione al menos un tipo de movimiento.");
            return;
        }

        const fechaIni = convertirFechaADDMMAAAA(fechaIniISO);
        const fechaFin = convertirFechaADDMMAAAA(fechaFinISO);

        const movimientos = [];
        document.querySelectorAll('#listaMovimientos li').forEach(li => {
            const spans = li.querySelectorAll('span');
            if (spans.length === 5) {
                const tipo = spans[1].textContent.trim();
                const fecha = spans[4].textContent.trim();
                const fechaMovDate = fechaDDMMAAAAaDate(fecha);
                const fechaIniDate = fechaDDMMAAAAaDate(fechaIni);
                const fechaFinDate = fechaDDMMAAAAaDate(fechaFin);

                if (
                    fechaMovDate >= fechaIniDate &&
                    fechaMovDate <= fechaFinDate &&
                    ((tipo === "Ingreso" && incluirIngreso) || (tipo === "Egreso" && incluirEgreso))
                ) {
                    movimientos.push([
                        spans[0].textContent,
                        tipo,
                        spans[2].textContent,
                        spans[3].textContent,
                        fecha
                    ]);
                }
            }
        });

        if (movimientos.length === 0) {
            alert("No hay movimientos en ese rango y tipo.");
            return;
        }

        movimientos.sort((a, b) => {
            return parseInt(a[0], 10) - parseInt(b[0], 10);
        });

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const colorFondo = "#2d98da";
        const colorTexto = "#ffffff";
        const colorTextoMov = "#000000";
        const movimientosPorPagina = 29;
        const margenIzq = 10;
        const margenTop = 15;
        const anchoPagina = 210;
        const altoEncabezado = 28;
        const altoFila = 8;

        function dibujarEncabezado(y) {
            doc.setFillColor(45, 152, 218);
            doc.rect(margenIzq, y, anchoPagina - 2 * margenIzq, altoEncabezado, "F");

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            const titulo = "Banco Digital: Cartola de Movimientos";
            const tituloWidth = doc.getTextWidth(titulo);
            doc.text(titulo, margenIzq + ((anchoPagina - 2 * margenIzq) / 2) - (tituloWidth / 2), y + 10);

            doc.setFontSize(10);
            const cliente = `Cliente: ${nombreCliente}`;
            const saldoTxt = `Saldo Actual: $${saldo.toLocaleString('es-CL')}`;
            const fechas = `Desde: ${fechaIni}  Hasta: ${fechaFin}`;
            doc.text(cliente, margenIzq + 2, y + 16);
            doc.text(saldoTxt, margenIzq + 2, y + 21);
            doc.text(fechas, margenIzq + 2, y + 26);

            doc.setFontSize(10);
            doc.setTextColor(45, 152, 218);
            doc.setDrawColor(45, 152, 218);
            doc.setFillColor(234, 240, 251);
            doc.rect(margenIzq, y + altoEncabezado, anchoPagina - 2 * margenIzq, altoFila, "F");
            doc.text("#", margenIzq + 2, y + altoEncabezado + 6);
            doc.text("Tipo", margenIzq + 15, y + altoEncabezado + 6);
            doc.text("Monto", margenIzq + 40, y + altoEncabezado + 6);
            doc.text("Detalle", margenIzq + 70, y + altoEncabezado + 6);
            doc.text("Fecha", margenIzq + 150, y + altoEncabezado + 6);

            doc.setTextColor(0, 0, 0);
        }

        let y = margenTop;
        let fila = 0;

        for (let i = 0; i < movimientos.length; i++) {
            if (fila % movimientosPorPagina === 0) {
                if (fila > 0) doc.addPage();
                y = margenTop;
                dibujarEncabezado(y);
                y += altoEncabezado + altoFila;
            }

            const numMov = i + 1;
            const mov = movimientos[i];

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(String(numMov), margenIzq + 2, y + 6);
            doc.text(mov[1], margenIzq + 15, y + 6);
            doc.text(mov[2], margenIzq + 40, y + 6);
            doc.text(mov[3], margenIzq + 70, y + 6);
            doc.text(mov[4], margenIzq + 150, y + 6);

            y += altoFila;
            fila++;
        }

        doc.save("Banco Digital Cartola.pdf");

        document.getElementById('cartolaModal').style.display = 'none';
    };
});

function bloquearComa(event) {
    if (event.key === ",") {
        event.preventDefault();
    }
}

function valorPositivo(event) {
    if (event.key < 0) {
        event.preventDefault();
    }
}

document.getElementById('montoIngreso').addEventListener('input', function () {
    this.setCustomValidity("");
    this.classList.remove("input-error");
});

document.getElementById('montoRetiro').addEventListener('input', function () {
    this.setCustomValidity("");
    this.classList.remove("input-error");
});

