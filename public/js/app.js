/**
 * NeoSafi Store - Main Application JavaScript
 * Handles frontend functionality for the e-commerce store
 */

// Global state
let currentUser = null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentPage = 'home';
let currentProduct = null;
let products = [];
let categories = [];
let currentFilters = {
    search: '',
    category_id: '',
    minPrice: '',
    maxPrice: '',
    page: 1,
    limit: 12,
    sort: 'created_at'
};

// Currency formatting helper (display with DH suffix)
function formatMAD(value) {
    const amount = Number(value) || 0;
    try {
        const formatted = new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
        return `${formatted} DH`;
    } catch (e) {
        return `${amount.toFixed(2)} DH`;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
    // Initialize search functionality
    setTimeout(() => {
        initializeSearch();
    }, 100);
});

/**
 * Initialize the application
 */
async function initializeApp() {
    try {
        // Check if user is logged in
        // Authentication removed - no need to check auth status
        
        // Load initial data
        await loadCategories();
        
        // Initialize modern animations and effects
        initializeAnimations();
        initializeScrollEffects();
        initializeCounters();
        
        // Initialize AOS animations
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                offset: 100
            });
        }
        
        // Update cart display
        updateCartDisplay();
        
        // Initialize floating cart
        initializeFloatingCart();
        
        // Set up event listeners
        setupEventListeners();
        
        // Show home page
        showPage('home');

        // Ensure bootstrap dropdowns are initialized for navbar
        try {
            const toggles = document.querySelectorAll('#navbarNav .dropdown-toggle');
            if (window.bootstrap?.Dropdown && toggles.length) {
                toggles.forEach(t => new window.bootstrap.Dropdown(t));
            }
        } catch {}
        
        console.log('shop47 Store initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        showAlert('Error loading application. Please refresh the page.', 'danger');
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Checkout form
    document.getElementById('checkoutForm').addEventListener('submit', handleCheckout);
    
    // Search input with debounce
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentFilters.search = this.value;
                currentFilters.page = 1;
                if (currentPage === 'catalog') {
                    loadProducts();
                }
            }, 500);
        });
    }
}







/**
 * Load categories
 */
async function loadCategories() {
    try {
        console.log('🔄 Chargement des catégories...');
        const response = await fetch('/api/categories');
        const data = await response.json();
        
        console.log('📊 Réponse API catégories:', data);
        
        if (data.success) {
            categories = data.categories;
            console.log('✅ Catégories chargées:', categories.length);
            updateCategoriesDisplay();
        } else {
            console.error('❌ Erreur API catégories:', data.message);
        }
    } catch (error) {
        console.error('❌ Erreur lors du chargement des catégories:', error);
    }
}

/**
 * Update categories display
 */
