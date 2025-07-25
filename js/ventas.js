// Cargar datos desde localStorage
function loadData(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Error cargando datos de', key, error);
        return defaultValue;
    }
}

// Guardar datos en localStorage
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error guardando datos en', key, error);
        return false;
    }
}

// Generar ID único
function generateId() {
    return Date.now().toString();
}

// Cargar información de la tienda
function loadTiendaInfo() {
    return loadData('tienda_info', {
        nombre: 'Zevti APP',
        nit: '123456789',
        direccion: 'Calle Principal #123',
        telefono: '(555) 123-4567'
    });
}

// Guardar información de la tienda
function saveTiendaInfo(info) {
    saveData('tienda_info', info);
}

// Cargar configuración de IVA
function loadIVAConfig() {
    return loadData('iva_config', {
        porcentaje: 19, // 19% por defecto
        activo: true
    });
}

// Guardar configuración de IVA
function saveIVAConfig(config) {
    saveData('iva_config', config);
}

// Cargar clientes y productos para los selects
function loadSelects() {
    const clientes = loadData('clientes');
    const productos = loadData('productos');
    
    const clienteSelect = document.getElementById('cliente-select');
    const productoSelect = document.getElementById('producto-select');
    
    clienteSelect.innerHTML = '<option value="">Seleccionar cliente</option>';
    productoSelect.innerHTML = '<option value="">Seleccionar producto</option>';
    
    clientes.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = cliente.nombre;
        clienteSelect.appendChild(option);
    });
    
    productos.forEach(producto => {
        const option = document.createElement('option');
        option.value = producto.id;
        option.textContent = `${producto.nombre} - $${parseFloat(producto.precio).toFixed(2)} (Stock: ${producto.stock})`;
        productoSelect.appendChild(option);
    });
}

// Variables globales para la venta actual
let currentSaleItems = [];
let subtotalVenta = 0;
let ivaVenta = 0;
let totalVenta = 0;
let ventaActual = null;

// Calcular totales con IVA
function calcularTotales() {
    const ivaConfig = loadIVAConfig();
    
    subtotalVenta = currentSaleItems.reduce((sum, item) => sum + item.total, 0);
    
    if (ivaConfig.activo) {
        ivaVenta = (subtotalVenta * ivaConfig.porcentaje) / 100;
    } else {
        ivaVenta = 0;
    }
    
    totalVenta = subtotalVenta + ivaVenta;
}

// Agregar item a la venta
function addItemToSale() {
    const clienteId = document.getElementById('cliente-select').value;
    const productoId = document.getElementById('producto-select').value;
    const cantidad = parseInt(document.getElementById('cantidad').value);
    const descuento = parseInt(document.getElementById('descuento').value) || 0;
    
    if (!clienteId || !productoId || !cantidad) {
        alert('Por favor complete todos los campos');
        return;
    }
    
    const productos = loadData('productos');
    const producto = productos.find(p => p.id === productoId);
    
    if (!producto) {
        alert('Producto no encontrado');
        return;
    }
    
    if (cantidad > producto.stock) {
        alert(`No hay suficiente stock. Disponible: ${producto.stock}`);
        return;
    }
    
    const precioUnitario = parseFloat(producto.precio);
    const subtotal = precioUnitario * cantidad;
    const descuentoMonto = (subtotal * descuento) / 100;
    const totalItem = subtotal - descuentoMonto;
    
    const item = {
        id: generateId(),
        productoId: producto.id,
        productoNombre: producto.nombre,
        cantidad: cantidad,
        precioUnitario: precioUnitario,
        descuento: descuento,
        descuentoMonto: descuentoMonto,
        subtotal: subtotal,
        total: totalItem
    };
    
    currentSaleItems.push(item);
    updateSaleDisplay();
    calcularTotales();
    updateTotalDisplay();
    
    document.getElementById('producto-select').value = '';
    document.getElementById('cantidad').value = '';
    document.getElementById('descuento').value = '0';
    
    document.getElementById('completar-venta').disabled = false;
}

// Actualizar visualización de items de venta
function updateSaleDisplay() {
    const itemsContainer = document.getElementById('items-venta');
    itemsContainer.innerHTML = '';
    
    currentSaleItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-venta';
        itemDiv.innerHTML = `
            <div>
                <strong>${item.productoNombre}</strong><br>
                ${item.cantidad} x $${item.precioUnitario.toFixed(2)} = $${item.subtotal.toFixed(2)}
                ${item.descuento > 0 ? `<br>Descuento ${item.descuento}%: -$${item.descuentoMonto.toFixed(2)}` : ''}
            </div>
            <div>
                <strong>$${item.total.toFixed(2)}</strong>
                <button onclick="removeItemFromSale('${item.id}')" style="margin-left: 10px;">X</button>
            </div>
        `;
        itemsContainer.appendChild(itemDiv);
    });
}

