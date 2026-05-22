// ============================================
// SISTEMA OPERATIVO PMT — GELM
// VERSION FULL FINAL + MULTAS EN TIEMPO REAL
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
let historialCambios = [];
let bitacoraGlobal = [];
let vacacionesGlobal = [];
let resumenGlobal = [];
let operacionesGlobal = [];
let multasGlobal = [];

// ============================================
// INICIO
// ============================================

window.addEventListener("DOMContentLoaded",()=>{

    limpiarOperacionesAntiguas();

    cargarSistema();

    setInterval(()=>{

        cargarSistema();

    },60000);

});

// ============================================
// CARGAR SISTEMA
// ============================================

async function cargarSistema(){

    try{

        mostrarAlerta(
            "Cargando sistema operativo...",
            "#00e5ff"
        );

        const [

            personalResponse,
            bitacoraResponse,
            resumenResponse,
            vacacionesResponse,
            operacionesResponse,
            multasResponse

        ] = await Promise.all([

            fetch(PERSONAL_URL),
            fetch(BITACORA_URL),
            fetch(RESUMEN_URL),
            fetch(VACACIONES_URL),
            fetch(OPERACIONES_URL),
            fetch(API_MULTAS)

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

        const multasJSON =
            await multasResponse.json();

        Papa.parse(personalCSV,{

            header:true,
            skipEmptyLines:true,

            complete:function(results){

                personalGlobal = results.data;

                Papa.parse(bitacoraCSV,{

                    header:true,
                    skipEmptyLines:true,

                    complete:function(bitacoraResults){

                        bitacoraGlobal =
                            bitacoraResults.data;

                    }

                });

                Papa.parse(resumenCSV,{

                    header:true,
                    skipEmptyLines:true,

                    complete:function(resumenResults){

                        resumenGlobal =
                            resumenResults.data;

                    }

                });

                Papa.parse(vacacionesCSV,{

                    header:true,
                    skipEmptyLines:true,

                    complete:function(vacacionesResults){

                        vacacionesGlobal =
                            vacacionesResults.data;

                    }

                });

                Papa.parse(operacionesCSV,{

                    header:true,
                    skipEmptyLines:true,

                    complete:function(operacionesResults){

                        operacionesGlobal =
                            filtrarOperacionesDelDia(
                                operacionesResults.data
                            );

                        multasGlobal = multasJSON;

                        eliminarDuplicados();

                        integrarOperaciones();

                        procesarDatos(
                            personalGlobal
                        );

                    }

                });

            }

        });

    }catch(error){

        console.error(error);

        mostrarAlerta(
            "Error cargando Google Sheets",
            "#ff004c"
        );

    }

}

// ============================================
// FILTRAR SOLO DIA ACTUAL
// ============================================

function filtrarOperacionesDelDia(lista){

    const hoy = new Date()
    .toISOString()
    .split("T")[0];

    return lista.filter(item=>{

        if(!item.FECHA) return false;

        return item.FECHA.includes(hoy);

    });

}

// ============================================
// ELIMINAR DUPLICADOS
// ============================================

function eliminarDuplicados(){

    const vistos = new Set();

    operacionesGlobal =
        operacionesGlobal.filter(op=>{

            const clave =

                limpiar(op.NOMBRE)
                +
                limpiar(op.MOVIMIENTO)
                +
                limpiar(op.ESTADO);

            if(vistos.has(clave)){

                return false;

            }

            vistos.add(clave);

            return true;

        });

}

// ============================================
// LIMPIEZA AUTOMATICA
// ============================================

function limpiarOperacionesAntiguas(){

    const hoy = new Date()
    .toISOString()
    .split("T")[0];

    const ultimaFecha =
        localStorage.getItem(
            "PMT_RESET"
        );

    if(ultimaFecha !== hoy){

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

function integrarOperaciones(){

    operacionesGlobal.forEach(op=>{

        const nombreOperacion =
            limpiar(op.NOMBRE);

        const estadoOperacion =
            limpiar(op.ESTADO);

        const movimiento =
            limpiar(op.MOVIMIENTO);

        const persona =
            personalGlobal.find(p=>

                limpiar(p.NOMBRE)
                ===
                nombreOperacion

            );

        if(!persona) return;

        if(

            estadoOperacion ===
            "FUERA SERVICIO"

        ){

            persona.ESTADO =
                "AUSENTE";

        }

        if(
            movimiento === "VACACIONES"
        ){

            persona.VACACIONES = "SI";

        }

        if(
            movimiento === "IGSS"
        ){

            persona.IGSS = "SI";

        }

        if(
            movimiento === "PERMISO"
        ){

            persona.PERMISO = "SI";

        }

        if(
            movimiento === "REPOSICION"
        ){

            persona.ESTADO =
                "AUSENTE";

        }

        if(
            movimiento === "AUSENCIA"
        ){

            persona.ESTADO =
                "AUSENTE";

        }

        if(
            movimiento === "RETIRO"
        ){

            persona.ESTADO =
                "AUSENTE";

        }

    });

}

// ============================================
// PROCESAR DATOS
// ============================================

function procesarDatos(data){

    limpiarTablas();

    detectarCambios(data);

    const hoy = new Date();

    const semana =
        obtenerSemana(hoy);

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

    data.forEach(persona=>{

        if(!persona.NOMBRE) return;

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

        let turnoActual =
            obtenerTurnoAutomatico(
                persona,
                grupoActivoSemana
            );

        if(fuera){

            fueraServicio++;

        }else{

            operativosHoy++;

        }

        if(grupo === "A"){

            if(vacaciones === "SI"){

                grupoAVacaciones++;

            }else if(igss === "SI"){

                grupoAIGSS++;

            }else{

                grupoAActivos++;

            }

        }

        if(grupo === "B"){

            if(vacaciones === "SI"){

                grupoBVacaciones++;

            }else if(igss === "SI"){

                grupoBIGSS++;

            }else{

                grupoBActivos++;

            }

        }

        if(

            cargo.includes("COMISARIO")
            ||
            cargo.includes("SUBDIRECTOR")
            ||
            cargo.includes("ENCARGADO")
            ||
            cargo.includes("TRANSPORTES")
            ||
            cargo.includes("SECRETARIO")

        ){

            mandos.push({

                nombre:persona.NOMBRE,

                cargo:persona.CARGO,

                estado:
                    fuera
                    ? "FUERA"
                    : "ACTIVO"

            });

            if(!fuera){

                mandosActivos++;

            }

        }

        // ============================================
        // MULTAS AUTOMATICAS
        // ============================================

        const chapaPersona =
            limpiar(persona.CHAPA);

        const multasElemento =
            multasGlobal.filter(m =>

                limpiar(m.chapa)
                ===
                chapaPersona

            ).length;

        const registro = {

            nombre:persona.NOMBRE,

            cargo:persona.CARGO,

            turno:turnoActual,

            multas:multasElemento,

            estado:
                fuera
                ? "FUERA"
                : "ACTIVO"

        };

        if(grupo === "A"){

            grupoA.push(registro);

        }

        if(grupo === "B"){

            grupoB.push(registro);

        }

    });

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

    generarAlertas(data);

    generarAlertasOperativas();

}

// ============================================
// TITULOS DINAMICOS
// ============================================

function actualizarTitulos(
    grupoActivoSemana
){

    const tituloGrupoA =
        document.getElementById(
            "tituloGrupoA"
        );

    const tituloGrupoB =
        document.getElementById(
            "tituloGrupoB"
        );

    if(tituloGrupoA){

        tituloGrupoA.textContent =

            grupoActivoSemana === "A"
            ?
            "GRUPO A — MAÑANA"
            :
            "GRUPO A — TARDE";

    }

    if(tituloGrupoB){

        tituloGrupoB.textContent =

            grupoActivoSemana === "B"
            ?
            "GRUPO B — MAÑANA"
            :
            "GRUPO B — TARDE";

    }

}

// ============================================
// TABLAS GRUPOS
// ============================================

function renderGrupo(id,lista){

    const tabla =
        document.getElementById(id);

    if(!tabla) return;

    tabla.innerHTML = "";

    lista.forEach(item=>{

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
// UTILIDADES
// ============================================

function limpiar(valor){

    if(!valor) return "";

    return valor
    .toString()
    .trim()
    .toUpperCase();

}

function setText(id,valor){

    const elemento =
        document.getElementById(id);

    if(elemento){

        elemento.textContent = valor;

    }

}
