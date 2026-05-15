// =====================================================
// SISTEMA OPERATIVO PMT
// GELM 2026
// APP.JS PROFESIONAL
// =====================================================

// =====================================================
// GOOGLE SHEETS
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

    skipEmptyLines: true,

    complete: function(resultado){

        personal = resultado.data;

        iniciarSistema(personal);

    }

});

// =====================================================
// INICIAR SISTEMA
// =====================================================

function iniciarSistema(datos){

    dashboardEjecutivo(datos);

    cargarMandos(datos);

    cargarGrupoA(datos);

    cargarGrupoB(datos);

    generarAlertas(datos);

}

// =====================================================
// DASHBOARD EJECUTIVO
// =====================================================

function dashboardEjecutivo(datos){

    const total = datos.length;

    const operativos = datos.filter(p =>

        estadoSeguro(p.ESTADO) === "ACTIVO"

    ).length;

    const fueraServicio = datos.filter(p =>

        estadoSeguro(p.ESTADO) !== "ACTIVO"

    ).length;

    const mandos = datos.filter(p =>

        esMando(p.CARGO)

        &&

        estadoSeguro(p.ESTADO) === "ACTIVO"

    ).length;

    document.getElementById("totalAgentes")
    .textContent = total;

    document.getElementById("operativosHoy")
    .textContent = operativos;

    document.getElementById("fueraServicio")
    .textContent = fueraServicio;

    document.getElementById("mandosActivos")
    .textContent = mandos;

}

// =====================================================
// MANDOS
// =====================================================

function cargarMandos(datos){

    const tbody =
    document.getElementById("mandos-body");

    tbody.innerHTML = "";

    const mandos = datos.filter(p =>

        esMando(p.CARGO)

    );

    mandos.forEach(persona => {

        tbody.innerHTML += `

        <tr>

            <td>
                ${persona.NOMBRE || ""}
            </td>

            <td>
                ${persona.CARGO || ""}
            </td>

            <td>

                <span class="${claseEstado(persona.ESTADO)}">

                    ${persona.ESTADO || "ACTIVO"}

                </span>

            </td>

        </tr>

        `;

    });

}

// =====================================================
// GRUPO A
// =====================================================

function cargarGrupoA(datos){

    const grupo = datos.filter(p =>

        grupoSeguro(p.GRUPO) === "A"

    );

    const tbody =
    document.getElementById("grupoA-body");

    tbody.innerHTML = "";

    let activos = 0;
    let vacaciones = 0;
    let igss = 0;

    grupo.forEach(persona => {

        const estado =
        estadoSeguro(persona.ESTADO);

        if(estado === "ACTIVO"){
            activos++;
        }

        if(estado === "VACACIONES"){
            vacaciones++;
        }

        if(estado === "IGSS"){
            igss++;
        }

        tbody.innerHTML += `

        <tr>

            <td>
                ${persona.NOMBRE || ""}
            </td>

            <td>
                ${persona.CARGO || ""}
            </td>

            <td>
                ${persona.TURNO || ""}
            </td>

            <td>

                <span class="${claseEstado(estado)}">

                    ${estado}

                </span>

            </td>

        </tr>

        `;

    });

    document.getElementById("grupoAActivos")
    .textContent = activos;

    document.getElementById("grupoAVacaciones")
    .textContent = vacaciones;

    document.getElementById("grupoAIGSS")
    .textContent = igss;

}

// =====================================================
// GRUPO B
// =====================================================

function cargarGrupoB(datos){

    const grupo = datos.filter(p =>

        grupoSeguro(p.GRUPO) === "B"

    );

    const tbody =
    document.getElementById("grupoB-body");

    tbody.innerHTML = "";

    let activos = 0;
    let vacaciones = 0;
    let igss = 0;

    grupo.forEach(persona => {

        const estado =
        estadoSeguro(persona.ESTADO);

        if(estado === "ACTIVO"){
            activos++;
        }

        if(estado === "VACACIONES"){
            vacaciones++;
        }

        if(estado === "IGSS"){
            igss++;
        }

        tbody.innerHTML += `

        <tr>

            <td>
                ${persona.NOMBRE || ""}
            </td>

            <td>
                ${persona.CARGO || ""}
            </td>

            <td>
                ${persona.TURNO || ""}
            </td>

            <td>

                <span class="${claseEstado(estado)}">

                    ${estado}

                </span>

            </td>

        </tr>

        `;

    });

    document.getElementById("grupoBActivos")
    .textContent = activos;

    document.getElementById("grupoBVacaciones")
    .textContent = vacaciones;

    document.getElementById("grupoBIGSS")
    .textContent = igss;

}