// Eliminar item de la venta
function removeItemFromSale(itemId) {
    currentSaleItems = currentSaleItems.filter(item => item.id !== itemId);
    updateSaleDisplay();
    calcularTotales();
    updateTotalDisplay();
    
    if (currentSaleItems.length === 0) {
        document.getElementById('completar-venta').disabled = true;
    }
}

// Actualizar visualización de totales
function updateTotalDisplay() {
    const ivaConfig = loadIVAConfig();
    
    let totalHTML = `
        <div style="text-align: right; margin-top: 1rem;">
            <div><strong>Subtotal: $${subtotalVenta.toFixed(2)}</strong></div>
    `;
    
    if (ivaConfig.activo) {
        totalHTML += `
            <div><strong>IVA (${ivaConfig.porcentaje}%): $${ivaVenta.toFixed(2)}</strong></div>
        `;
    }
    
    totalHTML += `
            <div style="font-size: 1.3rem; margin-top: 0.5rem; color: #2d3748;">
                <strong>Total: $${totalVenta.toFixed(2)}</strong>
            </div>
        </div>
    `;
    
    document.getElementById('total-venta-container').innerHTML = totalHTML;
}

// Completar venta
function completeSale() {
    if (currentSaleItems.length === 0) {
        alert('No hay items en la venta');
        return;
    }
    
    const clienteId = document.getElementById('cliente-select').value;
    const clientes = loadData('clientes');
    const cliente = clientes.find(c => c.id === clienteId);
    
    if (!cliente) {
        alert('Cliente no encontrado');
        return;
    }
    
    // Obtener información del cajero actual
    const currentUser = getCurrentUser();
    const cajeroNombre = currentUser ? currentUser.name : 'Cajero Desconocido';
    const cajeroUsername = currentUser ? currentUser.username : 'desconocido';
    
    // Obtener configuración de IVA
    const ivaConfig = loadIVAConfig();
    
    // Crear venta con información del cajero y IVA
    const venta = {
        id: generateId(),
        clienteId: cliente.id,
        clienteNombre: cliente.nombre,
        fecha: new Date().toISOString(),
        items: currentSaleItems,
        subtotal: subtotalVenta,
        ivaPorcentaje: ivaConfig.activo ? ivaConfig.porcentaje : 0,
        ivaMonto: ivaVenta,
        total: totalVenta,
        cajeroNombre: cajeroNombre,
        cajeroUsername: cajeroUsername
    };
    
    // Guardar venta
    const ventas = loadData('ventas');
    ventas.push(venta);
    saveData('ventas', ventas);
    
    // Actualizar stock de productos
    const productos = loadData('productos');
    currentSaleItems.forEach(item => {
        const producto = productos.find(p => p.id === item.productoId);
        if (producto) {
            producto.stock -= item.cantidad;
        }
    });
    saveData('productos', productos);
    
    ventaActual = venta;
    
    currentSaleItems = [];
    subtotalVenta = 0;
    ivaVenta = 0;
    totalVenta = 0;
    updateSaleDisplay();
    updateTotalDisplay();
    displayVentas();
    
    document.getElementById('venta-form').reset();
    document.getElementById('completar-venta').disabled = true;
    document.getElementById('imprimir-ticket').style.display = 'block';
    
    alert(`Venta completada exitosamente\nTotal: $${venta.total.toFixed(2)}\nCajero: ${cajeroNombre}`);
}

// Generar ticket HTML con IVA
function generateTicketHTML(venta) {
    const tienda = loadTiendaInfo();
    const fecha = new Date(venta.fecha);
    const fechaFormateada = fecha.toLocaleDateString();
    const horaFormateada = fecha.toLocaleTimeString();
    
    let ticketHTML = `
        <div class="ticket-container">
            <div class="ticket-header">
                <h2>${tienda.nombre}</h2>
                <p>NIT: ${tienda.nit}</p>
                <p>${tienda.direccion}</p>
                <p>Tel: ${tienda.telefono}</p>
            </div>
            
            <div class="ticket-info">
                <p><strong>FACTURA DE VENTA</strong></p>
                <p>ID: ${venta.id}</p>
                <p>Fecha: ${fechaFormateada}</p>
                <p>Hora: ${horaFormateada}</p>
                <p>Cliente: ${venta.clienteNombre}</p>
                <p>Cajero: ${venta.cajeroNombre}</p>
            </div>
            
            <div class="ticket-items">
    `;
    
    venta.items.forEach(item => {
        ticketHTML += `
            <div class="ticket-item">
                <div>
                    ${item.productoNombre}
                    <br><small>${item.cantidad} x $${item.precioUnitario.toFixed(2)}</small>
                    ${item.descuento > 0 ? `<br><small>Descuento ${item.descuento}%</small>` : ''}
                </div>
                <div>$${item.total.toFixed(2)}</div>
            </div>
        `;
    });
    
    ticketHTML += `
            </div>
            
            <div class="ticket-totals">
                <p><strong>Subtotal: $${venta.subtotal.toFixed(2)}</strong></p>
    `;
    
    if (venta.ivaPorcentaje > 0) {
        ticketHTML += `
            <p><strong>IVA (${venta.ivaPorcentaje}%): $${venta.ivaMonto.toFixed(2)}</strong></p>
        `;
    }
    
    ticketHTML += `
                <p style="font-size: 14px; margin-top: 5px;"><strong>TOTAL: $${venta.total.toFixed(2)}</strong></p>
            </div>
            
            <div class="ticket-footer">
                <p>¡Gracias por su compra!</p>
                <p>www.zevti.com</p>
            </div>
        </div>
    `;
    
    return ticketHTML;
}

