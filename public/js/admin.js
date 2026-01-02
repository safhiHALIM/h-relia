/**
 * shop47 - Admin Panel JavaScript
 * Handles admin functionality for the e-commerce store
 */

// Global state
let currentAdmin = null;
let currentAdminPage = 'dashboard';
let products = [];
let orders = [];
let accessLinks = [];
let categories = [];

// Global MAD currency formatter (display with DH suffix)
function formatMAD(value) {
    const amount = Number(value) || 0;
    try {
        const formatted = new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
        return `${formatted} DH`;
    } catch (e) {
        return `${amount.toFixed(2)} DH`;
    }
}

// Initialize admin app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminApp();
});

/**
 * Initialize the admin application
 */
async function initializeAdminApp() {
    try {
        // Check if admin is logged in
        const isLoggedIn = await checkAdminAuth();
        
        if (isLoggedIn) {
            showAdminDashboard();
            await loadInitialData();
        } else {
            showLoginScreen();
        }
        
        // Set up event listeners
        setupAdminEventListeners();
        
        console.log('Admin panel initialized successfully');
    } catch (error) {
        console.error('Error initializing admin app:', error);
        showAlert('Erreur lors du chargement du panneau d\'administration. Veuillez actualiser la page.', 'danger');
    }
}

/**
 * Set up event listeners
 */
function setupAdminEventListeners() {
    // Admin login form
    document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
    
    // Product form
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    
    // Generate link form
    document.getElementById('generateLinkForm').addEventListener('submit', handleGenerateLink);
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        const sidebar = document.getElementById('adminSidebar');
        const toggleBtn = document.querySelector('.navbar-toggler');
        
        if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('show')) {
            if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        }
    });
    
    // Setup image upload functionality
    setupImageUpload();
    
    // Setup category image upload
    setupCategoryImageUpload();
}

/**
 * Setup image upload functionality
 */
function setupImageUpload() {
    const imageInput = document.getElementById('productImages');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageSelection);
    }
}

/**
 * Setup category image upload functionality
 */
function setupCategoryImageUpload() {
    const categoryImageInput = document.getElementById('categoryImage');
    if (categoryImageInput) {
        categoryImageInput.addEventListener('change', handleCategoryImageSelection);
    }
}

/**
 * Handle image selection and preview
 */
function handleImageSelection(event) {
    const files = event.target.files;
    const previewContainer = document.getElementById('imagePreviewContainer');
    const primarySelection = document.getElementById('primaryImageSelection');
    const primarySelect = document.getElementById('primaryImageSelect');
    
    // Clear previous previews
    previewContainer.innerHTML = '';
    primarySelect.innerHTML = '';
    
    if (files.length === 0) {
        primarySelection.style.display = 'none';
        return;
    }
    
    // Show primary selection if multiple images
    if (files.length > 1) {
        primarySelection.style.display = 'block';
    } else {
        primarySelection.style.display = 'none';
    }
    
    // Create previews for each selected image
    Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            createImagePreview(file, index, previewContainer);
            
            // Add option to primary select
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Image ${index + 1} - ${file.name}`;
            if (index === 0) option.selected = true;
            primarySelect.appendChild(option);
        }
    });
}

/**
 * Create image preview element
 */
function createImagePreview(file, index, container) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const previewItem = document.createElement('div');
        previewItem.className = 'image-preview-item';
        if (index === 0) previewItem.classList.add('primary');
        
        previewItem.innerHTML = `
            <img src="${e.target.result}" alt="Preview ${index + 1}">
            <div class="image-preview-overlay">
                <button type="button" class="image-preview-btn primary-btn" onclick="setPrimaryPreview(${index})" title="Set as primary">
                    <i class="bi bi-star"></i>
                </button>
                <button type="button" class="image-preview-btn delete-btn" onclick="removeImagePreview(${index})" title="Remove">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            ${index === 0 ? '<div class="primary-badge">Primary</div>' : ''}
        `;
        
        container.appendChild(previewItem);
    };
    
    reader.readAsDataURL(file);
}

/**
 * Set primary image in preview
 */
function setPrimaryPreview(index) {
    const previewItems = document.querySelectorAll('.image-preview-item');
    const primarySelect = document.getElementById('primaryImageSelect');
    
    // Remove primary class and badge from all items
    previewItems.forEach((item, i) => {
        item.classList.remove('primary');
        const badge = item.querySelector('.primary-badge');
        if (badge) badge.remove();
    });
    
    // Add primary class and badge to selected item
    if (previewItems[index]) {
        previewItems[index].classList.add('primary');
        const badge = document.createElement('div');
        badge.className = 'primary-badge';
        badge.textContent = 'Primary';
        previewItems[index].appendChild(badge);
    }
    
    // Update select
    primarySelect.value = index;
}

/**
 * Remove image from preview
 */
function removeImagePreview(index) {
    const imageInput = document.getElementById('productImages');
    const files = Array.from(imageInput.files);
    
    // Remove file from the list
    files.splice(index, 1);
    
    // Create new FileList
    const dt = new DataTransfer();
    files.forEach(file => dt.items.add(file));
    imageInput.files = dt.files;
    
    // Trigger change event to refresh previews
    imageInput.dispatchEvent(new Event('change'));
}

/**
 * Load and display existing product images
 */
async function loadProductImages(productId) {
    try {
        const response = await fetch(`/api/admin/products/${productId}/images`);
        const data = await response.json();
        
        if (data.success) {
            displayExistingImages(data.images, productId);
        }
    } catch (error) {
        console.error('Error loading product images:', error);
    }
}

/**
 * Display existing product images
 */
function displayExistingImages(images, productId) {
    const container = document.getElementById('existingImagesContainer');
    if (!container) return;
    
    if (images.length === 0) {
        container.innerHTML = '<p class="text-muted">No images uploaded yet.</p>';
        return;
    }
    
    const grid = document.createElement('div');
    grid.className = 'existing-images-grid';
    
    images.forEach(image => {
        const imageItem = document.createElement('div');
        imageItem.className = 'existing-image-item';
        if (image.is_primary) imageItem.classList.add('primary');
        
        imageItem.innerHTML = `
            <img src="${image.image_url}" alt="Product image">
            <div class="image-actions">
                ${!image.is_primary ? `<button type="button" class="image-action-btn primary" onclick="setImageAsPrimary(${productId}, ${image.id})">Primary</button>` : ''}
                <button type="button" class="image-action-btn delete" onclick="deleteProductImage(${productId}, ${image.id})">Delete</button>
            </div>
            ${image.is_primary ? '<div class="primary-badge">Primary</div>' : ''}
        `;
        
        grid.appendChild(imageItem);
    });
    
    container.innerHTML = '<h6>Existing Images:</h6>';
    container.appendChild(grid);
}

/**
 * Set image as primary
 */
async function setImageAsPrimary(productId, imageId) {
    try {
        const response = await fetch(`/api/admin/products/${productId}/images/${imageId}/primary`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Primary image updated successfully', 'success');
            loadProductImages(productId);
        } else {
            showAlert(data.message || 'Failed to update primary image', 'danger');
        }
    } catch (error) {
        console.error('Error setting primary image:', error);
        showAlert('Erreur lors de la mise à jour de l\'image principale', 'danger');
    }
}

/**
 * Delete product image
 */
async function deleteProductImage(productId, imageId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Image deleted successfully', 'success');
            loadProductImages(productId);
        } else {
            showAlert(data.message || 'Failed to delete image', 'danger');
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        showAlert('Erreur lors de la suppression de l\'image', 'danger');
    }
}

/**
 * Handle category image selection and preview
 */
function handleCategoryImageSelection(event) {
    const file = event.target.files[0];
    const previewContainer = document.getElementById('categoryImagePreview');
    const previewImg = document.getElementById('categoryImagePreviewImg');
    
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewContainer.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
    } else {
        previewContainer.style.display = 'none';
    }
}

/**
 * Remove category image preview
 */
function removeCategoryImagePreview() {
    const categoryImageInput = document.getElementById('categoryImage');
    const previewContainer = document.getElementById('categoryImagePreview');
    
    categoryImageInput.value = '';
    previewContainer.style.display = 'none';
}

/**
 * Toggle sidebar visibility on mobile
 */
function toggleSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    if (sidebar) {
        sidebar.classList.toggle('show');
    }
}

/**
 * Check admin authentication
 */
async function checkAdminAuth() {
    try {
        const response = await fetch('/api/admin/check');
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                currentAdmin = data.user;
                return true;
            }
        }
        return false;
    } catch (error) {
        console.log('Not authenticated as admin');
        return false;
    }
}

/**
 * Show login screen
 */
function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('d-none');
    document.getElementById('adminDashboard').classList.add('d-none');
}

/**
 * Show admin dashboard
 */
function showAdminDashboard() {
    document.getElementById('loginScreen').classList.add('d-none');
    document.getElementById('adminDashboard').classList.remove('d-none');
    
    if (currentAdmin) {
        document.getElementById('adminName').textContent = currentAdmin.name;
    }
}

/**
 * Handle admin login
 */
async function handleAdminLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentAdmin = data.user;
            showAdminDashboard();
            await loadInitialData();
            showAlert('Login successful!', 'success');
        } else {
            showAlert(data.message || 'Login failed', 'danger');
        }
    } catch (error) {
        console.error('Admin login error:', error);
        showAlert('Erreur réseau. Veuillez réessayer.', 'danger');
    }
}

/**
 * Handle admin logout
 */
async function adminLogout() {
    try {
        await fetch('/api/admin/logout', { method: 'POST' });
        currentAdmin = null;
        showLoginScreen();
        showAlert('Logged out successfully', 'info');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

/**
 * Load initial data
 */
async function loadInitialData() {
    try {
        await Promise.all([
            loadCategories(),
            loadDashboardStats(),
            loadRecentOrders()
        ]);
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

/**
 * Load categories
 */
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        
        if (data.success) {
            categories = data.categories;
            updateCategorySelects();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

/**
 * Update category select elements
 */
function updateCategorySelects() {
    const selects = document.querySelectorAll('#productCategorySelect');
    selects.forEach(select => {
        select.innerHTML = categories.map(category => 
            `<option value="${category.id}">${category.name}</option>`
        ).join('');
    });
}

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
    try {
        // Load products count
        const productsResponse = await fetch('/api/products?limit=1');
        const productsData = await productsResponse.json();
        if (productsData.success) {
            document.getElementById('totalProducts').textContent = productsData.pagination.total;
        }
        
        // Load orders
        const ordersResponse = await fetch('/api/admin/orders');
        const ordersData = await ordersResponse.json();
        if (ordersData.success) {
            const totalOrders = ordersData.orders.length;
            const pendingOrders = ordersData.orders.filter(order => order.status === 'pending').length;
            
            document.getElementById('totalOrders').textContent = totalOrders;
            document.getElementById('pendingOrders').textContent = pendingOrders;
        }
        
        // Load access links
        const linksResponse = await fetch('/api/admin/access-links');
        const linksData = await linksResponse.json();
        if (linksData.success) {
            const activeLinks = linksData.links.filter(link => link.status === 'active').length;
            document.getElementById('activeLinks').textContent = activeLinks;
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

/**
 * Load recent orders for dashboard
 */
async function loadRecentOrders() {
    try {
        const response = await fetch('/api/admin/orders');
        const data = await response.json();
        
        if (data.success) {
            const recentOrders = data.orders.slice(0, 5);
            displayRecentOrders(recentOrders);
        }
    } catch (error) {
        console.error('Error loading recent orders:', error);
    }
}

/**
 * Display recent orders in dashboard
 */
function displayRecentOrders(orders) {
    const tbody = document.querySelector('#recentOrdersTable tbody');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No orders found</td></tr>';
        return;
    }
    
    // Local formatter to display DH
    const formatMAD = (value) => {
        const amount = Number(value) || 0;
        try {
            const formatted = new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
            return `${formatted} DH`;
        } catch (e) {
            return `${amount.toFixed(2)} DH`;
        }
    };

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.customer_name || order.customer_email || 'Guest'}</td>
            <td>${formatMAD(order.total_amount || 0)}</td>
            <td><span class="badge status-${order.status}">${order.status.toUpperCase()}</span></td>
            <td>${new Date(order.created_at).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

/**
 * Show admin page
 */
function showAdminPage(pageName) {
    // Update navigation
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Hide all admin pages
    document.querySelectorAll('.admin-page').forEach(page => {
        page.classList.add('d-none');
    });
    
    // Show selected page
    let pageId;
    if (pageName === 'access-links') {
        pageId = 'adminAccessLinksPage';
    } else {
        pageId = 'admin' + pageName.charAt(0).toUpperCase() + pageName.slice(1) + 'Page';
    }
    const targetPage = document.getElementById(pageId);
    console.log('🔍 Recherche de la page:', pageId, 'trouvée:', !!targetPage);
    if (targetPage) {
        targetPage.classList.remove('d-none');
        currentAdminPage = pageName;
        
        // Load page-specific data
        switch (pageName) {
            case 'categories':
                showCategoriesPage();
                break;
            case 'products':
                loadProducts();
                break;
            case 'orders':
                loadOrders();
                break;
            case 'access-links':
                refreshAccessLinks();
                break;
            case 'dashboard':
                loadDashboardStats();
                loadRecentOrders();
                break;
        }
    }
}



/**
 * Show product modal
 */
function showProductModal(product = null) {
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    const form = document.getElementById('productForm');
    const title = document.getElementById('productModalTitle');
    
    if (product) {
        // Edit mode
        title.textContent = 'Modifier le produit';
        form.productId.value = product.id;
        form.name.value = product.name;
        form.description.value = product.description;
        form.price.value = product.price;
        form.stock.value = product.stock;
        form.category_id.value = product.category_id;
    } else {
        // Add mode
        title.textContent = 'Ajouter un produit';
        form.reset();
        form.productId.value = '';
    }
    
    modal.show();
}

/**
 * Edit product
 */
function editProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        showProductModal(product);
    }
}

/**
 * Handle product form submission
 */
async function handleProductSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const productId = formData.get('productId');
    const isEdit = productId && productId !== '';
    
    try {
        const url = isEdit ? `/api/admin/products/${productId}` : '/api/admin/products';
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
            showAlert(`Product ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
            loadProducts();
            event.target.reset();
            
            // Clear image previews
            const previewContainer = document.getElementById('imagePreviewContainer');
            const primarySelection = document.getElementById('primaryImageSelection');
            if (previewContainer) previewContainer.innerHTML = '';
            if (primarySelection) primarySelection.style.display = 'none';
        } else {
            // Check if it's an authentication error
            if (response.status === 401) {
                showAlert('Session expired. Please login again.', 'danger');
                // Redirect to login after a delay
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                showAlert(data.message || `Failed to ${isEdit ? 'update' : 'create'} product`, 'danger');
            }
        }
    } catch (error) {
        console.error('Product save error:', error);
        showAlert('Erreur réseau. Veuillez réessayer.', 'danger');
    }
}

