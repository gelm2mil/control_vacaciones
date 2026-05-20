const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwvHRMaytHzcyv_RM0mk6LtIhacrGrXW2VYhHyrPxtgGSciiFWYIb-Yz8ff1yfUTzR0/exec";

const DB = "OPERACIONES_PMT";
const STORE = "MOVIMIENTOS";

let db;
let movimientos = [];

const f = id => document.getElementById(id);

/* =========================
   ABRIR BASE LOCAL
========================= */
function abrirDB() {
    return new Promise((resolve) => {

        const request = indexedDB.open(DB, 1);

        request.onupgradeneeded = (e) => {
            db = e.target.result;

            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE, {
                    keyPath: "id",
                    autoIncrement: true
                });
            }
        };

        request.onsuccess = (e) => {
            db = e.target.result;
            resolve();
        };

    });
}

/* =========================
   GUARDAR MOVIMIENTO
========================= */
async function guardarMovimiento() {

    if (!f("fecha").value || !f("nombre").value) {
        alert("Fecha y nombre requeridos");
        return;
    }

    await abrirDB();

    const movimiento = {
        fecha: f("fecha").value,
        hora: f("hora").value,
        nombre: f("nombre").value,
        grupo: f("grupo").value,
        movimiento: f("movimiento").value,
        estado: f("estado").value,
        responsable: f("responsable").value,
        encargado: f("encargado").value,
        observacion: f("observacion").value
    };

    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);

    store.add(movimiento);

    tx.oncomplete = () => {

        enviarGoogleSheets(movimiento);

        limpiar();

        cargarMovimientos();

        alert("Movimiento guardado correctamente");
    };
}

/* =========================
   ENVIAR A GOOGLE SHEETS
========================= */
function enviarGoogleSheets(data) {

    const formData = new URLSearchParams();

    for (const key in data) {
        formData.append(key, data[key]);
    }

    fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData
    })
    .then(() => {
        console.log("Backup enviado");
    })
    .catch((err) => {
        console.error(err);
    });
}

/* =========================
   CARGAR HISTORIAL
========================= */
async function cargarMovimientos() {

    await abrirDB();

    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);

    const request = store.getAll();

    request.onsuccess = () => {

        movimientos = request.result;

        renderMovimientos();
    };
}

/* =========================
   RENDER HISTORIAL
========================= */
function renderMovimientos() {

    let contenedor = document.getElementById("historial");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    movimientos.reverse().forEach(m => {

        contenedor.innerHTML += `
        <div class="card-registro">

            <div><strong>Fecha:</strong> ${m.fecha}</div>
            <div><strong>Hora:</strong> ${m.hora}</div>
            <div><strong>Nombre:</strong> ${m.nombre}</div>
            <div><strong>Grupo:</strong> ${m.grupo}</div>
            <div><strong>Movimiento:</strong> ${m.movimiento}</div>
            <div><strong>Estado:</strong> ${m.estado}</div>
            <div><strong>Responsable:</strong> ${m.responsable}</div>
            <div><strong>Encargado:</strong> ${m.encargado}</div>
            <div><strong>Observación:</strong> ${m.observacion}</div>

        </div>
        `;
    });
}

/* =========================
   LIMPIAR FORMULARIO
========================= */
function limpiar() {

    f("nombre").value = "";
    f("responsable").value = "";
    f("encargado").value = "";
    f("observacion").value = "";
}

/* =========================
   BORRAR HISTORIAL
========================= */
async function borrarHistorial() {

    if (!confirm("¿Borrar historial local?")) return;

    await abrirDB();

    const tx = db.transaction(STORE, "readwrite");

    tx.objectStore(STORE).clear();

    tx.oncomplete = () => {

        cargarMovimientos();

        alert("Historial eliminado");
    };
}

/* =========================
   EXPORTAR WORD
========================= */
function exportarWord() {

    const { Document, Packer, Paragraph } = window.docx;

    const contenido = movimientos.map(m => {

        return new Paragraph(
            `${m.fecha} ${m.hora} | ${m.nombre} | ${m.movimiento} | ${m.observacion}`
        );

    });

    const doc = new Document({
        sections: [{
            children: contenido
        }]
    });

    Packer.toBlob(doc).then(blob => {

        saveAs(blob, "MOVIMIENTOS_OPERATIVOS.docx");

    });
}

/* =========================
   AUTO FECHA
========================= */
window.onload = () => {

    const hoy = new Date();

    f("fecha").value = hoy.toISOString().split("T")[0];

    cargarMovimientos();
};
