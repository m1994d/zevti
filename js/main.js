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

// Backup de datos en la nube (simulado)
class CloudBackup {
    constructor() {
        this.backupKey = 'zevti_backup_' + new Date().toISOString().split('T')[0];
    }
    
    // Crear backup
    createBackup() {
        const data = {
            clientes: loadData('clientes'),
            productos: loadData('productos'),
            ventas: loadData('ventas'),
            tienda_info: loadData('tienda_info'),
            backup_date: new Date().toISOString()
        };
        
        // En una implementación real, aquí enviarías los datos a un servidor
        // Por ahora, lo guardamos en localStorage con una clave única
        localStorage.setItem(this.backupKey, JSON.stringify(data));
        
        // También guardamos una copia reciente
        localStorage.setItem('zevti_recent_backup', JSON.stringify(data));
        
        return this.backupKey;
    }
    
    // Restaurar backup
    restoreBackup(backupKey) {
        const backupData = localStorage.getItem(backupKey);
        if (backupData) {
            const data = JSON.parse(backupData);
            saveData('clientes', data.clientes);
            saveData('productos', data.productos);
            saveData('ventas', data.ventas);
            saveData('tienda_info', data.tienda_info);
            return true;
        }
        return false;
    }
    
    // Listar backups disponibles
    listBackups() {
        const backups = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('zevti_backup_')) {
                backups.push(key);
            }
        }
        return backups.sort().reverse(); // Más recientes primero
    }
    
    // Descargar backup como archivo
    downloadBackup() {
        const backup = this.createBackup();
        const data = localStorage.getItem(backup);
        const blob = new Blob([data], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `zevti_backup_${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Funciones globales para backup
const cloudBackup = new CloudBackup();

function createBackup() {
    const backupKey = cloudBackup.createBackup();
    alert(`Backup creado: ${backupKey}`);
}

function downloadBackup() {
    cloudBackup.downloadBackup();
    alert('Backup descargado exitosamente');
}

// Agrega estos botones al panel de control en index.html:
/*
<div class="form-section">
    <h3>Backup de Datos</h3>
    <button onclick="createBackup()" class="btn-primary">Crear Backup</button>
    <button onclick="downloadBackup()" class="btn-success">Descargar Backup</button>
</div>
*/

// Mostrar menú de usuarios solo para administradores
document.addEventListener('DOMContentLoaded', function() {
    if (isAdmin()) {
        const menuUsuarios = document.getElementById('menu-usuarios');
        if (menuUsuarios) {
            menuUsuarios.style.display = 'list-item';
        }
    }
});