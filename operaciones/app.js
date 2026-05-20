const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx_3nNwGflD8UJMEot-DxoX7HyRSUzLWoaezcxEGTDi275q37bIB-MqRb0g56iUN2-XZw/exec";

const movimientos = JSON.parse(localStorage.getItem("MOVIMIENTOS_PMT")) || [];

const formatearFecha = (f) => {
    if (!f) return "";
    return new Date(f).toISOString().split("T")[0];
};

function guardarMovimiento() {

    const movimiento = {
        fecha: formatearFecha(document.getElementById("fecha").value),
        hora: document.getElementById("hora").value,
        nombre: document.getElementById("nombre").value,
        grupo: document.getElementById("grupo").value,
        movimiento: document.getElementById("movimiento").value,
        estado: document.getElementById("estado").value,
        observacion: document.getElementById("observacion").value,
        responsable: document.getElementById("responsable").value,
        encargado: document.getElementById("encargado").value
    };

    movimientos.push(movimiento);

    localStorage.setItem(
        "MOVIMIENTOS_PMT",
        JSON.stringify(movimientos)
    );

    enviarGoogleSheets(movimiento);

    renderMovimientos();

    limpiarFormulario();

    alert("Movimiento guardado correctamente");
}

function enviarGoogleSheets(data) {

    fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(() => {
        console.log("Enviado a Google Sheets");
    })
    .catch(error => {
        console.error("Error:", error);
    });

}

function renderMovimientos() {

    const contenedor = document.getElementById("historial");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    movimientos.reverse().forEach(m => {

        contenedor.innerHTML += `
        <div class="card-movimiento">
            <b>Fecha:</b> ${m.fecha}<br>
            <b>Hora:</b> ${m.hora}<br>
            <b>Nombre:</b> ${m.nombre}<br>
            <b>Grupo:</b> ${m.grupo}<br>
            <b>Movimiento:</b> ${m.movimiento}<br>
            <b>Estado:</b> ${m.estado}<br>
            <b>Responsable:</b> ${m.responsable}<br>
            <b>Encargado:</b> ${m.encargado}<br>
            <b>Observación:</b> ${m.observacion}
        </div>
        `;
    });

}

function limpiarFormulario() {

    document.getElementById("nombre").value = "";
    document.getElementById("observacion").value = "";
    document.getElementById("responsable").value = "";
    document.getElementById("encargado").value = "";

}

function borrarHistorial() {

    if (confirm("¿Borrar historial completo?")) {

        localStorage.removeItem("MOVIMIENTOS_PMT");

        location.reload();

    }

}

renderMovimientos();