/**
 * Save product (called from modal)
 */
function saveProduct() {
    const form = document.getElementById('productForm');
    if (form.checkValidity()) {
        handleProductSubmit({ preventDefault: () => {}, target: form });
    } else {
        form.reportValidity();
    }
}

/**
 * Delete product
 */
async function deleteProduct(productId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/products/${productId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Product deleted successfully!', 'success');
            loadProducts();
        } else {
            showAlert(data.message || 'Failed to delete product', 'danger');
        }
    } catch (error) {
        console.error('Delete product error:', error);
        showAlert('Erreur réseau. Veuillez réessayer.', 'danger');
    }
}

/**
 * Load orders for admin
 */
async function loadOrders() {
    try {
        const response = await fetch('/api/admin/orders');
        const data = await response.json();
        
        if (data.success) {
            orders = data.orders;
            displayOrdersTable(data.orders);
            
            // Charger aussi les commandes livrées dans la nouvelle section
            loadDeliveredOrders();
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showAlert('Erreur lors du chargement des commandes', 'danger');
    }
}



/**
 * Display orders table
 */
function displayOrdersTable(orders) {
    const tbody = document.querySelector('#ordersTable tbody');
    
    // 🔥 FILTRER: Exclure les commandes livrées de la liste principale
    const nonDeliveredOrders = orders.filter(order => order.status !== 'delivered');
    
    if (nonDeliveredOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No orders found</td></tr>';
        return;
    }
    
    // Local formatter to display DH
    const formatMAD = (value) => {
        const amount = Number(value) || 0;
        try {
            const formatted = new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
            return `${formatted} DH`;
        } catch (e) {
            return `${amount.toFixed(2)} DH`;
        }
    };

    tbody.innerHTML = nonDeliveredOrders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.customer_name || order.customer_email || 'Guest'}</td>
            <td>${formatMAD(order.total_amount || 0)}</td>
            <td>
                <select class="order-status-select order-status-select-sm status-${order.status}" onchange="handleOrderStatusChange(${order.id}, this)">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}">⏳ En attente</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}">🔄 Traitement</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}">🚚 Expédiée</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}">✅ Livrée</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}">❌ Annulée</option>
                </select>
            </td>
            <td>${new Date(order.created_at).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-outline-info me-1" onclick="viewOrder(${order.id})" title="Voir détails">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-success" onclick="printOrder(${order.id})" title="Imprimer">
                    <i class="bi bi-printer"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    applyStatusSelectStyles();
}

/**
 * Keep the select style in sync with its value and update the status
 */
function handleOrderStatusChange(orderId, selectEl) {
    selectEl.className = 'order-status-select order-status-select-sm status-' + selectEl.value;
    updateOrderStatus(orderId, selectEl.value);
}

/**
 * Apply initial styles to all status selects based on their current value
 */
function applyStatusSelectStyles() {
    document.querySelectorAll('.order-status-select').forEach(sel => {
        sel.className = 'order-status-select order-status-select-sm status-' + sel.value;
    });
}

/**
 * Update order status
 */
async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`/api/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Order status updated successfully!', 'success');
            
            // Toujours recharger les deux listes pour maintenir la séparation
            loadOrders(); // Met à jour la liste principale (sans les livrées)
            
            // Recharger les commandes livrées si le nouveau statut est "delivered"
            if (status === 'delivered') {
                loadDeliveredOrders(); // Met à jour la liste des livrées
            }
        } else {
            showAlert(data.message || 'Failed to update order status', 'danger');
            loadOrders(); // Reload to reset the select
        }
    } catch (error) {
        console.error('Update order status error:', error);
        showAlert('Erreur réseau. Veuillez réessayer.', 'danger');
        loadOrders(); // Reload to reset the select
    }
}

/**
 * View order details
 */
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        alert(`Order #${order.id}\nCustomer: ${order.customer_name || order.customer_email || 'Guest'}\nItems: ${order.items}\nTotal: $${parseFloat(order.total).toFixed(2)}\nStatus: ${order.status}\nDate: ${new Date(order.created_at).toLocaleString()}`);
    }
}

// Fonction loadAccessLinks supprimée - utilise celle de la ligne 1669

// Fonction displayAccessLinksTable supprimée - utilise displayAccessLinks

/**
 * Show generate link modal
 */
function showGenerateLinkModal() {
    const modal = new bootstrap.Modal(document.getElementById('generateLinkModal'));
    document.getElementById('generateLinkForm').reset();
    modal.show();
}

/**
 * Handle generate link form submission
 */
async function handleGenerateLink(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const expiresHours = formData.get('expires_hours');
    
    const linkData = {};
    if (expiresHours) {
        linkData.expires_hours = parseInt(expiresHours);
    }
    
    try {
        const response = await fetch('/api/generate-link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(linkData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            bootstrap.Modal.getInstance(document.getElementById('generateLinkModal')).hide();
            showGeneratedLinkModal(data);
            loadAccessLinks(); // Refresh the table
        } else {
            showAlert(data.message || 'Failed to generate access link', 'danger');
        }
    } catch (error) {
        console.error('Generate link error:', error);
        showAlert('Erreur réseau. Veuillez réessayer.', 'danger');
    }
}





/**
 * Generate access link (wrapper function for button onclick)
 */
function generateAccessLink() {
    // Appeler la fonction async
    generateAccessLinkAsync();
}

/**
 * Copy to clipboard (supports input/textarea values)
 */
function copyToClipboard(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (navigator.clipboard && el.value !== undefined) {
        navigator.clipboard.writeText(el.value).then(() => showAlert('Copié !', 'success'))
            .catch(() => fallbackCopy(el));
    } else {
        fallbackCopy(el);
    }
}
function fallbackCopy(el) {
    try {
        el.select();
        el.setSelectionRange(0, 99999);
        document.execCommand('copy');
        showAlert('Copié !', 'success');
    } catch (err) {
        console.error('Failed to copy: ', err);
        showAlert('Échec de la copie', 'danger');
    }
}

/**
 * Revoke access link
 */
async function revokeAccessLink(tokenHash) {
    if (!confirm('Êtes-vous sûr de vouloir révoquer ce lien d\'accès ?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/access-links/${tokenHash}/revoke`, {
            method: 'PUT'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Access link revoked successfully!', 'success');
            loadAccessLinks();
        } else {
            showAlert(data.message || 'Failed to revoke access link', 'danger');
        }
    } catch (error) {
        console.error('Revoke link error:', error);
        showAlert('Erreur réseau. Veuillez réessayer.', 'danger');
    }
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add to page
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

/**
 * Hide all alert messages
 */
function hideAlert() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        if (alert.parentNode) {
            alert.remove();
        }
    });
}

// ===== RECHERCHE ET FILTRAGE DES PRODUITS =====

// Variables globales pour la recherche
let allProducts = []; // Tous les produits chargés
let filteredProducts = []; // Produits après filtrage
let searchTimeout; // Pour le debounce de la recherche

/**
 * Charger les produits avec support de recherche
 */
