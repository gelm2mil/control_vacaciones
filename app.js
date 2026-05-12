// ========================================
// SISTEMA CONTROL VACACIONES PMT
// VERSION FUNCIONAL COMPLETA
// ========================================

// ========================================
// VARIABLES
// ========================================

let agentes = [];

// ========================================
// FERIADOS GUATEMALA + CHIMALTENANGO
// ========================================

const feriados = [

    "2026-01-01",
    "2026-01-02",
    "2026-01-03",

    "2026-05-01",

    "2026-07-26",

    "2026-09-15",

    "2026-10-20",

    "2026-11-01",

    "2026-12-25"

];

// ========================================
// RELOJ
// ========================================

function actualizarFechaHora() {

    const ahora = new Date();

    const opciones = {

        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'

    };

    document.getElementById("clock").innerHTML =
    ahora.toLocaleDateString(
        'es-GT',
        opciones
    );

}

setInterval(actualizarFechaHora, 1000);

actualizarFechaHora();

// ========================================
// CONVERTIR FECHA EXCEL
// ========================================

function excelFechaAJS(numeroExcel) {

    const fecha =
    new Date(
        (numeroExcel - 25569)
        * 86400
        * 1000
    );

    return fecha;

}

// ========================================
// FORMATEAR FECHA
// ========================================

function formatearFecha(fecha) {

    return fecha.toLocaleDateString(
        'es-GT'
    );

}

// ========================================
// VALIDAR FERIADO
// ========================================

function esFeriado(fecha) {

    const yyyy =
    fecha.getFullYear();

    const mm =
    String(
        fecha.getMonth() + 1
    ).padStart(2, '0');

    const dd =
    String(
        fecha.getDate()
    ).padStart(2, '0');

    const formato =
    `${yyyy}-${mm}-${dd}`;

    return feriados.includes(formato);

}

// ========================================
// CARGAR EXCEL
// ========================================

async function cargarExcel() {

    try {

        const response =
        await fetch(
            "VACACIONES 2026.xlsx"
        );

        const data =
        await response.arrayBuffer();

        const workbook =
        XLSX.read(
            data,
            {
                type: "array"
            }
        );

        const hoja =
        workbook.Sheets[
            workbook.SheetNames[0]
        ];

        const filas =
        XLSX.utils.sheet_to_json(
            hoja,
            {
                header: 1
            }
        );

        procesarFilas(filas);

    }

    catch(error) {

        console.error(
            "ERROR:",
            error
        );

    }

}

// ========================================
// PROCESAR FILAS
// ========================================

function procesarFilas(filas) {

    agentes = [];

    filas.forEach(fila => {

        if(
            fila.length >= 6
        ) {

            const nombre =
            fila[1];

            const cargo =
            fila[2];

            const ingresoExcel =
            fila[3];

            const inicioExcel =
            fila[5];

            if(

                nombre &&
                cargo &&
                inicioExcel &&
                nombre !== "NOMBRE DE AGENTE"

            ) {

                const ingreso =
                excelFechaAJS(
                    ingresoExcel
                );

                const inicio =
                excelFechaAJS(
                    inicioExcel
                );

                const dias =
                calcularDiasVacaciones(
                    ingreso
                );

                const regreso =
                calcularFechaRegreso(
                    inicio,
                    dias
                );

                const estado =
                calcularEstado(
                    inicio,
                    regreso
                );

                agentes.push({

                    nombre,
                    cargo,
                    ingreso,
                    inicio,
                    dias,
                    regreso,
                    estado

                });

            }

        }

    });

    renderTabla(agentes);

    actualizarDashboard();

}

// ========================================
// CALCULAR DIAS
// ========================================

function calcularDiasVacaciones(
    fechaIngreso
) {

    const hoy =
    new Date();

    let anios =

    hoy.getFullYear()
    -
    fechaIngreso.getFullYear();

    return anios >= 5
    ? 25
    : 20;

}

// ========================================
// FECHA REGRESO
// ========================================

function calcularFechaRegreso(
    fechaInicio,
    diasHabiles
) {

    let fecha =
    new Date(fechaInicio);

    let contador = 0;

    while(
        contador < diasHabiles
    ) {

        fecha.setDate(
            fecha.getDate() + 1
        );

        const dia =
        fecha.getDay();

        // DOMINGO = 0
        // SABADO = 6

        if(

            dia !== 0 &&
            dia !== 6 &&
            !esFeriado(fecha)

        ) {

            contador++;

        }

    }

    return fecha;

}

// ========================================
// CALCULAR ESTADO
// ========================================

function calcularEstado(
    inicio,
    regreso
) {

    const hoy =
    new Date();

    // QUITAR HORAS

    hoy.setHours(0,0,0,0);

    inicio.setHours(0,0,0,0);

    regreso.setHours(0,0,0,0);

    // VACACIONES

    if(
        hoy >= inicio &&
        hoy <= regreso
    ) {

        return "VACACIONES";

    }

    // PROXIMOS

    const diferencia =
    inicio - hoy;

    const dias =
    diferencia /
    (1000 * 60 * 60 * 24);

    if(
        dias <= 15 &&
        dias > 0
    ) {

        return "PROXIMO";

    }

    return "SERVICIO";

}

// ========================================
// TABLA
// ========================================

function renderTabla(datos) {

    const tbody =
    document.getElementById(
        "tableBody"
    );

    tbody.innerHTML = "";

    datos.forEach(agente => {

        let clase = "";

        if(
            agente.estado ===
            "SERVICIO"
        ) {

            clase = "servicio";

        }

        if(
            agente.estado ===
            "VACACIONES"
        ) {

            clase = "vacaciones";

        }

        if(
            agente.estado ===
            "PROXIMO"
        ) {

            clase = "proximo";

        }

        tbody.innerHTML += `

        <tr>

            <td>
                ${agente.nombre}
            </td>

            <td>
                ${agente.cargo}
            </td>

            <td>
                ${formatearFecha(
                    agente.inicio
                )}
            </td>

            <td>
                ${formatearFecha(
                    agente.regreso
                )}
            </td>

            <td>
                ${agente.dias}
            </td>

            <td>

                <span class="
                estado
                ${clase}
                ">

                    ${agente.estado}

                </span>

            </td>

        </tr>

        `;

    });

}

// ========================================
// DASHBOARD
// ========================================

function actualizarDashboard() {

    document.getElementById(
        "totalAgentes"
    ).innerHTML =
    agentes.length;

    document.getElementById(
        "enServicio"
    ).innerHTML =
    agentes.filter(

        a => a.estado ===
        "SERVICIO"

    ).length;

    document.getElementById(
        "deVacaciones"
    ).innerHTML =
    agentes.filter(

        a => a.estado ===
        "VACACIONES"

    ).length;

    document.getElementById(
        "proximos"
    ).innerHTML =
    agentes.filter(

        a => a.estado ===
        "PROXIMO"

    ).length;

}

// ========================================
// BUSCADOR
// ========================================

document.getElementById(
    "searchInput"
).addEventListener(
    "keyup",
    buscar
);

function buscar() {

    const texto =

    document.getElementById(
        "searchInput"
    )
    .value
    .toLowerCase();

    const resultado =

    agentes.filter(agente =>

        agente.nombre
        .toLowerCase()
        .includes(texto)

        ||

        agente.cargo
        .toLowerCase()
        .includes(texto)

    );

    renderTabla(resultado);

}

// ========================================
// INICIAR SISTEMA
// ========================================

cargarExcel();
