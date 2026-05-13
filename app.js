const EXCEL_FILE = "personal_pmt.xlsx";

let personal = [];

async function cargarExcel() {

    try {

        const response = await fetch(EXCEL_FILE);

        const arrayBuffer = await response.arrayBuffer();

        const workbook = XLSX.read(arrayBuffer, {
            type: "array"
        });

        const hoja = workbook.Sheets["PERSONAL_MAESTRO"];

        personal = XLSX.utils.sheet_to_json(hoja);

        mostrarDatos(personal);

        actualizarResumen(personal);

        console.log("Excel cargado correctamente");

    } catch (error) {

        console.error("Error cargando Excel:", error);

    }

}

function mostrarDatos(datos) {

    const tabla = document.querySelector("tbody");

    tabla.innerHTML = "";

    datos.forEach(persona => {

        let colorEstado = "lime";

        if (persona.ESTADO === "VACACIONES") {
            colorEstado = "red";
        }

        if (persona.ESTADO === "IGSS") {
            colorEstado = "orange";
        }

        if (persona.ESTADO === "PERMISO") {
            colorEstado = "cyan";
        }

        tabla.innerHTML += `
            <tr>

                <td>${persona.NOMBRE}</td>

                <td>${persona.CARGO}</td>

                <td>${persona.GRUPO}</td>

                <td>${persona.TURNO}</td>

                <td>

                    <span style="
                        background:${colorEstado};
                        color:white;
                        padding:8px 15px;
                        border-radius:20px;
                        font-weight:bold;
                    ">
                        ${persona.ESTADO}
                    </span>

                </td>

            </tr>
        `;
    });

}

function actualizarResumen(datos) {

    const total = datos.length;

    const activos = datos.filter(p => p.ESTADO === "ACTIVO").length;

    const vacaciones = datos.filter(p => p.ESTADO === "VACACIONES").length;

    const igss = datos.filter(p => p.ESTADO === "IGSS").length;

    document.getElementById("totalAgentes").textContent = total;

    document.getElementById("enServicio").textContent = activos;

    document.getElementById("deVacaciones").textContent = vacaciones;

    document.getElementById("proximos").textContent = igss;

}

function buscarPersonal() {

    const texto = document
        .getElementById("busqueda")
        .value
        .toLowerCase();

    const filtrados = personal.filter(p =>

        p.NOMBRE.toLowerCase().includes(texto) ||

        p.CARGO.toLowerCase().includes(texto) ||

        p.ESTADO.toLowerCase().includes(texto)

    );

    mostrarDatos(filtrados);

}

document.addEventListener("DOMContentLoaded", () => {

    cargarExcel();

    document
        .getElementById("buscarBtn")
        .addEventListener("click", buscarPersonal);

});
