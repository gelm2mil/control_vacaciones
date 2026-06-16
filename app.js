const CSV_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vTsxA_1DCqrTBHMILm7bC3DRNTs5cLyJplztjRPvUyLLvJIvwbDSGrulY2CN9dcxQILbmTs_1yp5jAP/pub?gid=895287596&single=true&output=csv";

let personal = [];

window.addEventListener("DOMContentLoaded", () => {

    cargarDatos();

    document
        .getElementById("busqueda")
        .addEventListener("input", buscar);

});

async function cargarDatos() {

    try {

        const respuesta = await fetch(CSV_URL);

        const csv = await respuesta.text();

        Papa.parse(csv, {

            header: true,
            skipEmptyLines: true,

            complete: function(resultado) {

                personal = resultado.data;

                console.log("Datos cargados:", personal);

                actualizarResumen();

                render(personal);

            }

        });

    } catch(error) {

        console.error("Error cargando CSV:", error);

    }

}

function actualizarResumen() {

    let vacaciones = 0;
    let ingresos = 0;
    let mandos = 0;

    personal.forEach(persona => {

        const vac = obtenerVacaciones(persona);

        const ingresa = String(
            persona.ingresa || ""
        ).trim();

        const cargo = String(
            persona.CARGO || ""
        ).toUpperCase();

        if(vac !== "") vacaciones++;

        if(ingresa !== "") ingresos++;

        if(
            cargo.includes("DIRECTOR") ||
            cargo.includes("SUB-DIRECTOR") ||
            cargo.includes("ENCARGADO") ||
            cargo.includes("SECRETARIO") ||
            cargo.includes("TRANSPORTES") ||
            cargo.includes("VIA PUBLICA")
        ){
            mandos++;
        }

    });

    document.getElementById("totalVacaciones").textContent = vacaciones;
    document.getElementById("totalIngresos").textContent = ingresos;
    document.getElementById("totalMandos").textContent = mandos;

}

function obtenerVacaciones(persona){

    const columna = Object.keys(persona).find(campo =>
        campo.toLowerCase().includes("vacacion")
    );

    if(!columna) return "";

    return String(persona[columna] || "").trim();

}

function render(lista){

    const tabla = document.getElementById("tabla");

    tabla.innerHTML = "";

    lista.forEach(persona => {

        const vac = obtenerVacaciones(persona);

        const sale = String(
            persona.sale || ""
        ).trim();

        const ingresa = String(
            persona.ingresa || ""
        ).trim();

        const cargo = String(
            persona.CARGO || ""
        ).toUpperCase();

        let claseFila = "";

        const esMando =
            cargo.includes("DIRECTOR") ||
            cargo.includes("SUB-DIRECTOR") ||
            cargo.includes("ENCARGADO") ||
            cargo.includes("SECRETARIO") ||
            cargo.includes("TRANSPORTES") ||
            cargo.includes("VIA PUBLICA");

        if(esMando){
            claseFila = "mando-row";
        }

        if(vac !== ""){
            claseFila = "vacaciones-row";
        }

        tabla.innerHTML += `

        <tr class="${claseFila}">

            <td>${persona.CHAPA || ""}</td>

            <td>${persona["PERSONAL PMT"] || ""}</td>

            <td>${persona.CARGO || ""}</td>

            <td>
                ${vac ? "VACACIONES" : ""}
            </td>

            <td class="${sale ? "sale-cell" : ""}">
                ${sale}
            </td>

            <td class="${ingresa ? "ingresa-cell" : ""}">
                ${ingresa}
            </td>

        </tr>

        `;

    });

}

function buscar(){

    const texto = document
        .getElementById("busqueda")
        .value
        .toUpperCase();

    const resultado = personal.filter(persona =>

        String(persona.CHAPA || "")
            .toUpperCase()
            .includes(texto)

        ||

        String(persona["PERSONAL PMT"] || "")
            .toUpperCase()
            .includes(texto)

    );

    render(resultado);

}
