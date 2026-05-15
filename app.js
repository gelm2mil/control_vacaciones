// =====================================================
// GOOGLE SHEETS CSV
// =====================================================

const sheetURL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRgumTRicXBKZJbA1GJ-JGhrRnNAVhtgJmK87zHV7M2lfkNaxYi9AVQ3a_dADEaNg/pub?output=csv";

// =====================================================
// VARIABLES
// =====================================================

let personal = [];

// =====================================================
// CARGAR GOOGLE SHEETS
// =====================================================

Papa.parse(sheetURL, {

    download: true,
    header: true,

    complete: function(resultado){

        personal = resultado.data;

        cargarSistema(personal);

    }

});

// =====================================================
// SISTEMA
// =====================================================

function cargarSistema(datos){

    actualizarDashboard(datos);

    cargarGrupoA(datos);

    cargarGrupoB(datos);

}

// =====================================================
// DASHBOARD
// =====================================================

function actualizarDashboard(datos){

    const total = datos.length;

    const activos = datos.filter(p =>
        (p.ESTADO || "").toUpperCase() === "ACTIVO"
    ).length;

    const vacaciones = datos.filter(p =>
        (p.ESTADO || "").toUpperCase() === "VACACIONES"
    ).length;

    const igss = datos.filter(p =>
        (p.ESTADO || "").toUpperCase() === "IGSS"
    ).length;

    document.getElementById("totalAgentes").textContent = total;

    document.getElementById("enServicio").textContent = activos;

    document.getElementById("deVacaciones").textContent = vacaciones;

    document.getElementById("proximos").textContent = igss;

}

// =====================================================
// GRUPO A
// =====================================================

function cargarGrupoA(datos){

    const grupo = datos.filter(p =>
        (p.GRUPO || "").toUpperCase() === "A"
    );

    document.getElementById("activosA").textContent =
        grupo.filter(p => (p.ESTADO || "").toUpperCase() === "ACTIVO").length;

    document.getElementById("vacacionesA").textContent =
        grupo.filter(p => (p.ESTADO || "").toUpperCase() === "VACACIONES").length;

    document.getElementById("igssA").textContent =
        grupo.filter(p => (p.ESTADO || "").toUpperCase() === "IGSS").length;

    const tabla = document.getElementById("tablaGrupoA");

    tabla.innerHTML = "";

    grupo.forEach(persona => {

        tabla.innerHTML += `

        <tr>

            <td>${persona.NOMBRE || ""}</td>

            <td>${persona.CARGO || ""}</td>

            <td>${persona.TURNO || ""}</td>

            <td>
                <span class="${claseEstado(persona.ESTADO)}">
                    ${persona.ESTADO || ""}
                </span>
            </td>

        </tr>

        `;

    });

}

// =====================================================
// GRUPO B
// =====================================================

function cargarGrupoB(datos){

    const grupo = datos.filter(p =>
        (p.GRUPO || "").toUpperCase() === "B"
    );

    document.getElementById("activosB").textContent =
        grupo.filter(p => (p.ESTADO || "").toUpperCase() === "ACTIVO").length;

    document.getElementById("vacacionesB").textContent =
        grupo.filter(p => (p.ESTADO || "").toUpperCase() === "VACACIONES").length;

    document.getElementById("igssB").textContent =
        grupo.filter(p => (p.ESTADO || "").toUpperCase() === "IGSS").length;

    const tabla = document.getElementById("tablaGrupoB");

    tabla.innerHTML = "";

    grupo.forEach(persona => {

        tabla.innerHTML += `

        <tr>

            <td>${persona.NOMBRE || ""}</td>

            <td>${persona.CARGO || ""}</td>

            <td>${persona.TURNO || ""}</td>

            <td>
                <span class="${claseEstado(persona.ESTADO)}">
                    ${persona.ESTADO || ""}
                </span>
            </td>

        </tr>

        `;

    });

}

// =====================================================
// ESTADOS
// =====================================================

function claseEstado(estado){

    estado = (estado || "").toUpperCase();

    if(estado === "VACACIONES"){
        return "vacaciones";
    }

    if(estado === "IGSS"){
        return "igss";
    }

    return "activo";

}

// =====================================================
// BUSCADOR
// =====================================================

document.getElementById("buscarBtn")
.addEventListener("click", buscarPersonal);

function buscarPersonal(){

    const texto = document
    .getElementById("busqueda")
    .value
    .toLowerCase();

    const filtrados = personal.filter(p =>

        (p.NOMBRE || "").toLowerCase().includes(texto) ||

        (p.CARGO || "").toLowerCase().includes(texto) ||

        (p.GRUPO || "").toLowerCase().includes(texto) ||

        (p.ESTADO || "").toLowerCase().includes(texto)

    );

    cargarGrupoA(filtrados);

    cargarGrupoB(filtrados);

}

// =====================================================
// BOTONES
// =====================================================

function generarSolicitud(){

    alert("MÓDULO EN DESARROLLO");

}

function verHistorial(){

    alert("HISTORIAL EN DESARROLLO");

}
