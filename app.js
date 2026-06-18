const CSV_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vTsxA_1DCqrTBHMILm7bC3DRNTs5cLyJplztjRPvUyLLvJIvwbDSGrulY2CN9dcxQILbmTs_1yp5jAP/pub?gid=895287596&single=true&output=csv";

let personal = [];

window.addEventListener("DOMContentLoaded", () => {

```
cargarDatos();

document
    .getElementById("busqueda")
    .addEventListener("input", buscar);
```

});

async function cargarDatos(){

```
try{

    const respuesta = await fetch(CSV_URL);

    const csv = await respuesta.text();

    Papa.parse(csv,{

        header:true,
        skipEmptyLines:true,

        complete:function(resultado){

            personal = resultado.data;

            actualizarResumen();

            render(personal);

        }

    });

}catch(error){

    console.error(error);

}
```

}

function esMando(cargo){

```
cargo = String(cargo || "").toUpperCase();

return (
    cargo.includes("DIRECTOR") ||
    cargo.includes("SUB-DIRECTOR") ||
    cargo.includes("ENCARGADO") ||
    cargo.includes("SECRETARIO") ||
    cargo.includes("TRANSPORTES") ||
    cargo.includes("VIA PUBLICA")
);
```

}

function actualizarResumen(){

```
let vacaciones = 0;
let ingresos = 0;
let activos = 0;
let mandosActivos = 0;
let mandosVacaciones = 0;

personal.forEach(persona=>{

    const vac =
    String(persona.vacaciones || "").trim();

    const igss =
    String(persona.IGSS || "").trim();

    const ingreso =
    String(persona.ingresa || "").trim();

    const cargo =
    String(persona.CARGO || "");

    const mando =
    esMando(cargo);

    if(vac !== "")
        vacaciones++;

    if(ingreso !== "")
        ingresos++;

    if(vac === "" && igss === "")
        activos++;

    if(mando && vac === "" && igss === "")
        mandosActivos++;

    if(mando && vac !== "")
        mandosVacaciones++;

});

document.getElementById("totalVacaciones").textContent =
vacaciones;

document.getElementById("totalIngresos").textContent =
ingresos;

document.getElementById("totalActivos").textContent =
activos;

document.getElementById("totalMandosActivos").textContent =
mandosActivos;

document.getElementById("totalMandosVacaciones").textContent =
mandosVacaciones;
```

}

function render(lista){

```
const tabla =
document.getElementById("tabla");

tabla.innerHTML = "";

lista.forEach(persona=>{

    const vac =
    String(persona.vacaciones || "").trim();

    const igss =
    String(persona.IGSS || "").trim();

    const sale =
    String(persona.sale || "").trim();

    const ingresa =
    String(persona.ingresa || "").trim();

    const cargo =
    String(persona.CARGO || "");

    const mando =
    esMando(cargo);

    let claseFila = "";

    if(igss !== ""){

        claseFila = "igss-row";

    }else if(vac !== ""){

        if(mando){

            claseFila = "mando-vacaciones-row";

        }else{

            claseFila = "vacaciones-row";

        }

    }else if(mando){

        claseFila = "mando-row";

    }else{

        claseFila = "activo-row";

    }

    tabla.innerHTML += `

    <tr class="${claseFila}">

        <td>${persona.CHAPA || ""}</td>

        <td>${persona["PERSONAL PMT"] || ""}</td>

        <td>${cargo}</td>

        <td>
            ${vac}
        </td>

        <td>
            ${igss}
        </td>

        <td class="${sale ? "sale-cell" : ""}">
            ${sale}
        </td>

        <td class="${ingresa ? "ingresa-cell" : ""}">
            ${ingresa}
        </td>

    </tr>

    `;

});
```

}

function buscar(){

```
const texto =
document
.getElementById("busqueda")
.value
.toUpperCase();

const resultado =
personal.filter(persona =>

    String(persona.CHAPA || "")
    .toUpperCase()
    .includes(texto)

    ||

    String(persona["PERSONAL PMT"] || "")
    .toUpperCase()
    .includes(texto)

    ||

    String(persona.CARGO || "")
    .toUpperCase()
    .includes(texto)

);

render(resultado);
```

}