function updateCategoriesDisplay() {
    console.log('🔄 Mise à jour de l\'affichage des catégories...', categories);
    
    // Update dropdown menu avec icônes
    const dropdown = document.getElementById('categoriesDropdown');
    if (!dropdown) {
        console.error('❌ Élément categoriesDropdown non trouvé');
        return;
    }
    
    console.log('✅ Élément dropdown trouvé, mise à jour avec', categories.length, 'catégories');
    
    dropdown.innerHTML = `
        <li><a class="dropdown-item" href="#" onclick="return showAllProducts()">
            <i class="bi bi-grid" style="font-size: 1.2rem; margin-right: 0.5rem; color: #1ee98a;"></i>
            Tous les produits
        </a></li>
        <li><hr class="dropdown-divider"></li>
    ` + categories.map(category => 
        `<li><a class="dropdown-item" href="#" onclick="return filterByCategory(${category.id}, '${category.name}')">
            <i class="${category.icon}" style="font-size: 1.2rem; margin-right: 0.5rem; color: #1ee98a;"></i>
            ${category.name}
        </a></li>`
    ).join('');
    
    console.log('✅ Dropdown mis à jour avec succès');
    
    // Update filter select
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="">Toutes les catégories</option>' +
            categories.map(category => 
                `<option value="${category.id}">${category.name}</option>`
            ).join('');
    }
    
    // Update categories grid on home page avec design moderne
    const categoriesGrid = document.getElementById('categoriesGrid');
    if (categoriesGrid) {
        categoriesGrid.className = 'categories-grid-modern';
        categoriesGrid.innerHTML = categories.map((category, index) => `
            <div class="category-card-container" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="category-card-modern" data-category="${category.name}" onclick="filterByCategory(${category.id}, '${category.name}')">
                    ${category.image ? `
                    <!-- Category Image -->
                    <div class="category-image">
                        <img src="${category.image}" alt="${category.name}" loading="lazy">
                        <div class="category-overlay">
                            <div class="category-icon" title="${category.name}">
                                <i class="${category.icon}"></i>
                            </div>
                        </div>
                    </div>
                    ` : `
                    <!-- Category Header (sans image) -->
                    <div class="category-header">
                        <div class="category-icon" title="${category.name}">
                            <i class="${category.icon}"></i>
                        </div>
                        <div class="category-count-badge">
                            <span>${Math.floor(Math.random() * 50) + 10}</span> items
                        </div>
                    </div>
                    `}
                    
                    <!-- Category Content -->
                    <div class="category-content">
                        <h3 class="category-title">${category.name}</h3>
                        <p class="category-description">${category.description || 'Découvrez notre sélection de produits électroniques de qualité'}</p>
                        
                        <!-- Category Stats -->
                        <div class="category-stats">
                            <div class="stat-item" title="Note moyenne">
                                <i class="bi bi-star-fill"></i>
                                <span>4.${Math.floor(Math.random() * 9) + 1}</span>
                            </div>
                            <div class="stat-item" title="Produits populaires">
                                <i class="bi bi-heart-fill"></i>
                                <span>${Math.floor(Math.random() * 100) + 50}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Category Action -->
                    <div class="category-action">
                        <div class="action-text">
                            <span>Explorer</span>
                            <i class="bi bi-arrow-right"></i>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Initialize AOS animations if available
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }
}

/**
 * Get icon for category
 */
function getCategoryIcon(categoryName) {
    const icons = {
        // Catégories Électroniques Principales
        'Electronics': 'cpu',
        'Smartphones': 'phone',
        'Ordinateurs': 'laptop',
        'Tablettes': 'tablet',
        'Audio & Vidéo': 'headphones',
        'Gaming': 'controller',
        'TV & Écrans': 'tv',
        'Appareils Photo': 'camera',
        'Maison Connectée': 'house-gear',
        'Accessoires Tech': 'usb-symbol',
        'Électroménager': 'lightning-charge',
        'Wearables & Fitness': 'smartwatch',
        
        // Sous-catégories Spécialisées
        'iPhone': 'phone',
        'Samsung': 'phone-vibrate',
        'MacBook': 'laptop',
        'PC Gaming': 'pc-display-horizontal',
        'Casques Audio': 'headphones',
        'Écouteurs': 'earbuds',
        'PlayStation': 'controller',
        'Xbox': 'xbox',
        'Nintendo': 'nintendo-switch',
        'Smart TV': 'tv',
        'Moniteurs': 'display',
        'Projecteurs': 'projector',
        'Caméras': 'camera',
        'Drones': 'airplane',
        'Alexa': 'house-gear',
        'Google Home': 'google',
        'Chargeurs': 'battery-charging',
        'Câbles': 'usb-c',
        'Claviers': 'keyboard',
        'Souris': 'mouse',
        'Imprimantes': 'printer',
        'Stockage': 'device-hdd',
        'Réseaux': 'router',
        'Sécurité': 'shield-check',
        
        // Catégories Générales (fallback)
        'Clothing': 'bag-heart',
        'Books': 'book',
        'Home & Garden': 'house-heart',
        'Sports': 'trophy',
        'Beauty': 'palette',
        'Automotive': 'car-front',
        'Tools': 'tools',
        'Toys': 'puzzle'
    };
    return icons[categoryName] || 'cpu-fill';
}

/**
 * Filter products by category
 */
function filterByCategory(categoryId, categoryName) {
    // Mettre à jour les filtres
    currentFilters.category_id = categoryId;
    currentFilters.category = categoryName; // Pour l'affichage
    currentFilters.page = 1;

    // Fermer le dropdown du navbar si ouvert (Bootstrap 5)
    try {
        const openDropdown = document.querySelector('#navbarNav .dropdown.show .dropdown-toggle');
        if (openDropdown && window.bootstrap?.Dropdown) {
            const instance = window.bootstrap.Dropdown.getInstance(openDropdown) || new window.bootstrap.Dropdown(openDropdown);
            instance.hide();
        }
    } catch (e) {
        // Pas bloquant
        console.debug('Dropdown close skipped:', e?.message || e);
    }

    // Afficher le catalogue
    showPage('catalog');

    // Scroll en haut pour visibilité
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
    
    // Synchroniser le select de catégorie dans la sidebar
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = categoryId;
    }
    
    // Mettre à jour le titre de la page catalogue
    updateCatalogTitle(categoryName);

    // Debug rapide
    console.log('🔎 filterByCategory ->', { categoryId, categoryName, currentFilters });

    // Empêcher le comportement par défaut de l'ancre
    return false;
}

/**
 * Show all products (clear category filter)
 */
function showAllProducts() {
    currentFilters.category_id = '';
    currentFilters.category = '';
    currentFilters.page = 1;

    // Fermer le dropdown si ouvert
    try {
        const openDropdown = document.querySelector('#navbarNav .dropdown.show .dropdown-toggle');
        if (openDropdown && window.bootstrap?.Dropdown) {
            const instance = window.bootstrap.Dropdown.getInstance(openDropdown) || new window.bootstrap.Dropdown(openDropdown);
            instance.hide();
        }
    } catch {}

    showPage('catalog');
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
    
    // Synchroniser le select de catégorie dans la sidebar
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = '';
    }
    
    updateCatalogTitle(null);
    console.log('🔎 showAllProducts ->', { currentFilters });

    // Empêcher le comportement par défaut de l'ancre
    return false;
}

/**
 * Update catalog page title and category filter indicator
 */
function updateCatalogTitle(categoryName) {
    const catalogTitle = document.querySelector('#catalogPage h2');
    const categoryFilterHeader = document.getElementById('categoryFilterHeader');
    const categoryFilterInfo = document.querySelector('.category-filter-info');
    
    if (catalogTitle) {
        if (categoryName) {
            const category = categories.find(c => c.name === categoryName);
            const icon = category ? `<i class="${category.icon}" style="margin-right: 0.5rem; color: #1ee98a;"></i>` : '';
            catalogTitle.innerHTML = `${icon}Produits - ${categoryName}`;
            
            // Afficher l'indicateur de filtre de catégorie
            if (categoryFilterHeader && categoryFilterInfo) {
                categoryFilterInfo.innerHTML = `Catégorie: ${icon}${categoryName}`;
                categoryFilterHeader.style.display = 'block';
            }
        } else {
            catalogTitle.innerHTML = 'Tous les Produits';
            
            // Masquer l'indicateur de filtre de catégorie
            if (categoryFilterHeader) {
                categoryFilterHeader.style.display = 'none';
            }
        }
    }
}

/**
 * Load products with filters
 */
async function loadProducts() {
    try {
        const params = new URLSearchParams();
        Object.keys(currentFilters).forEach(key => {
            if (currentFilters[key]) {
                params.append(key, currentFilters[key]);
            }
        });
        
        const url = `/api/products?${params}`;
        console.log('Loading products from:', url, 'with filters:', JSON.parse(JSON.stringify(currentFilters)));
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('Products response:', { ok: data.success, count: data?.products?.length, pagination: data?.pagination });
        
        if (data.success) {
            products = data.products;
            displayProducts(data.products);
            displayPagination(data.pagination);
            updateProductsCount(data.pagination.total);
            
            // Update search results info
            const searchResultsHeader = document.getElementById('searchResultsHeader');
            const searchInfo = document.querySelector('.search-results-info');
            
            if (currentFilters.search) {
                if (searchResultsHeader) {
                    searchResultsHeader.style.display = 'block';
                }
                if (searchInfo) {
                    searchInfo.textContent = `${data.pagination.total} résultat(s) pour "${currentFilters.search}"`;
                }
            } else {
                if (searchResultsHeader) {
                    searchResultsHeader.style.display = 'none';
                }
            }
        } else {
            console.error('API returned error:', data.message);
            showAlert(data.message || 'Erreur lors du chargement des produits', 'danger');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showAlert('Erreur de connexion. Veuillez réessayer.', 'danger');
        
        // Show error in products grid
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-exclamation-triangle fs-1 text-danger"></i>
                    <h4 class="text-danger mt-3">Erreur de chargement</h4>
                    <p class="text-muted">Impossible de charger les produits. Veuillez réessayer.</p>
                    <button class="btn btn-primary" onclick="loadProducts()">
                        <i class="bi bi-arrow-clockwise"></i> Réessayer
                    </button>
                </div>
            `;
        }
    }
}

/**
 * Display products
 */