// Mostrar ticket en modal
function mostrarTicket(venta) {
    const ticketHTML = generateTicketHTML(venta);
    document.getElementById('ticket-content').innerHTML = ticketHTML;
    document.getElementById('ticket-modal').style.display = 'block';
}

// Imprimir ticket
function imprimirTicket() {
    window.print();
}

// Cerrar modal de ticket
function cerrarTicketModal() {
    document.getElementById('ticket-modal').style.display = 'none';
}

// Mostrar historial de ventas
function displayVentas() {
    const ventas = loadData('ventas');
    const tbody = document.querySelector('#ventas-table tbody');
    tbody.innerHTML = '';
    
    ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    ventas.forEach(venta => {
        const fecha = new Date(venta.fecha).toLocaleDateString();
        const hora = new Date(venta.fecha).toLocaleTimeString();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${venta.id}</td>
            <td>${venta.clienteNombre}</td>
            <td>${venta.cajeroNombre}</td>
            <td>${fecha} ${hora}</td>
            <td>$${parseFloat(venta.total).toFixed(2)}</td>
            <td class="action-buttons">
                <button onclick="verTicket('${venta.id}')" style="background: #17a2b8;">Ver Ticket</button>
                <button onclick="imprimirTicketVenta('${venta.id}')" style="background: #28a745;">Imprimir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Ver ticket de una venta específica
function verTicket(ventaId) {
    const ventas = loadData('ventas');
    const venta = ventas.find(v => v.id === ventaId);
    
    if (venta) {
        mostrarTicket(venta);
    }
}

// Imprimir ticket de una venta específica
function imprimirTicketVenta(ventaId) {
    const ventas = loadData('ventas');
    const venta = ventas.find(v => v.id === ventaId);
    
    if (venta) {
        mostrarTicket(venta);
        setTimeout(() => {
            window.print();
        }, 500);
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    const tienda = loadTiendaInfo();
    document.getElementById('nombre-tienda').value = tienda.nombre;
    document.getElementById('nit-tienda').value = tienda.nit;
    document.getElementById('direccion-tienda').value = tienda.direccion;
    document.getElementById('telefono-tienda').value = tienda.telefono;
    
    // Crear contenedor para totales
    const totalVentaContainer = document.createElement('div');
    totalVentaContainer.id = 'total-venta-container';
    totalVentaContainer.innerHTML = `
        <div style="text-align: right; margin-top: 1rem;">
            <div><strong>Subtotal: $0.00</strong></div>
            <div><strong>IVA (19%): $0.00</strong></div>
            <div style="font-size: 1.3rem; margin-top: 0.5rem; color: #2d3748;">
                <strong>Total: $0.00</strong>
            </div>
        </div>
    `;
    
    // Reemplazar el span existente con el nuevo contenedor
    const oldTotalElement = document.getElementById('total-venta');
    if (oldTotalElement) {
        const parent = oldTotalElement.parentElement;
        parent.replaceChild(totalVentaContainer, oldTotalElement);
    } else {
        // Si no existe, agregarlo después de items-venta
        const ventaResumen = document.querySelector('.venta-resumen');
        if (ventaResumen) {
            const itemsVenta = document.getElementById('items-venta');
            if (itemsVenta) {
                itemsVenta.insertAdjacentElement('afterend', totalVentaContainer);
            }
        }
    }
    
    loadSelects();
    displayVentas();
    
    document.getElementById('venta-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addItemToSale();
    });
    
    document.getElementById('completar-venta').addEventListener('click', completeSale);
    
    document.getElementById('imprimir-ticket').addEventListener('click', function() {
        if (ventaActual) {
            mostrarTicket(ventaActual);
        }
    });
    
    document.getElementById('guardar-tienda').addEventListener('click', function() {
        const tiendaInfo = {
            nombre: document.getElementById('nombre-tienda').value || 'SUPERMERCADO APP',
            nit: document.getElementById('nit-tienda').value || '123456789',
            direccion: document.getElementById('direccion-tienda').value || 'Calle Principal #123',
            telefono: document.getElementById('telefono-tienda').value || '(555) 123-4567'
        };
        
        saveTiendaInfo(tiendaInfo);
        alert('Información de la tienda guardada exitosamente');
    });
    
    const closeBtn = document.querySelector('#ticket-modal .close');
    if (closeBtn) {
        closeBtn.addEventListener('click', cerrarTicketModal);
    }
    
    const modal = document.getElementById('ticket-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                cerrarTicketModal();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarTicketModal();
        }
    });
});