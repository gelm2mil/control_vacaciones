// ============================================
// SISTEMA OPERATIVO PMT — GELM
// VERSION PRO OPERATIVA FINAL
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
// VARIABLES
// ============================================

let personalGlobal = [];
let historialCambios = [];
let bitacoraGlobal = [];
let vacacionesGlobal = [];
let resumenGlobal = [];
let operacionesGlobal = [];

// ============================================
// INICIAR
// ============================================

window.addEventListener("DOMContentLoaded", () => {

    cargarSistema();

});

// ============================================
// CARGAR SISTEMA
// ============================================

async function cargarSistema() {

    try {

        mostrarAlerta(
            "Cargando sistema operativo...",
            "#00e5ff"
        );

        const [

            personalResponse,
            bitacoraResponse,
            resumenResponse,
            vacacionesResponse,
            operacionesResponse

        ] = await Promise.all([

            fetch(PERSONAL_URL),
            fetch(BITACORA_URL),
            fetch(RESUMEN_URL),
            fetch(VACACIONES_URL),
            fetch(OPERACIONES_URL)

        ]);

        const personalCSV =
            await personalResponse.text();

        const bitacoraCSV =
            await bitacoraResponse.text();

        const resumenCSV =
            await resumenResponse.text();

        const vacacionesCSV =
            await vacacionesResponse.text();

        const operacionesCSV =
            await operacionesResponse.text();

        // ====================================
        // PERSONAL
        // ====================================

        Papa.parse(personalCSV, {

            header: true,
            skipEmptyLines: true,

            complete: function(results) {

                personalGlobal = results.data;

                // ================================
                // BITACORA
                // ================================

                Papa.parse(bitacoraCSV, {

                    header: true,
                    skipEmptyLines: true,

                    complete: function(bitacoraResults) {

                        bitacoraGlobal =
                            bitacoraResults.data;

                    }

                });

                // ================================
                // RESUMEN
                // ================================

                Papa.parse(resumenCSV, {

                    header: true,
                    skipEmptyLines: true,

                    complete: function(resumenResults) {

                        resumenGlobal =
                            resumenResults.data;

                    }

                });

                // ================================
                // VACACIONES
                // ================================

                Papa.parse(vacacionesCSV, {

                    header: true,
                    skipEmptyLines: true,

                    complete: function(vacacionesResults) {

                        vacacionesGlobal =
                            vacacionesResults.data;

                    }

                });

                // ================================
                // OPERACIONES
                // ================================

                Papa.parse(operacionesCSV, {

                    header: true,
                    skipEmptyLines: true,

                    complete: function(operacionesResults) {

                        operacionesGlobal =
                            operacionesResults.data;

                    }

                });

                procesarDatos(personalGlobal);

            }

        });

    } catch (error) {

        console.error(error);

        mostrarAlerta(
            "Error cargando Google Sheets",
            "#ff004c"
        );

    }

}

// ============================================
// PROCESAR DATOS
// ============================================