function displayProducts(products) {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    if (products.length === 0) {
        const isSearch = currentFilters.search;
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-search fs-1 text-muted"></i>
                <h4 class="text-muted mt-3">
                    ${isSearch ? `Aucun résultat pour "${currentFilters.search}"` : 'Aucun produit trouvé'}
                </h4>
                <p class="text-muted">
                    ${isSearch ? 'Essayez avec d\'autres mots-clés ou vérifiez l\'orthographe' : 'Essayez d\'ajuster vos filtres'}
                </p>
                ${isSearch ? `
                    <button class="btn btn-outline-primary mt-3" onclick="clearSearchAndShowAll()">
                        <i class="bi bi-grid"></i> Voir tous les produits
                    </button>
                ` : ''}
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card product-card h-100 card-hover-advanced" onclick="showProductDetail(${product.id})">
                <img src="${product.primary_image || product.image || '/images/placeholder.svg'}" class="card-img-top product-image" alt="${product.name}">
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title">${product.name}</h6>
                    <p class="text-muted small">${product.category_name}</p>
                    <p class="card-text text-truncate-2 small">${product.description}</p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="h5 text-primary mb-0">${formatMAD(product.price)}</span>
                            <span class="badge bg-success">${product.stock} en stock</span>
                        </div>
                        <button class="btn btn-primary btn-sm w-100" onclick="event.stopPropagation(); quickAddToCart(${product.id})">
                            <i class="bi bi-cart-plus"></i> Ajouter au panier
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Display pagination
 */
function displayPagination(pagination) {
    const container = document.getElementById('pagination');
    if (!container) return;
    
    const { page, pages, total } = pagination;
    
    if (pages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${page === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${page - 1})">Previous</a>
        </li>
    `;
    
    // Page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(pages, page + 2);
    
    if (startPage > 1) {
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(1)">1</a></li>`;
        if (startPage > 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === page ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }
    
    if (endPage < pages) {
        if (endPage < pages - 1) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${pages})">${pages}</a></li>`;
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${page === pages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${page + 1})">Next</a>
        </li>
    `;
    
    container.innerHTML = paginationHTML;
}

/**
 * Change page
 */
function changePage(page) {
    currentFilters.page = page;
    loadProducts();
    window.scrollTo(0, 0);
}

/**
 * Update products count display
 */
function updateProductsCount(count) {
    const element = document.getElementById('productsCount');
    if (element) {
        element.textContent = count;
    }
}

/**
 * Apply filters
 */
function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    const sortBy = document.getElementById('sortBy');
    
    currentFilters.search = searchInput?.value || '';
    currentFilters.category_id = categoryFilter?.value || '';
    currentFilters.minPrice = minPrice?.value || '';
    currentFilters.maxPrice = maxPrice?.value || '';
    currentFilters.sort = sortBy?.value || 'created_at';
    currentFilters.page = 1;
    
    // Mettre à jour le titre si une catégorie est sélectionnée
    if (currentFilters.category_id) {
        const selectedCategory = categories.find(c => c.id == currentFilters.category_id);
        if (selectedCategory) {
            updateCatalogTitle(selectedCategory.name);
        }
    } else {
        updateCatalogTitle(null);
    }
    
    loadProducts();
}

/**
 * Clear filters
 */
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('sortBy').value = 'created_at';
    
    currentFilters = {
        search: '',
        category_id: '',
        minPrice: '',
        maxPrice: '',
        page: 1,
        limit: 12,
        sort: 'created_at'
    };
    
    // Réinitialiser le titre
    updateCatalogTitle(null);
    
    loadProducts();
}

/**
 * Show product detail
 */
async function showProductDetail(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();
        
        if (data.success) {
            currentProduct = data.product;
            displayProductDetail(data.product);
            showPage('product');
        } else {
            showAlert('Product not found', 'danger');
        }
    } catch (error) {
        console.error('Error loading product:', error);
        showAlert('Error loading product', 'danger');
    }
}

/**
 * Display product detail
 */
function displayProductDetail(product) {
    // Set product info
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productCategory').textContent = product.category_name;
    document.getElementById('productPrice').textContent = formatMAD(product.price);
    
    // Update stock display with better styling
    const stockElement = document.getElementById('productStock');
    const availableStockElement = document.getElementById('availableStock');
    
    if (product.stock > 0) {
        if (product.stock <= 5) {
            stockElement.className = 'badge bg-warning';
            stockElement.innerHTML = `<i class=\"bi bi-exclamation-triangle\"></i> Stock faible: ${product.stock}`;
        } else {
            stockElement.className = 'badge bg-success';
            stockElement.innerHTML = `<i class=\"bi bi-check-circle\"></i> En stock: ${product.stock}`;
        }
    } else {
        stockElement.className = 'badge bg-danger';
        stockElement.innerHTML = `<i class=\"bi bi-x-circle\"></i> Rupture de stock`;
    }
    
    if (availableStockElement) {
        availableStockElement.textContent = product.stock;
    }
    
    document.getElementById('productDescription').textContent = product.description;
    document.getElementById('productBreadcrumb').textContent = product.name;

    // Initialize quantity input
    const qtyInput = document.getElementById('quantity');
    qtyInput.value = 1;
    qtyInput.min = 1;
    qtyInput.max = product.stock;
    qtyInput.oninput = () => handleQuantityInput();
    qtyInput.onblur = () => handleQuantityInput(true);
    
    // Update quantity buttons state
    updateQuantityButtons();
    
    // Handle images
    displayProductImages(product);

    // Load related products by same category
    loadRelatedProducts(product.category_id, product.id);
}

// Fetch and display related products (same category)
async function loadRelatedProducts(categoryId, excludeProductId) {
    try {
        if (!categoryId) return;
        const response = await fetch(`/api/products?category_id=${encodeURIComponent(categoryId)}&limit=8`);
        const data = await response.json();
        if (!data.success) return;

        // Exclude current product and limit to 6
        const related = data.products.filter(p => p.id !== excludeProductId).slice(0, 6);
        const grid = document.getElementById('relatedProductsGrid');
        if (!grid) return;

        if (related.length === 0) {
            grid.innerHTML = `<div class=\"col-12 text-muted\">Aucun produit similaire trouvé.</div>`;
            return;
        }

        grid.innerHTML = related.map(product => `
            <div class=\"col-12 col-sm-6 col-lg-4 mb-4\">
                <div class=\"card product-card h-100\" onclick=\"showProductDetail(${product.id})\">
                    <img src=\"${product.primary_image || product.image || '/images/placeholder.svg'}\" class=\"card-img-top product-image\" alt=\"${product.name}\">
                    <div class=\"card-body d-flex flex-column\">
                        <h6 class=\"card-title\">${product.name}</h6>
                        <p class=\"text-muted small\">${product.category_name || ''}</p>
                        <div class=\"mt-auto d-flex justify-content-between align-items-center\">
                            <span class=\"h6 text-primary mb-0\">${formatMAD(product.price)}</span>
                            <button class=\"btn btn-primary btn-sm\" onclick=\"event.stopPropagation(); addToCartFromRelated(${product.id})\">Ajouter</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error('Failed to load related products:', e);
    }
}

// Small helper to add to cart from related card without leaving page
async function addToCartFromRelated(productId) {
    try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (!data.success) return;
        const product = data.product;
        // add with qty 1
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            if (existing.quantity < product.stock) existing.quantity += 1;
        } else {
            cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1, image: (product.primary_image || product.image) });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        showAlert(`${product.name} ajouté au panier`, 'success');
    } catch (e) {
        console.error('addToCartFromRelated error:', e);
    }
}

/**
 * Display product images
 */
function displayProductImages(product) {
    const mainImage = document.getElementById('productMainImage');
    const thumbnailsContainer = document.getElementById('productThumbnails');
    
    // Clear previous thumbnails
    thumbnailsContainer.innerHTML = '';
    
    if (product.images && product.images.length > 0) {
        // Sort images by sort_order
        const sortedImages = product.images.sort((a, b) => a.sort_order - b.sort_order);
        
        // Find primary image or use first image
        const primaryImage = sortedImages.find(img => img.is_primary) || sortedImages[0];
        
        // Set main image
        mainImage.src = primaryImage.image_url;
        mainImage.alt = product.name;
        
        // Create thumbnails if multiple images
        if (sortedImages.length > 1) {
            sortedImages.forEach((image, index) => {
                const thumbnail = document.createElement('div');
                thumbnail.className = `product-thumbnail ${image.is_primary ? 'active' : ''}`;
                thumbnail.onclick = () => changeMainImage(image.image_url, index);
                
                thumbnail.innerHTML = `<img src="${image.image_url}" alt="${product.name} - Image ${index + 1}">`;
                thumbnailsContainer.appendChild(thumbnail);
            });
        }
        
        // Store images for modal
        window.currentProductImages = sortedImages;
    } else {
        // Fallback to old image field or placeholder
        const fallbackImage = product.image || '/images/placeholder.svg';
        mainImage.src = fallbackImage;
        mainImage.alt = product.name;
        
        // Store single image for modal
        window.currentProductImages = [{ image_url: fallbackImage, is_primary: true }];
    }
}

/**
 * Change main product image
 */
function changeMainImage(imageUrl, index) {
    const mainImage = document.getElementById('productMainImage');
    const thumbnails = document.querySelectorAll('.product-thumbnail');
    
    // Update main image
    mainImage.src = imageUrl;
    
    // Update active thumbnail
    thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

/**
 * Open image gallery modal
 */
function openImageModal() {
    if (!window.currentProductImages || window.currentProductImages.length === 0) return;
    
    const carouselInner = document.getElementById('carouselInner');
    const customIndicators = document.getElementById('customIndicators');
    
    // Clear previous content
    carouselInner.innerHTML = '';
    customIndicators.innerHTML = '';
    
    // Create carousel items
    window.currentProductImages.forEach((image, index) => {
        // Carousel item
        const carouselItem = document.createElement('div');
        carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        carouselItem.innerHTML = `<img src="${image.image_url}" alt="Product image ${index + 1}">`;
        carouselInner.appendChild(carouselItem);
        
        // Custom indicator
        const indicator = document.createElement('div');
        indicator.className = `carousel-indicator-thumb ${index === 0 ? 'active' : ''}`;
        indicator.onclick = () => goToSlide(index);
        indicator.innerHTML = `<img src="${image.image_url}" alt="Thumbnail ${index + 1}">`;
        customIndicators.appendChild(indicator);
    });
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('imageGalleryModal'));
    modal.show();
}

/**
 * Go to specific carousel slide
 */
function goToSlide(index) {
    const carousel = bootstrap.Carousel.getInstance(document.getElementById('productImageCarousel'));
    if (carousel) {
        carousel.to(index);
    }
    
    // Update custom indicators
    const indicators = document.querySelectorAll('.carousel-indicator-thumb');
    indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
    });
}

/**
 * Change quantity by +/- buttons
 */
function changeQuantity(delta) {
    const quantityInput = document.getElementById('quantity');
    const currentValue = parseInt(quantityInput.value || '1');
    const newValue = Math.max(1, Math.min(currentProduct.stock, currentValue + delta));
    
    quantityInput.value = newValue;
    updateQuantityButtons();
    
    // Visual feedback
    const quantitySelector = document.querySelector('.quantity-selector');
    if (quantitySelector) {
        quantitySelector.style.transform = 'scale(1.05)';
        setTimeout(() => {
            quantitySelector.style.transform = 'scale(1)';
        }, 150);
    }
}

/**
 * Handle manual input in quantity field (clamp 1..stock)
 */
function handleQuantityInput(applyOnBlur = false) {
    const quantityInput = document.getElementById('quantity');
    if (!quantityInput || !currentProduct) return;

    let value = quantityInput.value.trim();

    // If empty during typing, don't force until blur
    if (value === '') {
        if (applyOnBlur) {
            quantityInput.value = '1';
        }
        updateQuantityButtons();
        return;
    }

    let parsed = parseInt(value, 10);
    if (isNaN(parsed)) parsed = 1;

    const clamped = Math.max(1, Math.min(currentProduct.stock, parsed));
    quantityInput.value = String(clamped);
    updateQuantityButtons();
}

/**
 * Update quantity buttons state
 */
function updateQuantityButtons() {
    const quantityInput = document.getElementById('quantity');
    const decreaseBtn = document.querySelector('.quantity-decrease');
    const increaseBtn = document.querySelector('.quantity-increase');
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const buyNowBtn = document.querySelector('.buy-now-btn');
    
    if (!quantityInput || !currentProduct) return;
    
    const currentValue = parseInt(quantityInput.value || '1', 10);
    const maxStock = currentProduct.stock;
    
    // Update decrease button
    if (decreaseBtn) {
        decreaseBtn.disabled = currentValue <= 1;
        decreaseBtn.style.opacity = currentValue <= 1 ? '0.5' : '1';
        decreaseBtn.style.cursor = currentValue <= 1 ? 'not-allowed' : 'pointer';
    }
    
    // Update increase button
    if (increaseBtn) {
        increaseBtn.disabled = currentValue >= maxStock;
        increaseBtn.style.opacity = currentValue >= maxStock ? '0.5' : '1';
        increaseBtn.style.cursor = currentValue >= maxStock ? 'not-allowed' : 'pointer';
    }
    
    // Update action buttons based on stock
    const isOutOfStock = maxStock <= 0;
    
    if (addToCartBtn) {
        addToCartBtn.disabled = isOutOfStock;
        if (isOutOfStock) {
            addToCartBtn.innerHTML = '<i class="bi bi-x-circle"></i><span>Rupture de Stock</span>';
            addToCartBtn.className = 'btn btn-secondary btn-lg product-action-btn add-to-cart-btn';
        } else {
            addToCartBtn.innerHTML = '<i class="bi bi-cart-plus"></i><span>Ajouter au Panier</span>';
            addToCartBtn.className = 'btn btn-primary btn-lg product-action-btn add-to-cart-btn';
        }
    }
    
    if (buyNowBtn) {
        buyNowBtn.disabled = isOutOfStock;
        if (isOutOfStock) {
            buyNowBtn.innerHTML = '<i class="bi bi-x-circle"></i><span>Indisponible</span>';
            buyNowBtn.className = 'btn btn-secondary btn-lg product-action-btn buy-now-btn';
        } else {
            buyNowBtn.innerHTML = '<i class="bi bi-lightning-charge"></i><span>Acheter Maintenant</span>';
            buyNowBtn.className = 'btn btn-success btn-lg product-action-btn buy-now-btn';
        }
    }
}

/**
 * Add to cart
 */
function addToCart() {
    if (!currentProduct) return;
    
    const quantity = parseInt(document.getElementById('quantity').value);
    
    // Check stock availability
    if (currentProduct.stock <= 0) {
        showAlert('Ce produit est en rupture de stock', 'danger');
        return;
    }
    
    if (quantity > currentProduct.stock) {
        showAlert(`Seulement ${currentProduct.stock} articles disponibles`, 'warning');
        return;
    }
    
    const existingItem = cart.find(item => item.id === currentProduct.id);
    
    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > currentProduct.stock) {
            showAlert(`Quantité maximale disponible: ${currentProduct.stock}`, 'warning');
            return;
        }
        existingItem.quantity = newQuantity;
    } else {
        // Use primary image or fallback
        const productImage = currentProduct.images && currentProduct.images.length > 0 
            ? currentProduct.images.find(img => img.is_primary)?.image_url || currentProduct.images[0].image_url
            : currentProduct.image;
            
        cart.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            image: productImage,
            quantity: quantity,
            stock: currentProduct.stock
        });
    }
    
    saveCart();
    updateCartDisplay();
    showAlert(`${currentProduct.name} ajouté au panier!`, 'success');
    
    // Add visual feedback
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            addToCartBtn.style.transform = 'scale(1)';
        }, 150);
    }
    
    // Ouvrir automatiquement le modal panier après ajout
    setTimeout(() => {
        showCartModal();
    }, 500);
}



/**
 * Quick add to cart
 */
function quickAddToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            showAlert('Maximum stock reached', 'warning');
            return;
        }
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            stock: product.stock
        });
    }
    
    saveCart();
    updateCartDisplay();
    showAlert(`${product.name} added to cart!`, 'success');
    
    // Ouvrir automatiquement le modal panier après ajout
    setTimeout(() => {
        showCartModal();
    }, 500);
}

/**
 * Buy now
 */
function buyNow() {
    addToCart();
    // Le modal s'ouvrira automatiquement via addToCart()
}

/**
 * Save cart to localStorage
 */
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

/**
 * Update cart display
 */
function updateCartDisplay() {
    const cartBadge = document.getElementById('cartBadge');
    const cartFloatBadge = document.getElementById('cartFloatBadge');
    const cartFloat = document.getElementById('cartFloat');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Animate badge update for navbar
    if (cartBadge.textContent !== totalItems.toString()) {
        cartBadge.classList.add('updated');
        setTimeout(() => cartBadge.classList.remove('updated'), 600);
    }
    
    // Animate badge update for floating button with enhanced effects
    if (cartFloatBadge && cartFloatBadge.textContent !== totalItems.toString()) {
        cartFloatBadge.classList.add('updated', 'notification');
        
        // Add shake effect to the floating cart
        if (cartFloat) {
            cartFloat.classList.add('shake', 'glow');
            setTimeout(() => {
                cartFloat.classList.remove('shake', 'glow');
            }, 500);
        }
        
        setTimeout(() => {
            cartFloatBadge.classList.remove('updated', 'notification');
        }, 1000);
    }
    
    cartBadge.textContent = totalItems;
    if (cartFloatBadge) {
        cartFloatBadge.textContent = totalItems;
        
        // Toggle empty class based on cart content
        if (cartFloat) {
            if (totalItems === 0) {
                cartFloat.classList.add('empty');
            } else {
                cartFloat.classList.remove('empty');
            }
        }
    }
    
    if (currentPage === 'cart') {
        displayCartItems();
    }
    
    // Update modal if it's open
    const cartModal = document.getElementById('cartModal');
    if (cartModal && cartModal.classList.contains('show')) {
        displayCartModalItems();
        updateCartTotals();
    }
}

/**
 * Initialize floating cart
 */
function initializeFloatingCart() {
    const cartFloat = document.getElementById('cartFloat');
    const cartFloatBadge = document.getElementById('cartFloatBadge');
    
    if (!cartFloat || !cartFloatBadge) return;
    
    // Set initial state
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartFloatBadge.textContent = totalItems;
    
    if (totalItems === 0) {
        cartFloat.classList.add('empty');
    }
    
    // Add smooth entrance animation
    setTimeout(() => {
        cartFloat.style.opacity = '1';
        cartFloat.style.transform = 'translateY(0)';
    }, 500);
}

/**
 * Display cart items
 */
function displayCartItems() {
    const container = document.getElementById('cartItems');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-cart-x fs-1 text-muted"></i>
                <h4 class="text-muted mt-3">Your cart is empty</h4>
                <p class="text-muted">Add some products to get started</p>
                <button class="btn btn-primary" onclick="showPage('catalog')">Continue Shopping</button>
            </div>
        `;
        checkoutBtn.disabled = true;
        updateCartTotals();
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="row align-items-center">
                <div class="col-md-2">
                    <img src="${item.image || '/images/placeholder.svg'}" class="cart-item-image" alt="${item.name}">
                </div>
                <div class="col-md-4">
                    <h6>${item.name}</h6>
                    <p class="text-muted small">${formatMAD(item.price)} chacun</p>
                </div>
                <div class="col-md-3">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, -1)">-</button>
                        <span class="mx-2">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <div class="col-md-2">
                    <strong>${formatMAD(item.price * item.quantity)}</strong>
                </div>
                <div class="col-md-1">
                    <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${item.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    checkoutBtn.disabled = false;
    updateCartTotals();
}

/**
 * Update cart quantity
 */
function updateCartQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    const newQuantity = item.quantity + delta;
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    // Clamp to available stock
    const clampedQuantity = Math.min(newQuantity, item.stock || newQuantity);
    if (clampedQuantity !== newQuantity) {
        showAlert('Maximum stock reached', 'warning');
    }
    
    item.quantity = clampedQuantity;
    saveCart();
    
    // Update UI without full re-render for smoother UX
    const cartModal = document.getElementById('cartModal');
    if (cartModal && cartModal.classList.contains('show')) {
        const itemElement = cartModal.querySelector(`[data-product-id="${productId}"]`);
        if (itemElement) {
            // Update quantity input and display
            const quantityInput = itemElement.querySelector('.quantity-input');
            if (quantityInput) {
                quantityInput.value = clampedQuantity;
                quantityInput.style.transform = 'scale(1.1)';
                setTimeout(() => quantityInput.style.transform = 'scale(1)', 150);
            }
            const quantityDisplay = itemElement.querySelector('.quantity-display');
            if (quantityDisplay) quantityDisplay.textContent = clampedQuantity;
            
            // Update line total
            const itemTotal = itemElement.querySelector('.item-total');
            if (itemTotal) {
                const newTotal = item.price * clampedQuantity;
                itemTotal.textContent = formatMAD(newTotal);
                itemTotal.style.transform = 'scale(1.1)';
                itemTotal.style.color = '#198754';
                setTimeout(() => {
                    itemTotal.style.transform = 'scale(1)';
                    itemTotal.style.color = '';
                }, 200);
            }
        }
        updateModalTotals();
    }
    
    updateCartDisplay();
}

// Set absolute quantity from input
function setCartQuantity(productId, qty) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    let value = parseInt(qty);
    if (isNaN(value) || value < 1) value = 1;
    if (item.stock && value > item.stock) {
        value = item.stock;
        showAlert('Maximum stock reached', 'warning');
    }
    const delta = value - item.quantity;
    if (delta !== 0) {
        updateCartQuantity(productId, delta);
    }
}

/**
 * Met à jour les totaux du modal panier
 */
function updateModalTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal; // Pas de taxes ou frais de livraison pour l'instant
    
    const modalSubtotal = document.getElementById('cartModalSubtotal');
    const modalTotal = document.getElementById('cartModalTotal');
    
    if (modalSubtotal) {
        modalSubtotal.textContent = formatMAD(subtotal);
        // Animation de mise à jour
        modalSubtotal.style.transform = 'scale(1.1)';
        modalSubtotal.style.color = '#198754';
        setTimeout(() => {
            modalSubtotal.style.transform = 'scale(1)';
            modalSubtotal.style.color = '';
        }, 200);
    }
    
    if (modalTotal) {
        modalTotal.textContent = formatMAD(total);
        // Animation de mise à jour
        modalTotal.style.transform = 'scale(1.1)';
        modalTotal.style.color = '#198754';
        setTimeout(() => {
            modalTotal.style.transform = 'scale(1)';
            modalTotal.style.color = '';
        }, 200);
    }
}

