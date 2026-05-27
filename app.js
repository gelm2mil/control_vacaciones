// ============================================
// SISTEMA OPERATIVO PMT — GELM
// VERSION FULL FINAL ESTABLE + MULTAS
// ============================================

// ============================================
// GOOGLE SHEETS CSV
// ============================================

const PERSONAL_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRgumTRicXBKZJbA1GJ-JGhrRnNAVhtgJmK87zHV7M2lfkNaxYi9AVQ3a_dADEaNg/pub?gid=1097513246&single=true&output=csv";

const BITACORA_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRgumTRicXBKZJbA1GJ-JGhrRnNAVhtgJmK87zHV7M2lfkNaxYi9AVQ3a_dADEaNg/pub?gid=624752042&single=true&output=csv";

const RESUMEN_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRgumTRicXBKZJbA1GJ-JGhrRnNAVhtgJmK87zHV7M2lfkNaxYi9AVQ3a_dADEaNg/pub?gid=1553827404&single=true&output=csv";

const VACACIONES_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRgumTRicXBKZJbA1GJ-JGhrRnNAVhtgJmK87zHV7M2lfkNaxYi9AVQ3a_dADEaNg/pub?gid=936650941&single=true&output=csv";

const OPERACIONES_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSdxL8NbBd5qZBfd7s1ValAKmVRQ2d3aWh3Fd07cTPLMXxly9Cap-AbpQuJtasRQw00EYnogECsVvtc/pub?gid=289242254&single=true&output=csv";

// ============================================
// API MULTAS
// ============================================

const API_MULTAS =
"https://script.google.com/macros/s/AKfycbw_zF-9ao0DhjvJdLiJx4ZRGV74pLzdRrUnpm8Gs-Z4OEYZ9oWRGhIJyb8Vw_qAZG_2/exec";

// ============================================
// VARIABLES GLOBALES
// ============================================

let personalGlobal = [];
let operacionesGlobal = [];
let multasGlobal = [];
let historialCambios = [];

// ============================================
// INICIO DEL SISTEMA
// ============================================

window.addEventListener("DOMContentLoaded", () => {

    limpiarOperacionesAntiguas();

    cargarSistema();

    setInterval(() => {

        cargarSistema();

    }, 60000);

});

// ============================================
// CARGAR SISTEMA
// ============================================

