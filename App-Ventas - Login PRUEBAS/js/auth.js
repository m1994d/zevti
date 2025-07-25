// Usuarios por defecto
const defaultUsers = [
    {
        username: 'admin',
        password: 'admin123',
        role: 'administrador',
        name: 'Marlon Diaz'
    },
    {
        username: 'cajero',
        password: 'cajero123',
        role: 'cajero',
        name: 'Andres Diaz'
    }
];

// Verificar credenciales
function login(username, password) {
    const users = defaultUsers;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Crear sesión
        const session = {
            username: user.username,
            role: user.role,
            name: user.name,
            loginTime: new Date().toISOString()
        };
        
        // Guardar sesión en localStorage
        localStorage.setItem('zevti_session', JSON.stringify(session));
        console.log('Sesión creada:', session);
        return true;
    }
    return false;
}

// Verificar si hay sesión activa
function isAuthenticated() {
    const session = localStorage.getItem('zevti_session');
    console.log('Verificando sesión - Session en localStorage:', session);
    
    if (!session) {
        console.log('No hay sesión en localStorage');
        return false;
    }
    
    try {
        const sessionData = JSON.parse(session);
        console.log('Sesión válida encontrada:', sessionData);
        return true;
    } catch (error) {
        console.log('Error parseando sesión:', error);
        localStorage.removeItem('zevti_session');
        return false;
    }
}

// Obtener información del usuario actual
function getCurrentUser() {
    const session = localStorage.getItem('zevti_session');
    return session ? JSON.parse(session) : null;
}

// Cerrar sesión
function logout() {
    console.log('Cerrando sesión');
    localStorage.removeItem('zevti_session');
    
    // Redirigir al login
    if (window.location.pathname.split('/').pop() !== 'login.html') {
        window.location.href = 'login.html';
    }
}

// Verificar permisos por rol
function hasPermission(permission) {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Definir permisos por rol
    const permissions = {
        'administrador': {
            'edit_products': true,
            'delete_products': true,
            'edit_clients': true,
            'delete_clients': true,
            'view_reports': true,
            'manage_users': true
        },
        'cajero': {
            'edit_products': false,
            'delete_products': false,
            'edit_clients': false,
            'delete_clients': false,
            'view_reports': false,
            'manage_users': false
        }
    };
    
    return permissions[user.role] && permissions[user.role][permission] === true;
}

// Verificar si es administrador
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'administrador';
}

// Proteger páginas que requieren autenticación
function protectPage() {
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'login.html') {
        return true;
    }
    
    if (!isAuthenticated()) {
        console.log('No autenticado, redirigiendo a login');
        window.location.href = 'login.html';
        return false;
    }
    
    // Verificar permisos para páginas restringidas
    const adminOnlyPages = ['usuarios.html'];
    if (adminOnlyPages.includes(currentPage) && !isAdmin()) {
        alert('No tienes permisos para acceder a esta sección');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Mostrar información de usuario
function showUserInfo() {
    const user = getCurrentUser();
    if (user && document.querySelector('header')) {
        if (!document.querySelector('.user-info')) {
            let additionalLinks = '';
            if (isAdmin()) {
                additionalLinks = '<br><a href="usuarios.html" style="color: white; font-size: 0.8rem; text-decoration: underline;">Gestión de Usuarios</a>';
            }
            
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            userInfo.innerHTML = `
                <div style="position: absolute; top: 15px; right: 20px; color: white; font-size: 0.9rem; display: flex; align-items: center; gap: 15px;">
                    <span>
                        <strong>${user.name}</strong>
                        <br>
                        <small style="opacity: 0.8;">${user.role}</small>
                        ${additionalLinks}
                    </span>
                    <button onclick="logout()" 
                            style="background: rgba(255,255,255,0.2); 
                                   border: 1px solid rgba(255,255,255,0.3); 
                                   color: white; 
                                   padding: 8px 15px; 
                                   border-radius: 20px; 
                                   cursor: pointer; 
                                   font-size: 0.8rem;
                                   transition: background 0.3s ease;">
                        Cerrar Sesión
                    </button>
                </div>
            `;
            document.querySelector('header').appendChild(userInfo);
        }
    }
}

// Manejar formulario de login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        console.log('Formulario de login detectado');
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            console.log('Intentando login con:', username);
            
            if (login(username, password)) {
                console.log('Login exitoso, redirigiendo a index.html');
                window.location.href = 'index.html';
            } else {
                console.log('Login fallido');
                const errorMessage = document.getElementById('error-message');
                errorMessage.style.display = 'block';
            }
        });
    }
    
    // Proteger páginas
    protectPage();
    
    // Mostrar info de usuario en páginas protegidas
    const protectedPages = ['index.html', 'clientes.html', 'productos.html', 'ventas.html', 'reportes.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && isAuthenticated()) {
        showUserInfo();
    }
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