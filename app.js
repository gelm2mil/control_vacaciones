// ============================================
// SISTEMA OPERATIVO PMT — GELM
// VERSION PRO OPERATIVA
// ============================================

// ===============================
// GOOGLE SHEETS CSV
// ===============================

const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRgumTRicXBKZJbA1GJ-JGhrRnNAVhtgJmK87zHV7M2lfkNaxYi9AVQ3a_dADEaNg/pub?gid=1097513246&single=true&output=csv";

// ===============================
// VARIABLES GLOBALES
// ===============================

let personalGlobal = [];
let historialCambios = [];

// ===============================
// INICIAR SISTEMA
// ===============================

window.addEventListener("DOMContentLoaded", () => {
    cargarSistema();
});

// ===============================
// CARGAR SISTEMA
// ===============================

async function cargarSistema() {

    try {

        mostrarAlerta("Cargando sistema operativo...", "#00e5ff");

        const response = await fetch(SHEET_URL);

        const csv = await response.text();

        Papa.parse(csv, {
            header: true,
            skipEmptyLines: true,

            complete: function(results) {

                personalGlobal = results.data;

                procesarDatos(personalGlobal);

            }

        });

    } catch (error) {

        console.error(error);

        mostrarAlerta("Error cargando Google Sheets", "#ff004c");

    }

}

// ===============================
// PROCESAR DATOS
// ===============================

