// =====================================================
// SISTEMA GELM PMT
// CONTROL DE PERSONAL POR GRUPOS
// APP.JS COMPLETO
// =====================================================

let personal = [];

// =====================================================
// CARGAR EXCEL
// =====================================================

fetch("personal_pmt.xlsx")

.then(response => response.arrayBuffer())

.then(data => {

    const workbook = XLSX.read(data, {
        type: "array"
    });

    const hoja = workbook.Sheets["PERSONAL_MAESTRO"];

    personal = XLSX.utils.sheet_to_json(hoja);

    cargarSistema(personal);

})

.catch(error => {

    console.error("ERROR EXCEL:", error);

});

// =====================================================
// CARGAR SISTEMA
// =====================================================

function cargarSistema(datos){

    actualizarDashboard(datos);

    renderizarGrupos(datos);

}

// =====================================================
// DASHBOARD
// =====================================================

function actualizarDashboard(datos){

    const total = datos.length;

    const vacaciones = datos.filter(p =>
        (p.ESTADO || "").toUpperCase() === "VACACIONES"
    ).length;

    const igss = datos.filter(p =>
        (p.ESTADO || "").toUpperCase() === "IGSS"
    ).length;

    const activos = datos.filter(p =>
        (p.ESTADO || "").toUpperCase() === "ACTIVO"
    ).length;

    document.getElementById("totalAgentes").textContent = total;

    document.getElementById("enServicio").textContent = activos;

    document.getElementById("deVacaciones").textContent = vacaciones;

    document.getElementById("proximos").textContent = igss;

}

// =====================================================
// RENDERIZAR GRUPOS
// =====================================================

function renderizarGrupos(datos){

    const tablaA = document.getElementById("tablaGrupoA");

    const tablaB = document.getElementById("tablaGrupoB");

    tablaA.innerHTML = "";

    tablaB.innerHTML = "";

    let activosA = 0;
    let vacacionesA = 0;
    let igssA = 0;

    let activosB = 0;
    let vacacionesB = 0;
    let igssB = 0;

    datos.forEach(persona => {

        const grupo = (persona.GRUPO || "").toUpperCase();

        const estado = (persona.ESTADO || "ACTIVO").toUpperCase();

        const fila = `

        <tr>

            <td>${persona.NOMBRE || ""}</td>

            <td>${persona.CARGO || ""}</td>

            <td>${persona.TURNO || ""}</td>

            <td>
                <span class="estado ${claseEstado(estado)}">
                    ${estado}
                </span>
            </td>

        </tr>

        `;

        // =========================
        // GRUPO A
        // =========================

        if(grupo === "A"){

            tablaA.innerHTML += fila;

            if(estado === "ACTIVO") activosA++;

            if(estado === "VACACIONES") vacacionesA++;

            if(estado === "IGSS") igssA++;

        }

        // =========================
        // GRUPO B
        // =========================

        if(grupo === "B"){

            tablaB.innerHTML += fila;

            if(estado === "ACTIVO") activosB++;

            if(estado === "VACACIONES") vacacionesB++;

            if(estado === "IGSS") igssB++;

        }

    });

    // =========================
    // ESTADISTICAS A
    // =========================

    document.getElementById("activosA").textContent = activosA;

    document.getElementById("vacacionesA").textContent = vacacionesA;

    document.getElementById("igssA").textContent = igssA;

    // =========================
    // ESTADISTICAS B
    // =========================

    document.getElementById("activosB").textContent = activosB;

    document.getElementById("vacacionesB").textContent = vacacionesB;

    document.getElementById("igssB").textContent = igssB;

}

// =====================================================
// ESTADOS
// =====================================================

function claseEstado(estado){

    if(estado === "VACACIONES") return "vacaciones";

    if(estado === "IGSS") return "igss";

    return "activo";

}

// =====================================================
// BUSCADOR
// =====================================================

document
.getElementById("buscarBtn")
.addEventListener("click", buscarPersonal);

function buscarPersonal(){

    const texto = document
    .getElementById("busqueda")
    .value
    .toLowerCase();

    const filtrados = personal.filter(p =>

        (p.NOMBRE || "").toLowerCase().includes(texto)

        ||

        (p.CARGO || "").toLowerCase().includes(texto)

        ||

        (p.GRUPO || "").toLowerCase().includes(texto)

        ||

        (p.ESTADO || "").toLowerCase().includes(texto)

    );

    cargarSistema(filtrados);

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
