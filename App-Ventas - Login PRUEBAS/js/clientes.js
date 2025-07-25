// Cargar clientes desde localStorage
function loadClientes() {
    return JSON.parse(localStorage.getItem('clientes') || '[]');
}

// Guardar clientes en localStorage
function saveClientes(clientes) {
    localStorage.setItem('clientes', JSON.stringify(clientes));
}

// Generar ID único
function generateId() {
    return Date.now().toString();
}

// Agregar cliente
function addCliente(cliente) {
    const clientes = loadClientes();
    cliente.id = generateId();
    clientes.push(cliente);
    saveClientes(clientes);
    return cliente;
}

// Actualizar cliente (solo para administradores)
function updateCliente(id, clienteData) {
    if (!hasPermission('edit_clients')) {
        alert('No tienes permisos para editar clientes');
        return null;
    }
    
    const clientes = loadClientes();
    const index = clientes.findIndex(c => c.id === id);
    if (index !== -1) {
        clientes[index] = { ...clientes[index], ...clienteData };
        saveClientes(clientes);
        return clientes[index];
    }
    return null;
}

// Eliminar cliente (solo para administradores)
function deleteCliente(id) {
    if (!hasPermission('delete_clients')) {
        alert('No tienes permisos para eliminar clientes');
        return [];
    }
    
    const clientes = loadClientes();
    const filtered = clientes.filter(c => c.id !== id);
    saveClientes(filtered);
    return filtered;
}

// Mostrar clientes en la tabla
function displayClientes() {
    const clientes = loadClientes();
    const tbody = document.querySelector('#clientes-table tbody');
    tbody.innerHTML = '';

    clientes.forEach(cliente => {
        // Verificar permisos para mostrar botones de edición/eliminación
        const canEdit = hasPermission('edit_clients');
        const canDelete = hasPermission('delete_clients');
        
        const actionButtons = `
            <td class="action-buttons">
                ${canEdit ? `<button onclick="editCliente('${cliente.id}')">Editar</button>` : '<span>-</span>'}
                ${canDelete ? `<button onclick="deleteClienteHandler('${cliente.id}')" style="background: #dc3545;">Eliminar</button>` : '<span>-</span>'}
            </td>
        `;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cliente.id}</td>
            <td>${cliente.nombre}</td>
            <td>${cliente.email}</td>
            <td>${cliente.telefono}</td>
            <td>${cliente.direccion}</td>
            ${actionButtons}
        `;
        tbody.appendChild(row);
    });
}

// Manejar envío del formulario
document.getElementById('cliente-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const cliente = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        direccion: document.getElementById('direccion').value
    };
    
    addCliente(cliente);
    this.reset();
    displayClientes();
    alert('Cliente agregado exitosamente');
});

// Editar cliente
function editCliente(id) {
    if (!hasPermission('edit_clients')) {
        alert('No tienes permisos para editar clientes');
        return;
    }
    
    const clientes = loadClientes();
    const cliente = clientes.find(c => c.id === id);
    
    if (cliente) {
        document.getElementById('nombre').value = cliente.nombre;
        document.getElementById('email').value = cliente.email;
        document.getElementById('telefono').value = cliente.telefono;
        document.getElementById('direccion').value = cliente.direccion;
        
        const form = document.getElementById('cliente-form');
        form.onsubmit = function(e) {
            e.preventDefault();
            
            const updatedCliente = {
                nombre: document.getElementById('nombre').value,
                email: document.getElementById('email').value,
                telefono: document.getElementById('telefono').value,
                direccion: document.getElementById('direccion').value
            };
            
            updateCliente(id, updatedCliente);
            displayClientes();
            form.reset();
            form.onsubmit = null;
            alert('Cliente actualizado exitosamente');
        };
    }
}

// Eliminar cliente
function deleteClienteHandler(id) {
    if (!hasPermission('delete_clients')) {
        alert('No tienes permisos para eliminar clientes');
        return;
    }
    
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
        deleteCliente(id);
        displayClientes();
        alert('Cliente eliminado exitosamente');
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    displayClientes();
});

// Mostrar menú de usuarios solo para administradores
document.addEventListener('DOMContentLoaded', function() {
    if (isAdmin()) {
        const menuUsuarios = document.getElementById('menu-usuarios');
        if (menuUsuarios) {
            menuUsuarios.style.display = 'list-item';
        }
    }
});