// =====================================================
// ALERTAS OPERATIVAS
// =====================================================

function generarAlertas(datos){

    const container =
    document.getElementById("alertasContainer");

    container.innerHTML = "";

    const vacaciones = datos.filter(p =>

        estadoSeguro(p.ESTADO) === "VACACIONES"

    );

    const igss = datos.filter(p =>

        estadoSeguro(p.ESTADO) === "IGSS"

    );

    // =========================================
    // VACACIONES
    // =========================================

    if(vacaciones.length > 0){

        container.innerHTML += `

        <div class="alerta-item">

            ⚠️ ${vacaciones.length}
            elemento(s) de vacaciones.

        </div>

        `;

    }

    // =========================================
    // IGSS
    // =========================================

    if(igss.length > 0){

        container.innerHTML += `

        <div class="alerta-item">

            ⚠️ ${igss.length}
            elemento(s) en IGSS.

        </div>

        `;

    }

    // =========================================
    // BAJA COBERTURA
    // =========================================

    const grupoA = datos.filter(p =>

        grupoSeguro(p.GRUPO) === "A"

        &&

        estadoSeguro(p.ESTADO) === "ACTIVO"

    ).length;

    const grupoB = datos.filter(p =>

        grupoSeguro(p.GRUPO) === "B"

        &&

        estadoSeguro(p.ESTADO) === "ACTIVO"

    ).length;

    if(grupoA <= 10){

        container.innerHTML += `

        <div class="alerta-item">

            ⚠️ Grupo A con baja cobertura operativa.

        </div>

        `;

    }

    if(grupoB <= 10){

        container.innerHTML += `

        <div class="alerta-item">

            ⚠️ Grupo B con baja cobertura operativa.

        </div>

        `;

    }

    // =========================================
    // SIN ALERTAS
    // =========================================

    if(container.innerHTML === ""){

        container.innerHTML = `

        <div class="alerta-item">

            Sistema operativo estable.

        </div>

        `;

    }

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

        (p.NOMBRE || "")
        .toLowerCase()
        .includes(texto)

        ||

        (p.CARGO || "")
        .toLowerCase()
        .includes(texto)

        ||

        (p.GRUPO || "")
        .toLowerCase()
        .includes(texto)

        ||

        (p.ESTADO || "")
        .toLowerCase()
        .includes(texto)

    );

    iniciarSistema(filtrados);

}

// =====================================================
// UTILIDADES
// =====================================================

function estadoSeguro(estado){

    return (estado || "ACTIVO")
    .toUpperCase()
    .trim();

}

function grupoSeguro(grupo){

    return (grupo || "")
    .toUpperCase()
    .trim();

}

function claseEstado(estado){

    estado = estadoSeguro(estado);

    if(estado === "VACACIONES"){
        return "vacaciones";
    }

    if(estado === "IGSS"){
        return "igss";
    }

    return "activo";

}

function esMando(cargo){

    cargo = (cargo || "")
    .toUpperCase();

    return (

        cargo.includes("COMISARIO")

        ||

        cargo.includes("SUBDIRECTOR")

        ||

        cargo.includes("VIA PUBLICA")

        ||

        cargo.includes("TRANSPORTES")

        ||

        cargo.includes("ENCARGADO")

    );

}

// =====================================================
// BOTONES
// =====================================================

function generarSolicitud(){

    alert(
        "MÓDULO DE SOLICITUDES EN DESARROLLO"
    );

}

function imprimirPDF(){

    window.print();

}

function verHistorial(){

    alert(
        "MÓDULO DE HISTORIAL EN DESARROLLO"
    );

}
