/* ==========================================================
   PARTE 1: BASE DE DATOS COMPLETA DE CLIENTES RECURRENTES
   ========================================================== */
const baseDatosClientes = {
    "1": {
        nombre: "ABBEY S.A",
        nif: "A - 7859726",
        direccion: "C/ Lopez de Hoyos Nº 210 Madrid, C.P 28002",
        multilineas: false,
        servicio: "Mantenimiento y conservación de zonas ajardinadas y riego",
        importe: 174.60
    },
    "2": {
        nombre: "SERVICIOS INTEGRALES RUGE S.L",
        nif: "B - 84539626",
        direccion: "Avda. De la Albufera 302 Local Nº2",
        multilineas: true,
        encabezado: "Mantenimiento y conservación de zonas ajardinadas en las siguientes comunidades:",
        conceptos: [
            { desc: "C/ Rafael Fernandez Hijicos Nº 1 al 14", precio: 300.00 },
            { desc: "Avda. Buenos Aires nº91", precio: 140.84 },
            { desc: "C/ Angelillo nº2", precio: 160.00 },
            { desc: "C/ Angelillo nº4", precio: 160.00 },
            { desc: "C/ León Felipe nº6", precio: 255.97 },
            { desc: "C/ Roquetas Del Mar nº 7 - 9", precio: 201.00 },
            { desc: "C/ Santa cruz de retamar nº13", precio: 108.97 },
            { desc: "C/ Pablo neruda nº114", precio: 200.00 },
            { desc: "C. P Fuente de Piedra 12", precio: 110.00 },
            { desc: "C. P Fuente de Piedra 16", precio: 110.00 },
            { desc: "C. P FuenGirola 23", precio: 60.00 },
            { desc: "C. P Rafael Alberti 14", precio: 70.00 }
        ]
    },
    "3": {
        nombre: "ANDRES CAMINERO TAPIADOR",
        nif: "51901477 - E",
        direccion: "C/ Javier de Miguel, 33 puerta L",
        multilineas: false,
        servicio: "Servicios Varios de Jardinería",
        importe: 513.00
    },
    "4": {
        nombre: "COMUNIDAD ANGELILLO Nº 1",
        nif: "H 79813937",
        direccion: "Angelillo Nº 1",
        multilineas: false,
        servicio: "Mantenimiento y conservación de zonas ajardinadas y riego",
        importe: 170.00
    }
};
/* ==========================================================
   PARTE 2: CONTROLADOR INTERACTIVO Y FILAS DINÁMICAS
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const selector = document.getElementById("seleccionar-cliente");
    const contenedorConceptos = document.getElementById("contenedor-dinamico-conceptos");

    selector.addEventListener("change", (e) => {
        const idCliente = e.target.value;
        contenedorConceptos.innerHTML = "";

        if (!baseDatosClientes[idCliente]) {
            limpiarCampos();
            return;
        }

        const data = baseDatosClientes[idCliente];
        document.getElementById("cliente-nombre").value = data.nombre;
        document.getElementById("cliente-nif").value = data.nif;
        document.getElementById("cliente-dir").value = data.direccion;

        contenedorConceptos.innerHTML = `
            <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <label style="margin: 0; font-weight: 700;">Conceptos y Detalles a Facturar</label>
                <button type="button" id="btn-agregar-fila" style="background-color: #0A2F1D; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer;">➕ Añadir Línea Extra</button>
            </div>
            <div id="lista-filas-conceptos"></div>
        `;

        const listaFilas = document.getElementById("lista-filas-conceptos");

        if (data.multilineas) {
            // Creamos la caja del subtítulo para Ruge
            let htmlSub = `<div class="form-group"><label>Subtítulo de Factura</label><input type="text" id="subtitulo-complejo" class="form-control mb-3" value="${data.encabezado}"></div>`;
            contenedorConceptos.insertAdjacentHTML('afterbegin', htmlSub);
            
            data.conceptos.forEach(c => {
                crearFilaConcepto(listaFilas, c.desc, c.precio);
            });
        } else {
            crearFilaConcepto(listaFilas, data.servicio, data.importe);
        }

        document.getElementById("btn-agregar-fila").addEventListener("click", () => {
            crearFilaConcepto(listaFilas, "", 0.00);
        });
    });

    function crearFilaConcepto(contenedor, descripcion, precio) {
        const div = document.createElement("div");
        div.style.display = "grid";
        div.style.gridTemplateColumns = "4fr 1.5fr auto";
        div.style.gap = "15px";
        div.style.marginBottom = "10px";
        div.className = "bloque-linea-dinamica";

        div.innerHTML = `
            <input type="text" class="form-control txt-desc" value="${descripcion}" placeholder="Escribe el concepto...">
            <input type="number" class="form-control txt-precio" value="${parseFloat(precio).toFixed(2)}" step="0.01" placeholder="0.00">
            <button type="button" class="btn-eliminar-fila" style="background-color: #dc3545; color: white; border: none; padding: 0 12px; border-radius: 4px; font-size: 16px; cursor: pointer;">🗑</button>
        `;

        div.querySelector(".btn-eliminar-fila").addEventListener("click", () => {
            div.remove();
        });

        contenedor.appendChild(div);
    }

    function limpiarCampos() {
        document.getElementById("cliente-nombre").value = "";
        document.getElementById("cliente-nif").value = "";
        document.getElementById("cliente-dir").value = "";
    }
});
/* ==========================================================
   PARTE 3: MOTOR DE RECOPILACIÓN Y CÁLCULO MATEMÁTICO
   ========================================================== */