/**
 * Remove from cart
 */
function removeFromCart(productId) {
    // Animation de suppression pour le modal
    const cartModal = document.getElementById('cartModal');
    if (cartModal && cartModal.classList.contains('show')) {
        const itemElement = cartModal.querySelector(`[data-product-id="${productId}"]`);
        if (itemElement) {
            itemElement.style.transform = 'translateX(-100%)';
            itemElement.style.opacity = '0';
            setTimeout(() => {
                cart = cart.filter(item => item.id !== productId);
                saveCart();
                updateCartDisplay();
                showAlert('Item removed from cart', 'info');
            }, 300);
            return;
        }
    }
    
    // Suppression normale si pas de modal
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    showAlert('Item removed from cart', 'info');
}

/**
 * Update cart totals
 */
function updateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;
    
    // Update page totals
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');
    if (cartSubtotal) cartSubtotal.textContent = formatMAD(subtotal);
    if (cartTotal) cartTotal.textContent = formatMAD(total);
    
    // Update modal totals
    const modalSubtotal = document.getElementById('cartModalSubtotal');
    const modalTotal = document.getElementById('cartModalTotal');
    if (modalSubtotal) modalSubtotal.textContent = formatMAD(subtotal);
    if (modalTotal) modalTotal.textContent = formatMAD(total);
    
    // Update checkout totals if on checkout page
    if (currentPage === 'checkout') {
        const checkoutSubtotal = document.getElementById('checkoutSubtotal');
        const checkoutTotal = document.getElementById('checkoutTotal');
        if (checkoutSubtotal) checkoutSubtotal.textContent = formatMAD(subtotal);
        if (checkoutTotal) checkoutTotal.textContent = formatMAD(total);
    }
}

