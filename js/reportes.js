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

// Formatear moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP'
    }).format(amount);
}

// Generar reporte
function generarReporte() {
    const fechaInicio = document.getElementById('fecha-inicio').value;
    const fechaFin = document.getElementById('fecha-fin').value;
    const tipoReporte = document.getElementById('tipo-reporte').value;
    
    const ventas = loadData('ventas');
    
    // Filtrar por fechas
    let ventasFiltradas = ventas;
    if (fechaInicio && fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        
        ventasFiltradas = ventas.filter(venta => {
            const fechaVenta = new Date(venta.fecha);
            return fechaVenta >= inicio && fechaVenta <= fin;
        });
    }
    
    // Calcular estadísticas
    calcularEstadisticas(ventasFiltradas);
    
    // Mostrar detalle según tipo de reporte
    switch(tipoReporte) {
        case 'ventas':
            mostrarReporteVentas(ventasFiltradas);
            break;
        case 'productos':
            mostrarReporteProductos(ventasFiltradas);
            break;
        case 'clientes':
            mostrarReporteClientes(ventasFiltradas);
            break;
    }
    
    // Generar gráfico
    generarGrafico(ventasFiltradas);
}

// Calcular estadísticas generales
function calcularEstadisticas(ventas) {
    const subtotalTotal = ventas.reduce((sum, venta) => sum + parseFloat(venta.subtotal || 0), 0);
    const ivaTotal = ventas.reduce((sum, venta) => sum + parseFloat(venta.ivaMonto || 0), 0);
    const totalVentas = ventas.reduce((sum, venta) => sum + parseFloat(venta.total), 0);
    const numeroVentas = ventas.length;
    const ticketPromedio = numeroVentas > 0 ? totalVentas / numeroVentas : 0;
    
    document.getElementById('total-ventas').textContent = formatCurrency(totalVentas);
    document.getElementById('numero-ventas').textContent = numeroVentas;
    document.getElementById('ticket-promedio').textContent = formatCurrency(ticketPromedio);
}

// Mostrar reporte de ventas
function mostrarReporteVentas(ventas) {
    const tbody = document.querySelector('#reporte-table tbody');
    tbody.innerHTML = '';
    
    ventas.forEach(venta => {
        const fecha = new Date(venta.fecha).toLocaleDateString();
        const total = formatCurrency(parseFloat(venta.total));
        
        // Obtener nombres de productos
        const productos = venta.items.map(item => 
            `${item.cantidad} x ${item.productoNombre}`
        ).join(', ');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fecha}</td>
            <td>${venta.clienteNombre}</td>
            <td>${productos}</td>
            <td>${total}</td>
        `;
        tbody.appendChild(row);
    });
}

// Mostrar reporte de productos más vendidos
function mostrarReporteProductos(ventas) {
    const tbody = document.querySelector('#reporte-table tbody');
    tbody.innerHTML = '';
    
    // Contar productos vendidos
    const productosVendidos = {};
    ventas.forEach(venta => {
        venta.items.forEach(item => {
            if (productosVendidos[item.productoId]) {
                productosVendidos[item.productoId].cantidad += item.cantidad;
                productosVendidos[item.productoId].total += item.total;
            } else {
                productosVendidos[item.productoId] = {
                    nombre: item.productoNombre,
                    cantidad: item.cantidad,
                    total: item.total
                };
            }
        });
    });
    
    // Convertir a array y ordenar por cantidad
    const productosArray = Object.values(productosVendidos);
    productosArray.sort((a, b) => b.cantidad - a.cantidad);
    
    // Mostrar en tabla
    productosArray.forEach(producto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>-</td>
            <td>${producto.nombre}</td>
            <td>Cantidad: ${producto.cantidad}</td>
            <td>${formatCurrency(producto.total)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Mostrar reporte de clientes frecuentes
function mostrarReporteClientes(ventas) {
    const tbody = document.querySelector('#reporte-table tbody');
    tbody.innerHTML = '';
    
    // Contar compras por cliente
    const clientesFrecuentes = {};
    ventas.forEach(venta => {
        if (clientesFrecuentes[venta.clienteId]) {
            clientesFrecuentes[venta.clienteId].compras += 1;
            clientesFrecuentes[venta.clienteId].total += parseFloat(venta.total);
        } else {
            clientesFrecuentes[venta.clienteId] = {
                nombre: venta.clienteNombre,
                compras: 1,
                total: parseFloat(venta.total)
            };
        }
    });
    
    // Convertir a array y ordenar por número de compras
    const clientesArray = Object.values(clientesFrecuentes);
    clientesArray.sort((a, b) => b.compras - a.compras);
    
    // Mostrar en tabla
    clientesArray.forEach(cliente => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>-</td>
            <td>${cliente.nombre}</td>
            <td>Compras: ${cliente.compras}</td>
            <td>${formatCurrency(cliente.total)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Generar gráfico
function generarGrafico(ventas) {
    // Agrupar ventas por fecha
    const ventasPorFecha = {};
    ventas.forEach(venta => {
        const fecha = new Date(venta.fecha).toLocaleDateString();
        if (ventasPorFecha[fecha]) {
            ventasPorFecha[fecha] += parseFloat(venta.total);
        } else {
            ventasPorFecha[fecha] = parseFloat(venta.total);
        }
    });
    
    // Preparar datos para Chart.js
    const labels = Object.keys(ventasPorFecha);
    const data = Object.values(ventasPorFecha);
    
    // Destruir gráfico existente si hay uno
    const chartElement = document.getElementById('ventasChart');
    if (chartElement.chart) {
        chartElement.chart.destroy();
    }
    
    // Crear nuevo gráfico
    const ctx = chartElement.getContext('2d');
    chartElement.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventas por Fecha',
                data,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Tendencia de Ventas'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

// Exportar a CSV
function exportarCSV() {
    const tabla = document.getElementById('reporte-table');
    let csv = '';
    
    // Encabezados
    const headers = [];
    tabla.querySelectorAll('thead th').forEach(th => {
        headers.push(th.textContent);
    });
    csv += headers.join(',') + '\n';
    
    // Datos
    tabla.querySelectorAll('tbody tr').forEach(tr => {
        const rowData = [];
        tr.querySelectorAll('td').forEach(td => {
            rowData.push('"' + td.textContent.replace(/"/g, '""') + '"');
        });
        csv += rowData.join(',') + '\n';
    });
    
    // Crear y descargar archivo
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'reporte_zevti_' + new Date().toISOString().split('T')[0] + '.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Exportar a Excel (simplificado)
function exportarExcel() {
    const tabla = document.getElementById('reporte-table');
    let html = '<table>' + tabla.innerHTML + '</table>';
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'reporte_zevti_' + new Date().toISOString().split('T')[0] + '.xls');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Establecer fechas por defecto (últimos 30 días)
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    document.getElementById('fecha-inicio').value = hace30Dias.toISOString().split('T')[0];
    document.getElementById('fecha-fin').value = hoy.toISOString().split('T')[0];
    
    // Generar reporte inicial
    generarReporte();
});