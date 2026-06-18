// ==========================
// CONFIGURACION CSV
// ==========================

const CSV_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vTsxA_1DCqrTBHMILm7bC3DRNTs5cLyJplztjRPvUyLLvJIvwbDSGrulY2CN9dcxQILbmTs_1yp5jAP/pub?gid=895287596&single=true&output=csv";

let personal = [];

// ==========================
// INICIO
// ==========================

window.addEventListener("DOMContentLoaded", () => {

```
actualizarFechaHora();

setInterval(
    actualizarFechaHora,
    1000
);

cargarDatos();

const buscador =
document.getElementById("busqueda");

if (buscador) {

    buscador.addEventListener(
        "input",
        buscar
    );

}

actualizarEstadoConexion();
```

});

window.addEventListener(
"online",
actualizarEstadoConexion
);

window.addEventListener(
"offline",
actualizarEstadoConexion
);

// ==========================
// ESTADO CONEXION
// ==========================

function actualizarEstadoConexion(){

```
const estado =
document.getElementById("estadoSistema");

if(!estado) return;

if(navigator.onLine){

    estado.textContent =
    "🟢 ONLINE";

}else{

    estado.textContent =
    "🔴 OFFLINE";

}
```

}

// ==========================
// FECHA Y HORA
// ==========================

function actualizarFechaHora(){

```
const fecha =
document.getElementById("fechaActual");

if(!fecha) return;

const ahora =
new Date();

fecha.textContent =
ahora.toLocaleString(
    "es-GT"
);
```

}

// ==========================
// BUSCAR CAMPOS
// ==========================

function valor(persona, campo) {

```
const llave =
Object.keys(persona).find(

    k =>

    k.trim()
    .toUpperCase()

    ===

    campo.trim()
    .toUpperCase()

);

return llave
    ? String(
        persona[llave] || ""
    ).trim()
    : "";
```

}

// ==========================
// CARGAR CSV
// ==========================

async function cargarDatos() {

```
try {

    const respuesta =
    await fetch(CSV_URL);

    if (!respuesta.ok) {

        throw new Error(
            "No se pudo descargar CSV"
        );

    }

    const csv =
    await respuesta.text();

    Papa.parse(csv, {

        header: true,

        skipEmptyLines: true,

        complete: function(resultado) {

            personal =
            resultado.data;

            actualizarResumen();

            render(personal);

            actualizarFechaActualizacion();

        }

    });

} catch (error) {

    console.error(error);

}
```

}

// ==========================
// ULTIMA ACTUALIZACION
// ==========================

function actualizarFechaActualizacion(){

```
const campo =
document.getElementById(
    "ultimaActualizacion"
);

if(!campo) return;

campo.textContent =
"Actualizado: " +

new Date()
.toLocaleString(
    "es-GT"
);
```

}

// ==========================
// IDENTIFICAR MANDOS
// ==========================

function esMando(cargo) {

```
cargo =
String(cargo || "")
.toUpperCase();

return (

    cargo.includes("DIRECTOR") ||

    cargo.includes("SUB-DIRECTOR") ||

    cargo.includes("ENCARGADO") ||

    cargo.includes("SECRETARIO") ||

    cargo.includes("TRANSPORTES") ||

    cargo.includes("VIA PUBLICA") ||

    cargo.includes("VÍA PUBLICA")

);
```

}

// ==========================
// RESUMEN
// ==========================

function actualizarResumen() {

```
let vacaciones = 0;
let ingresos = 0;
let activos = 0;
let mandosActivos = 0;
let mandosVacaciones = 0;
let suspendidos = 0;

const totalPersonal =
personal.length;

personal.forEach(persona => {

    const vac =
    valor(persona,"vacaciones");

    const igss =
    valor(persona,"IGSS");

    const ingreso =
    valor(persona,"ingresa");

    const cargo =
    valor(persona,"CARGO");

    const mando =
    esMando(cargo);

    if(vac !== "")
        vacaciones++;

    if(ingreso !== "")
        ingresos++;

    if(igss !== "")
        suspendidos++;

    if(vac === "" && igss === "")
        activos++;

    if(mando && vac === "" && igss === "")
        mandosActivos++;

    if(mando && vac !== "")
        mandosVacaciones++;

});

document.getElementById(
    "totalVacaciones"
).textContent =
vacaciones;

document.getElementById(
    "totalIngresos"
).textContent =
ingresos;

document.getElementById(
    "totalActivos"
).textContent =
activos;

document.getElementById(
    "totalMandosActivos"
).textContent =
mandosActivos;

document.getElementById(
    "totalMandosVacaciones"
).textContent =
mandosVacaciones;

document.getElementById(
    "totalSuspendidos"
).textContent =
suspendidos;

const total =
document.getElementById(
    "totalPersonal"
);

if(total){

    total.textContent =
    totalPersonal;

}
```

}

// ==========================
// TABLA
// ==========================

function render(lista) {

```
const tabla =
document.getElementById(
    "tabla"
);

if (!tabla) return;

tabla.innerHTML = "";

lista.forEach(persona => {

    const chapa =
    valor(persona,"CHAPA");

    const nombre =
    valor(persona,"PERSONAL PMT");

    const cargo =
    valor(persona,"CARGO");

    const vac =
    valor(persona,"vacaciones");

    const igss =
    valor(persona,"IGSS");

    const sale =
    valor(persona,"sale");

    const ingresa =
    valor(persona,"ingresa");

    const mando =
    esMando(cargo);

    let claseFila = "";

    if(igss !== ""){

        claseFila =
        "igss-row";

    }else if(vac !== ""){

        claseFila =
        mando
        ? "mando-vacaciones-row"
        : "vacaciones-row";

    }else if(mando){

        claseFila =
        "mando-row";

    }else{

        claseFila =
        "activo-row";

    }

    tabla.insertAdjacentHTML(

        "beforeend",

        `<tr class="${claseFila}">
            <td>${chapa}</td>
            <td>${nombre}</td>
            <td>${cargo}</td>
            <td>${vac}</td>
            <td>${igss}</td>
            <td class="${sale ? "sale-cell" : ""}">
                ${sale}
            </td>
            <td class="${ingresa ? "ingresa-cell" : ""}">
                ${ingresa}
            </td>
        </tr>`

    );

});
```

}

// ==========================
// BUSCADOR
// ==========================

function buscar() {

```
const texto =

document
.getElementById("busqueda")
.value
.toUpperCase();

const resultado =

personal.filter(persona => {

    return (

        valor(persona,"CHAPA")
        .toUpperCase()
        .includes(texto)

        ||

        valor(persona,"PERSONAL PMT")
        .toUpperCase()
        .includes(texto)

        ||

        valor(persona,"CARGO")
        .toUpperCase()
        .includes(texto)

    );

});

render(resultado);
```

}