async function loadProducts() {
    try {
        // Ajouter l'indicateur de chargement
        const tableContainer = document.querySelector('.product-results-section');
        if (tableContainer) {
            tableContainer.classList.add('product-loading');
        }
        
        // Robust fetch with fallback to local API when served from another origin (e.g., Live Server)
        const tryFetchJson = async (path) => {
            const candidates = [''];
            if (typeof window !== 'undefined') {
                // If file:// or likely another dev server, add Express defaults
                if (window.location.protocol === 'file:' || /:\\d{4,5}$/.test(window.location.host)) {
                    candidates.push('http://localhost:3000', 'http://127.0.0.1:3000');
                }
            }
            for (const base of candidates) {
                try {
                    const res = await fetch(`${base}${path}`);
                    if (!res.ok) continue;
                    const ct = (res.headers.get('content-type') || '').toLowerCase();
                    if (!ct.includes('application/json')) continue;
                    return await res.json();
                } catch (_) { /* try next */ }
            }
            throw new Error('API unreachable');
        };

        const data = await tryFetchJson('/api/products?limit=1000');
        
        if (data.success) {
            allProducts = data.products;
            filteredProducts = [...allProducts]; // Copie pour le filtrage
            displayProductsTable(filteredProducts);
            updateProductCounts();
            loadCategoriesForFilter(); // Charger les catégories pour le filtre
            
            // Animation d'apparition des lignes
            setTimeout(() => {
                const rows = document.querySelectorAll('#productsTable tbody tr');
                rows.forEach((row, index) => {
                    row.style.animation = `fadeInUp 0.3s ease-out ${index * 0.05}s both`;
                });
            }, 100);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        const hint = (error && error.message === 'API unreachable') ? '\nVérifiez que le serveur tourne sur http://localhost:3000' : '';
        showAlert('Erreur lors du chargement des produits' + hint, 'danger');
    } finally {
        // Retirer l'indicateur de chargement
        const tableContainer = document.querySelector('.product-results-section');
        if (tableContainer) {
            tableContainer.classList.remove('product-loading');
        }
    }
}

/**
 * Charger les catégories pour le filtre
 */
async function loadCategoriesForFilter() {
    try {
        // Same robust fetch fallback as products
        const tryFetchJson = async (path) => {
            const candidates = [''];
            if (typeof window !== 'undefined') {
                if (window.location.protocol === 'file:' || /:\\d{4,5}$/.test(window.location.host)) {
                    candidates.push('http://localhost:3000', 'http://127.0.0.1:3000');
                }
            }
            for (const base of candidates) {
                try {
                    const res = await fetch(`${base}${path}`);
                    if (!res.ok) continue;
                    const ct = (res.headers.get('content-type') || '').toLowerCase();
                    if (!ct.includes('application/json')) continue;
                    return await res.json();
                } catch (_) {}
            }
            throw new Error('API unreachable');
        };

        const data = await tryFetchJson('/api/categories');
        
        if (data.success) {
            const categoryFilter = document.getElementById('productCategoryFilter');
            categoryFilter.innerHTML = '<option value="">Toutes les catégories</option>';
            
            data.categories.forEach(category => {
                categoryFilter.innerHTML += `<option value="${category.id}">${category.name}</option>`;
            });
        }
    } catch (error) {
        console.error('Error loading categories for filter:', error);
    }
}

/**
 * Rechercher des produits avec debounce
 */
function searchProducts() {
    const searchInput = document.getElementById('productSearchInput');
    
    // Ajouter l'indicateur de recherche
    searchInput.classList.add('searching');
    
    // Annuler la recherche précédente si elle existe
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Attendre 300ms avant de lancer la recherche
    searchTimeout = setTimeout(() => {
        performSearch();
        // Retirer l'indicateur de recherche
        searchInput.classList.remove('searching');
    }, 300);
}

/**
 * Effectuer la recherche
 */
function performSearch() {
    const searchTerm = document.getElementById('productSearchInput').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        // Si pas de recherche, appliquer seulement les filtres
        applyFilters();
        return;
    }
    
    // Filtrer par terme de recherche
    const searchResults = allProducts.filter(product => {
        return (
            product.name.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm)) ||
            (product.sku && product.sku.toLowerCase().includes(searchTerm)) ||
            (product.category_name && product.category_name.toLowerCase().includes(searchTerm))
        );
    });
    
    // Appliquer les autres filtres sur les résultats de recherche
    filteredProducts = applyOtherFilters(searchResults);
    displayProductsTable(filteredProducts);
    updateProductCounts();
    updateSearchInfo(searchTerm);
}

/**
 * Appliquer les filtres (catégorie, stock, statut)
 */
function filterProducts() {
    applyFilters();
}

/**
 * Appliquer tous les filtres
 */
function applyFilters() {
    const searchTerm = document.getElementById('productSearchInput').value.toLowerCase().trim();
    
    // Commencer avec tous les produits ou les résultats de recherche
    let baseProducts = allProducts;
    
    if (searchTerm !== '') {
        baseProducts = allProducts.filter(product => {
            return (
                product.name.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                (product.sku && product.sku.toLowerCase().includes(searchTerm)) ||
                (product.category_name && product.category_name.toLowerCase().includes(searchTerm))
            );
        });
    }
    
    // Appliquer les autres filtres
    filteredProducts = applyOtherFilters(baseProducts);
    displayProductsTable(filteredProducts);
    updateProductCounts();
    updateSearchInfo(searchTerm);
}

/**
 * Appliquer les filtres autres que la recherche textuelle
 */
function applyOtherFilters(products) {
    const categoryFilter = document.getElementById('productCategoryFilter').value;
    const stockFilter = document.getElementById('productStockFilter').value;
    
    return products.filter(product => {
        // Filtre par catégorie
        if (categoryFilter && product.category_id != categoryFilter) {
            return false;
        }
        
        // Filtre par stock
        if (stockFilter) {
            switch (stockFilter) {
                case 'in-stock':
                    if (product.stock <= 0) return false;
                    break;
                case 'low-stock':
                    if (product.stock >= 10) return false;
                    break;
                case 'out-of-stock':
                    if (product.stock > 0) return false;
                    break;
            }
        }
        
        return true;
    });
}

/**
 * Effacer la recherche
 */
function clearProductSearch() {
    document.getElementById('productSearchInput').value = '';
    applyFilters();
}

/**
 * Réinitialiser tous les filtres
 */
function resetProductFilters() {
    document.getElementById('productSearchInput').value = '';
    document.getElementById('productCategoryFilter').value = '';
    document.getElementById('productStockFilter').value = '';
    
    filteredProducts = [...allProducts];
    displayProductsTable(filteredProducts);
    updateProductCounts();
    updateSearchInfo('');
}

/**
 * Mettre à jour les compteurs de produits
 */
function updateProductCounts() {
    document.getElementById('totalProductsCount').textContent = allProducts.length;
    document.getElementById('visibleProductsCount').textContent = filteredProducts.length;
}

/**
 * Mettre à jour les informations de recherche
 */
function updateSearchInfo(searchTerm) {
    const infoElement = document.getElementById('productSearchInfo');
    
    if (searchTerm) {
        const totalResults = filteredProducts.length;
        infoElement.innerHTML = `
            <i class="bi bi-search"></i> 
            <strong>${totalResults}</strong> produit(s) trouvé(s) pour "<strong>${searchTerm}</strong>"
            ${totalResults !== allProducts.length ? ` sur ${allProducts.length} total` : ''}
        `;
    } else if (filteredProducts.length !== allProducts.length) {
        infoElement.innerHTML = `
            <i class="bi bi-funnel"></i> 
            <strong>${filteredProducts.length}</strong> produit(s) affiché(s) sur ${allProducts.length} total (filtres appliqués)
        `;
    } else {
        infoElement.innerHTML = `
            <i class="bi bi-check-circle"></i> 
            Affichage de tous les produits (${allProducts.length})
        `;
    }
}

/**
 * Afficher le tableau des produits (version améliorée)
 */