function generarDocumentoPDF() {
    const tipoDoc = document.getElementById("tipo-doc").value.toUpperCase();
    const numDoc = document.getElementById("num-doc").value;
    const fechaInput = document.getElementById("doc-fecha").value;
    const fecha = fechaInput ? fechaInput.split("-").reverse().join("/") : "";
    const nombre = document.getElementById("cliente-nombre").value;
    const nif = document.getElementById("cliente-nif").value;
    const dir = document.getElementById("cliente-dir").value;
    
    const formaPago = document.getElementById("forma-pago-select").value;
    const ibanCuenta = document.getElementById("cuenta-iban").value;

    if (!nombre) {
        alert("Por favor, selecciona o rellena un cliente primero.");
        return;
    }

    let filasHtml = "";
    let baseImponible = 0;
    const bloquesDesc = document.querySelectorAll(".txt-desc");
    const bloquesPrecio = document.querySelectorAll(".txt-precio");

    // Inyectar la frase de subtítulo de Ruge si está presente en el panel
    const esComplejo = document.getElementById("subtitulo-complejo");
    if (esComplejo && esComplejo.value.trim() !== "") {
        filasHtml += `
            <tr>
                <td colspan="4" style="text-align:left; font-size:12px; padding:5px 8px; font-weight:600; color:#1c281f; background-color:#fcfcfc; border-bottom:1px solid #ced4da;">
                    ${esComplejo.value}
                </td>
            </tr>`;
    }

    // Procesar fila por fila recolectando descripciones y precios
    bloquesDesc.forEach((descElement, index) => {
        const desc = descElement.value;
        const precio = parseFloat(bloquesPrecio[index].value) || 0;
        const cant = 1;
        const totalFila = precio * cant;

        if (desc.trim() !== "") {
            baseImponible += totalFila;
            filasHtml += `
                <tr>
                    <td style="text-align:left; padding:4px 8px; border:1px solid #ced4da;">${desc}</td>
                    <td style="text-align:right; padding:4px 8px; border:1px solid #ced4da;">${precio.toFixed(2)} €</td>
                    <td style="text-align:center; padding:4px 8px; border:1px solid #ced4da;">${cant}</td>
                    <td style="text-align:right; padding:4px 8px; border:1px solid #ced4da; font-weight:600;">${totalFila.toFixed(2)} €</td>
                </tr>`;
        }
    });

    const calculaIva = tipoDoc === "FACTURA" ? baseImponible * 0.21 : 0;
    const totalFinal = baseImponible + calculaIva;
/* ==========================================================
   PARTE 4: MAQUETACIÓN VISUAL PREMIUM CON LOGO AGRANDADO
   ========================================================== */
    const ventanaImpresion = window.open("", "_blank");
    ventanaImpresion.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>${tipoDoc} ${numDoc} - ${nombre}</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Segoe UI', Arial, sans-serif; color: #1c281f; padding: 0; background-color: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                
                /* Forzado estricto de una página A4 con 12 conceptos */
                .a4-page { width: 100%; max-width: 800px; height: 1030px; margin: 0 auto; padding: 25px 40px; display: flex; flex-direction: column; justify-content: space-between; }
                
                /* Encabezado Oficial Armijos con bloque diagonal */
                .header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px; }
                .emisor-datos { width: 60%; line-height: 1.4; font-size: 12.5px; color: #2c3e2f; }
                .emisor-datos h2 { color: #0A2F1D; font-size: 21px; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 3px; }
                
                .diagonal-badge { width: 38%; background: linear-gradient(135deg, #198754 0%, #0A2F1D 100%); color: white; text-align: right; padding: 12px 20px; clip-path: polygon(18% 0%, 100% 0%, 100% 100%, 0% 100%); border-radius: 4px; display: flex; flex-direction: column; justify-content: center; }
                .diagonal-badge h1 { font-size: 20px; font-weight: 900; text-transform: uppercase; margin-bottom: 1px; }
                .diagonal-badge .number-display { font-size: 30px; font-weight: 900; line-height: 1; }

                .date-row { text-align: right; font-size: 13.5px; font-weight: 700; color: #0A2F1D; margin-bottom: 12px; padding-right: 5px; }

                /* Cuadro del Cliente */
                .client-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #ced4da; }
                .client-table td { padding: 6px 10px; font-size: 13px; border: 1px solid #ced4da; }
                .client-table td.label-bold { font-weight: 700; color: #0A2F1D; width: 15%; background-color: #f8f9fa; }

                /* Rejilla de Conceptos */
                .concepts-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                .concepts-table th { background-color: #0A2F1D; color: #ffffff; font-size: 11.5px; font-weight: 700; text-transform: uppercase; padding: 6px 8px; border: 1px solid #0A2F1D; letter-spacing: 0.5px; }
                .concepts-table td { font-size: 12px; }
                
                /* Bloque de Totales alineados y Forma de pago a la izquierda */
                .footer-calc-block { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
                .payment-info-box { width: 50%; font-size: 12.5px; line-height: 1.4; padding-top: 5px; }
                .payment-info-box strong { color: #0A2F1D; display: block; margin-bottom: 3px; }
                
                .totals-table { width: 45%; border-collapse: collapse; border: 1px solid #ced4da; }
                .totals-table td { padding: 6px 12px; font-size: 12.5px; border: 1px solid #ced4da; }
                .totals-table td.label-total { font-weight: 700; background-color: #f8f9fa; width: 50%; color: #0A2F1D; }
                .grand-total-row { background-color: #0A2F1D; color: white; font-weight: bold; }
                .grand-total-row td { font-size: 14.5px; border-color: #0A2F1D; padding: 8px 12px; }

                /* Cuadros de Firma independientes */
                .signatures-table { width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 15px; }
                .signatures-table th { background-color: #0A2F1D; color: white; font-size: 11.5px; font-weight: bold; padding: 6px; text-transform: uppercase; width: 50%; border: 1px solid #0A2F1D; }
                .signatures-table td { height: 55px; border: 1px solid #ced4da; background-color: #fff; }

                /* Pie Legal y Alineación Limpia del Logo sin Recuadro */
                .legal-footer-area { border-top: 1px solid #dee2e6; padding-top: 10px; font-size: 11px; color: #495057; line-height: 1.4; }
                .brand-alignment { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding: 0 5px; }
                
                /* Logo considerable y visible con su color verde original */
                .brand-alignment .logo-img { height: 95px; object-fit: contain; max-width: 200px; }
                .brand-alignment .garantia-text { color: #0A2F1D; font-weight: 700; font-size: 13.5px; letter-spacing: 0.5px; }
            </style>
        </head>
        <body>
            <div class="a4-page">
                <!-- Zona Alta -->
                <div>
                    <div class="header-container">
                        <div class="emisor-datos">
                            <h2>JARDINERÍA Y MANTENIMIENTO</h2>
                            <p><strong>Enrique Armijos Robles</strong> con DNI 51705943B</p>
                            <p>enrique-77@hotmail.es | 680 442 376</p>
                            <p>C/ Camino de Valderribas 96, Madrid, C.P 28038</p>
                        </div>
                        <div class="diagonal-badge">
                            <h1>${tipoDoc}</h1>
                            <div class="number-display">${numDoc}</div>
                        </div>
                    </div>

                    <div class="date-row">Fecha: ${fecha}</div>

                    <!-- Cuadro Cliente -->
                    <table class="client-table">
                        <tr><td class="label-bold">Cliente:</td><td>${nombre}</td></tr>
                        <tr><td class="label-bold">C.I.F :</td><td>${nif}</td></tr>
                        <tr><td class="label-bold">Dirección:</td><td>${dir}</td></tr>
                    </table>

                    <!-- Tabla Conceptos -->
                    <table class="concepts-table">
                        <thead>
                            <tr>
                                <th style="text-align:left; padding-left:8px; width:55%;">DESCRIPCIÒN</th>
                                <th style="text-align:right; width:15%;">IMPORTE</th>
                                <th style="width:12%;">CANTIDAD</th>
                                <th style="text-align:right; width:18%;">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filasHtml}
                        </tbody>
                    </table>
                </div>

                <!-- Zona Baja -->
                <div>
                    <div class="footer-calc-block">
                        <div class="payment-info-box">
                            <strong>FORMA DE PAGO:</strong>
                            <p style="font-size:13px; margin-bottom:4px; color:#212529;">${formaPago.toUpperCase()}</p>
                            ${formaPago === 'Transferencia' ? `
                                <p style="font-family:monospace; font-size:11.5px; background-color:#f8f9fa; padding:4px 8px; border-radius:4px; border:1px solid #e9ecef; display:inline-block; letter-spacing:0.5px;">
                                    ${ibanCuenta}
                                </p>
                            ` : ''}
                        </div>
                        <table class="totals-table">
                            <tr>
                                <td class="label-total">${tipoDoc === 'FACTURA' ? 'BASE IMPONIBLE' : 'TOTAL (Sin IVA)'}</td>
                                <td style="text-align:right; font-weight:700;">${baseImponible.toFixed(2)} €</td>
                            </tr>
                            ${tipoDoc === "FACTURA" ? `
                            <tr>
                                <td class="label-total">IVA 21 %</td>
                                <td style="text-align:right; font-weight:700;">${calculaIva.toFixed(2)} €</td>
                            </tr>` : ''}
                            <tr class="grand-total-row">
                                <td>TOTAL</td>
                                <td style="text-align:right;">${totalFinal.toFixed(2)} €</td>
                            </tr>
                        </table>
                    </div>

                    <table class="signatures-table">
                        <thead>
                            <tr>
                                <th>RESPONSABLE</th>
                                <th>CLIENTE</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Pie Legal Dinámico Informativo -->
                    <footer class="legal-footer-area">
                        <p><strong>Términos y condiciones:</strong> ${tipoDoc === 'FACTURA' ? 'Si tiene alguna pregunta acerca de esta factura, póngase en contacto con Enrique Armijos Robles al 680442376.' : 'Este presupuesto es puramente informativo, refleja precios netos sin IVA y cuenta con una validez de 30 días naturales desde su fecha de emisión.'}</p>
                        <div class="brand-alignment">
                            <img src="LOGO_Transparente.png" alt="Armijos Logo" class="logo-img">

`);
ventanaImpresion.document.close();
ventanaImpresion.focus();
ventanaImpresion.print();
}
/* ==========================================================
   CONEXIÓN EN CALIENTE DEL TABLÓN DE ANUNCIOS INTERACTIVO
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
    // Buscamos exhaustivamente el botón de publicar por su texto nativo de la pantalla
    const botones = document.querySelectorAll("button");
    let btnPublicar = null;
    
    botones.forEach(btn => {
        if (btn.textContent.includes("Publicar en Web Clientes")) {
            btnPublicar = btn;
        }
    });

    // Buscamos el cuadro de texto donde escribes el mensaje
    const campoTexto = document.querySelector("textarea") || document.getElementById("texto-nuevo-aviso");

    if (btnPublicar) {
        btnPublicar.addEventListener("click", (e) => {
            // Evitamos cualquier conflicto o recarga de la página
            e.preventDefault(); 
            
            if (!campoTexto) {
                alert("Error: No se ha encontrado el cuadro de texto del aviso.");
                return;
            }

            const mensajeAviso = campoTexto.value.trim();

            if (mensajeAviso === "") {
                alert("Por favor, escribe el texto del aviso antes de publicar.");
                return;
            }

            // Guardamos de forma estricta el mensaje en la memoria compartida del sistema
            localStorage.setItem("aviso_armijos_guardado", mensajeAviso);

            alert("🚀 ¡Aviso enviado con éxito! Los vecinos verán el nuevo comunicado en la barra superior al abrir la web.");
        });
    }
});