/**
 * Show checkout view in modal
 */
function showCheckoutInModal() {
    if (cart.length === 0) {
        showAlert('Your cart is empty', 'warning');
        return;
    }
    
    // Switch to checkout view
    document.getElementById('cartView').classList.add('d-none');
    document.getElementById('checkoutView').classList.remove('d-none');
    
    // Update modal title
    const modalTitle = document.getElementById('modalTitle');
    const modalIcon = document.querySelector('#cartModalLabel i');
    modalTitle.textContent = 'Checkout';
    modalIcon.className = 'bi bi-credit-card';
    
    // Display checkout items and update totals
    displayCheckoutModalItems();
    updateCheckoutModalTotals();
}

/**
 * Show cart view in modal
 */
function showCartInModal() {
    // Switch to cart view
    document.getElementById('checkoutView').classList.add('d-none');
    document.getElementById('cartView').classList.remove('d-none');
    
    // Update modal title
    const modalTitle = document.getElementById('modalTitle');
    const modalIcon = document.querySelector('#cartModalLabel i');
    modalTitle.textContent = 'Shopping Cart';
    modalIcon.className = 'bi bi-cart3';
    
    // Refresh cart display
    displayCartModalItems();
    updateCartTotals();
}

/**
 * Proceed to checkout (legacy function - now redirects to modal)
 */
