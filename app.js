const CSV_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vTsxA_1DCqrTBHMILm7bC3DRNTs5cLyJplztjRPvUyLLvJIvwbDSGrulY2CN9dcxQILbmTs_1yp5jAP/pub?gid=895287596&single=true&output=csv";

let personal = [];

window.addEventListener("DOMContentLoaded", () => {

    cargarDatos();

    const buscador = document.getElementById("busqueda");

    if (buscador) {
        buscador.addEventListener("input", buscar);
    }

});

function valor(persona, campo) {

    const llave = Object.keys(persona).find(k =>
        k.trim().toUpperCase() === campo.trim().toUpperCase()
    );

    return llave
        ? String(persona[llave] || "").trim()
        : "";

}

async function cargarDatos() {

    try {

        console.log("Cargando CSV...");

        const respuesta = await fetch(CSV_URL);

        if (!respuesta.ok) {
            throw new Error("No se pudo descargar el CSV");
        }

        const csv = await respuesta.text();

        console.log("CSV descargado");

        Papa.parse(csv, {

            header: true,
            skipEmptyLines: true,

            complete: function(resultado) {

                personal = resultado.data;

                console.log("Personal cargado:", personal.length);

                actualizarResumen();

                render(personal);

            },

            error: function(error) {

                console.error("Error PapaParse:", error);

            }

        });

    } catch (error) {

        console.error("Error cargando CSV:", error);

    }

}

function esMando(cargo) {

    cargo = String(cargo || "").toUpperCase();

    return (
        cargo.includes("DIRECTOR") ||
        cargo.includes("SUB-DIRECTOR") ||
        cargo.includes("ENCARGADO") ||
        cargo.includes("SECRETARIO") ||
        cargo.includes("TRANSPORTES") ||
        cargo.includes("VIA PUBLICA") ||
        cargo.includes("VÍA PUBLICA")
    );

}

function actualizarResumen() {

    let vacaciones = 0;
    let ingresos = 0;
    let activos = 0;
    let mandosActivos = 0;
    let mandosVacaciones = 0;
    let suspendidos = 0;

    personal.forEach(persona => {

        const vac = valor(persona, "vacaciones");
        const igss = valor(persona, "IGSS");
        const ingreso = valor(persona, "ingresa");
        const cargo = valor(persona, "CARGO");

        const mando = esMando(cargo);

        if (vac !== "") {
            vacaciones++;
        }

        if (ingreso !== "") {
            ingresos++;
        }

        if (igss !== "") {
            suspendidos++;
        }

        if (vac === "" && igss === "") {
            activos++;
        }

        if (mando && vac === "" && igss === "") {
            mandosActivos++;
        }

        if (mando && vac !== "") {
            mandosVacaciones++;
        }

    });

    const totalVacaciones =
        document.getElementById("totalVacaciones");

    const totalIngresos =
        document.getElementById("totalIngresos");

    const totalActivos =
        document.getElementById("totalActivos");

    const totalMandosActivos =
        document.getElementById("totalMandosActivos");

    const totalMandosVacaciones =
        document.getElementById("totalMandosVacaciones");

    const totalSuspendidos =
        document.getElementById("totalSuspendidos");

    if (totalVacaciones)
        totalVacaciones.textContent = vacaciones;

    if (totalIngresos)
        totalIngresos.textContent = ingresos;

    if (totalActivos)
        totalActivos.textContent = activos;

    if (totalMandosActivos)
        totalMandosActivos.textContent = mandosActivos;

    if (totalMandosVacaciones)
        totalMandosVacaciones.textContent = mandosVacaciones;

    if (totalSuspendidos)
        totalSuspendidos.textContent = suspendidos;

}

function render(lista) {

    const tabla = document.getElementById("tabla");

    if (!tabla) return;

    tabla.innerHTML = "";

    lista.forEach(persona => {

        const chapa = valor(persona, "CHAPA");
        const nombre = valor(persona, "PERSONAL PMT");
        const cargo = valor(persona, "CARGO");
        const vac = valor(persona, "vacaciones");
        const igss = valor(persona, "IGSS");
        const sale = valor(persona, "sale");
        const ingresa = valor(persona, "ingresa");

        const mando = esMando(cargo);

        let claseFila = "";

        if (igss !== "") {

            claseFila = "igss-row";

        } else if (vac !== "") {

            if (mando) {
                claseFila = "mando-vacaciones-row";
            } else {
                claseFila = "vacaciones-row";
            }

        } else if (mando) {

            claseFila = "mando-row";

        } else {

            claseFila = "activo-row";

        }

        const fila = `
<tr class="${claseFila}">
    <td>${chapa}</td>
    <td>${nombre}</td>
    <td>${cargo}</td>
    <td>${vac}</td>
    <td>${igss}</td>
    <td class="${sale ? "sale-cell" : ""}">
        ${sale}
    </td>
    <td class="${ingresa ? "ingresa-cell" : ""}">
        ${ingresa}
    </td>
</tr>
`;

        tabla.insertAdjacentHTML("beforeend", fila);

    });

}

function buscar() {

    const texto = document
        .getElementById("busqueda")
        .value
        .toUpperCase();

    const resultado = personal.filter(persona => {

        const chapa =
            valor(persona, "CHAPA").toUpperCase();

        const nombre =
            valor(persona, "PERSONAL PMT").toUpperCase();

        const cargo =
            valor(persona, "CARGO").toUpperCase();

        return (
            chapa.includes(texto) ||
            nombre.includes(texto) ||
            cargo.includes(texto)
        );

    });

    render(resultado);

}