function displayProductsTable(products) {
    const tbody = document.querySelector('#productsTable tbody');
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-search fs-1"></i><br>
                    Aucun produit trouvé
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = products.map(product => {
        // Déterminer la classe CSS pour le stock
        let stockClass = 'success';
        let stockIcon = 'bi-check-circle';
        
        if (product.stock <= 0) {
            stockClass = 'danger';
            stockIcon = 'bi-x-circle';
        } else if (product.stock < 10) {
            stockClass = 'warning';
            stockIcon = 'bi-exclamation-triangle';
        }
        
        return `
            <tr>
                <td>
                    <img src="${product.image || '/images/placeholder.jpg'}" 
                         alt="${product.name}" 
                         class="product-image">
                </td>
                <td>
                    <div>
                        <strong class="text-primary">${product.name}</strong>
                        ${product.sku ? `<br><small class="text-muted"><i class="bi bi-upc-scan"></i> SKU: ${product.sku}</small>` : ''}
                        ${product.description ? `<br><small class="text-muted">${product.description.substring(0, 50)}${product.description.length > 50 ? '...' : ''}</small>` : ''}
                    </div>
                </td>
                <td>
                    <span class="badge bg-secondary rounded-pill">
                        <i class="bi bi-tag"></i> ${product.category_name || 'N/A'}
                    </span>
                </td>
                <td>
                    <strong class="text-success fs-5">${formatMAD(product.price)}</strong>
                </td>
                <td>
                    <span class="badge stock-badge bg-${stockClass}">
                        <i class="${stockIcon}"></i> ${product.stock}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="editProduct(${product.id})" title="Modifier">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteProduct(${product.id})" title="Supprimer">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ===== RACCOURCIS CLAVIER =====

/**
 * Gérer les raccourcis clavier
 */
document.addEventListener('keydown', function(event) {
    // Ctrl+F pour focus sur la recherche de produits (seulement sur la page produits)
    if (event.ctrlKey && event.key === 'f' && currentAdminPage === 'products') {
        event.preventDefault();
        const searchInput = document.getElementById('productSearchInput');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    
    // Échap pour effacer la recherche
    if (event.key === 'Escape' && currentAdminPage === 'products') {
        const searchInput = document.getElementById('productSearchInput');
        if (searchInput && searchInput.value) {
            clearProductSearch();
        }
    }
});

// ===== GESTION DES CATÉGORIES =====

/**
 * Afficher la page des catégories
 */
function showCategoriesPage() {
    loadCategoriesGrid();
}

/**
 * Charger la grille des catégories
 */
async function loadCategoriesGrid() {
    try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        
        if (data.success) {
            categories = data.categories;
            displayCategoriesGrid();
            updateDashboardStats();
        } else {
            showAlert('Erreur lors du chargement des catégories', 'danger');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        showAlert('Erreur réseau lors du chargement des catégories', 'danger');
    }
}

/**
 * Afficher la grille des catégories
 */
function displayCategoriesGrid() {
    const grid = document.getElementById('categoriesGrid');
    
    if (categories.length === 0) {
        grid.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <i class="bi bi-tags" style="font-size: 3rem; color: #ccc;"></i>
                    <h4 class="mt-3 text-muted">Aucune catégorie</h4>
                    <p class="text-muted">Commencez par créer votre première catégorie</p>
                    <button class="btn btn-primary" onclick="showCategoryModal()">
                        <i class="bi bi-plus"></i> Ajouter une catégorie
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    let html = '';
    categories.forEach(category => {
        html += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 category-card">
                    <div class="card-body text-center">
                        <div class="mb-3">
                            <i class="${category.icon}" style="font-size: 3rem; color: #1ee98a;"></i>
                        </div>
                        <h5 class="card-title">${category.name}</h5>
                        <p class="card-text text-muted small">
                            ${category.description || 'Pas de description'}
                        </p>
                        <div class="mt-3">
                            <button class="btn btn-outline-primary btn-sm me-2" onclick="editCategory(${category.id})">
                                <i class="bi bi-pencil"></i> Modifier
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="deleteCategory(${category.id}, '${category.name}')">
                                <i class="bi bi-trash"></i> Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

/**
 * Afficher le modal d'ajout/modification de catégorie
 */
function showCategoryModal(categoryId = null) {
    const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    const title = document.getElementById('categoryModalTitle');
    const form = document.getElementById('categoryForm');
    
    // Reset form
    form.reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('iconPreview').className = 'bi bi-tag';
    
    if (categoryId) {
        // Mode édition
        const category = categories.find(c => c.id === categoryId);
        if (category) {
            title.textContent = 'Modifier la catégorie';
            document.getElementById('categoryId').value = category.id;
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryDescription').value = category.description || '';
            document.getElementById('categoryIcon').value = category.icon;
            document.getElementById('iconPreview').className = category.icon;
        }
    } else {
        // Mode ajout
        title.textContent = 'Ajouter une catégorie';
        document.getElementById('categoryIcon').value = 'bi-tag';
    }
    
    modal.show();
}

/**
 * Sauvegarder une catégorie
 */
async function saveCategory() {
    try {
        const form = document.getElementById('categoryForm');
        const formData = new FormData(form);
        
        const categoryId = formData.get('categoryId');
        const isEdit = categoryId && categoryId !== '';
        
        const url = isEdit ? `/api/admin/categories/${categoryId}` : '/api/admin/categories';
        const method = isEdit ? 'PUT' : 'POST';
        
        // Pour l'édition, nous devons utiliser FormData aussi pour supporter l'image
        const response = await fetch(url, {
            method: method,
            body: formData // Utiliser FormData directement pour supporter les fichiers
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert(data.message, 'success');
            bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
            loadCategoriesGrid();
            loadCategories(); // Recharger pour les selects
        } else {
            showAlert(data.message || 'Erreur lors de la sauvegarde', 'danger');
        }
        
    } catch (error) {
        console.error('Save category error:', error);
        showAlert('Erreur réseau lors de la sauvegarde', 'danger');
    }
}

/**
 * Modifier une catégorie
 */
function editCategory(categoryId) {
    showCategoryModal(categoryId);
}

/**
 * Supprimer une catégorie
 */
async function deleteCategory(categoryId, categoryName) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" ?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/categories/${categoryId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert(data.message, 'success');
            loadCategoriesGrid();
            loadCategories(); // Recharger pour les selects
        } else {
            showAlert(data.message || 'Erreur lors de la suppression', 'danger');
        }
        
    } catch (error) {
        console.error('Delete category error:', error);
        showAlert('Erreur réseau lors de la suppression', 'danger');
    }
}

/**
 * Afficher le sélecteur d'icônes
 */
async function showIconSelector() {
    try {
        const response = await fetch('/api/admin/categories/icons');
        const data = await response.json();
        
        if (data.success) {
            displayIconSelector(data.icons);
            const modal = new bootstrap.Modal(document.getElementById('iconSelectorModal'));
            modal.show();
        } else {
            showAlert('Erreur lors du chargement des icônes', 'danger');
        }
        
    } catch (error) {
        console.error('Load icons error:', error);
        showAlert('Erreur réseau lors du chargement des icônes', 'danger');
    }
}

/**
 * Afficher le sélecteur d'icônes
 */
function displayIconSelector(iconCategories) {
    const container = document.getElementById('iconCategories');
    let html = '';
    
    iconCategories.forEach(category => {
        html += `
            <div class="mb-4">
                <h6 class="text-primary mb-3">
                    <i class="bi bi-folder"></i> ${category.category}
                </h6>
                <div class="row g-2">
        `;
        
        category.icons.forEach(icon => {
            html += `
                <div class="col-2 col-md-1">
                    <button type="button" class="btn btn-outline-secondary w-100 icon-btn" 
                            onclick="selectIcon('${icon}')" 
                            title="${icon}">
                        <i class="${icon}"></i>
                    </button>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Sélectionner une icône
 */
function selectIcon(iconClass) {
    document.getElementById('categoryIcon').value = iconClass;
    document.getElementById('iconPreview').className = iconClass;
    
    // Fermer le modal
    bootstrap.Modal.getInstance(document.getElementById('iconSelectorModal')).hide();
    
    showAlert('Icône sélectionnée !', 'success');
}

// ===== GESTION DES LIENS D'ACCÈS =====

/**
 * Ouvrir le modal de détails du lien d'accès
 */
function showAccessLinkDetails(encodedJson) {
    try {
        const link = JSON.parse(decodeURIComponent(encodedJson));
        const baseUrl = window.location.origin;
        const fullLink = link.token ? `${baseUrl}/access?token=${link.token}` : '';
        
        // Remplir les champs
        setValue('detailFullLink', fullLink);
        setValue('detailToken', link.token || '');
        setValue('detailId', link.id != null ? `#${link.id}` : '');
        setValue('detailDescription', link.description || '');
        setValue('detailStatus', link.status || '');
        setValue('detailCreatedBy', link.created_by || '');
        setValue('detailCreatedAt', link.created_at ? formatDateTime(link.created_at) : '');
        setValue('detailExpiresAt', link.expires_at ? formatDateTime(link.expires_at) : 'Aucune');
        setValue('detailUsedAt', link.used_at ? formatDateTime(link.used_at) : 'Jamais');
        setValue('detailAccessCount', String(link.access_count ?? '0'));
        setValue('detailDeviceInfo', link.device_info || '');
        
        // Afficher le modal
        new bootstrap.Modal(document.getElementById('accessLinkDetailsModal')).show();
    } catch (e) {
        console.error('showAccessLinkDetails error:', e);
        showAlert('Erreur lors de l\'ouverture des détails du lien', 'danger');
    }
}
function setValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    if ('value' in el) el.value = value;
    else el.textContent = value;
}

/**
 * Formater une date/heure pour l'affichage
 */
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Date invalide';
        
        return date.toLocaleString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (error) {
        console.error('Erreur formatage date:', error);
        return 'Erreur date';
    }
}

/**
 * Charger les liens d'accès
 */
async function loadAccessLinks() {
    try {
        console.log('🔄 Chargement des liens d\'accès...');
        const response = await fetch('/api/admin/access-links');
        console.log('📡 Réponse reçue:', response.status);
        const data = await response.json();
        console.log('📊 Données reçues:', data);
        
        if (data.success) {
            console.log('✅ Liens chargés avec succès:', data.links.length, 'liens');
            displayAccessLinks(data.links);
        } else {
            console.error('❌ Erreur API:', data.message);
            showAlert(data.message || 'Erreur lors du chargement des liens', 'danger');
        }
    } catch (error) {
        console.error('❌ Load access links error:', error);
        showAlert('Erreur lors du chargement des liens d\'accès', 'danger');
    }
}

/**
 * Charger les statistiques des liens d'accès
 */
async function loadAccessLinksStats() {
    try {
        console.log('📊 Chargement des statistiques...');
        const response = await fetch('/api/admin/access-links/stats');
        console.log('📡 Stats réponse:', response.status);
        const data = await response.json();
        console.log('📈 Stats données:', data);
        
        if (data.success) {
            const stats = data.stats;
            console.log('✅ Stats chargées:', stats);
            document.getElementById('totalLinks').textContent = stats.total || 0;
            document.getElementById('activeLinks').textContent = stats.active || 0;
            document.getElementById('usedLinks').textContent = stats.used || 0;
            document.getElementById('expiredLinks').textContent = stats.expired_by_time || 0;
            document.getElementById('revokedLinks').textContent = stats.revoked || 0;
            document.getElementById('totalAccesses').textContent = stats.total_accesses || 0;
        } else {
            console.error('❌ Erreur stats:', data.message);
        }
    } catch (error) {
        console.error('❌ Load access links stats error:', error);
    }
}

/**
 * Afficher les liens d'accès dans le tableau
 */
function displayAccessLinks(links) {
    const tbody = document.querySelector('#accessLinksTable tbody');
    tbody.innerHTML = '';
    
    if (links.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center text-muted py-4">
                    <i class="bi bi-link-45deg fs-1"></i><br>
                    Aucun lien d'accès trouvé
                </td>
            </tr>
        `;
        return;
    }
    
    links.forEach(link => {
        const row = document.createElement('tr');
        
        // Déterminer la classe CSS pour le statut
        let statusClass = 'secondary';
        let statusIcon = 'bi-question-circle';
        
        switch (link.status) {
            case 'active':
                statusClass = 'success';
                statusIcon = 'bi-check-circle';
                break;
            case 'used':
                statusClass = 'primary';
                statusIcon = 'bi-person-check';
                break;
            case 'expired':
                statusClass = 'warning';
                statusIcon = 'bi-clock';
                break;
            case 'revoked':
                statusClass = 'danger';
                statusIcon = 'bi-x-circle';
                break;
        }
        
        // Vérifier si expiré par le temps
        if (link.is_expired) {
            statusClass = 'warning';
            statusIcon = 'bi-clock';
        }
        
        row.innerHTML = `
            <td><strong>#${link.id}</strong></td>
            <td><code>${link.token_hash}</code></td>
            <td>${link.description || '<em>Aucune</em>'}</td>
            <td>
                <span class="badge bg-${statusClass}">
                    <i class="${statusIcon}"></i> ${link.status || 'N/A'}
                </span>
            </td>
            <td>${link.created_by_name || '<em>Inconnu</em>'}</td>
            <td>${formatDateTime(link.created_at)}</td>
            <td>${link.expires_at ? formatDateTime(link.expires_at) : '<em>Jamais</em>'}</td>
            <td>${link.used_at ? formatDateTime(link.used_at) : '<em>Jamais</em>'}</td>
            <td>
                <span class="badge bg-info">${link.access_count}</span>
            </td>
            <td>${link.used_by_device || '<em>Aucun</em>'}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-info" onclick="showAccessLinkDetails('${encodeURIComponent(JSON.stringify({
                        id: link.id,
                        token: link.token || link.token_hash,
                        description: link.description || '',
                        status: link.status || '',
                        created_by: link.created_by_name || link.created_by || '',
                        created_at: link.created_at || '',
                        expires_at: link.expires_at || '',
                        used_at: link.used_at || '',
                        access_count: link.access_count || 0,
                        device_info: link.used_by_device || link.device_info || ''
                    }))}')" title="Détails">
                        <i class="bi bi-eye"></i>
                    </button>
                    ${link.status === 'active' ? `
                        <button class="btn btn-warning btn-sm" onclick="revokeAccessLink(${link.id})" title="Révoquer">
                            <i class="bi bi-x-circle"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-danger btn-sm" onclick="deleteAccessLink(${link.id})" title="Supprimer">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * Afficher le modal de génération de lien
 */
function showGenerateLinkModal() {
    // Réinitialiser le formulaire
    document.getElementById('generateLinkForm').reset();
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('generateLinkModal'));
    modal.show();
}

/**
 * Générer un nouveau lien d'accès
 */
async function generateAccessLinkAsync() {
    try {
        console.log('🚀 Début de génération de lien...');
        const form = document.getElementById('generateLinkForm');
        
        // Récupérer les données directement depuis les éléments du formulaire
        const descriptionInput = form.querySelector('input[name="description"]');
        const expiresHoursInput = form.querySelector('input[name="expires_hours"]');
        
        const data = {
            description: descriptionInput ? descriptionInput.value.trim() : '',
            expires_hours: expiresHoursInput && expiresHoursInput.value ? parseInt(expiresHoursInput.value) : null
        };
        
        console.log('📝 Données du formulaire:', data);
        
        // Validation
        if (!data.description || data.description.trim() === '') {
            console.log('❌ Description manquante');
            showAlert('La description est obligatoire', 'warning');
            return;
        }
        
        if (!document.getElementById('confirmGenerate').checked) {
            console.log('❌ Confirmation manquante');
            showAlert('Veuillez confirmer la génération du lien', 'warning');
            return;
        }
        
        console.log('📡 Envoi de la requête à /api/generate-link...');
        const response = await fetch('/api/generate-link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        console.log('📡 Réponse reçue:', response.status, response.statusText);
        
        if (!response.ok) {
            console.error('❌ Réponse HTTP non-OK:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('❌ Contenu de l\'erreur:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('📊 Données de réponse:', result);
        
        if (result.success) {
            // Fermer le modal de génération
            bootstrap.Modal.getInstance(document.getElementById('generateLinkModal')).hide();
            
            // Afficher le modal avec le lien généré
            showGeneratedLinkModal(result);
            
            // Recharger les liens et statistiques
            loadAccessLinks();
            loadAccessLinksStats();
            
            showAlert('Lien d\'accès généré avec succès !', 'success');
        } else {
            showAlert(result.message || 'Erreur lors de la génération du lien', 'danger');
        }
    } catch (error) {
        console.error('❌ Generate access link error:', error);
        console.error('❌ Error details:', error.message);
        console.error('❌ Error stack:', error.stack);
        showAlert('Erreur lors de la génération du lien d\'accès: ' + error.message, 'danger');
    }
}

/**
 * Afficher le modal avec le lien généré
 */
function showGeneratedLinkModal(linkData) {
    // Remplir les champs
    document.getElementById('generatedLink').value = linkData.link || '';
    document.getElementById('generatedToken').value = linkData.token || '';
    document.getElementById('generatedDescription').textContent = linkData.description || 'Aucune';
    
    // Vérifier si l'élément existe avant de le modifier
    const currentLinksElement = document.getElementById('currentLinksCount');
    if (currentLinksElement) {
        currentLinksElement.textContent = linkData.totalActiveLinks || '0';
    }
    
    // Gestion de l'expiration
    const expirationElement = document.getElementById('expirationTime');
    if (expirationElement) {
        if (linkData.expires_at) {
            expirationElement.textContent = formatDateTime(linkData.expires_at);
        } else {
            expirationElement.textContent = 'Aucune expiration';
        }
    }
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('generatedLinkModal'));
    modal.show();
}

/**
 * Mettre à jour le statut d'un lien d'accès
 */
async function updateLinkStatus(linkId, newStatus) {
    try {
        const response = await fetch(`/api/admin/access-links/${linkId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert(`Statut du lien #${linkId} mis à jour vers ${newStatus.toUpperCase()}`, 'success');
            // Recharger la liste pour refléter les changements
            loadAccessLinks();
        } else {
            showAlert(data.message || 'Erreur lors de la mise à jour du statut', 'danger');
            // Recharger pour restaurer l'ancien statut
            loadAccessLinks();
        }
    } catch (error) {
        console.error('Update link status error:', error);
        showAlert('Erreur réseau lors de la mise à jour du statut', 'danger');
        // Recharger pour restaurer l'ancien statut
        loadAccessLinks();
    }
}

