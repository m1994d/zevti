// Cargar productos desde localStorage
function loadProductos() {
    return JSON.parse(localStorage.getItem('productos') || '[]');
}

// Guardar productos en localStorage
function saveProductos(productos) {
    localStorage.setItem('productos', JSON.stringify(productos));
}

// Generar ID único
function generateId() {
    return Date.now().toString();
}

// Generar código único para el producto
function generateProductCode(productId) {
    const prefix = 'PROD';
    const suffix = productId.slice(-4);
    return prefix + suffix;
}

// Agregar producto
function addProducto(producto) {
    const productos = loadProductos();
    producto.id = generateId();
    producto.codigo = generateProductCode(producto.id);
    productos.push(producto);
    saveProductos(productos);
    return producto;
}

// Actualizar producto (solo para administradores)
function updateProducto(id, productoData) {
    if (!hasPermission('edit_products')) {
        alert('No tienes permisos para editar productos');
        return null;
    }
    
    const productos = loadProductos();
    const index = productos.findIndex(p => p.id === id);
    if (index !== -1) {
        productos[index] = { ...productos[index], ...productoData };
        saveProductos(productos);
        return productos[index];
    }
    return null;
}

// Eliminar producto (solo para administradores)
function deleteProducto(id) {
    if (!hasPermission('delete_products')) {
        alert('No tienes permisos para eliminar productos');
        return [];
    }
    
    const productos = loadProductos();
    const filtered = productos.filter(p => p.id !== id);
    saveProductos(filtered);
    return filtered;
}

