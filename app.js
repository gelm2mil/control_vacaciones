// ========================================
// VARIABLES GLOBALES
// ========================================

let agentes = [];

// ========================================
// RELOJ GELM
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

    const fecha = ahora.toLocaleDateString(
        'es-GT',
        opciones
    );

    document.getElementById("clock").innerHTML = fecha;

}

setInterval(actualizarFechaHora, 1000);

actualizarFechaHora();

// ========================================
// CARGAR EXCEL
// ========================================

async function cargarExcel() {

    try {

        const response = await fetch(
            "VACACIONES 2026.xlsx"
        );

        const data = await response.arrayBuffer();

        const workbook = XLSX.read(
            data,
            {
                type: "array"
            }
        );

        const hoja =
        workbook.Sheets[
            workbook.SheetNames[0]
        ];

        const json =
        XLSX.utils.sheet_to_json(
            hoja,
            {
                defval: ""
            }
        );

        console.log(json);

        procesarDatos(json);

    }

    catch(error) {

        console.error(
            "Error cargando Excel:",
            error
        );

    }

}

// ========================================
// PROCESAR DATOS
// ========================================

function procesarDatos(datosExcel) {

    agentes = [];

    datosExcel.forEach(fila => {

        const nombre =
        fila["NOMBRE DE AGENTE"];

        const cargo =
        fila["CARGO"];

        const ingreso =
        fila["AÑO DE INGRESO"];

        const inicia =
        fila["INICIA"];

        // VALIDAR REGISTRO

        if(
            nombre &&
            cargo &&
            inicia
        ) {

            const anios =
            calcularAnios(
                ingreso
            );

            const dias =
            anios >= 5
            ? 25
            : 20;

            const regreso =
            calcularFechaRegreso(
                inicia,
                dias
            );

            const estado =
            calcularEstado(
                inicia,
                regreso
            );

            agentes.push({

                nombre,
                cargo,
                ingreso,
                inicia,
                dias,
                regreso,
                estado

            });

        }

    });

    renderTabla(agentes);

    actualizarDashboard();

}

// ========================================
// CALCULAR AÑOS
// ========================================

function calcularAnios(fechaIngreso) {

    if(!fechaIngreso) return 0;

    const hoy = new Date();

    const ingreso =
    new Date(fechaIngreso);

    let anios =
    hoy.getFullYear()
    -
    ingreso.getFullYear();

    return anios;

}

// ========================================
// CALCULAR REGRESO
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

        // NO SABADO NI DOMINGO

        if(
            dia !== 0 &&
            dia !== 6
        ) {

            contador++;

        }

    }

    return fecha.toLocaleDateString(
        'es-GT'
    );

}

// ========================================
// ESTADO
// ========================================

function calcularEstado(
    inicio,
    regreso
) {

    const hoy =
    new Date();

    const fechaInicio =
    new Date(inicio);

    const fechaRegreso =
    new Date(regreso);

    // VACACIONES

    if(
        hoy >= fechaInicio &&
        hoy <= fechaRegreso
    ) {

        return "VACACIONES";

    }

    // PROXIMO

    const diferencia =
    fechaInicio - hoy;

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
// RENDER TABLA
// ========================================

function renderTabla(datos) {

    const tbody =
    document.getElementById(
        "tableBody"
    );

    tbody.innerHTML = "";

    datos.forEach(agente => {

        let claseEstado = "";

        if(
            agente.estado ===
            "SERVICIO"
        ) {

            claseEstado =
            "servicio";

        }

        if(
            agente.estado ===
            "VACACIONES"
        ) {

            claseEstado =
            "vacaciones";

        }

        if(
            agente.estado ===
            "PROXIMO"
        ) {

            claseEstado =
            "proximo";

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
                ${agente.inicia}
            </td>

            <td>
                ${agente.regreso}
            </td>

            <td>
                ${agente.dias}
            </td>

            <td>

                <span class="
                estado
                ${claseEstado}
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

    const filtrados =
    agentes.filter(agente =>

        agente.nombre
        .toLowerCase()
        .includes(texto)

        ||

        agente.cargo
        .toLowerCase()
        .includes(texto)

    );

    renderTabla(filtrados);

}

// ========================================
// INICIAR SISTEMA
// ========================================

cargarExcel();
