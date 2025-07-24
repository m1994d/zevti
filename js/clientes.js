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

// Actualizar cliente
function updateCliente(id, clienteData) {
    const clientes = loadClientes();
    const index = clientes.findIndex(c => c.id === id);
    if (index !== -1) {
        clientes[index] = { ...clientes[index], ...clienteData };
        saveClientes(clientes);
        return clientes[index];
    }
    return null;
}

// Eliminar cliente
function deleteCliente(id) {
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
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cliente.id}</td>
            <td>${cliente.nombre}</td>
            <td>${cliente.email}</td>
            <td>${cliente.telefono}</td>
            <td>${cliente.direccion}</td>
            <td class="action-buttons">
                <button onclick="editCliente('${cliente.id}')">Editar</button>
                <button onclick="deleteClienteHandler('${cliente.id}')">Eliminar</button>
            </td>
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
    const clientes = loadClientes();
    const cliente = clientes.find(c => c.id === id);
    
    if (cliente) {
        document.getElementById('nombre').value = cliente.nombre;
        document.getElementById('email').value = cliente.email;
        document.getElementById('telefono').value = cliente.telefono;
        document.getElementById('direccion').value = cliente.direccion;
        
        // Cambiar el comportamiento del formulario para editar
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
            form.onsubmit = null; // Restaurar comportamiento original
            alert('Cliente actualizado exitosamente');
        };
    }
}

// Eliminar cliente
function deleteClienteHandler(id) {
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