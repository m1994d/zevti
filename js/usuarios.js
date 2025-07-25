// Cargar usuarios desde localStorage
function loadUsers() {
    const users = localStorage.getItem('zevti_users');
    return users ? JSON.parse(users) : [
        {
            id: '1',
            nombre: 'Administrador',
            username: 'admin',
            password: 'admin123',
            role: 'cajero',
            createdAt: new Date().toISOString(),
            lastLogin: null
        },
        {
            id: '2',
            nombre: 'Cajero',
            username: 'cajero',
            password: 'cajero123',
            role: 'cajero',
            createdAt: new Date().toISOString(),
            lastLogin: null
        },
        {
            id: '3',
            nombre: 'Daniel Cristancho',
            username: 'admin2',
            password: 'daniel123',
            role: 'administrador',
            createdAt: new Date().toISOString(),
            lastLogin: null
        }
    ];
}

// Guardar usuarios en localStorage
function saveUsers(users) {
    localStorage.setItem('zevti_users', JSON.stringify(users));
}

// Generar ID único
function generateId() {
    return Date.now().toString();
}

// Agregar nuevo usuario
function addUsuario(usuario) {
    const users = loadUsers();
    
    // Verificar si el username ya existe
    const existingUser = users.find(u => u.username === usuario.username);
    if (existingUser) {
        throw new Error('El nombre de usuario ya existe');
    }
    
    const newUser = {
        id: generateId(),
        nombre: usuario.nombre,
        username: usuario.username,
        password: usuario.password,
        role: usuario.role,
        createdAt: new Date().toISOString(),
        lastLogin: null
    };
    
    users.push(newUser);
    saveUsers(users);
    return newUser;
}

// Actualizar usuario
function updateUsuario(id, userData) {
    const users = loadUsers();
    const index = users.findIndex(u => u.id === id);
    
    if (index !== -1) {
        // Verificar si se está cambiando el username y si ya existe
        if (userData.username && userData.username !== users[index].username) {
            const existingUser = users.find(u => u.username === userData.username && u.id !== id);
            if (existingUser) {
                throw new Error('El nombre de usuario ya existe');
            }
        }
        
        users[index] = { ...users[index], ...userData };
        saveUsers(users);
        return users[index];
    }
    return null;
}

// Eliminar usuario
function deleteUsuario(id) {
    const users = loadUsers();
    
    // No permitir eliminar al propio usuario
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === id) {
        throw new Error('No puedes eliminar tu propia cuenta');
    }
    
    // No permitir eliminar al usuario admin principal
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete && userToDelete.username === 'admin') {
        throw new Error('No se puede eliminar el usuario administrador principal');
    }
    
    const filtered = users.filter(u => u.id !== id);
    saveUsers(filtered);
    return filtered;
}

// Mostrar usuarios en la tabla
function displayUsuarios() {
    const users = loadUsers();
    const tbody = document.querySelector('#usuarios-table tbody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-';
        const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.nombre}</td>
            <td>${user.username}</td>
            <td><span class="badge-role ${user.role}">${user.role}</span></td>
            <td>${createdAt}</td>
            <td>${lastLogin}</td>
            <td class="action-buttons">
                <button onclick="editUsuario('${user.id}')" class="btn-sm">Editar</button>
                ${user.username !== 'admin' ? 
                    `<button onclick="deleteUsuarioHandler('${user.id}')" class="btn-sm btn-danger">Eliminar</button>` : 
                    '<span>-</span>'
                }
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Editar usuario
let editingUserId = null;

function editUsuario(id) {
    const users = loadUsers();
    const user = users.find(u => u.id === id);
    
    if (user) {
        document.getElementById('nombre-usuario').value = user.nombre;
        document.getElementById('username').value = user.username;
        document.getElementById('password').value = '';
        document.getElementById('rol').value = user.role;
        
        editingUserId = id;
        
        // Mostrar botón de cancelar
        document.getElementById('cancelar-edicion').style.display = 'inline-block';
        
        // Cambiar texto del botón de submit
        document.querySelector('#usuario-form button[type="submit"]').textContent = 'Actualizar Usuario';
    }
}

// Cancelar edición
function cancelarEdicion() {
    document.getElementById('usuario-form').reset();
    editingUserId = null;
    document.getElementById('cancelar-edicion').style.display = 'none';
    document.querySelector('#usuario-form button[type="submit"]').textContent = 'Guardar Usuario';
}

// Eliminar usuario
function deleteUsuarioHandler(id) {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
        try {
            deleteUsuario(id);
            displayUsuarios();
            alert('Usuario eliminado exitosamente');
        } catch (error) {
            alert(error.message);
        }
    }
}

// Manejar envío del formulario
document.getElementById('usuario-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const usuario = {
        nombre: document.getElementById('nombre-usuario').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        role: document.getElementById('rol').value
    };
    
    // Validar que la contraseña no esté vacía
    if (!usuario.password && !editingUserId) {
        alert('La contraseña es requerida');
        return;
    }
    
    try {
        if (editingUserId) {
            // Actualizar usuario existente
            const updateData = { ...usuario };
            if (!usuario.password) {
                // Si no se cambia la contraseña, no la incluimos
                delete updateData.password;
            }
            
            updateUsuario(editingUserId, updateData);
            alert('Usuario actualizado exitosamente');
            cancelarEdicion();
        } else {
            // Agregar nuevo usuario
            addUsuario(usuario);
            alert('Usuario agregado exitosamente');
        }
        
        this.reset();
        displayUsuarios();
    } catch (error) {
        alert(error.message);
    }
});

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar que el usuario sea administrador
    if (!isAdmin()) {
        alert('No tienes permisos para acceder a esta sección');
        window.location.href = 'index.html';
        return;
    }
    
    displayUsuarios();
    
    // Event listener para cancelar edición
    document.getElementById('cancelar-edicion').addEventListener('click', cancelarEdicion);
});