/**
 * Révoquer un lien d'accès
 */
async function revokeAccessLink(linkId) {
    if (!confirm('Êtes-vous sûr de vouloir révoquer ce lien d\'accès ? Cette action est irréversible.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/access-links/${linkId}/revoke`, {
            method: 'PUT'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Lien d\'accès révoqué avec succès', 'success');
            loadAccessLinks();
            loadAccessLinksStats();
        } else {
            showAlert(data.message || 'Erreur lors de la révocation', 'danger');
        }
    } catch (error) {
        console.error('Revoke access link error:', error);
        showAlert('Erreur lors de la révocation du lien', 'danger');
    }
}

/**
 * Supprimer un lien d'accès
 */
async function deleteAccessLink(linkId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce lien d\'accès ? Cette action est irréversible.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/access-links/${linkId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Lien d\'accès supprimé avec succès', 'success');
            loadAccessLinks();
            loadAccessLinksStats();
        } else {
            showAlert(data.message || 'Erreur lors de la suppression', 'danger');
        }
    } catch (error) {
        console.error('Delete access link error:', error);
        showAlert('Erreur lors de la suppression du lien', 'danger');
    }
}

/**
 * Actualiser les liens d'accès
 */
function refreshAccessLinks() {
    loadAccessLinks();
    loadAccessLinksStats();
    showAlert('Liens d\'accès actualisés', 'info');
}

/**
 * Copier dans le presse-papiers
 */
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    element.setSelectionRange(0, 99999); // Pour mobile
    
    try {
        document.execCommand('copy');
        showAlert('Copié dans le presse-papiers !', 'success');
    } catch (err) {
        console.error('Copy failed:', err);
        showAlert('Erreur lors de la copie', 'danger');
    }
}

// ===== GESTION DES REÇUS DE COMMANDE =====

/**
 * Imprimer le reçu d'une commande
 */
async function printOrderReceipt(orderId) {
    try {
        console.log('Attempting to print receipt for order:', orderId);
        
        // Récupérer les détails complets de la commande
        const response = await fetch(`/api/admin/orders/${orderId}/details`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (!data.success) {
            showAlert(data.message || 'Erreur lors du chargement des détails de la commande', 'danger');
            return;
        }
        
        const order = data.order;
        const orderItems = data.items || [];
        
        console.log('Order data:', order);
        console.log('Order items:', orderItems);
        
        // Générer le HTML du reçu
        const receiptHTML = generateReceiptHTML(order, orderItems);
        
        // Ouvrir une nouvelle fenêtre pour l'impression
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) {
            showAlert('Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez que les popups ne sont pas bloqués.', 'warning');
            return;
        }
        
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        
        // Attendre que le contenu soit chargé puis imprimer
        printWindow.onload = function() {
            printWindow.print();
            // Fermer la fenêtre après impression (optionnel)
            printWindow.onafterprint = function() {
                printWindow.close();
            };
        };
        
        showAlert('Reçu généré avec succès !', 'success');
        
    } catch (error) {
        console.error('Print receipt error:', error);
        showAlert(`Erreur lors de la génération du reçu: ${error.message}`, 'danger');
    }
}

/**
 * Générer le HTML du reçu
 */
