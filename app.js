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

    cargarGrupoA(datos);

    cargarGrupoB(datos);

}

// =====================================================
// DASHBOARD
// =====================================================

function actualizarDashboard(datos){

    const total = datos.length;

    const vacaciones = datos.filter(p =>
        p.ESTADO?.toUpperCase() === "VACACIONES"
    ).length;

    const igss = datos.filter(p =>
        p.ESTADO?.toUpperCase() === "IGSS"
    ).length;

    const activos = datos.filter(p =>
        p.ESTADO?.toUpperCase() === "ACTIVO"
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

    const grupoA = datos.filter(p =>
        p.GRUPO === "A"
    );

    const tbody = document.getElementById("grupoA-body");

    tbody.innerHTML = "";

    grupoA.forEach(persona => {

        tbody.innerHTML += `

        <tr>

            <td>${persona.NOMBRE || ""}</td>

            <td>${persona.CARGO || ""}</td>

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

    const grupoB = datos.filter(p =>
        p.GRUPO === "B"
    );

    const tbody = document.getElementById("grupoB-body");

    tbody.innerHTML = "";

    grupoB.forEach(persona => {

        tbody.innerHTML += `

        <tr>

            <td>${persona.NOMBRE || ""}</td>

            <td>${persona.CARGO || ""}</td>

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
// CLASES ESTADO
// =====================================================

function claseEstado(estado){

    if(!estado) return "activo";

    estado = estado.toUpperCase();

    if(estado === "VACACIONES") return "vacaciones";

    if(estado === "IGSS") return "igss";

    return "activo";

}

// =====================================================
// BUSCADOR
// =====================================================

document.getElementById("buscarBtn")
.addEventListener("click", buscarPersonal);

function buscarPersonal(){

    const texto = document.getElementById("busqueda")
    .value
    .toLowerCase();

    const filtrados = personal.filter(p =>

        (p.NOMBRE || "").toLowerCase().includes(texto) ||

        (p.CARGO || "").toLowerCase().includes(texto) ||

        (p.GRUPO || "").toLowerCase().includes(texto)

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