function proceedToCheckout() {
    showCheckoutInModal();
}

/**
 * Display checkout items in modal
 */
function displayCheckoutModalItems() {
    const container = document.getElementById('checkoutModalItems');
    
    container.innerHTML = cart.map(item => `
        <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded">
            <div class="d-flex align-items-center">
                <img src="${item.image || '/images/placeholder.svg'}" 
                     class="rounded me-2" 
                     alt="${item.name}" 
                     style="width: 40px; height: 40px; object-fit: cover;">
                <div>
                    <div class="fw-bold small">${item.name}</div>
                    <small class="text-muted">${formatMAD(item.price)} × ${item.quantity}</small>
                </div>
            </div>
            <div class="text-end">
                <strong class="text-primary">${formatMAD(item.price * item.quantity)}</strong>
            </div>
        </div>
    `).join('');
}

/**
 * Update checkout modal totals
 */
function updateCheckoutModalTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;
    
    const modalSubtotal = document.getElementById('checkoutModalSubtotal');
    const modalShipping = document.getElementById('checkoutModalShipping');
    const modalTotal = document.getElementById('checkoutModalTotal');
    
    if (modalSubtotal) modalSubtotal.textContent = formatMAD(subtotal);
    if (modalShipping) modalShipping.textContent = shipping === 0 ? 'Gratuit' : formatMAD(shipping);
    if (modalTotal) modalTotal.textContent = formatMAD(total);
}

/**
 * Submit checkout from modal
 */
async function submitModalCheckout() {
    const form = document.getElementById('checkoutModalForm');
    const formData = new FormData(form);
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Check if cart is not empty
    if (!cart || cart.length === 0) {
        showAlert('Your cart is empty. Please add items before checkout.', 'warning');
        return;
    }
    
    // Validate cart items
    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        if (!item.id || !item.quantity || !item.price) {
            console.error('Invalid cart item:', item);
            showAlert('Invalid cart data. Please refresh the page and try again.', 'danger');
            return;
        }
    }
    
    const submitBtn = document.getElementById('submitModalCheckoutBtn');
    const originalText = submitBtn.innerHTML;
    let orderData = null;
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Processing...';
        
        orderData = {
            items: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                price: item.price
            })),
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            customer_info: {
                customerName: formData.get('customerName'),
                customerEmail: formData.get('customerEmail'),
                customerPhone: formData.get('customerPhone') || '',
                shippingAddress: formData.get('shippingAddress'),
                city: formData.get('city'),
                zipCode: formData.get('zipCode')
            }
        };
        
        console.log('Sending order data:', orderData);
        
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (response.ok) {
            const result = await response.json();
            
            // Clear cart
            cart = [];
            saveCart();
            updateCartDisplay();
            
            // Close modal
            const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
            if (cartModal) {
                cartModal.hide();
            }
            
            // Show success message
            showAlert(`Order #${result.orderId} placed successfully! Thank you for your purchase.`, 'success');
            
            // Reset form
            form.reset();
            
            // Switch back to cart view for next time
            showCartInModal();
            
        } else {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            
            let errorMessage = 'Failed to place order';
            try {
                const error = JSON.parse(errorText);
                errorMessage = error.message || errorMessage;
            } catch (e) {
                console.error('Failed to parse error response as JSON:', e);
                errorMessage = `Server error (${response.status}): ${errorText}`;
            }
            
            showAlert(errorMessage, 'danger');
        }
        
    } catch (error) {
        console.error('Checkout error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            orderData: orderData
        });
        showAlert(`An error occurred while placing your order: ${error.message}`, 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

/**
 * Display checkout items (legacy function for checkout page)
 */
function displayCheckoutItems() {
    const container = document.getElementById('checkoutItems');
    if (!container) return;
    
    container.innerHTML = cart.map(item => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
                <h6 class="mb-0">${item.name}</h6>
                <small class="text-muted">Qty: ${item.quantity}</small>
            </div>
            <span>${formatMAD(item.price * item.quantity)}</span>
        </div>
    `).join('');
}

/**
 * Handle checkout
 */
async function handleCheckout(event) {
    event.preventDefault();
    
    if (cart.length === 0) {
        showAlert('Your cart is empty', 'warning');
        return;
    }
    
    const formData = new FormData(event.target);
    const customerInfo = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        zipCode: formData.get('zipCode')
    };
    
    const orderData = {
        items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
        })),
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        customer_info: customerInfo
    };
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Clear cart
            cart = [];
            saveCart();
            updateCartDisplay();
            
            showAlert('Order placed successfully! Order ID: ' + data.orderId, 'success');
            showPage('home');
        } else {
            showAlert(data.message || 'Order failed', 'danger');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showAlert('Network error. Please try again.', 'danger');
    }
}

/**
 * Show cart modal
 */
function showCartModal() {
    // Always show cart view by default
    showCartInModal();
    
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    cartModal.show();
}

/**
 * Display cart items in modal
 */
function displayCartModalItems() {
    const container = document.getElementById('cartModalItems');
    const checkoutBtn = document.getElementById('checkoutModalBtn');
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="empty-cart-icon mb-4">
                    <i class="bi bi-cart-x text-muted" style="font-size: 4rem; opacity: 0.3;"></i>
                </div>
                <h4 class="text-muted fw-bold">Votre panier est vide</h4>
                <p class="text-muted mb-4">Découvrez nos rituels de beauté pour commencer vos achats.</p>
                <button class="btn btn-primary px-4 py-2 rounded-pill" data-bs-dismiss="modal" onclick="showPage('catalog')">
                    <i class="bi bi-shop me-2"></i> Explorer la boutique
                </button>
            </div>
        `;
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }
    
    if (checkoutBtn) checkoutBtn.disabled = false;
    
    container.innerHTML = cart.map(item => `
        <div class="cart-modal-item" data-product-id="${item.id}">
            <div class="row align-items-center">
                <div class="col-3 col-md-2">
                    <div class="position-relative">
                        <img src="${item.image || '/images/placeholder.svg'}" 
                             class="img-fluid rounded-3 shadow-sm" 
                             alt="${item.name}" 
                             style="aspect-ratio: 1; object-fit: cover;">
                    </div>
                </div>
                <div class="col-9 col-md-5">
                    <h6 class="mb-1 fw-bold text-dark">${item.name}</h6>
                    <p class="text-accent small mb-0 fw-medium">${formatMAD(item.price)}</p>
                </div>
                <div class="col-8 col-md-4 mt-3 mt-md-0">
                    <div class="d-flex align-items-center bg-light rounded-pill p-1" style="width: fit-content;">
                        <button class="btn btn-sm btn-white rounded-circle shadow-sm" onclick="updateCartQuantity(${item.id}, -1)" style="width: 28px; height: 28px; padding: 0;">
                            <i class="bi bi-dash"></i>
                        </button>
                        <span class="mx-3 fw-bold small">${item.quantity}</span>
                        <button class="btn btn-sm btn-white rounded-circle shadow-sm" onclick="updateCartQuantity(${item.id}, 1)" style="width: 28px; height: 28px; padding: 0;">
                            <i class="bi bi-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="col-4 col-md-1 text-end mt-3 mt-md-0">
                    <button class="btn btn-link text-danger p-0" onclick="removeFromCart(${item.id})" title="Supprimer">
                        <i class="bi bi-trash fs-5"></i>
                    </button>
                </div>
            </div>
            <div class="row mt-2">
                <div class="col-12 text-end">
                    <span class="text-muted small">Total: </span>
                    <span class="fw-bold text-primary">${formatMAD(item.price * item.quantity)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Place order (alternative method)
 */
async function placeOrder() {
    const form = document.getElementById('checkoutForm');
    if (form.checkValidity()) {
        handleCheckout({ preventDefault: () => {}, target: form });
    } else {
        form.reportValidity();
    }
}

/**
 * Load user orders
 */
async function loadOrders() {
    if (!currentUser) {
        showAlert('Please login to view orders', 'warning');
        showLoginModal();
        return;
    }
    
    try {
        const response = await fetch('/api/orders');
        const data = await response.json();
        
        if (data.success) {
            displayOrders(data.orders);
        } else {
            showAlert(data.message || 'Error loading orders', 'danger');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showAlert('Error loading orders', 'danger');
    }
}

/**
 * Display orders
 */
function displayOrders(orders) {
    const container = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-receipt fs-1 text-muted"></i>
                <h4 class="text-muted mt-3">No orders found</h4>
                <p class="text-muted">You haven't placed any orders yet</p>
                <button class="btn btn-primary" onclick="showPage('catalog')">Start Shopping</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h6>Order #${order.id}</h6>
                        <p class="text-muted mb-1">${order.items}</p>
                        <small class="text-muted">Placed on ${new Date(order.created_at).toLocaleDateString()}</small>
                    </div>
                    <div class="col-md-4 text-md-end">
                        <h5 class="text-primary">$${parseFloat(order.total).toFixed(2)}</h5>
                        <span class="badge status-${order.status}">${order.status.toUpperCase()}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Show page
 */
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('d-none');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageName + 'Page');
    if (targetPage) {
        targetPage.classList.remove('d-none');
        currentPage = pageName;
        
        // Load page-specific data
        switch (pageName) {
            case 'catalog':
                loadProducts();
                break;
            case 'cart':
                displayCartItems();
                break;
            case 'orders':
                loadOrders();
                break;
        }
        
        // Update URL without page reload
        const newUrl = pageName === 'home' ? '/' : `/#${pageName}`;
        window.history.pushState({ page: pageName }, '', newUrl);
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

// Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    const page = event.state?.page || 'home';
    showPage(page);
});

// Handle initial URL
window.addEventListener('load', function() {
    const hash = window.location.hash.substring(1);
    if (hash && ['home', 'catalog', 'cart', 'checkout', 'orders'].includes(hash)) {
        showPage(hash);
    }
});

// ===== ANIMATIONS ET EFFETS MODERNES =====

/**
 * Initialise les animations modernes
 */
function initializeAnimations() {
    // Animation de typing pour le titre
    const typingElement = document.querySelector('.typing-effect');
    if (typingElement) {
        const text = typingElement.textContent;
        typingElement.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                typingElement.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }
        
        setTimeout(typeWriter, 1000);
    }
    
    // Initialiser le panier flottant
    updateFloatingCartCount();
    
    // Animation de la navbar au scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/**
 * Effets d'apparition au scroll
 */
function initializeScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    // Observer tous les éléments avec la classe animate-on-scroll
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

/**
 * Animation des compteurs
 */
function initializeCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const observerOptions = {
        threshold: 0.5
    };
    
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

/**
 * Anime un compteur
 */
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    element.classList.add('counting');
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 16);
}