async function cargarSistema() {

    try {

        mostrarEstadoSistema("CONECTANDO");

        mostrarAlerta(
            "Conectando sistema PMT...",
            "#00e5ff"
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

        if (!personalResponse.ok)
            throw new Error("Error PERSONAL");

        if (!operacionesResponse.ok)
            throw new Error("Error OPERACIONES");

        if (!multasResponse.ok)
            throw new Error("Error MULTAS");

        const personalCSV =
            await personalResponse.text();

        const operacionesCSV =
            await operacionesResponse.text();

        const multasJSON =
            await multasResponse.json();

        multasGlobal = Array.isArray(multasJSON)
            ? multasJSON
            : [];

        Papa.parse(personalCSV, {

            header: true,
            skipEmptyLines: true,

            complete: function (results) {

                personalGlobal = results.data || [];

                Papa.parse(operacionesCSV, {

                    header: true,
                    skipEmptyLines: true,

                    complete: function (operacionesResults) {

                        operacionesGlobal =
                            filtrarOperacionesDelDia(
                                operacionesResults.data || []
                            );

                        integrarOperaciones();

                        procesarDatos(
                            personalGlobal
                        );

                        mostrarEstadoSistema("ONLINE");

                        mostrarAlerta(
                            "Sistema operativo estable.",
                            "#00ff88"
                        );

                    }

                });

            }

        });

    } catch (error) {

        console.error(error);

        mostrarEstadoSistema("ERROR");

        mostrarAlerta(
            "Error cargando sistema",
            "#ff1744"
        );

    }

}

// ============================================
// FILTRAR OPERACIONES
// ============================================

function filtrarOperacionesDelDia(lista) {

    return lista.filter(item => {

        return item.NOMBRE;

    });

}

// ============================================
// LIMPIAR HISTORIAL
// ============================================

function limpiarOperacionesAntiguas() {

    const hoy = new Date()
        .toISOString()
        .split("T")[0];

    const fechaGuardada =
        localStorage.getItem(
            "PMT_RESET"
        );

    if (fechaGuardada !== hoy) {

        localStorage.setItem(
            "PMT_RESET",
            hoy
        );

        historialCambios = [];

    }

}

// ============================================
// INTEGRAR OPERACIONES
// ============================================

function integrarOperaciones() {

    operacionesGlobal.forEach(op => {

        const nombreOperacion =
            limpiar(op.NOMBRE);

        const movimiento =
            limpiar(op.MOVIMIENTO);

        const persona =
            personalGlobal.find(p =>

                limpiar(p.NOMBRE)
                ===
                nombreOperacion

            );

        if (!persona) return;

        if (movimiento === "VACACIONES") {

            persona.VACACIONES = "SI";

        }

        if (movimiento === "IGSS") {

            persona.IGSS = "SI";

        }

        if (movimiento === "PERMISO") {

            persona.PERMISO = "SI";

        }

        if (
            movimiento === "AUSENCIA"
            ||
            movimiento === "RETIRO"
        ) {

            persona.ESTADO = "AUSENTE";

        }

    });

}

// ============================================
// PROCESAR DATOS
// ============================================

function procesarDatos(data) {

    limpiarTablas();

    const semana =
        obtenerSemana(
            new Date()
        );

    const grupoActivoSemana =
        semana % 2 === 0
            ? "B"
            : "A";

    actualizarTitulos(
        grupoActivoSemana
    );

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

    data.forEach(persona => {

        if (!persona.NOMBRE) return;

        totalPMT++;

        const grupo =
            limpiar(persona.GRUPO);

        const cargo =
            limpiar(persona.CARGO);

        const estado =
            limpiar(persona.ESTADO);

        const vacaciones =
            limpiar(persona.VACACIONES);

        const igss =
            limpiar(persona.IGSS);

        const permiso =
            limpiar(persona.PERMISO);

        const fuera =

            vacaciones === "SI"
            ||
            igss === "SI"
            ||
            permiso === "SI"
            ||
            estado === "AUSENTE";

        const turnoActual =
            obtenerTurnoAutomatico(
                persona,
                grupoActivoSemana
            );

        if (fuera) {

            fueraServicio++;

        } else {

            operativosHoy++;

        }

        // =====================================
        // ESTADISTICAS GRUPOS
        // =====================================

        if (grupo === "A") {

            if (vacaciones === "SI") {

                grupoAVacaciones++;

            } else if (igss === "SI") {

                grupoAIGSS++;

            } else {

                grupoAActivos++;

            }

        }

        if (grupo === "B") {

            if (vacaciones === "SI") {

                grupoBVacaciones++;

            } else if (igss === "SI") {

                grupoBIGSS++;

            } else {

                grupoBActivos++;

            }

        }

        // =====================================
        // MANDOS
        // =====================================

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
            ||
            cargo.includes("DIRECTOR")

        ) {

            mandos.push({

                nombre: persona.NOMBRE,

                cargo: persona.CARGO,

                estado:
                    fuera
                        ? "FUERA"
                        : "ACTIVO"

            });

            if (!fuera) {

                mandosActivos++;

            }

        }

        // =====================================
        // MULTAS
        // =====================================

        const chapaPersona =
            limpiar(persona.CHAPA);

        const multasElemento =
            multasGlobal.filter(m =>

                limpiar(m.chapa)
                ===
                chapaPersona

            ).length;

        const registro = {

            nombre: persona.NOMBRE,

            cargo: persona.CARGO,

            turno: turnoActual,

            multas: multasElemento,

            estado:
                fuera
                    ? "FUERA"
                    : "ACTIVO"

        };

        if (grupo === "A") {

            grupoA.push(registro);

        }

        if (grupo === "B") {

            grupoB.push(registro);

        }

    });

    // =====================================
    // DASHBOARD
    // =====================================

    actualizarDashboard(

        totalPMT,
        operativosHoy,
        fueraServicio,
        mandosActivos

    );

    setText(
        "grupoAActivos",
        grupoAActivos
    );

    setText(
        "grupoAVacaciones",
        grupoAVacaciones
    );

    setText(
        "grupoAIGSS",
        grupoAIGSS
    );

    setText(
        "grupoBActivos",
        grupoBActivos
    );

    setText(
        "grupoBVacaciones",
        grupoBVacaciones
    );

    setText(
        "grupoBIGSS",
        grupoBIGSS
    );

    renderMandos(mandos);

    renderGrupo(
        "grupoA-body",
        grupoA
    );

    renderGrupo(
        "grupoB-body",
        grupoB
    );

    generarAlertasOperativas();

}

// ============================================
// RENDER MANDOS
// ============================================

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

                <span class="${
                    item.estado === "ACTIVO"
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

// ============================================
// RENDER GRUPOS
// ============================================

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

                    ${item.multas || 0}

                </span>

            </td>

            <td>

                <span class="${
                    item.estado === "ACTIVO"
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