function generateReceiptHTML(order, orderItems) {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const orderDate = new Date(order.created_at).toLocaleDateString('fr-FR');
    const orderTime = new Date(order.created_at).toLocaleTimeString('fr-FR');

    // Local MAD currency formatter for receipt rendering (display with DH suffix)
    const formatMAD = (value) => {
        const amount = Number(value) || 0;
        try {
            const formatted = new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
            return `${formatted} DH`;
        } catch (e) {
            return `${amount.toFixed(2)} DH`;
        }
    };
    
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reçu de Commande #${order.id}</title>
        <style>
            body {
                font-family: 'Courier New', monospace;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                line-height: 1.4;
                color: #333;
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
                margin-bottom: 20px;
            }
            .store-name {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            .store-info {
                font-size: 12px;
                color: #666;
            }
            .receipt-title {
                font-size: 18px;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
                text-transform: uppercase;
            }
            .order-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            .order-info div {
                margin-bottom: 10px;
            }
            .customer-info {
                border: 1px solid #ddd;
                padding: 15px;
                margin-bottom: 20px;
                background-color: #f9f9f9;
            }
            .customer-info h3 {
                margin-top: 0;
                margin-bottom: 10px;
                font-size: 14px;
                text-transform: uppercase;
            }
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            .items-table th,
            .items-table td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            .items-table th {
                background-color: #f5f5f5;
                font-weight: bold;
                text-transform: uppercase;
                font-size: 12px;
            }
            .items-table td {
                font-size: 12px;
            }
            .text-right {
                text-align: right;
            }
            .text-center {
                text-align: center;
            }
            .total-section {
                border-top: 2px solid #333;
                padding-top: 15px;
                margin-top: 20px;
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
                font-size: 14px;
            }
            .total-final {
                font-weight: bold;
                font-size: 16px;
                border-top: 1px solid #333;
                padding-top: 10px;
                margin-top: 10px;
            }
            .status-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
            }
            .status-pending { background-color: #fff3cd; color: #856404; }
            .status-processing { background-color: #cce5ff; color: #004085; }
            .status-shipped { background-color: #d4edda; color: #155724; }
            .status-delivered { background-color: #d1ecf1; color: #0c5460; }
            .status-cancelled { background-color: #f8d7da; color: #721c24; }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 12px;
                color: #666;
            }
            @media print {
                body { margin: 0; padding: 15px; }
                .no-print { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="store-name">🛍️ shop47</div>
            <div class="store-info">
                Électronique Moderne - Qualité Premium<br>
                Email: contact@neosafistore.com | Tél: +33 1 23 45 67 89
            </div>
        </div>

        <div class="receipt-title">Reçu de Commande</div>

        <div class="order-info">
            <div>
                <strong>N° Commande:</strong> #${order.id}<br>
                <strong>Date:</strong> ${orderDate} à ${orderTime}<br>
                <strong>Statut:</strong> <span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span>
            </div>
            <div>
                <strong>Imprimé le:</strong> ${currentDate}<br>
                <strong>Par:</strong> Administration
            </div>
        </div>

        <div class="customer-info">
            <h3>📋 Informations Client</h3>
            <strong>Nom:</strong> ${order.customer_name || 'N/A'}<br>
            <strong>Email:</strong> ${order.customer_email || 'N/A'}<br>
            <strong>Téléphone:</strong> ${order.customer_phone || 'N/A'}<br>
            <strong>Adresse:</strong> ${order.shipping_address || 'N/A'}<br>
            <strong>Ville:</strong> ${order.city || 'N/A'}<br>
            <strong>Code Postal:</strong> ${order.zip_code || 'N/A'}
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Article</th>
                    <th class="text-center">Qté</th>
                    <th class="text-right">Prix Unit.</th>
                    <th class="text-right">Sous-total</th>
                </tr>
            </thead>
            <tbody>
                ${orderItems.map(item => `
                    <tr>
                        <td>${item.product_name || 'Article inconnu'}</td>
                        <td class="text-center">${item.quantity}</td>
                        <td class="text-right">${formatMAD(item.product_price || 0)}</td>
                        <td class="text-right">${formatMAD(item.subtotal || 0)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="total-section">
            <div class="total-row">
                <span>Sous-total:</span>
                <span>${formatMAD(order.total_amount || 0)}</span>
            </div>
            <div class="total-row">
                <span>Frais de livraison:</span>
                <span>${formatMAD(0)}</span>
            </div>
            <div class="total-row">
                <span>Taxes:</span>
                <span>${formatMAD(0)}</span>
            </div>
            <div class="total-row total-final">
                <span>TOTAL:</span>
                <span>${formatMAD(order.total_amount || 0)}</span>
            </div>
        </div>

        <div class="footer">
            <p><strong>Merci pour votre commande !</strong></p>
            <p>Pour toute question, contactez-nous à contact@shop47.com</p>
            <p>shop47 - Votre partenaire technologique de confiance</p>
        </div>
    </body>
    </html>
    `;
}

/**
 * Mettre à jour les statistiques du dashboard
 */
function updateDashboardStats() {
    // Mettre à jour le nombre de catégories
    const totalCategoriesElement = document.getElementById('totalCategories');
    if (totalCategoriesElement) {
        totalCategoriesElement.textContent = categories.length;
    }
}

// ===== RECHERCHE ET FILTRAGE DES COMMANDES =====

// Variables globales pour la recherche des commandes
let allOrders = []; // Toutes les commandes chargées
let filteredOrders = []; // Commandes après filtrage
let orderSearchTimeout; // Pour le debounce de la recherche

/**
 * Charger les commandes avec support de recherche
 */
async function loadOrders() {
    try {
        // Ajouter l'indicateur de chargement
        const tableContainer = document.querySelector('.order-results-section');
        if (tableContainer) {
            tableContainer.classList.add('product-loading');
        }
        
        const response = await fetch('/api/orders?limit=1000');
        const data = await response.json();
        
        if (data.success) {
            allOrders = data.orders;
            // 🔥 FILTRER: Exclure les commandes livrées dès le chargement initial
            filteredOrders = allOrders.filter(order => order.status !== 'delivered');
            displayOrdersTable(filteredOrders);
            updateOrderCounts();
            
            // Charger aussi les commandes livrées
            loadDeliveredOrders();
            
            // Animation d'apparition des lignes
            setTimeout(() => {
                const rows = document.querySelectorAll('#ordersTable tbody tr');
                rows.forEach((row, index) => {
                    row.style.animation = `fadeInUp 0.3s ease-out ${index * 0.05}s both`;
                });
            }, 100);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showAlert('Erreur lors du chargement des commandes', 'danger');
    } finally {
        // Retirer l'indicateur de chargement
        const tableContainer = document.querySelector('.order-results-section');
        if (tableContainer) {
            tableContainer.classList.remove('product-loading');
        }
    }
}

// ===== GESTION DES COMMANDES LIVRÉES =====

/**
 * Charger les commandes livrées uniquement
 */
async function loadDeliveredOrders() {
    try {
        const response = await fetch('/api/admin/orders');
        const data = await response.json();
        
        if (data.success) {
            // Filtrer uniquement les commandes livrées
            const deliveredOrders = data.orders.filter(order => order.status === 'delivered');
            displayDeliveredOrdersTable(deliveredOrders);
            updateDeliveredOrdersCount(deliveredOrders.length);
        }
    } catch (error) {
        console.error('Error loading delivered orders:', error);
        showAlert('Erreur lors du chargement des commandes livrées', 'danger');
    }
}

/**
 * Afficher le tableau des commandes livrées
 */
function displayDeliveredOrdersTable(deliveredOrders) {
    const tbody = document.querySelector('#deliveredOrdersTable tbody');
    
    if (deliveredOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Aucune commande livrée</td></tr>';
        return;
    }
    
    // Local formatter to display DH
    const formatMAD = (value) => {
        const amount = Number(value) || 0;
        try {
            const formatted = new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
            return `${formatted} DH`;
        } catch (e) {
            return `${amount.toFixed(2)} DH`;
        }
    };

    tbody.innerHTML = deliveredOrders.map(order => `
        <tr>
            <td><strong>#${order.id}</strong></td>
            <td>
                <div>
                    <strong>${order.customer_name || 'N/A'}</strong>
                    ${order.customer_email ? `<br><small class="text-muted">${order.customer_email}</small>` : ''}
                </div>
            </td>
            <td>
                <strong class="text-success">${formatMAD(order.total_amount || 0)}</strong>
            </td>
            <td>
                <small>${new Date(order.created_at).toLocaleDateString()}</small>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="viewOrder(${order.id})" title="Voir détails">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="printOrder(${order.id})" title="Imprimer">
                        <i class="bi bi-printer"></i>
                    </button>
                </div>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteDeliveredOrder(${order.id})" title="Supprimer cette commande livrée">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Mettre à jour le compteur des commandes livrées
 */
function updateDeliveredOrdersCount(count) {
    const countElement = document.getElementById('deliveredOrdersCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

/**
 * Confirmer la suppression d'une commande livrée
 */
function confirmDeleteDeliveredOrder(orderId) {
    if (confirm('⚠️ ATTENTION !\n\nÊtes-vous sûr de vouloir supprimer définitivement cette commande livrée ?\n\nCette action est irréversible et supprimera :\n- La commande et tous ses détails\n- L\'historique de la commande\n- Les éléments associés\n\nConfirmer la suppression ?')) {
        deleteDeliveredOrder(orderId);
    }
}

/**
 * Supprimer une commande livrée
 */
async function deleteDeliveredOrder(orderId) {
    try {
        showAlert('Suppression en cours...', 'info');
        
        const response = await fetch(`/api/admin/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Commande supprimée avec succès', 'success');
            
            // Recharger les listes
            loadOrders(); // Recharge toutes les commandes
            loadDeliveredOrders(); // Recharge les commandes livrées
        } else {
            showAlert(data.message || 'Erreur lors de la suppression', 'danger');
        }
    } catch (error) {
        console.error('Error deleting delivered order:', error);
        showAlert('Erreur lors de la suppression de la commande', 'danger');
    }
}

/**
 * Rechercher des commandes avec debounce
 */
function searchOrders() {
    const searchInput = document.getElementById('orderSearchInput');
    
    // Ajouter l'indicateur de recherche
    searchInput.classList.add('searching');
    
    // Annuler la recherche précédente si elle existe
    if (orderSearchTimeout) {
        clearTimeout(orderSearchTimeout);
    }
    
    // Attendre 300ms avant de lancer la recherche
    orderSearchTimeout = setTimeout(() => {
        performOrderSearch();
        // Retirer l'indicateur de recherche
        searchInput.classList.remove('searching');
    }, 300);
}

/**
 * Effectuer la recherche des commandes
 */
function performOrderSearch() {
    const searchTerm = document.getElementById('orderSearchInput').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        // Si pas de recherche, appliquer seulement les filtres
        applyOrderFilters();
        return;
    }
    
    // Filtrer par terme de recherche
    const searchResults = allOrders.filter(order => {
        return (
            order.id.toString().includes(searchTerm) ||
            (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm)) ||
            (order.customer_email && order.customer_email.toLowerCase().includes(searchTerm)) ||
            (order.status && order.status.toLowerCase().includes(searchTerm))
        );
    });
    
    // Appliquer les autres filtres sur les résultats de recherche
    filteredOrders = applyOtherOrderFilters(searchResults);
    displayOrdersTable(filteredOrders);
    updateOrderCounts();
    updateOrderSearchInfo(searchTerm);
}

/**
 * Appliquer tous les filtres des commandes
 */
function applyOrderFilters() {
    const searchTerm = document.getElementById('orderSearchInput').value.toLowerCase().trim();
    
    // 🔥 COMMENCER AVEC LES COMMANDES NON-LIVRÉES SEULEMENT
    let baseOrders = allOrders.filter(order => order.status !== 'delivered');
    
    if (searchTerm !== '') {
        baseOrders = baseOrders.filter(order => {
            return (
                order.id.toString().includes(searchTerm) ||
                (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm)) ||
                (order.customer_email && order.customer_email.toLowerCase().includes(searchTerm)) ||
                (order.status && order.status.toLowerCase().includes(searchTerm))
            );
        });
    }
    
    // Appliquer les autres filtres
    filteredOrders = applyOtherOrderFilters(baseOrders);
    displayOrdersTable(filteredOrders);
    updateOrderCounts();
    updateOrderSearchInfo(searchTerm);
}

/**
 * Appliquer les filtres autres que la recherche textuelle des commandes
 */
function applyOtherOrderFilters(orders) {
    const statusFilter = document.getElementById('orderStatusFilter').value;
    const dateFilter = document.getElementById('orderDateFilter').value;
    
    return orders.filter(order => {
        // Filtre par statut
        if (statusFilter && order.status !== statusFilter) {
            return false;
        }
        
        // Filtre par date
        if (dateFilter) {
            const orderDate = new Date(order.created_at);
            const now = new Date();
            
            switch (dateFilter) {
                case 'today':
                    if (orderDate.toDateString() !== now.toDateString()) return false;
                    break;
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    if (orderDate < weekAgo) return false;
                    break;
                case 'month':
                    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                    if (orderDate < monthAgo) return false;
                    break;
                case 'year':
                    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                    if (orderDate < yearAgo) return false;
                    break;
            }
        }
        
        return true;
    });
}

/**
 * Filtrer les commandes
 */
function filterOrders() {
    applyOrderFilters();
}

/**
 * Effacer la recherche des commandes
 */
function clearOrderSearch() {
    document.getElementById('orderSearchInput').value = '';
    applyOrderFilters();
}

/**
 * Réinitialiser tous les filtres des commandes
 */
function resetOrderFilters() {
    document.getElementById('orderSearchInput').value = '';
    document.getElementById('orderStatusFilter').value = '';
    document.getElementById('orderDateFilter').value = '';
    
    // Filtrer les commandes pour exclure les livrées de la liste principale
    filteredOrders = allOrders.filter(order => order.status !== 'delivered');
    displayOrdersTable(filteredOrders);
    updateOrderCounts();
    updateOrderSearchInfo('');
}

/**
 * Mettre à jour les compteurs de commandes
 */
function updateOrderCounts() {
    // Compter seulement les commandes non-livrées pour la liste principale
    const nonDeliveredOrders = allOrders.filter(order => order.status !== 'delivered');
    
    document.getElementById('totalOrdersCount').textContent = nonDeliveredOrders.length;
    document.getElementById('visibleOrdersCount').textContent = filteredOrders.length;
}

/**
 * Mettre à jour les informations de recherche des commandes
 */
function updateOrderSearchInfo(searchTerm) {
    const infoElement = document.getElementById('orderSearchInfo');
    
    if (searchTerm) {
        const totalResults = filteredOrders.length;
        infoElement.innerHTML = `
            <i class="bi bi-search"></i> 
            <strong>${totalResults}</strong> commande(s) trouvée(s) pour "<strong>${searchTerm}</strong>"
            ${totalResults !== allOrders.length ? ` sur ${allOrders.length} total` : ''}
        `;
    } else if (filteredOrders.length !== allOrders.length) {
        infoElement.innerHTML = `
            <i class="bi bi-funnel"></i> 
            <strong>${filteredOrders.length}</strong> commande(s) affichée(s) sur ${allOrders.length} total (filtres appliqués)
        `;
    } else {
        infoElement.innerHTML = `
            <i class="bi bi-check-circle"></i> 
            Affichage de toutes les commandes (${allOrders.length})
        `;
    }
}

/**
 * Afficher le tableau des commandes (version améliorée)
 */
function displayOrdersTable(orders) {
    const tbody = document.querySelector('#ordersTable tbody');
    
    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-search fs-1"></i><br>
                    Aucune commande trouvée
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = orders.map(order => {
        // Déterminer la classe CSS pour le statut
        let statusClass = 'secondary';
        let statusIcon = 'bi-clock';
        
        switch (order.status) {
            case 'pending':
                statusClass = 'warning';
                statusIcon = 'bi-clock';
                break;
            case 'processing':
                statusClass = 'info';
                statusIcon = 'bi-gear';
                break;
            case 'shipped':
                statusClass = 'primary';
                statusIcon = 'bi-truck';
                break;
            case 'delivered':
                statusClass = 'success';
                statusIcon = 'bi-check-circle';
                break;
            case 'cancelled':
                statusClass = 'danger';
                statusIcon = 'bi-x-circle';
                break;
        }
        
        return `
            <tr>
                <td><strong>#${order.id}</strong></td>
                <td>
                    <div>
                        <strong>${order.customer_name || 'N/A'}</strong>
                        ${order.customer_email ? `<br><small class="text-muted">${order.customer_email}</small>` : ''}
                    </div>
                </td>
                <td>
                    <strong class="text-success">$${parseFloat(order.total_amount || 0).toFixed(2)}</strong>
                </td>
                <td>
                    <select class="order-status-select order-status-select-sm status-${order.status}" onchange="handleOrderStatusChange(${order.id}, this)">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>⏳ En attente</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>🔄 Traitement</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>🚚 Expédiée</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>✅ Livrée</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>❌ Annulée</option>
                    </select>
                </td>
                <td>
                    <small>${new Date(order.created_at).toLocaleDateString()}</small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="viewOrder(${order.id})" title="Voir">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-info" onclick="printOrder(${order.id})" title="Imprimer">
                            <i class="bi bi-printer"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Voir les détails d'une commande
 */
async function viewOrder(orderId) {
    try {
        console.log('Attempting to view order details for ID:', orderId);
        
        const response = await fetch(`/api/admin/orders/${orderId}/details`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                errorMessage += ` - ${response.statusText}`;
            }
            
            if (response.status === 401) {
                showAlert('Erreur d\'authentification: Vous devez être connecté en tant qu\'administrateur.', 'danger');
                // Rediriger vers la page de connexion admin si nécessaire
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                return;
            }
            
            showAlert('Erreur lors du chargement de la commande: ' + errorMessage, 'danger');
            return;
        }
        
        const data = await response.json();
        console.log('Order data received:', data);
        
        if (data.success && data.order) {
            // Combiner les données de commande avec les articles
            const orderWithItems = {
                ...data.order,
                items: data.items || []
            };
            showOrderDetailsModal(orderWithItems);
        } else {
            showAlert('Erreur lors du chargement de la commande: ' + (data.message || 'Données invalides'), 'danger');
        }
    } catch (error) {
        console.error('Error loading order:', error);
        showAlert('Erreur de connexion: Impossible de communiquer avec le serveur. Veuillez vérifier votre connexion.', 'danger');
    }
}

/**
 * Imprimer une commande
 */
async function printOrder(orderId) {
    try {
        console.log('🖨️ Impression de la commande:', orderId);
        
        // Afficher un indicateur de chargement
        showAlert('Préparation de l\'impression...', 'info');
        
        const response = await fetch(`/api/admin/orders/${orderId}/details`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📦 Données reçues:', data);
        
        if (data.success && data.order) {
            // Masquer l'indicateur de chargement
            hideAlert();
            
            // Combiner les données de commande avec les articles
            const orderWithItems = {
                ...data.order,
                items: data.items || []
            };
            
            console.log('📋 Commande avec articles:', orderWithItems);
            
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                showAlert('Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez que les pop-ups sont autorisés.', 'warning');
                return;
            }
            
            const htmlContent = generateOrderPrintHTML(orderWithItems);
            console.log('📄 HTML généré (premiers 500 caractères):', htmlContent.substring(0, 500));
            
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            
            // Attendre que le contenu soit chargé puis imprimer
            printWindow.onload = function() {
                setTimeout(() => {
                    printWindow.print();
                    // Fermer la fenêtre après un délai pour laisser le temps à l'impression
                    setTimeout(() => {
                        printWindow.close();
                    }, 1000);
                }, 500);
            };
            
            // Fallback si onload ne fonctionne pas
            setTimeout(() => {
                if (printWindow && !printWindow.closed) {
                    printWindow.print();
                }
            }, 2000);
            
        } else {
            showAlert('Erreur lors du chargement de la commande: ' + (data.message || 'Commande introuvable'), 'danger');
        }
    } catch (error) {
        console.error('Error printing order:', error);
        showAlert('Erreur lors de l\'impression de la commande: ' + error.message, 'danger');
    }
}

/**
 * Afficher le modal des détails de commande
 */
function showOrderDetailsModal(order) {
    // Créer le modal s'il n'existe pas
    let modal = document.getElementById('orderDetailsModal');
    if (!modal) {
        modal = createOrderDetailsModal();
        document.body.appendChild(modal);
    }
    
    // Remplir le contenu du modal
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = generateOrderDetailsHTML(order);
    
    // Afficher le modal
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

/**
 * Créer le modal des détails de commande
 */
function createOrderDetailsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'orderDetailsModal';
    modal.tabIndex = -1;
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">
                        <i class="bi bi-receipt"></i> Détails de la Commande
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <!-- Le contenu sera injecté ici -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-primary" onclick="printCurrentOrder()">
                        <i class="bi bi-printer"></i> Imprimer
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                </div>
            </div>
        </div>
    `;
    return modal;
}

/**
 * Générer le HTML des détails de commande pour le modal
 */
function generateOrderDetailsHTML(order) {
    const statusClass = getOrderStatusClass(order.status);
    const statusIcon = getOrderStatusIcon(order.status);
    
    // Local MAD currency formatter for modal (DH suffix)
    const formatMAD = (value) => {
        const amount = Number(value) || 0;
        try {
            const formatted = new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
            return `${formatted} DH`;
        } catch (e) {
            return `${amount.toFixed(2)} DH`;
        }
    };
    
    return `
        <div class="order-details">
            <!-- En-tête de la commande -->
            <div class="row mb-4">
                <div class="col-md-6">
                    <h4 class="text-primary">Commande #${order.id}</h4>
                    <p class="text-muted mb-1">
                        <i class="bi bi-calendar"></i> 
                        Créée le ${new Date(order.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                    <span class="badge bg-${statusClass} fs-6">
                        <i class="${statusIcon}"></i> ${order.status || 'N/A'}
                    </span>
                </div>
                <div class="col-md-6 text-md-end">
                    <h5 class="text-success mb-0">
                        Total: ${formatMAD(order.total_amount || 0)}
                    </h5>
                    <div class="mt-2">
                        <span class="badge bg-info">${order.total_items_quantity || 0} article(s)</span>
                    </div>
                </div>
            </div>
            
            <!-- Informations client -->
            <div class="card mb-4">
                <div class="card-header">
                    <h6 class="mb-0">
                        <i class="bi bi-person"></i> Informations Client
                    </h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <strong>Nom:</strong> ${order.customer_name || 'N/A'}<br>
                            <strong>Email:</strong> ${order.customer_email || 'N/A'}<br>
                            <strong>Téléphone:</strong> ${order.customer_phone || 'N/A'}
                        </div>
                        <div class="col-md-6">
                            <strong>Adresse de livraison:</strong><br>
                            ${order.shipping_address || 'N/A'}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Articles commandés -->
            <div class="card">
                <div class="card-header">
                    <h6 class="mb-0">
                        <i class="bi bi-box"></i> Articles Commandés
                    </h6>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Produit</th>
                                    <th>Prix unitaire</th>
                                    <th>Quantité</th>
                                    <th class="text-end" style="background-color: white; color: black;">Sous-total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(order.items || []).map(item => `
                                    <tr>
                                        <td>
                                            <strong>${item.product_name || 'N/A'}</strong>
                                            ${item.product_description ? `<br><small class="text-muted">${item.product_description}</small>` : ''}
                                        </td>
                                        <td>${formatMAD(item.price || 0)}</td>
                                        <td>
                                            <span class="badge bg-secondary">${item.quantity || 0}</span>
                                        </td>
                                        <td class="text-end">
                                            <strong>${formatMAD(item.subtotal || 0)}</strong>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr class="table-active">
                                    <th colspan="3">Total</th>
                                    <th class="text-end" style="background-color: white; color: black;">
                                        <h5 class="text-success mb-0" style="color: white;">
                                            ${formatMAD(order.total_amount || 0)}
                                        </h5>
                                    </th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Générer le HTML pour l'impression de commande
 */
function generateOrderPrintHTML(order) {
    const statusClass = getOrderStatusClass(order.status);
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Commande #${order.id} - NeoSafi Store</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    color: #333;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #007bff;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .company-name {
                    font-size: 24px;
                    font-weight: bold;
                    color: #007bff;
                    margin-bottom: 5px;
                }
                .order-title {
                    font-size: 20px;
                    margin: 10px 0;
                }
                .info-section {
                    margin-bottom: 20px;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }
                .customer-info {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: left;
                }
                th {
                    background-color: #f8f9fa;
                    font-weight: bold;
                }
                .text-right {
                    text-align: right;
                }
                .total-section {
                    border-top: 2px solid #007bff;
                    padding-top: 15px;
                    margin-top: 20px;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                .total-final {
                    font-weight: bold;
                    font-size: 18px;
                    color: #007bff;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                    margin-top: 10px;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    color: #666;
                }
                .status-badge {
                    display: inline-block;
                    padding: 5px 10px;
                    border-radius: 15px;
                    font-size: 12px;
                    font-weight: bold;
                    color: white;
                    background-color: #6c757d;
                }
                .status-${statusClass} {
                    background-color: ${getStatusColor(statusClass)};
                }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-name">🛍️ shop47</div>
                <div class="order-title">Facture - Commande #${order.id}</div>
                <div>
                    <span class="status-badge status-${statusClass}">
                        ${order.status || 'N/A'}
                    </span>
                </div>
            </div>

            <div class="info-section">
                <div class="info-row">
                    <div><strong>Date de commande:</strong> ${new Date(order.created_at).toLocaleDateString('fr-FR')}</div>
                    <div><strong>Heure:</strong> ${new Date(order.created_at).toLocaleTimeString('fr-FR')}</div>
                </div>
            </div>

            <div class="customer-info">
                <h3>Informations Client</h3>
                <div class="info-row">
                    <div><strong>Nom:</strong> ${order.customer_name || 'N/A'}</div>
                    <div><strong>Email:</strong> ${order.customer_email || 'N/A'}</div>
                </div>
                <div class="info-row">
                    <div><strong>Téléphone:</strong> ${order.customer_phone || 'N/A'}</div>
                </div>
                ${order.shipping_address ? `
                <div style="margin-top: 10px;">
                    <strong>Adresse de livraison:</strong><br>
                    ${order.shipping_address}
                </div>
                ` : ''}
            </div>

            <h3>Détail de la commande</h3>
            <table>
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th>Prix unitaire</th>
                        <th>Quantité</th>
                        <th class="text-right">Sous-total</th>
                    </tr>
                </thead>
                <tbody>
                    ${(order.items || []).map(item => `
                        <tr>
                            <td>
                                <strong>${item.product_name || 'N/A'}</strong>
                                ${item.product_description ? `<br><small>${item.product_description}</small>` : ''}
                            </td>
                            <td>${formatMAD(item.price || 0)}</td>
                            <td>${item.quantity || 0}</td>
                            <td class="text-right">${formatMAD(item.subtotal || 0)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="total-section">
                <div class="total-row">
                    <span>Sous-total:</span>
                    <span>${formatMAD(order.total_amount || 0)}</span>
                </div>
                <div class="total-row">
                    <span>Frais de livraison:</span>
                    <span>${formatMAD(0)}</span>
                </div>
                <div class="total-row">
                    <span>Taxes:</span>
                    <span>${formatMAD(0)}</span>
                </div>
                <div class="total-row total-final">
                    <span>TOTAL:</span>
                    <span>${formatMAD(order.total_amount || 0)}</span>
                </div>
            </div>

            <div class="footer">
                <p><strong>Merci pour votre commande !</strong></p>
                <p>Pour toute question, contactez-nous à contact@neosafistore.com</p>
                <p>NeoSafi Store - Votre partenaire technologique de confiance</p>
            </div>
        </body>
        </html>
    `;
}

/**
 * Imprimer la commande actuellement affichée dans le modal
 */
function printCurrentOrder() {
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
        const orderIdElement = modal.querySelector('.text-primary');
        if (orderIdElement) {
            const orderIdText = orderIdElement.textContent;
            const orderId = orderIdText.replace('Commande #', '');
            printOrder(parseInt(orderId));
        }
    }
}

/**
 * Obtenir la classe CSS pour le statut de commande
 */
function getOrderStatusClass(status) {
    switch (status) {
        case 'pending': return 'warning';
        case 'processing': return 'info';
        case 'shipped': return 'primary';
        case 'delivered': return 'success';
        case 'cancelled': return 'danger';
        default: return 'secondary';
    }
}

/**
 * Obtenir l'icône pour le statut de commande
 */
function getOrderStatusIcon(status) {
    switch (status) {
        case 'pending': return 'bi-clock';
        case 'processing': return 'bi-gear';
        case 'shipped': return 'bi-truck';
        case 'delivered': return 'bi-check-circle';
        case 'cancelled': return 'bi-x-circle';
        default: return 'bi-question-circle';
    }
}

/**
 * Obtenir la couleur pour le statut (pour l'impression)
 */
function getStatusColor(statusClass) {
    switch (statusClass) {
        case 'warning': return '#ffc107';
        case 'info': return '#17a2b8';
        case 'primary': return '#007bff';
        case 'success': return '#28a745';
        case 'danger': return '#dc3545';
        default: return '#6c757d';
    }
}

// ===== RECHERCHE ET FILTRAGE DES LIENS D'ACCÈS =====

// Variables globales pour la recherche des liens
let allLinks = []; // Tous les liens chargés
let filteredLinks = []; // Liens après filtrage
let linkSearchTimeout; // Pour le debounce de la recherche

// Fonction refreshAccessLinks dupliquée supprimée - utilise celle de la ligne 1931

/**
 * Rechercher des liens avec debounce
 */
function searchLinks() {
    const searchInput = document.getElementById('linkSearchInput');
    
    // Ajouter l'indicateur de recherche
    searchInput.classList.add('searching');
    
    // Annuler la recherche précédente si elle existe
    if (linkSearchTimeout) {
        clearTimeout(linkSearchTimeout);
    }
    
    // Attendre 300ms avant de lancer la recherche
    linkSearchTimeout = setTimeout(() => {
        performLinkSearch();
        // Retirer l'indicateur de recherche
        searchInput.classList.remove('searching');
    }, 300);
}

/**
 * Effectuer la recherche des liens
 */
function performLinkSearch() {
    const searchTerm = document.getElementById('linkSearchInput').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        // Si pas de recherche, appliquer seulement les filtres
        applyLinkFilters();
        return;
    }
    
    // Filtrer par terme de recherche
    const searchResults = allLinks.filter(link => {
        return (
            link.token.toLowerCase().includes(searchTerm) ||
            (link.description && link.description.toLowerCase().includes(searchTerm)) ||
            (link.created_by && link.created_by.toLowerCase().includes(searchTerm)) ||
            (link.status && link.status.toLowerCase().includes(searchTerm))
        );
    });
    
    // Appliquer les autres filtres sur les résultats de recherche
    filteredLinks = applyOtherLinkFilters(searchResults);
    displayLinksTable(filteredLinks);
    updateLinkCounts();
    updateLinkSearchInfo(searchTerm);
}

/**
 * Appliquer tous les filtres des liens
 */
function applyLinkFilters() {
    const searchTerm = document.getElementById('linkSearchInput').value.toLowerCase().trim();
    
    // Commencer avec tous les liens ou les résultats de recherche
    let baseLinks = allLinks;
    
    if (searchTerm !== '') {
        baseLinks = allLinks.filter(link => {
            return (
                link.token.toLowerCase().includes(searchTerm) ||
                (link.description && link.description.toLowerCase().includes(searchTerm)) ||
                (link.created_by && link.created_by.toLowerCase().includes(searchTerm)) ||
                (link.status && link.status.toLowerCase().includes(searchTerm))
            );
        });
    }
    
    // Appliquer les autres filtres
    filteredLinks = applyOtherLinkFilters(baseLinks);
    displayLinksTable(filteredLinks);
    updateLinkCounts();
    updateLinkSearchInfo(searchTerm);
}

/**
 * Appliquer les filtres autres que la recherche textuelle des liens
 */
function applyOtherLinkFilters(links) {
    const statusFilter = document.getElementById('linkStatusFilter').value;
    const dateFilter = document.getElementById('linkDateFilter').value;
    
    return links.filter(link => {
        // Filtre par statut
        if (statusFilter && link.status !== statusFilter) {
            return false;
        }
        
        // Filtre par date
        if (dateFilter) {
            const linkDate = new Date(link.created_at);
            const now = new Date();
            
            switch (dateFilter) {
                case 'today':
                    if (linkDate.toDateString() !== now.toDateString()) return false;
                    break;
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    if (linkDate < weekAgo) return false;
                    break;
                case 'month':
                    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                    if (linkDate < monthAgo) return false;
                    break;
                case 'year':
                    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                    if (linkDate < yearAgo) return false;
                    break;
            }
        }
        
        return true;
    });
}

/**
 * Filtrer les liens
 */
function filterLinks() {
    applyLinkFilters();
}

/**
 * Effacer la recherche des liens
 */
function clearLinkSearch() {
    document.getElementById('linkSearchInput').value = '';
    applyLinkFilters();
}

/**
 * Réinitialiser tous les filtres des liens
 */
function resetLinkFilters() {
    document.getElementById('linkSearchInput').value = '';
    document.getElementById('linkStatusFilter').value = '';
    document.getElementById('linkDateFilter').value = '';
    
    filteredLinks = [...allLinks];
    displayLinksTable(filteredLinks);
    updateLinkCounts();
    updateLinkSearchInfo('');
}

/**
 * Mettre à jour les compteurs de liens
 */
function updateLinkCounts() {
    document.getElementById('totalLinksCount').textContent = allLinks.length;
    document.getElementById('visibleLinksCount').textContent = filteredLinks.length;
}

/**
 * Mettre à jour les informations de recherche des liens
 */
function updateLinkSearchInfo(searchTerm) {
    const infoElement = document.getElementById('linkSearchInfo');
    
    if (searchTerm) {
        const totalResults = filteredLinks.length;
        infoElement.innerHTML = `
            <i class="bi bi-search"></i> 
            <strong>${totalResults}</strong> lien(s) trouvé(s) pour "<strong>${searchTerm}</strong>"
            ${totalResults !== allLinks.length ? ` sur ${allLinks.length} total` : ''}
        `;
    } else if (filteredLinks.length !== allLinks.length) {
        infoElement.innerHTML = `
            <i class="bi bi-funnel"></i> 
            <strong>${filteredLinks.length}</strong> lien(s) affiché(s) sur ${allLinks.length} total (filtres appliqués)
        `;
    } else {
        infoElement.innerHTML = `
            <i class="bi bi-check-circle"></i> 
            Affichage de tous les liens (${allLinks.length})
        `;
    }
}

/**
 * Afficher le tableau des liens (version améliorée)
 */
function displayLinksTable(links) {
    const tbody = document.querySelector('#accessLinksTable tbody');
    
    if (links.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center text-muted py-4">
                    <i class="bi bi-search fs-1"></i><br>
                    Aucun lien trouvé
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = links.map(link => {
        // Déterminer la classe CSS pour le statut
        let statusClass = 'secondary';
        let statusIcon = 'bi-question-circle';
        
        switch (link.status) {
            case 'active':
                statusClass = 'success';
                statusIcon = 'bi-check-circle';
                break;
            case 'used':
                statusClass = 'primary';
                statusIcon = 'bi-check2-circle';
                break;
            case 'expired':
                statusClass = 'warning';
                statusIcon = 'bi-clock';
                break;
            case 'revoked':
                statusClass = 'danger';
                statusIcon = 'bi-x-circle';
                break;
        }
        
        return `
            <tr>
                <td><strong>#${link.id}</strong></td>
                <td>
                    <code class="text-primary">${link.token.substring(0, 8)}...</code>
                </td>
                <td>
                    <span class="text-muted">${link.description || 'N/A'}</span>
                </td>
                <td>
                    <span class="badge bg-${statusClass}">
                        <i class="${statusIcon}"></i> ${link.status || 'N/A'}
                    </span>
                </td>
                <td>
                    <small>${link.created_by || 'N/A'}</small>
                </td>
                <td>
                    <small>${new Date(link.created_at).toLocaleDateString()}</small>
                </td>
                <td>
                    <small>${link.expires_at ? new Date(link.expires_at).toLocaleDateString() : 'N/A'}</small>
                </td>
                <td>
                    <small>${link.used_at ? new Date(link.used_at).toLocaleDateString() : 'N/A'}</small>
                </td>
                <td>
                    <span class="badge bg-info">${link.access_count || 0}</span>
                </td>
                <td>
                    <small>${link.device_info || 'N/A'}</small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="copyLinkToClipboard('${link.token}')" title="Copier">
                            <i class="bi bi-clipboard"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="revokeAccessLink('${link.token}')" title="Révoquer">
                            <i class="bi bi-x-circle"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Mise à jour des raccourcis clavier pour inclure les nouvelles pages
document.addEventListener('keydown', function(event) {
    // Ctrl+F pour focus sur la recherche selon la page active
    if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        
        if (currentAdminPage === 'products') {
            const searchInput = document.getElementById('productSearchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        } else if (currentAdminPage === 'orders') {
            const searchInput = document.getElementById('orderSearchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        } else if (currentAdminPage === 'access-links') {
            const searchInput = document.getElementById('linkSearchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    }
    
    // Échap pour effacer la recherche selon la page active
    if (event.key === 'Escape') {
        if (currentAdminPage === 'products') {
            const searchInput = document.getElementById('productSearchInput');
            if (searchInput && searchInput.value) {
                clearProductSearch();
            }
        } else if (currentAdminPage === 'orders') {
            const searchInput = document.getElementById('orderSearchInput');
            if (searchInput && searchInput.value) {
                clearOrderSearch();
            }
        } else if (currentAdminPage === 'access-links') {
            const searchInput = document.getElementById('linkSearchInput');
            if (searchInput && searchInput.value) {
                clearLinkSearch();
            }
        }
    }
});