/**
 * Met à jour le compteur du panier dans la navbar
 */
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.getElementById('cartBadge');
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        if (totalItems > 0) {
            cartBadge.style.display = 'inline';
        } else {
            cartBadge.style.display = 'none';
        }
    }
}

/**
 * Met à jour le compteur du panier flottant
 */
function updateFloatingCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartFloatBadge = document.getElementById('cartFloatBadge');
    if (cartFloatBadge) {
        cartFloatBadge.textContent = totalItems;
        if (totalItems > 0) {
            cartFloatBadge.style.display = 'flex';
        } else {
            cartFloatBadge.style.display = 'none';
        }
    }
}

/**
 * Fonction pour faire défiler vers une section
 */
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

/**
 * Génère les icônes de catégories
 */
function getCategoryIcon(categoryName) {
    const icons = {
        'Smartphones & Tablettes': '📱',
        'Ordinateurs & Laptops': '💻',
        'Audio & Casques': '🎧',
        'Gaming & Consoles': '🎮',
        'TV & Écrans': '📺',
        'Appareils Photo': '📷',
        'Maison Connectée': '🏠',
        'Accessoires Tech': '🔌',
        'Électroménager': '🏠',
        'Wearables & Fitness': '⌚'
    };
    return icons[categoryName] || '📦';
}

/**
 * Met à jour l'affichage du panier avec animation
 */
function updateCartDisplay() {
    updateCartCount();
    updateFloatingCartCount();
    
    // Animation du badge de panier
    const cartBadge = document.getElementById('cartBadge');
    if (cartBadge && cart.length > 0) {
        cartBadge.style.animation = 'bounce 0.5s ease';
        setTimeout(() => {
            cartBadge.style.animation = '';
        }, 500);
    }
    
    // Debug: Log cart synchronization
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    console.log(`Cart sync: ${totalItems} items total`);
}

/**
 * Fonction de débogage pour tester la synchronisation des badges
 * Utilisable dans la console : testCartSync()
 */
function testCartSync() {
    console.log('=== CART SYNCHRONIZATION TEST ===');
    
    // État du panier
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    console.log('Cart contents:', cart);
    console.log('Total items in cart:', totalItems);
    
    // État des badges
    const navBadge = document.getElementById('cartBadge');
    const floatBadge = document.getElementById('cartFloatBadge');
    
    console.log('Nav badge element:', navBadge);
    console.log('Nav badge text:', navBadge?.textContent);
    console.log('Nav badge visible:', navBadge?.style.display !== 'none');
    
    console.log('Float badge element:', floatBadge);
    console.log('Float badge text:', floatBadge?.textContent);
    console.log('Float badge visible:', floatBadge?.style.display !== 'none');
    
    // Vérification de synchronisation
    const navCount = parseInt(navBadge?.textContent || '0');
    const floatCount = parseInt(floatBadge?.textContent || '0');
    
    console.log('=== SYNCHRONIZATION CHECK ===');
    console.log(`Cart total: ${totalItems}`);
    console.log(`Nav badge: ${navCount}`);
    console.log(`Float badge: ${floatCount}`);
    
    if (navCount === totalItems && floatCount === totalItems) {
        console.log('✅ BADGES SYNCHRONIZED CORRECTLY!');
    } else {
        console.log('❌ BADGES NOT SYNCHRONIZED!');
        console.log('Forcing update...');
        updateCartDisplay();
    }
    
    return {
        cartTotal: totalItems,
        navBadge: navCount,
        floatBadge: floatCount,
        synchronized: navCount === totalItems && floatCount === totalItems
    };
}

// Rendre la fonction disponible globalement pour les tests
window.testCartSync = testCartSync;

// ===== SYSTÈME DE RECHERCHE MODERNE =====

let searchTimeout;
let searchCache = new Map();

/**
 * Initialise le système de recherche
 */
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (!searchInput) return;
    
    // Événements de recherche
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('focus', handleSearchFocus);
    searchInput.addEventListener('blur', handleSearchBlur);
    searchInput.addEventListener('keydown', handleSearchKeydown);
    
    // Fermer les suggestions en cliquant ailleurs
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            hideSuggestions();
        }
    });
}

/**
 * Gère la saisie dans la barre de recherche
 */
function handleSearchInput(e) {
    const query = e.target.value.trim();
    
    // Effacer le timeout précédent
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
        hideSuggestions();
        return;
    }
    
    // Délai pour éviter trop de requêtes
    searchTimeout = setTimeout(() => {
        searchProducts(query);
    }, 300);
}

/**
 * Gère le focus sur la barre de recherche
 */
function handleSearchFocus(e) {
    const query = e.target.value.trim();
    if (query.length >= 2) {
        searchProducts(query);
    }
}

/**
 * Gère la perte de focus
 */
function handleSearchBlur(e) {
    // Délai pour permettre le clic sur les suggestions
    setTimeout(() => {
        hideSuggestions();
    }, 200);
}

