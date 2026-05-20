// =====================================================
// OPERACIONES PMT — GELM
// VERSION OPERATIVA 2026
// =====================================================

// =====================================================
// BASE LOCAL
// =====================================================

const DB_NAME = "PMT_OPERACIONES_DB";
const STORE_NAME = "MOVIMIENTOS";

let db;
let movimientos = [];

// =====================================================
// GOOGLE SHEETS
// =====================================================

const GOOGLE_SCRIPT_URL = "PEGAR_APPS_SCRIPT_AQUI";

// =====================================================
// ATAJOS
// =====================================================

const $ = id => document.getElementById(id);

// =====================================================
// ABRIR BASE
// =====================================================

function abrirDB(){

    return new Promise((resolve,reject)=>{

        const request = indexedDB.open(DB_NAME,1);

        request.onupgradeneeded = e=>{

            db = e.target.result;

            if(!db.objectStoreNames.contains(STORE_NAME)){

                db.createObjectStore(
                    STORE_NAME,
                    {
                        keyPath:"id",
                        autoIncrement:true
                    }
                );

            }

        };

        request.onsuccess = e=>{

            db = e.target.result;
            resolve();

        };

        request.onerror = e=>reject(e);

    });

}

// =====================================================
// FECHA AUTOMATICA
// =====================================================

function fechaActual(){

    const hoy = new Date();

    return hoy.toISOString().split("T")[0];

}

function horaActual(){

    const hoy = new Date();

    return hoy.toTimeString().slice(0,5);

}

// =====================================================
// INICIAR
// =====================================================

window.onload = async()=>{

    $("fecha").value = fechaActual();

    $("hora").value = horaActual();

    await abrirDB();

    renderHistorial();

};

// =====================================================
// GUARDAR MOVIMIENTO
// =====================================================

async function guardarMovimiento(){

    if(!$("nombre").value){

        alert("Debe ingresar nombre");
        return;

    }

    const registro = {

        fecha:$("fecha").value,
        hora:$("hora").value,
        nombre:$("nombre").value,
        grupo:$("grupo").value,
        movimiento:$("movimiento").value,
        estado:$("estado").value,
        responsable:$("responsable").value,
        encargado:$("encargado").value,
        observacion:$("observacion").value,

        creado:new Date().toLocaleString("es-GT"),

        timestamp:new Date().toISOString()

    };

    const tx = db.transaction(STORE_NAME,"readwrite");

    const store = tx.objectStore(STORE_NAME);

    store.add(registro);

    tx.oncomplete = ()=>{

        enviarGoogleSheets(registro);

        limpiarFormulario();

        renderHistorial();

        alert("Movimiento guardado correctamente");

    };

}

// =====================================================
// ENVIAR A GOOGLE SHEETS
// =====================================================

function enviarGoogleSheets(data){

    if(
        GOOGLE_SCRIPT_URL ===
        "PEGAR_APPS_SCRIPT_AQUI"
    ) return;

    const form = new URLSearchParams();

    for(const key in data){

        form.append(key,data[key]);

    }

    fetch(
        GOOGLE_SCRIPT_URL,
        {
            method:"POST",
            mode:"no-cors",
            body:form
        }
    ).catch(()=>{

        console.log(
            "No se pudo enviar a Google"
        );

    });

}

// =====================================================
// LIMPIAR
// =====================================================

function limpiarFormulario(){

    $("nombre").value = "";

    $("responsable").value = "";

    $("encargado").value = "";

    $("observacion").value = "";

    $("hora").value = horaActual();

}

// =====================================================
// RENDER HISTORIAL
// =====================================================

async function renderHistorial(){

    const tx = db.transaction(
        STORE_NAME,
        "readonly"
    );

    const store = tx.objectStore(STORE_NAME);

    const request = store.getAll();

    request.onsuccess = ()=>{

        movimientos = request.result || [];

        movimientos.sort((a,b)=>
            new Date(b.timestamp)
            -
            new Date(a.timestamp)
        );

        const historial =
        $("historial");

        historial.innerHTML = "";

        $("vacio").style.display =
        movimientos.length
        ?
        "none"
        :
        "block";

        let fechaActualRender = "";

        movimientos.forEach(m=>{

            if(m.fecha !== fechaActualRender){

                fechaActualRender = m.fecha;

                historial.innerHTML += `

                <div class="dia-header">

                    📅 ${m.fecha}

                </div>

                `;

            }

            historial.innerHTML += `

            <div class="card-registro">

                <div class="fila">
                    <span class="lbl">
                    Hora:
                    </span>

                    <span class="val">
                    ${m.hora}
                    </span>
                </div>

                <div class="fila">
                    <span class="lbl">
                    Nombre:
                    </span>

                    <span class="val">
                    ${m.nombre}
                    </span>
                </div>

                <div class="fila">
                    <span class="lbl">
                    Movimiento:
                    </span>

                    <span class="val">
                    ${m.movimiento}
                    </span>
                </div>

                <div class="fila">
                    <span class="lbl">
                    Estado:
                    </span>

                    <span class="val">
                    ${m.estado}
                    </span>
                </div>

                <div class="fila">
                    <span class="lbl">
                    Observación:
                    </span>

                    <span class="val">
                    ${m.observacion}
                    </span>
                </div>

                <div class="fila">
                    <span class="lbl">
                    Responsable:
                    </span>

                    <span class="val">
                    ${m.responsable}
                    </span>
                </div>

            </div>

            `;

        });

    };

}

// =====================================================
// BORRAR HISTORIAL
// =====================================================

function borrarHistorial(){

    if(
        !confirm(
            "¿Borrar historial completo?"
        )
    ) return;

    const tx = db.transaction(
        STORE_NAME,
        "readwrite"
    );

    tx.objectStore(STORE_NAME)
    .clear();

    tx.oncomplete = ()=>{

        renderHistorial();

    };

}

// =====================================================
// EXPORTAR WORD
// =====================================================

async function exportarWord(){

    const {
        Document,
        Packer,
        Paragraph
    } = window.docx;

    const contenido = movimientos.map(m=>

        new Paragraph(

`${m.fecha} ${m.hora} | ${m.nombre} | ${m.movimiento} | ${m.estado} | ${m.observacion}`

        )

    );

    const doc = new Document({

        sections:[{

            children:contenido

        }]

    });

    const blob =
    await Packer.toBlob(doc);

    saveAs(
        blob,
        "OPERACIONES_PMT.docx"
    );

}