// ============================================
// SISTEMA OPERATIVO PMT — GELM
// VERSION FULL FINAL INTEGRADA
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
// VARIABLES GLOBALES
// ============================================

let personalGlobal = [];
let historialCambios = [];
let bitacoraGlobal = [];
let vacacionesGlobal = [];
let resumenGlobal = [];
let operacionesGlobal = [];

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

        const registro = {

            nombre:persona.NOMBRE,

            cargo:persona.CARGO,

            turno:turnoActual,

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
// ALERTAS OPERATIVAS
// ============================================

function generarAlertasOperativas(){

    const contenedor =
        document.getElementById(
            "alertasContainer"
        );

    if(!contenedor) return;

    contenedor.innerHTML = "";

    if(!operacionesGlobal.length){

        contenedor.innerHTML = `

        <div
        class="alerta-item"
        onclick="abrirOperaciones()"
        >

        Sistema operativo estable.

        </div>

        `;

        return;

    }

    operacionesGlobal
    .slice()
    .reverse()
    .slice(0,10)
    .forEach(item=>{

        contenedor.innerHTML += `

        <div
        class="alerta-item"
        onclick="abrirOperaciones()"
        style="cursor:pointer;"
        >

        🚨 ${item.NOMBRE || ""}
        —
        ${item.MOVIMIENTO || ""}
        —
        ${item.ESTADO || ""}

        </div>

        `;

    });

}

// ============================================
// BUSCADOR
// ============================================

function buscarPersonal(){

    const texto =
        limpiar(

            document.getElementById(
                "busqueda"
            ).value

        );

    if(!texto){

        procesarDatos(
            personalGlobal
        );

        return;

    }

    const filtrado =
        personalGlobal.filter(p=>

            limpiar(p.NOMBRE)
            .includes(texto)

            ||

            limpiar(p.CARGO)
            .includes(texto)

            ||

            limpiar(p.GRUPO)
            .includes(texto)

            ||

            limpiar(p.ESTADO)
            .includes(texto)

        );

    procesarDatos(filtrado);

}

// ============================================
// TURNOS
// ============================================

function obtenerTurnoAutomatico(
    persona,
    grupoActivoSemana
){

    const grupo =
        limpiar(persona.GRUPO);

    const turnoOriginal =
        limpiar(persona.TURNO);

    if(
        turnoOriginal ===
        "ADMINISTRATIVO"
    ){

        return "ADMINISTRATIVO";

    }

    if(grupo === "A"){

        return grupoActivoSemana === "A"
        ? "MAÑANA"
        : "TARDE";

    }

    if(grupo === "B"){

        return grupoActivoSemana === "B"
        ? "MAÑANA"
        : "TARDE";

    }

    return turnoOriginal;

}

// ============================================
// SEMANA
// ============================================

function obtenerSemana(fecha){

    const inicio =
        new Date(
            fecha.getFullYear(),
            0,
            1
        );

    const dias = Math.floor(

        (fecha - inicio)

        /

        (24*60*60*1000)

    );

    return Math.ceil(

        (dias + inicio.getDay()+1)

        /7

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
){

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
// TABLA MANDOS
// ============================================

function renderMandos(lista){

    const tabla =
        document.getElementById(
            "mandos-body"
        );

    if(!tabla) return;

    tabla.innerHTML = "";

    lista.forEach(item=>{

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

function generarAlertas(data){

    let alertas = [];

    data.forEach(persona=>{

        const nombre =
            persona.NOMBRE;

        const vacaciones =
            limpiar(persona.VACACIONES);

        const igss =
            limpiar(persona.IGSS);

        const permiso =
            limpiar(persona.PERMISO);

        if(vacaciones === "SI"){

            alertas.push(
                `🚨 ${nombre} en VACACIONES`
            );

        }

        if(igss === "SI"){

            alertas.push(
                `🟡 ${nombre} en IGSS`
            );

        }

        if(permiso === "SI"){

            alertas.push(
                `🟠 ${nombre} en PERMISO`
            );

        }

    });

    if(alertas.length === 0){

        alertas.push(
            "Sistema operativo estable."
        );

    }

    mostrarAlertas(alertas);

}

// ============================================
// MOSTRAR ALERTAS
// ============================================

function mostrarAlertas(lista){

    const contenedor =
        document.getElementById(
            "alertasContainer"
        );

    if(!contenedor) return;

    contenedor.innerHTML = "";

    lista.forEach(alerta=>{

        contenedor.innerHTML += `

        <div
        class="alerta-item"
        onclick="abrirOperaciones()"
        style="cursor:pointer;"
        >

            ${alerta}

        </div>

        `;

    });

}

// ============================================
// DETECTAR CAMBIOS
// ============================================

function detectarCambios(data){

    const anterior =

        JSON.parse(
            localStorage.getItem(
                "pmt_anterior"
            )
        ) || [];

    if(anterior.length > 0){

        data.forEach(actual=>{

            const viejo =
                anterior.find(

                    x =>
                    x.NOMBRE === actual.NOMBRE

                );

            if(!viejo) return;

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
){

    const viejoValor =
        limpiar(viejo[campo]);

    const nuevoValor =
        limpiar(actual[campo]);

    if(viejoValor !== nuevoValor){

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

    }

}

// ============================================
// LIMPIAR TABLAS
// ============================================

function limpiarTablas(){

    limpiarTabla(
        "grupoA-body"
    );

    limpiarTabla(
        "grupoB-body"
    );

    limpiarTabla(
        "mandos-body"
    );

}

// ============================================
// LIMPIAR TABLA
// ============================================

function limpiarTabla(id){

    const tabla =
        document.getElementById(id);

    if(tabla){

        tabla.innerHTML = "";

    }

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

// ============================================
// ALERTA SIMPLE
// ============================================

function mostrarAlerta(
    texto,
    color
){

    const contenedor =
        document.getElementById(
            "alertasContainer"
        );

    if(!contenedor) return;

    contenedor.innerHTML = `

    <div
        class="alerta-item"
        style="
        border-left:4px solid ${color};
        cursor:pointer;
        "
        onclick="abrirOperaciones()"
    >

        ${texto}

    </div>

    `;

}

// ============================================
// ABRIR OPERACIONES
// ============================================

function abrirOperaciones(){

    window.open(
        "operaciones/operaciones.html",
        "_blank"
    );

}

// ============================================
// BOTONES
// ============================================

function generarSolicitud(){

    alert(
        "Módulo de solicitudes en desarrollo."
    );

}

function imprimirPDF(){

    window.print();

}

function verHistorial(){

    console.table(
        historialCambios
    );

    alert(
        "Historial mostrado en consola."
    );

}