/**
 * Gère les touches du clavier
 */
function handleSearchKeydown(e) {
    const suggestions = document.querySelectorAll('.search-suggestion-item');
    const activeSuggestion = document.querySelector('.search-suggestion-item.active');
    
    switch (e.key) {
        case 'Enter':
            e.preventDefault();
            if (activeSuggestion) {
                activeSuggestion.click();
            } else {
                performSearch();
            }
            break;
            
        case 'ArrowDown':
            e.preventDefault();
            navigateSuggestions(suggestions, 'down');
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            navigateSuggestions(suggestions, 'up');
            break;
            
        case 'Escape':
            hideSuggestions();
            e.target.blur();
            break;
    }
}

/**
 * Navigation dans les suggestions avec les flèches
 */
function navigateSuggestions(suggestions, direction) {
    const current = document.querySelector('.search-suggestion-item.active');
    let index = -1;
    
    if (current) {
        index = Array.from(suggestions).indexOf(current);
        current.classList.remove('active');
    }
    
    if (direction === 'down') {
        index = index < suggestions.length - 1 ? index + 1 : 0;
    } else {
        index = index > 0 ? index - 1 : suggestions.length - 1;
    }
    
    if (suggestions[index]) {
        suggestions[index].classList.add('active');
        suggestions[index].scrollIntoView({ block: 'nearest' });
    }
}

/**
 * Recherche de produits avec suggestions
 */
async function searchProducts(query) {
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (!searchInput || !searchSuggestions) return;
    
    // Vérifier le cache
    if (searchCache.has(query)) {
        displaySuggestions(searchCache.get(query), query);
        return;
    }
    
    try {
        // Animation de recherche
        searchInput.classList.add('searching');
        
        // Afficher le loading
        searchSuggestions.innerHTML = `
            <div class="search-loading">
                <i class="bi bi-search"></i>
                Recherche de "${query}"...
            </div>
        `;
        showSuggestions();
        
        const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=8`);
        const data = await response.json();
        
        if (data.success) {
            // Mettre en cache
            searchCache.set(query, data.products);
            displaySuggestions(data.products, query);
        } else {
            searchSuggestions.innerHTML = '<div class="search-loading">Aucun résultat trouvé</div>';
        }
        
    } catch (error) {
        console.error('Erreur de recherche:', error);
        searchSuggestions.innerHTML = '<div class="search-loading">Erreur de recherche</div>';
    } finally {
        searchInput.classList.remove('searching');
    }
}

/**
 * Affiche les suggestions de recherche
 */
function displaySuggestions(products, query) {
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (!products || products.length === 0) {
        searchSuggestions.innerHTML = `
            <div class="search-suggestion-item">
                <div class="suggestion-icon">
                    <i class="bi bi-search"></i>
                </div>
                <div class="suggestion-content">
                    <div class="suggestion-title">Aucun produit trouvé</div>
                    <div class="suggestion-category">Essayez avec d'autres mots-clés</div>
                </div>
            </div>
        `;
        showSuggestions();
        return;
    }
    
    const suggestionsHTML = products.map(product => {
        const highlightedName = highlightSearchTerm(product.name, query);
        const categoryName = product.category_name || 'Produit';
        
        // Utiliser l'image primaire ou l'image de base
        let productImage = '/images/placeholder.svg';
        if (product.primary_image) {
            productImage = product.primary_image;
        } else if (product.image) {
            productImage = product.image;
        }
        
        return `
            <div class="search-suggestion-item" onclick="selectProduct(${product.id})">
                <div class="suggestion-image-container">
                    <img src="${productImage}" 
                         class="suggestion-image" 
                         alt="${product.name}"
                         onerror="this.src='/images/placeholder.svg'">
                </div>
                <div class="suggestion-content">
                    <div class="suggestion-title">${highlightedName}</div>
                    <div class="suggestion-category">
                        <i class="bi bi-tag"></i> ${categoryName}
                    </div>
                    <div class="suggestion-description">
                        ${product.description ? product.description.substring(0, 60) + '...' : ''}
                    </div>
                </div>
                <div class="suggestion-price-container">
                    <div class="suggestion-price">${formatMAD(product.price)}</div>
                    <div class="suggestion-action">
                        <i class="bi bi-arrow-right"></i>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Ajouter option "Voir tous les résultats"
    const viewAllHTML = `
        <div class="search-view-all" onclick="performSearch()">
            <div class="view-all-icon">
                <i class="bi bi-grid-3x3-gap"></i>
            </div>
            <div class="suggestion-content">
                <div class="suggestion-title">
                    <i class="bi bi-search"></i> Voir tous les résultats pour "${query}"
                </div>
                <div class="suggestion-category">${products.length} produit(s) trouvé(s) - Cliquez pour voir plus</div>
            </div>
            <div class="suggestion-action">
                <i class="bi bi-arrow-right-circle"></i>
            </div>
        </div>
    `;
    
    searchSuggestions.innerHTML = suggestionsHTML + viewAllHTML;
    showSuggestions();
}

/**
 * Surligne les termes de recherche
 */
function highlightSearchTerm(text, term) {
    if (!term) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

/**
 * Affiche les suggestions
 */
function showSuggestions() {
    const searchSuggestions = document.getElementById('searchSuggestions');
    if (searchSuggestions) {
        searchSuggestions.classList.add('show');
    }
}

/**
 * Cache les suggestions
 */
function hideSuggestions() {
    const searchSuggestions = document.getElementById('searchSuggestions');
    if (searchSuggestions) {
        searchSuggestions.classList.remove('show');
    }
}

/**
 * Sélectionne un produit depuis les suggestions
 */
window.selectProduct = function selectProduct(productId) {
    console.log('🔍 Selecting product:', productId);
    hideSuggestions();
    showProductDetail(productId);
}

/**
 * Effectue une recherche complète
 */
window.performSearch = function performSearch() {
    console.log('🔍 performSearch called');
    
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.trim() : '';
    
    console.log('🔍 Search query:', query);
    console.log('🔍 Search input element:', searchInput);
    
    if (!query) {
        console.log('🔍 No query provided');
        showAlert('Veuillez saisir un terme de recherche', 'warning');
        return;
    }
    
    console.log('🔍 Hiding suggestions');
    if (typeof hideSuggestions === 'function') {
        hideSuggestions();
    }
    
    // Reset other filters to focus on search
    currentFilters = {
        search: query,
        page: 1,
        limit: 12
    };
    
    console.log('🔍 Updated filters:', currentFilters);
    
    // Show catalog page and load results
    console.log('🔍 Showing catalog page');
    if (typeof showPage === 'function') {
        showPage('catalog');
    } else {
        console.error('🔍 showPage function not found');
    }
    
    console.log('🔍 Loading products');
    if (typeof loadProducts === 'function') {
        loadProducts();
    } else {
        console.error('🔍 loadProducts function not found');
    }
    
    // Update search input state
    if (searchInput) {
        searchInput.blur();
    }
    
    // Show loading indicator
    const productsGrid = document.getElementById('productsGrid');
    console.log('🔍 Products grid element:', productsGrid);
    
    if (productsGrid) {
        productsGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Recherche en cours...</span>
                </div>
                <p class="mt-3 text-muted">Recherche de "${query}"...</p>
            </div>
        `;
    }
    
    console.log('🔍 performSearch completed');
}

/**
 * Efface la recherche
 */
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        hideSuggestions();
    }
    
    currentFilters.search = '';
    currentFilters.page = 1;
    
    if (currentPage === 'catalog') {
        loadProducts();
    }
}

/**
 * Clear search and show all products
 */
window.clearSearchAndShowAll = function clearSearchAndShowAll() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Reset all filters
    currentFilters = {
        page: 1,
        limit: 12
    };
    
    hideSuggestions();
    loadProducts();
}

