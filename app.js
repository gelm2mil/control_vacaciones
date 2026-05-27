// =====================================================
// SISTEMA OPERATIVO PMT — GELM FULL FINAL
// VERSION ESTABLE PROFESIONAL
// =====================================================

// =====================================================
// URLS GOOGLE SHEETS
// =====================================================

const PERSONAL_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRgumTRicXBKZJbA1GJ-JGhrRnNAVhtgJmK87zHV7M2lfkNaxYi9AVQ3a_dADEaNg/pub?gid=1097513246&single=true&output=csv";

const OPERACIONES_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSdxL8NbBd5qZBfd7s1ValAKmVRQ2d3aWh3Fd07cTPLMXxly9Cap-AbpQuJtasRQw00EYnogECsVvtc/pub?gid=289242254&single=true&output=csv";

const API_MULTAS =
"https://script.google.com/macros/s/AKfycbw_zF-9ao0DhjvJdLiJx4ZRGV74pLzdRrUnpm8Gs-Z4OEYZ9oWRGhIJyb8Vw_qAZG_2/exec";

// =====================================================
// VARIABLES GLOBALES
// =====================================================

let personalGlobal = [];
let operacionesGlobal = [];
let multasGlobal = [];
let personalProcesado = [];

// =====================================================
// INICIO
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    iniciarSistema();

    setInterval(() => {

        iniciarSistema();

    }, 60000);

});

// =====================================================
// INICIAR SISTEMA
// =====================================================

async function iniciarSistema() {

    try {

        mostrarAlerta(
            "🔄 Actualizando sistema operativo..."
        );

        const [
            personalResponse,
            operacionesResponse,
            multasResponse
        ] = await Promise.all([

            fetch(PERSONAL_URL),
            fetch(OPERACIONES_URL),
            fetch(API_MULTAS)

        ]);

        const personalCSV =
            await personalResponse.text();

        const operacionesCSV =
            await operacionesResponse.text();

        let multasJSON = [];

        try {

            multasJSON =
                await multasResponse.json();

        } catch (e) {

            multasJSON = [];

        }

        multasGlobal = multasJSON;

        Papa.parse(personalCSV, {

            header: true,
            skipEmptyLines: true,

            complete: function (resultadoPersonal) {

                personalGlobal =
                    resultadoPersonal.data;

                Papa.parse(operacionesCSV, {

                    header: true,
                    skipEmptyLines: true,

                    complete: function (resultadoOperaciones) {

                        operacionesGlobal =
                            resultadoOperaciones.data;

                        procesarSistema();

                    }

                });

            }

        });

    } catch (error) {

        console.error(error);

        mostrarAlerta(
            "❌ Error cargando sistema"
        );

    }

}

// =====================================================
// PROCESAR SISTEMA
// =====================================================

function procesarSistema() {

    personalProcesado =
        JSON.parse(
            JSON.stringify(personalGlobal)
        );

    aplicarOperaciones();

    renderizarSistema();

}

// =====================================================
// APLICAR OPERACIONES
// =====================================================

function aplicarOperaciones() {

    operacionesGlobal.forEach(op => {

        const nombreOperacion =
            limpiar(op.NOMBRE);

        const movimiento =
            limpiar(op.MOVIMIENTO);

        const persona =
            personalProcesado.find(p =>

                limpiar(p.NOMBRE)
                ===
                nombreOperacion

            );

        if (!persona) return;

        if (movimiento === "VACACIONES") {

            persona.ESTADO_ACTUAL =
                "VACACIONES";

        }

        else if (movimiento === "IGSS") {

            persona.ESTADO_ACTUAL =
                "IGSS";

        }

        else if (
            movimiento === "AUSENCIA"
            ||
            movimiento === "RETIRO"
        ) {

            persona.ESTADO_ACTUAL =
                "FUERA";

        }

        else {

            persona.ESTADO_ACTUAL =
                "ACTIVO";

        }

    });

}

// =====================================================
// RENDERIZAR SISTEMA
// =====================================================

