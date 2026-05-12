// ========================================
// VARIABLES
// ========================================

let agentes = [];

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
        XLSX.read(data, {
            type: "array"
        });

        const hoja =
        workbook.Sheets[
            workbook.SheetNames[0]
        ];

        // LEER COMO MATRIZ

        const filas =
        XLSX.utils.sheet_to_json(
            hoja,
            {
                header: 1
            }
        );

        console.log(filas);

        procesarFilas(filas);

    }

    catch(error) {

        console.error(
            "ERROR EXCEL:",
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

        // VALIDAR FILA

        if(
            fila.length >= 6
        ) {

            const nombre =
            fila[1];

            const cargo =
            fila[2];

            const ingreso =
            fila[3];

            const inicia =
            fila[5];

            // VALIDAR NOMBRE

            if(
                nombre &&
                cargo &&
                inicia &&
                nombre !== "NOMBRE DE AGENTE"
            ) {

                const dias =
                calcularDias(
                    ingreso
                );

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

        }

    });

    console.log(agentes);

    renderTabla(agentes);

    actualizarDashboard();

}

// ========================================
// CALCULAR DIAS
// ========================================

function calcularDias(ingreso) {

    if(!ingreso) return 20;

    const hoy =
    new Date();

    const fechaIngreso =
    new Date(ingreso);

    const anios =
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

        // NO SABADOS NI DOMINGOS

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

    // PROXIMOS

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

            <td>${agente.nombre}</td>

            <td>${agente.cargo}</td>

            <td>${agente.inicia}</td>

            <td>${agente.regreso}</td>

            <td>${agente.dias}</td>

            <td>

                <span class="estado ${clase}">

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
// INICIAR
// ========================================

cargarExcel();