function procesarDatos(data) {

    limpiarTablas();

    detectarCambios(data);

    const hoy = new Date();

    const semana = obtenerSemana(hoy);

    const grupoActivoSemana =
        semana % 2 === 0 ? "A" : "B";

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

        const horario =
            limpiar(persona.HORARIO);

        let turnoActual =
            obtenerTurnoAutomatico(
                persona,
                grupoActivoSemana
            );

        // ====================================
        // ESTADO
        // ====================================

        const fuera =

            vacaciones === "SI" ||

            igss === "SI" ||

            permiso === "SI" ||

            estado === "AUSENTE";

        if (fuera) {

            fueraServicio++;

        } else {

            operativosHoy++;

        }

        // ====================================
        // CONTADORES
        // ====================================

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

        // ====================================
        // MANDOS
        // ====================================

        if (

            cargo.includes("COMISARIO") ||
            cargo.includes("SUBDIRECTOR") ||
            cargo.includes("ENCARGADO") ||
            cargo.includes("TRANSPORTES") ||
            cargo.includes("SECRETARIO")

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

        // ====================================
        // REGISTRO
        // ====================================

        const registro = {

            nombre: persona.NOMBRE,

            cargo: persona.CARGO,

            turno: turnoActual,

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

    // ====================================
    // DASHBOARD
    // ====================================

    actualizarDashboard(

        totalPMT,
        operativosHoy,
        fueraServicio,
        mandosActivos

    );

    // ====================================
    // DASHBOARD GRUPOS
    // ====================================

    document.getElementById(
        "grupoAActivos"
    ).textContent = grupoAActivos;

    document.getElementById(
        "grupoAVacaciones"
    ).textContent = grupoAVacaciones;

    document.getElementById(
        "grupoAIGSS"
    ).textContent = grupoAIGSS;

    document.getElementById(
        "grupoBActivos"
    ).textContent = grupoBActivos;

    document.getElementById(
        "grupoBVacaciones"
    ).textContent = grupoBVacaciones;

    document.getElementById(
        "grupoBIGSS"
    ).textContent = grupoBIGSS;

    // ====================================
    // TABLAS
    // ====================================

    renderMandos(mandos);

    renderGrupo(
        "grupoA-body",
        grupoA
    );

    renderGrupo(
        "grupoB-body",
        grupoB
    );

    // ====================================
    // ALERTAS
    // ====================================

    generarAlertas(data);

    generarAlertasOperativas();

}

// ============================================
// ALERTAS OPERATIVAS
// ============================================

function generarAlertasOperativas() {

    if (!operacionesGlobal.length) return;

    const hoy = new Date();

    const yyyy = hoy.getFullYear();

    const mm = String(
        hoy.getMonth() + 1
    ).padStart(2, "0");

    const dd = String(
        hoy.getDate()
    ).padStart(2, "0");

    const fechaHoy =
        `${yyyy}-${mm}-${dd}`;

    operacionesGlobal.forEach(item => {

        const fecha =
            (item.FECHA || "").trim();

        const nombre =
            (item.NOMBRE || "").trim();

        const movimiento =
            (item.MOVIMIENTO || "").trim();

        const estado =
            (item.ESTADO || "").trim();

        const observacion =
            (item.OBSERVACION || "").trim();

        if (
            fecha.includes(fechaHoy)
        ) {

            mostrarNuevaAlerta(

                `🚨 ${nombre} — ${movimiento} — ${estado} — ${observacion}`

            );

        }

    });

}

// ============================================
// NUEVA ALERTA
// ============================================

function mostrarNuevaAlerta(texto) {

    const contenedor =
        document.getElementById(
            "alertasContainer"
        );

    if (!contenedor) return;

    contenedor.innerHTML += `

    <div class="alerta-item">

        ${texto}

    </div>

    `;

}

// ============================================
// ROTACION AUTOMATICA
// ============================================

function obtenerTurnoAutomatico(
    persona,
    grupoActivoSemana
) {

    const grupo =
        limpiar(persona.GRUPO);

    const turnoOriginal =
        limpiar(persona.TURNO);

    if (
        turnoOriginal === "ADMINISTRATIVO"
    ) {

        return "ADMINISTRATIVO";

    }

    if (grupo === "A") {

        return grupoActivoSemana === "A"
            ? "MAÑANA"
            : "TARDE";

    }

    if (grupo === "B") {

        return grupoActivoSemana === "B"
            ? "MAÑANA"
            : "TARDE";

    }

    return turnoOriginal;

}

// ============================================
// OBTENER SEMANA
// ============================================

function obtenerSemana(fecha) {

    const inicio =
        new Date(fecha.getFullYear(), 0, 1);

    const dias = Math.floor(

        (fecha - inicio)

        /

        (24 * 60 * 60 * 1000)

    );

    return Math.ceil(

        (dias + inicio.getDay() + 1)

        / 7

    );

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

    document.getElementById(
        "totalAgentes"
    ).textContent = total;

    document.getElementById(
        "operativosHoy"
    ).textContent = operativos;

    document.getElementById(
        "fueraServicio"
    ).textContent = fuera;

    document.getElementById(
        "mandosActivos"
    ).textContent = mandos;

}

// ============================================
// TABLA MANDOS
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
// TABLAS GRUPOS
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
// ALERTAS GENERALES
// ============================================

function generarAlertas(data) {

    let alertas = [];

    data.forEach(persona => {

        const nombre =
            persona.NOMBRE;

        const vacaciones =
            limpiar(persona.VACACIONES);

        const igss =
            limpiar(persona.IGSS);

        const permiso =
            limpiar(persona.PERMISO);

        if (vacaciones === "SI") {

            alertas.push(
                `🚨 ${nombre} en VACACIONES`
            );

        }

        if (igss === "SI") {

            alertas.push(
                `🟡 ${nombre} en IGSS`
            );

        }

        if (permiso === "SI") {

            alertas.push(
                `🟠 ${nombre} en PERMISO`
            );

        }

    });

    if (alertas.length === 0) {

        alertas.push(
            "Sistema operativo estable."
        );

    }

    mostrarAlertas(alertas);

}

// ============================================
// MOSTRAR ALERTAS
// ============================================

function mostrarAlertas(lista) {

    const contenedor =
        document.getElementById(
            "alertasContainer"
        );

    if (!contenedor) return;

    contenedor.innerHTML = "";

    lista.forEach(alerta => {

        contenedor.innerHTML += `

        <div class="alerta-item">

            ${alerta}

        </div>

        `;

    });

}

// ============================================
// DETECTAR CAMBIOS
// ============================================

function detectarCambios(data) {

    const anterior =

        JSON.parse(
            localStorage.getItem(
                "pmt_anterior"
            )
        ) || [];

    if (anterior.length > 0) {

        data.forEach(actual => {

            const viejo =
                anterior.find(

                    x =>
                    x.NOMBRE === actual.NOMBRE

                );

            if (!viejo) return;

            compararCambio(
                viejo,
                actual,
                "VACACIONES"
            );

            compararCambio(
                viejo,
                actual,
                "IGSS"
            );

            compararCambio(
                viejo,
                actual,
                "PERMISO"
            );

            compararCambio(
                viejo,
                actual,
                "ESTADO"
            );

        });

    }

    localStorage.setItem(

        "pmt_anterior",

        JSON.stringify(data)

    );

}

// ============================================
// COMPARAR CAMBIOS
// ============================================

function compararCambio(
    viejo,
    actual,
    campo
) {

    const viejoValor =
        limpiar(viejo[campo]);

    const nuevoValor =
        limpiar(actual[campo]);

    if (viejoValor !== nuevoValor) {

        const registro = {

            fecha:
                new Date()
                .toLocaleDateString(),

            hora:
                new Date()
                .toLocaleTimeString(),

            nombre:
                actual.NOMBRE,

            movimiento:
                campo,

            detalle:
                `${viejoValor} → ${nuevoValor}`

        };

        historialCambios.push(registro);

        console.log(
            "CAMBIO:",
            registro
        );

    }

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

    if (grupoA)
        grupoA.innerHTML = "";

    if (grupoB)
        grupoB.innerHTML = "";

    if (mandos)
        mandos.innerHTML = "";

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

// ============================================
// ALERTA SIMPLE
// ============================================

function mostrarAlerta(
    texto,
    color
) {

    const contenedor =
        document.getElementById(
            "alertasContainer"
        );

    if (!contenedor) return;

    contenedor.innerHTML = `

    <div
        class="alerta-item"
        style="border-left: 4px solid ${color}"
    >

        ${texto}

    </div>

    `;

}

// ============================================
// ABRIR OPERACIONES
// ============================================

function abrirOperaciones() {

    window.open(
        "operaciones/operaciones.html",
        "_blank"
    );

}

// ============================================
// BOTONES
// ============================================

function generarSolicitud() {

    alert(
        "Módulo de solicitudes en desarrollo."
    );

}

function imprimirPDF() {

    window.print();

}

function verHistorial() {

    console.table(historialCambios);

    alert(
        "Historial mostrado en consola."
    );

}