function renderizarSistema() {

    limpiarTablas();

    let totalPMT = 0;
    let operativosHoy = 0;
    let fueraServicio = 0;
    let mandosActivos = 0;

    let grupoA = [];
    let grupoB = [];
    let mandos = [];

    let grupoAActivos = 0;
    let grupoAVacaciones = 0;
    let grupoAIGSS = 0;

    let grupoBActivos = 0;
    let grupoBVacaciones = 0;
    let grupoBIGSS = 0;

    const semana =
        obtenerSemanaActual();

    const grupoMañana =
        semana % 2 === 0 ? "B" : "A";

    actualizarTitulos(
        grupoMañana
    );

    personalProcesado.forEach(persona => {

        if (!persona.NOMBRE) return;

        totalPMT++;

        const grupo =
            limpiar(persona.GRUPO);

        const cargo =
            limpiar(persona.CARGO);

        const estado =
            persona.ESTADO_ACTUAL || "ACTIVO";

        const chapa =
            limpiar(persona.CHAPA);

        const multas =
            contarMultas(chapa);

        const turno =
            grupo === grupoMañana
                ? "MAÑANA"
                : "TARDE";

        if (estado === "ACTIVO") {

            operativosHoy++;

        } else {

            fueraServicio++;

        }

        // =================================================
        // ESTADISTICAS GRUPOS
        // =================================================

        if (grupo === "A") {

            if (estado === "VACACIONES") {

                grupoAVacaciones++;

            }

            else if (estado === "IGSS") {

                grupoAIGSS++;

            }

            else {

                grupoAActivos++;

            }

        }

        if (grupo === "B") {

            if (estado === "VACACIONES") {

                grupoBVacaciones++;

            }

            else if (estado === "IGSS") {

                grupoBIGSS++;

            }

            else {

                grupoBActivos++;

            }

        }

        // =================================================
        // PANEL MANDOS
        // =================================================

        if (

            cargo.includes("COMISARIO")
            ||
            cargo.includes("SUBDIRECTOR")
            ||
            cargo.includes("ENCARGADO")
            ||
            cargo.includes("TRANSPORTES")
            ||
            cargo.includes("SECRETARIO")

        ) {

            mandos.push({

                nombre: persona.NOMBRE,
                cargo: persona.CARGO,
                estado

            });

            if (estado === "ACTIVO") {

                mandosActivos++;

            }

        }

        // =================================================
        // REGISTRO TABLAS
        // =================================================

        const registro = {

            nombre: persona.NOMBRE,
            cargo: persona.CARGO,
            turno,
            multas,
            estado

        };

        if (grupo === "A") {

            grupoA.push(registro);

        }

        if (grupo === "B") {

            grupoB.push(registro);

        }

    });

    // =================================================
    // DASHBOARD
    // =================================================

    actualizarTexto(
        "totalAgentes",
        totalPMT
    );

    actualizarTexto(
        "operativosHoy",
        operativosHoy
    );

    actualizarTexto(
        "fueraServicio",
        fueraServicio
    );

    actualizarTexto(
        "mandosActivos",
        mandosActivos
    );

    actualizarTexto(
        "grupoAActivos",
        grupoAActivos
    );

    actualizarTexto(
        "grupoAVacaciones",
        grupoAVacaciones
    );

    actualizarTexto(
        "grupoAIGSS",
        grupoAIGSS
    );

    actualizarTexto(
        "grupoBActivos",
        grupoBActivos
    );

    actualizarTexto(
        "grupoBVacaciones",
        grupoBVacaciones
    );

    actualizarTexto(
        "grupoBIGSS",
        grupoBIGSS
    );

    // =================================================
    // RENDER TABLAS
    // =================================================

    renderMandos(mandos);

    renderGrupo(
        "grupoA-body",
        grupoA
    );

    renderGrupo(
        "grupoB-body",
        grupoB
    );

    mostrarAlerta(
        "✅ Sistema operativo activo"
    );

}

// =====================================================
// CONTAR MULTAS
// =====================================================

function contarMultas(chapa) {

    return multasGlobal.filter(m =>

        limpiar(m.chapa)
        ===
        chapa

    ).length;

}

// =====================================================
// RENDER MANDOS
// =====================================================

function renderMandos(lista) {

    const tabla =
        document.getElementById(
            "mandos-body"
        );

    if (!tabla) return;

    tabla.innerHTML = "";

    lista.forEach(item => {

        tabla.innerHTML += `

        <tr>

            <td>${item.nombre}</td>

            <td>${item.cargo}</td>

            <td>

                <span class="${item.estado === "ACTIVO"
                ? "estado-activo"
                : "estado-fuera"
            }">

                    ${item.estado}

                </span>

            </td>

        </tr>

        `;

    });

}

