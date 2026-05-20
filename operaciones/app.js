const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx_3nNwGflD8UJMEot-DxoX7HyRSUzLWoaezcxEGTDi275q37bIB-MqRb0g56iUN2-XZw/exec";

let movimientos = JSON.parse(localStorage.getItem("MOVIMIENTOS_PMT")) || [];

function guardarMovimiento(){

    const movimiento = {

        fecha: document.getElementById("fecha").value,

        hora: document.getElementById("hora").value,

        nombre: document.getElementById("nombre").value,

        grupo: document.getElementById("grupo").value,

        movimiento: document.getElementById("movimiento").value,

        estado: document.getElementById("estado").value,

        responsable: document.getElementById("responsable").value,

        encargado: document.getElementById("encargado").value,

        observacion: document.getElementById("observacion").value

    };

    movimientos.push(movimiento);

    localStorage.setItem(
        "MOVIMIENTOS_PMT",
        JSON.stringify(movimientos)
    );

    enviarGoogleSheets(movimiento);

    renderHistorial();

    limpiarFormulario();

    alert("Movimiento guardado correctamente");

}

function enviarGoogleSheets(datos){

    fetch(SCRIPT_URL,{

        method:"POST",

        mode:"no-cors",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify(datos)

    })
    .then(()=>{
        console.log("Datos enviados");
    })
    .catch(error=>{
        console.error(error);
    });

}

function renderHistorial(){

    const historial = document.getElementById("historial");

    const vacio = document.getElementById("vacio");

    historial.innerHTML = "";

    if(movimientos.length === 0){

        vacio.style.display = "block";

        return;

    }

    vacio.style.display = "none";

    movimientos.slice().reverse().forEach(m=>{

        historial.innerHTML += `

        <div class="card-registro">

            <div class="fila">
            <span class="lbl">Fecha:</span>
            <span class="val">${m.fecha}</span>
            </div>

            <div class="fila">
            <span class="lbl">Hora:</span>
            <span class="val">${m.hora}</span>
            </div>

            <div class="fila">
            <span class="lbl">Nombre:</span>
            <span class="val">${m.nombre}</span>
            </div>

            <div class="fila">
            <span class="lbl">Grupo:</span>
            <span class="val">${m.grupo}</span>
            </div>

            <div class="fila">
            <span class="lbl">Movimiento:</span>
            <span class="val">${m.movimiento}</span>
            </div>

            <div class="fila">
            <span class="lbl">Estado:</span>
            <span class="val">${m.estado}</span>
            </div>

            <div class="fila">
            <span class="lbl">Responsable:</span>
            <span class="val">${m.responsable}</span>
            </div>

            <div class="fila">
            <span class="lbl">Encargado:</span>
            <span class="val">${m.encargado}</span>
            </div>

            <div class="fila">
            <span class="lbl">Observación:</span>
            <span class="val">${m.observacion}</span>
            </div>

        </div>

        `;

    });

}

function limpiarFormulario(){

    document.getElementById("nombre").value = "";

    document.getElementById("responsable").value = "";

    document.getElementById("encargado").value = "";

    document.getElementById("observacion").value = "";

}

function borrarHistorial(){

    if(confirm("¿Deseas borrar el historial?")){

        localStorage.removeItem("MOVIMIENTOS_PMT");

        movimientos = [];

        renderHistorial();

    }

}

function exportarWord(){

    const {Document,Packer,Paragraph} = window.docx;

    const doc = new Document({

        sections:[{

            children:movimientos.map(m=>

                new Paragraph(

                    `${m.fecha} ${m.hora} - ${m.nombre} - ${m.movimiento} - ${m.observacion}`

                )

            )

        }]

    });

    Packer.toBlob(doc).then(blob=>{

        saveAs(blob,"MOVIMIENTOS_OPERATIVOS.docx");

    });

}

renderHistorial();