// Generar código QR
function generateQRCode(text, containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
        new QRCode(container, {
            text: text,
            width: 80,
            height: 80,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

// Generar código de barras simple
function generateBarcodeHTML(code, containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        let barcodeHTML = '<div class="barcode-container">';
        barcodeHTML += '<div style="display: flex; justify-content: center; margin: 5px 0;">';
        
        const codeString = code.toString();
        for (let i = 0; i < codeString.length; i++) {
            const char = codeString.charAt(i);
            const charCode = char.charCodeAt(0);
            const bars = charCode % 8 + 2;
            
            for (let j = 0; j < bars; j++) {
                const width = (j % 2 === 0) ? '2px' : '4px';
                const height = '30px';
                const color = (j % 3 === 0) ? '#000' : '#333';
                barcodeHTML += `<div style="width: ${width}; height: ${height}; background: ${color}; margin: 0 1px; display: inline-block;"></div>`;
            }
        }
        
        barcodeHTML += '</div>';
        barcodeHTML += `<div class="barcode-text">${code}</div>`;
        barcodeHTML += '</div>';
        
        container.innerHTML = barcodeHTML;
    }
}

// Función para obtener clase de stock según cantidad
function getStockClass(stock) {
    const cantidad = parseInt(stock);
    if (cantidad < 10) return 'stock-bajo';
    if (cantidad <= 50) return 'stock-medio';
    return 'stock-alto';
}

// Función para filtrar productos
function filterProductos(productos, searchTerm, categoria, stockFilter, precioMin, precioMax) {
    return productos.filter(producto => {
        const matchesSearch = searchTerm === '' || 
            producto.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategoria = categoria === '' || producto.categoria === categoria;
        
        let matchesStock = true;
        if (stockFilter === 'bajo') {
            matchesStock = producto.stock < 10;
        } else if (stockFilter === 'medio') {
            matchesStock = producto.stock >= 10 && producto.stock <= 50;
        } else if (stockFilter === 'alto') {
            matchesStock = producto.stock > 50;
        }
        
        const precio = parseFloat(producto.precio);
        const matchesPrecioMin = precioMin === '' || precio >= parseFloat(precioMin);
        const matchesPrecioMax = precioMax === '' || precio <= parseFloat(precioMax);
        
        return matchesSearch && matchesCategoria && matchesStock && matchesPrecioMin && matchesPrecioMax;
    });
}

// Mostrar productos en la tabla
function displayProductos(productosToDisplay = null) {
    const productos = productosToDisplay || loadProductos();
    const tbody = document.querySelector('#productos-table tbody');
    tbody.innerHTML = '';

    // Verificar permisos
    const canEdit = hasPermission('edit_products');
    const canDelete = hasPermission('delete_products');

    productos.forEach(producto => {
        const imagenHTML = producto.imagen ? 
            `<img src="${producto.imagen}" alt="${producto.nombre}" class="product-image">` : 
            '<span>Sin imagen</span>';
            
        const stockClass = getStockClass(producto.stock);
        const stockHTML = `<span class="${stockClass}">${producto.stock}</span>`;
        
        // Botones de acción según permisos
        const actionButtons = `
            <td class="action-buttons">
                ${canEdit ? `<button onclick="editProducto('${producto.id}')">Editar</button>` : '<span>-</span>'}
                ${canDelete ? `<button onclick="deleteProductoHandler('${producto.id}')" style="background: #dc3545;">Eliminar</button>` : '<span>-</span>'}
            </td>
        `;
            
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${producto.id}</td>
            <td>${imagenHTML}</td>
            <td>${producto.nombre}</td>
            <td>$${parseFloat(producto.precio).toFixed(2)}</td>
            <td>${stockHTML}</td>
            <td>${producto.categoria}</td>
            <td>
                <div id="qr-${producto.id}" class="qr-code" onclick="showLargeCode('QR', '${producto.codigo}', '${producto.nombre}')"></div>
            </td>
            <td>
                <div id="barcode-${producto.id}" class="barcode" onclick="showLargeCode('BARCODE', '${producto.codigo}', '${producto.nombre}')"></div>
            </td>
            ${actionButtons}
        `;
        tbody.appendChild(row);
        
        setTimeout(() => {
            generateQRCode(producto.codigo, `qr-${producto.id}`);
            generateBarcodeHTML(producto.codigo, `barcode-${producto.id}`);
        }, 100);
    });
    
    updateResultCount(productos.length);
}

// Actualizar contador de resultados
function updateResultCount(count) {
    const totalProductos = loadProductos().length;
    const resultCountElement = document.getElementById('result-count');
    
    if (count === totalProductos) {
        resultCountElement.textContent = `Mostrando todos los productos (${totalProductos})`;
    } else {
        resultCountElement.textContent = `Mostrando ${count} de ${totalProductos} productos`;
    }
}

// Mostrar código grande en modal
function showLargeCode(type, code, productName) {
    const modal = document.getElementById('code-modal');
    const container = document.getElementById('modal-code-container');
    
    container.innerHTML = `
        <h3>${productName}</h3>
        <p><strong>Código: ${code}</strong></p>
        <div id="large-code-display" style="margin: 20px 0;"></div>
    `;
    
    const displayDiv = document.getElementById('large-code-display');
    
    if (type === 'QR') {
        displayDiv.innerHTML = `<div id="large-qr-code"></div>`;
        setTimeout(() => {
            new QRCode(document.getElementById('large-qr-code'), {
                text: code,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }, 100);
    } else {
        generateBarcodeHTML(code, 'large-code-display');
        displayDiv.classList.add('barcode-large');
    }
    
    modal.style.display = 'block';
}

// Cerrar modal
function closeModal() {
    document.getElementById('code-modal').style.display = 'none';
}

// Manejar envío del formulario
document.getElementById('producto-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('imagen');
    let imagenUrl = '';
    
    if (fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            imagenUrl = e.target.result;
            
            const producto = {
                nombre: document.getElementById('nombre-producto').value,
                precio: document.getElementById('precio').value,
                stock: document.getElementById('stock').value,
                categoria: document.getElementById('categoria').value,
                imagen: imagenUrl
            };
            
            addProducto(producto);
            displayProductos();
            document.getElementById('producto-form').reset();
            alert('Producto agregado exitosamente con código QR y de barras');
        };
        
        reader.readAsDataURL(file);
    } else {
        const producto = {
            nombre: document.getElementById('nombre-producto').value,
            precio: document.getElementById('precio').value,
            stock: document.getElementById('stock').value,
            categoria: document.getElementById('categoria').value,
            imagen: imagenUrl
        };
        
        addProducto(producto);
        displayProductos();
        this.reset();
        alert('Producto agregado exitosamente con código QR y de barras');
    }
});

// Editar producto
function editProducto(id) {
    if (!hasPermission('edit_products')) {
        alert('No tienes permisos para editar productos');
        return;
    }
    
    const productos = loadProductos();
    const producto = productos.find(p => p.id === id);
    
    if (producto) {
        document.getElementById('nombre-producto').value = producto.nombre;
        document.getElementById('precio').value = producto.precio;
        document.getElementById('stock').value = producto.stock;
        document.getElementById('categoria').value = producto.categoria;
        
        const form = document.getElementById('producto-form');
        form.onsubmit = function(e) {
            e.preventDefault();
            
            const fileInput = document.getElementById('imagen');
            let imagenUrl = producto.imagen;
            
            if (fileInput.files[0]) {
                const file = fileInput.files[0];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    imagenUrl = e.target.result;
                    
                    const updatedProducto = {
                        nombre: document.getElementById('nombre-producto').value,
                        precio: document.getElementById('precio').value,
                        stock: document.getElementById('stock').value,
                        categoria: document.getElementById('categoria').value,
                        imagen: imagenUrl
                    };
                    
                    updateProducto(id, updatedProducto);
                    displayProductos();
                    form.reset();
                    form.onsubmit = null;
                    alert('Producto actualizado exitosamente');
                };
                
                reader.readAsDataURL(file);
            } else {
                const updatedProducto = {
                    nombre: document.getElementById('nombre-producto').value,
                    precio: document.getElementById('precio').value,
                    stock: document.getElementById('stock').value,
                    categoria: document.getElementById('categoria').value,
                    imagen: imagenUrl
                };
                
                updateProducto(id, updatedProducto);
                displayProductos();
                form.reset();
                form.onsubmit = null;
                alert('Producto actualizado exitosamente');
            }
        };
    }
}

// Eliminar producto
function deleteProductoHandler(id) {
    if (!hasPermission('delete_products')) {
        alert('No tienes permisos para eliminar productos');
        return;
    }
    
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        deleteProducto(id);
        displayProductos();
        alert('Producto eliminado exitosamente');
    }
}

// Función para aplicar filtros
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value;
    const categoria = document.getElementById('categoria-filter').value;
    const stockFilter = document.getElementById('stock-filter').value;
    const precioMin = document.getElementById('precio-min').value;
    const precioMax = document.getElementById('precio-max').value;
    
    const productos = loadProductos();
    const filteredProductos = filterProductos(productos, searchTerm, categoria, stockFilter, precioMin, precioMax);
    displayProductos(filteredProductos);
}

// Función para limpiar filtros
function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('categoria-filter').value = '';
    document.getElementById('stock-filter').value = '';
    document.getElementById('precio-min').value = '';
    document.getElementById('precio-max').value = '';
    
    displayProductos();
}

// Event listeners para búsqueda y filtros
document.addEventListener('DOMContentLoaded', function() {
    displayProductos();
    
    document.getElementById('search-input').addEventListener('input', applyFilters);
    document.getElementById('categoria-filter').addEventListener('change', applyFilters);
    document.getElementById('stock-filter').addEventListener('change', applyFilters);
    document.getElementById('precio-min').addEventListener('input', applyFilters);
    document.getElementById('precio-max').addEventListener('input', applyFilters);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
    
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    const modal = document.getElementById('code-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
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