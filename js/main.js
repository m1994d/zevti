// Función para cargar datos desde localStorage
function loadData(key, defaultValue = []) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
}

// Función para guardar datos en localStorage
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Función para actualizar estadísticas del dashboard
function updateDashboardStats() {
    const clientes = loadData('clientes');
    const productos = loadData('productos');
    const ventas = loadData('ventas');
    
    document.getElementById('total-clientes').textContent = clientes.length;
    document.getElementById('total-productos').textContent = productos.length;
    
    // Contar ventas de hoy
    const today = new Date().toDateString();
    const ventasHoy = ventas.filter(venta => 
        new Date(venta.fecha).toDateString() === today
    ).length;
    
    document.getElementById('ventas-hoy').textContent = ventasHoy;
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    updateDashboardStats();
});