function procesarDatos(data) {

    limpiarTablas();

    detectarCambios(data);

    const hoy = new Date();

    const semana = obtenerSemana(hoy);

    const grupoActivoSemana = semana % 2 === 0 ? "A" : "B";

    let totalPMT = 0;
    let operativosHoy = 0;
    let fueraServicio = 0;
    let mandosActivos = 0;

    let grupoA = [];
    let grupoB = [];
    let mandos = [];

    data.forEach(persona => {

        if (!persona.NOMBRE) return;

        totalPMT++;

        const grupo = limpiar(persona.GRUPO);
        const cargo = limpiar(persona.CARGO);
        const estado = limpiar(persona.ESTADO);
        const vacaciones = limpiar(persona.VACACIONES);
        const igss = limpiar(persona.IGSS);
        const permiso = limpiar(persona.PERMISO);
        const area = limpiar(persona.AREA);
        const horario = limpiar(persona.HORARIO);

        // ====================================
        // ROTACION AUTOMATICA
        // ====================================

        let turnoActual = obtenerTurnoAutomatico(persona, grupoActivoSemana);

        // ====================================
        // ESTADOS
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
        // MANDOS
        // ====================================

        if (
            cargo.includes("COMISARIO") ||
            cargo.includes("SUBDIRECTOR") ||
            cargo.includes("ENCARGADO") ||
            cargo.includes("VIA PUBLICA") ||
            cargo.includes("TRANSPORTES") ||
            cargo.includes("SECRETARIO")
        ) {

            mandos.push({
                nombre: persona.NOMBRE,
                cargo: persona.CARGO,
                estado: fuera ? "FUERA" : "ACTIVO",
                horario: horario
            });

            if (!fuera) mandosActivos++;

        }

        // ====================================
        // GRUPOS
        // ====================================

        const registro = {
            nombre: persona.NOMBRE,
            cargo: persona.CARGO,
            turno: turnoActual,
            estado: fuera ? "FUERA" : "ACTIVO"
        };

        if (grupo === "A") grupoA.push(registro);

        if (grupo === "B") grupoB.push(registro);

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
    // TABLAS
    // ====================================

    renderMandos(mandos);

    renderGrupo("grupoAContainer", grupoA);

    renderGrupo("grupoBContainer", grupoB);

    // ====================================
    // ALERTAS
    // ====================================

    generarAlertas(data);

}

// ===============================
// ROTACION AUTOMATICA
// ===============================

function obtenerTurnoAutomatico(persona, grupoActivoSemana) {

    const grupo = limpiar(persona.GRUPO);

    const turnoOriginal = limpiar(persona.TURNO);

    if (turnoOriginal === "ADMINISTRATIVO") {
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

// ===============================
// SEMANA ACTUAL
// ===============================

function obtenerSemana(fecha) {

    const inicio = new Date(fecha.getFullYear(), 0, 1);

    const dias = Math.floor(
        (fecha - inicio) / (24 * 60 * 60 * 1000)
    );

    return Math.ceil((dias + inicio.getDay() + 1) / 7);

}

// ===============================
// DASHBOARD
// ===============================

function actualizarDashboard(total, operativos, fuera, mandos) {

    document.getElementById("totalPMT").textContent = total;

    document.getElementById("operativosHoy").textContent = operativos;

    document.getElementById("fueraServicio").textContent = fuera;

    document.getElementById("mandosActivos").textContent = mandos;

}

// ===============================
// TABLA MANDOS
// ===============================

function renderMandos(lista) {

    const tabla = document.getElementById("tablaMandos");

    if (!tabla) return;

    tabla.innerHTML = "";

    lista.forEach(item => {

        tabla.innerHTML += `
        <tr>
            <td>${item.nombre}</td>
            <td>${item.cargo}</td>
            <td>${item.horario || "-"}</td>
            <td>
                <span class="${item.estado === "ACTIVO" ? "estado-activo" : "estado-fuera"}">
                    ${item.estado}
                </span>
            </td>
        </tr>
        `;

    });

}

// ===============================
// TABLAS GRUPOS
// ===============================

function renderGrupo(id, lista) {

    const tabla = document.getElementById(id);

    if (!tabla) return;

    tabla.innerHTML = "";

    lista.forEach(item => {

        tabla.innerHTML += `
        <tr>
            <td>${item.nombre}</td>
            <td>${item.cargo}</td>
            <td>${item.turno}</td>
            <td>
                <span class="${item.estado === "ACTIVO" ? "estado-activo" : "estado-fuera"}">
                    ${item.estado}
                </span>
            </td>
        </tr>
        `;

    });

}

// ===============================
// ALERTAS OPERATIVAS
// ===============================

function generarAlertas(data) {

    let alertas = [];

    data.forEach(persona => {

        const nombre = persona.NOMBRE;

        const vacaciones = limpiar(persona.VACACIONES);

        const igss = limpiar(persona.IGSS);

        const permiso = limpiar(persona.PERMISO);

        const fechaSalida = limpiar(persona.FECHA_SALIDA);

        const fechaRegreso = limpiar(persona.FECHA_REGRESO);

        if (vacaciones === "SI") {
            alertas.push(`🚨 ${nombre} en VACACIONES`);
        }

        if (igss === "SI") {
            alertas.push(`🟡 ${nombre} en IGSS`);
        }

        if (permiso === "SI") {
            alertas.push(`🟠 ${nombre} en PERMISO`);
        }

        if (fechaSalida) {
            alertas.push(`📅 ${nombre} sale: ${fechaSalida}`);
        }

        if (fechaRegreso) {
            alertas.push(`📌 ${nombre} regresa: ${fechaRegreso}`);
        }

    });

    if (alertas.length === 0) {
        alertas.push("Sistema operativo estable.");
    }

    mostrarAlertas(alertas);

}

// ===============================
// MOSTRAR ALERTAS
// ===============================

function mostrarAlertas(lista) {

    const contenedor = document.getElementById("alertasContainer");

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

// ===============================
// DETECTAR CAMBIOS
// ===============================

function detectarCambios(data) {

    const anterior =
        JSON.parse(localStorage.getItem("pmt_anterior")) || [];

    if (anterior.length > 0) {

        data.forEach(actual => {

            const viejo = anterior.find(
                x => x.NOMBRE === actual.NOMBRE
            );

            if (!viejo) return;

            compararCambio(viejo, actual, "VACACIONES");

            compararCambio(viejo, actual, "IGSS");

            compararCambio(viejo, actual, "PERMISO");

            compararCambio(viejo, actual, "ESTADO");

        });

    }

    localStorage.setItem(
        "pmt_anterior",
        JSON.stringify(data)
    );

}

// ===============================
// COMPARAR CAMBIOS
// ===============================

function compararCambio(viejo, actual, campo) {

    const viejoValor = limpiar(viejo[campo]);

    const nuevoValor = limpiar(actual[campo]);

    if (viejoValor !== nuevoValor) {

        const registro = {
            fecha: new Date().toLocaleDateString(),
            hora: new Date().toLocaleTimeString(),
            nombre: actual.NOMBRE,
            movimiento: campo,
            detalle: `${viejoValor} → ${nuevoValor}`
        };

        historialCambios.push(registro);

        console.log("CAMBIO:", registro);

    }

}

// ===============================
// LIMPIAR TABLAS
// ===============================

function limpiarTablas() {

    const grupoA = document.getElementById("grupoAContainer");

    const grupoB = document.getElementById("grupoBContainer");

    const mandos = document.getElementById("tablaMandos");

    if (grupoA) grupoA.innerHTML = "";

    if (grupoB) grupoB.innerHTML = "";

    if (mandos) mandos.innerHTML = "";

}

// ===============================
// UTILIDADES
// ===============================

function limpiar(valor) {

    if (!valor) return "";

    return valor.toString().trim().toUpperCase();

}

// ===============================
// ALERTA SIMPLE
// ===============================

function mostrarAlerta(texto, color) {

    const contenedor = document.getElementById("alertasContainer");

    if (!contenedor) return;

    contenedor.innerHTML = `
    <div class="alerta-item" style="border-left: 4px solid ${color}">
        ${texto}
    </div>
    `;

}