// =====================================================
// RENDER GRUPOS
// =====================================================

function renderGrupo(id, lista) {

    const tabla =
        document.getElementById(id);

    if (!tabla) return;

    tabla.innerHTML = "";

    lista.forEach(item => {

        tabla.innerHTML += `

        <tr>

            <td>${item.nombre}</td>

            <td>${item.cargo}</td>

            <td>${item.turno}</td>

            <td>

                <span class="badge-multas">

                    ${item.multas}

                </span>

            </td>

            <td>

                <span class="${item.estado === "ACTIVO"
                ? "estado-activo"
                : "estado-fuera"
            }">

                    ${item.estado}

                </span>

            </td>

        </tr>

        `;

    });

}

// =====================================================
// BUSCADOR
// =====================================================

function buscarPersonal() {

    const texto =
        limpiar(
            document.getElementById(
                "busqueda"
            ).value
        );

    if (!texto) {

        renderizarSistema();

        return;

    }

    const filtrado =
        personalProcesado.filter(p =>

            limpiar(p.NOMBRE)
            .includes(texto)

            ||

            limpiar(p.CARGO)
            .includes(texto)

            ||

            limpiar(p.GRUPO)
            .includes(texto)

        );

    limpiarTablas();

    renderGrupo(
        "grupoA-body",
        filtrado.filter(x =>
            limpiar(x.GRUPO) === "A"
        )
    );

    renderGrupo(
        "grupoB-body",
        filtrado.filter(x =>
            limpiar(x.GRUPO) === "B"
        )
    );

}

// =====================================================
// LIMPIAR TABLAS
// =====================================================

function limpiarTablas() {

    const grupoA =
        document.getElementById(
            "grupoA-body"
        );

    const grupoB =
        document.getElementById(
            "grupoB-body"
        );

    const mandos =
        document.getElementById(
            "mandos-body"
        );

    if (grupoA) grupoA.innerHTML = "";
    if (grupoB) grupoB.innerHTML = "";
    if (mandos) mandos.innerHTML = "";

}

// =====================================================
// TITULOS
// =====================================================

function actualizarTitulos(grupoMañana) {

    const tituloA =
        document.getElementById(
            "tituloGrupoA"
        );

    const tituloB =
        document.getElementById(
            "tituloGrupoB"
        );

    if (tituloA) {

        tituloA.innerHTML =

            grupoMañana === "A"
                ?
                "GRUPO A — MAÑANA"
                :
                "GRUPO A — TARDE";

    }

    if (tituloB) {

        tituloB.innerHTML =

            grupoMañana === "B"
                ?
                "GRUPO B — MAÑANA"
                :
                "GRUPO B — TARDE";

    }

}

// =====================================================
// ALERTAS
// =====================================================

function mostrarAlerta(texto) {

    const alerta =
        document.getElementById(
            "alertaTexto"
        );

    if (!alerta) return;

    alerta.innerHTML = texto;

}

// =====================================================
// BOTONES
// =====================================================

function abrirOperaciones() {

    window.open(
        "https://gelm2mil.github.io/control_vacaciones/operaciones/operaciones.html",
        "_blank"
    );

}

function generarSolicitud() {

    alert(
        "Módulo en desarrollo"
    );

}

function imprimirPDF() {

    window.print();

}

function verHistorial() {

    alert(
        "Historial operativo en desarrollo"
    );

}

// =====================================================
// UTILIDADES
// =====================================================

function limpiar(valor) {

    if (!valor) return "";

    return valor
        .toString()
        .trim()
        .toUpperCase();

}

function actualizarTexto(id, valor) {

    const elemento =
        document.getElementById(id);

    if (elemento) {

        elemento.innerHTML = valor;

    }

}

function obtenerSemanaActual() {

    const fecha = new Date();

    const inicio =
        new Date(
            fecha.getFullYear(),
            0,
            1
        );

    const dias =
        Math.floor(
            (fecha - inicio)
            / 86400000
        );

    return Math.ceil(
        (dias + inicio.getDay() + 1)
        / 7
    );

}