// ============================================
// DASHBOARD
// ============================================

function actualizarDashboard(

    total,
    operativos,
    fuera,
    mandos

) {

    setText(
        "totalAgentes",
        total
    );

    setText(
        "operativosHoy",
        operativos
    );

    setText(
        "fueraServicio",
        fuera
    );

    setText(
        "mandosActivos",
        mandos
    );

}

// ============================================
// ALERTAS
// ============================================

function generarAlertasOperativas() {

    const contenedor =
        document.getElementById(
            "alertasContainer"
        );

    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (operacionesGlobal.length === 0) {

        contenedor.innerHTML = `

        <div class="alerta-item">

            Sin novedades operativas hoy.

        </div>

        `;

        return;

    }

    operacionesGlobal
        .slice()
        .reverse()
        .forEach(op => {

            contenedor.innerHTML += `

        <div class="alerta-item">

            ${op.NOMBRE}
            —
            ${op.MOVIMIENTO}

        </div>

        `;

        });

}

// ============================================
// LIMPIAR TABLAS
// ============================================

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

    if (grupoA) {

        grupoA.innerHTML = "";

    }

    if (grupoB) {

        grupoB.innerHTML = "";

    }

    if (mandos) {

        mandos.innerHTML = "";

    }

}

// ============================================
// TITULOS
// ============================================

function actualizarTitulos(
    grupoActivoSemana
) {

    const tituloGrupoA =
        document.getElementById(
            "tituloGrupoA"
        );

    const tituloGrupoB =
        document.getElementById(
            "tituloGrupoB"
        );

    if (tituloGrupoA) {

        tituloGrupoA.textContent =

            grupoActivoSemana === "A"
                ?
                "GRUPO A — MAÑANA"
                :
                "GRUPO A — TARDE";

    }

    if (tituloGrupoB) {

        tituloGrupoB.textContent =

            grupoActivoSemana === "B"
                ?
                "GRUPO B — MAÑANA"
                :
                "GRUPO B — TARDE";

    }

}

// ============================================
// TURNOS
// ============================================

function obtenerTurnoAutomatico(
    persona,
    grupoActivoSemana
) {

    const grupo =
        limpiar(persona.GRUPO);

    if (grupo === grupoActivoSemana) {

        return "MAÑANA";

    }

    return "TARDE";

}

// ============================================
// CALCULAR SEMANA
// ============================================

function obtenerSemana(fecha) {

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

// ============================================
// BUSCADOR
// ============================================

function buscarPersonal() {

    const texto =
        limpiar(

            document.getElementById(
                "busqueda"
            ).value

        );

    if (!texto) {

        cargarSistema();

        return;

    }

    const resultado =
        personalGlobal.filter(p =>

            limpiar(p.NOMBRE)
                .includes(texto)

            ||

            limpiar(p.CARGO)
                .includes(texto)

            ||

            limpiar(p.GRUPO)
                .includes(texto)

        );

    procesarDatos(resultado);

}

// ============================================
// BOTONES
// ============================================

function abrirOperaciones() {

    window.open(

        "https://gelm2mil.github.io/control_vacaciones/operaciones/operaciones.html",
        "_blank"

    );

}

function generarSolicitud() {

    alert(
        "Modulo en desarrollo"
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

// ============================================
// ALERTAS VISUALES
// ============================================

function mostrarAlerta(
    mensaje,
    color
) {

    const contenedor =
        document.getElementById(
            "alertasContainer"
        );

    if (!contenedor) return;

    contenedor.innerHTML = `

    <div class="alerta-item"
    style="
    border-left:4px solid ${color};
    ">

        ${mensaje}

    </div>

    `;

}

// ============================================
// ESTADO DEL SISTEMA
// ============================================

function mostrarEstadoSistema(estado) {

    const luces =
        document.querySelectorAll(
            ".estado-luz"
        );

    if (!luces.length) return;

    luces.forEach(l => {

        l.style.opacity = "0.2";

    });

    if (estado === "ONLINE") {

        luces[2].style.opacity = "1";

    }

    if (estado === "CONECTANDO") {

        luces[1].style.opacity = "1";

    }

    if (estado === "ERROR") {

        luces[0].style.opacity = "1";

    }

}

// ============================================
// UTILIDADES
// ============================================

function limpiar(valor) {

    if (!valor) return "";

    return valor
        .toString()
        .trim()
        .toUpperCase();

}

function setText(id, valor) {

    const elemento =
        document.getElementById(id);

    if (elemento) {

        elemento.textContent = valor;

    }

}
