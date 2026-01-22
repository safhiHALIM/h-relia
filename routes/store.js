const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { executeQuery, getOne } = require('../config/db');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', 'public', 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
        files: 10 // Maximum 10 images per product
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Configuration pour upload multiple
const uploadMultiple = upload.array('images', 10);

// Configuration pour upload d'image de catégorie
const uploadCategoryImage = upload.single('categoryImage');

// Utility functions for product images
const saveProductImages = async (productId, files, primaryIndex = 0) => {
    if (!files || files.length === 0) return;
    
    const imagePromises = files.map(async (file, index) => {
        const imageUrl = `/uploads/${file.filename}`;
        const isPrimary = index === primaryIndex;
        const sortOrder = index;
        
        return executeQuery(
            'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)',
            [productId, imageUrl, isPrimary, sortOrder]
        );
    });
    
    await Promise.all(imagePromises);
};

const getProductImages = async (productId) => {
    return executeQuery(
        'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC',
        [productId]
    );
};

const deleteProductImages = async (productId) => {
    // Get existing images to delete files
    const existingImages = await getProductImages(productId);
    
    // Delete image files from filesystem
    existingImages.forEach(image => {
        const filePath = path.join(__dirname, '..', 'public', image.image_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });
    
    // Delete from database
    await executeQuery('DELETE FROM product_images WHERE product_id = ?', [productId]);
};

const updateProductImageOrder = async (imageId, newOrder) => {
    return executeQuery(
        'UPDATE product_images SET sort_order = ? WHERE id = ?',
        [newOrder, imageId]
    );
};

const setPrimaryImage = async (productId, imageId) => {
    // Reset all images to non-primary
    await executeQuery(
        'UPDATE product_images SET is_primary = FALSE WHERE product_id = ?',
        [productId]
    );
    
    // Set the selected image as primary
    return executeQuery(
        'UPDATE product_images SET is_primary = TRUE WHERE id = ? AND product_id = ?',
        [imageId, productId]
    );
};

// Utility functions
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

const generateDeviceId = (userAgent, screenInfo, timezone) => {
    const deviceString = `${userAgent}|${screenInfo}|${timezone}`;
    return crypto.createHash('sha256').update(deviceString).digest('hex');
};

const isAdmin = (req, res, next) => {
    console.log('🔐 Admin check - Session user:', req.session.user);
    console.log('🔐 Admin check - Session ID:', req.sessionID);
    
    if (!req.session.user || req.session.user.role !== 'admin') {
        console.log('❌ Admin access denied - not authenticated or not admin');
        return res.status(401).json({ success: false, message: 'Admin access required' });
    }
    
    console.log('✅ Admin access granted');
    next();
};

// Logging function
const logActivity = (action, details, userId = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${action}:`, details, userId ? `(User: ${userId})` : '');
};

// ==================== AUTH ROUTES ====================

// Admin login
router.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password required' });
        }

        const user = await getOne('SELECT * FROM users WHERE username = ? AND role = ?', [username, 'admin']);
        
        if (!user || password !== user.password) { // Comparaison directe pour simplifier
            logActivity('ADMIN_LOGIN_FAILED', { username, ip: req.ip });
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role,
            name: user.name
        };

        logActivity('ADMIN_LOGIN_SUCCESS', { username, ip: req.ip }, user.id);
        res.json({ success: true, message: 'Login successful', user: req.session.user });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Admin logout
router.post('/admin/logout', (req, res) => {
    const userId = req.session.user?.id;
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        logActivity('ADMIN_LOGOUT', { ip: req.ip }, userId);
        res.json({ success: true, message: 'Logout successful' });
    });
});

// Check admin session
router.get('/admin/check', (req, res) => {
    if (req.session.user && req.session.user.role === 'admin') {
        res.json({ success: true, user: req.session.user });
    } else {
        res.status(401).json({ success: false, message: 'Not authenticated' });
    }
});

// ==================== CUSTOMER AUTH ROUTES ====================

// Customer registration (DISABLED - No frontend auth)
router.post('/register', async (req, res) => {
    res.status(404).json({ success: false, message: 'Registration not available' });
});

// Customer login (DISABLED - No frontend auth)
router.post('/login', async (req, res) => {
    res.status(404).json({ success: false, message: 'Customer login not available' });
});

// ==================== PRODUCT ROUTES ====================

// Get all products with pagination and filters
router.get('/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const category = req.query.category || '';
        const categoryId = req.query.category_id || '';
        const minPrice = parseFloat(req.query.minPrice) || 0;
        const maxPrice = parseFloat(req.query.maxPrice) || 999999;

        let whereClause = 'WHERE p.price BETWEEN ? AND ?';
        let params = [minPrice, maxPrice];

        if (search) {
            whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (categoryId) {
            whereClause += ' AND p.category_id = ?';
            params.push(categoryId);
        } else if (category) {
            whereClause += ' AND c.name = ?';
            params.push(category);
        }

        const query = `
            SELECT p.*, c.name as category_name,
                   (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = TRUE LIMIT 1) as primary_image
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            ${whereClause}
            ORDER BY p.created_at DESC 
            LIMIT ? OFFSET ?
        `;
        
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            ${whereClause}
        `;

        const products = await executeQuery(query, [...params, limit, offset]);
        const totalResult = await getOne(countQuery, params);
        const total = totalResult.total;

        res.json({
            success: true,
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
});

// Get single product
router.get('/products/:id', async (req, res) => {
    try {
        const product = await getOne(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.id = ?
        `, [req.params.id]);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Get all images for this product
        const images = await getProductImages(req.params.id);
        product.images = images;

        res.json({ success: true, product });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch product' });
    }
});

// Get featured products
router.get('/products/featured/list', async (req, res) => {
    try {
        const products = await executeQuery(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.featured = 1 
            ORDER BY p.created_at DESC 
            LIMIT 8
        `);

        res.json({ success: true, products });
    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch featured products' });
    }
});

// Search products with suggestions
router.get('/products/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        const limit = parseInt(req.query.limit) || 10;
        
        if (!query || query.length < 2) {
            return res.json({ success: true, products: [] });
        }

        // Recherche dans le nom et la description des produits
        const searchQuery = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)
            AND p.stock > 0
            ORDER BY 
                CASE 
                    WHEN p.name LIKE ? THEN 1
                    WHEN p.name LIKE ? THEN 2
                    WHEN p.description LIKE ? THEN 3
                    WHEN c.name LIKE ? THEN 4
                    ELSE 5
                END,
                p.featured DESC,
                p.created_at DESC
            LIMIT ?
        `;

        const searchTerm = `%${query}%`;
        const exactTerm = `${query}%`;
        
        const products = await executeQuery(searchQuery, [
            searchTerm, searchTerm, searchTerm,  // WHERE conditions
            exactTerm, searchTerm, searchTerm, searchTerm,  // ORDER BY conditions
            limit
        ]);

        res.json({ success: true, products });
    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({ success: false, message: 'Failed to search products' });
    }
});

// ==================== ADMIN PRODUCT MANAGEMENT ====================

// Create product (admin only)
router.post('/admin/products', isAdmin, uploadMultiple, async (req, res) => {
    try {
        const { name, description, price, stock, category_id, featured, primaryImageIndex } = req.body;
        
        if (!name || !description || !price || !stock || !category_id) {
            return res.status(400).json({ success: false, message: 'All fields required' });
        }

        // Create product without image first
        const result = await executeQuery(
            'INSERT INTO products (name, description, price, stock, category_id, featured) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, parseFloat(price), parseInt(stock), parseInt(category_id), featured === 'true' ? 1 : 0]
        );

        const productId = result.insertId;

        // Save multiple images if provided
        if (req.files && req.files.length > 0) {
            // Log files for debugging
            console.log('🖼️ Uploaded files:', req.files);
            // Always clean up any existing images for a new product (should be none, but for safety)
            await deleteProductImages(productId);
            const primaryIndex = Number.isInteger(parseInt(primaryImageIndex)) ? parseInt(primaryImageIndex) : 0;
            // Remove undefined/empty files and files with size 0
            const validFiles = req.files.filter(f => f && f.filename && f.size && f.size > 0);
            await saveProductImages(productId, validFiles, primaryIndex);
        }

        logActivity('PRODUCT_CREATED', { productId, name }, req.session.user.id);
        res.json({ success: true, message: 'Product created successfully', productId });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ success: false, message: 'Failed to create product' });
    }
});

// Update product (admin only)
router.put('/admin/products/:id', isAdmin, uploadMultiple, async (req, res) => {
    try {
        const { name, description, price, stock, category_id, featured, primaryImageIndex, replaceImages } = req.body;
        const productId = req.params.id;

        if (!name || !description || !price || !stock || !category_id) {
            return res.status(400).json({ success: false, message: 'All fields required' });
        }

        // Update product basic info
        await executeQuery(
            'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category_id = ?, featured = ? WHERE id = ?',
            [name, description, parseFloat(price), parseInt(stock), parseInt(category_id), featured === 'true' ? 1 : 0, productId]
        );

        // Handle images if provided
        if (req.files && req.files.length > 0) {
            // Log files for debugging
            console.log('🖼️ Uploaded files:', req.files);
            if (replaceImages === 'true') {
                // Replace all existing images
                await deleteProductImages(productId);
                const primaryIndex = Number.isInteger(parseInt(primaryImageIndex)) ? parseInt(primaryImageIndex) : 0;
                const validFiles = req.files.filter(f => f && f.filename && f.size && f.size > 0);
                await saveProductImages(productId, validFiles, primaryIndex);
            } else {
                // Add new images to existing ones
                const existingImages = await getProductImages(productId);
                const startOrder = existingImages.length;
                const primaryIndex = Number.isInteger(parseInt(primaryImageIndex)) ? parseInt(primaryImageIndex) : 0;
                const validFiles = req.files.filter(f => f && f.filename && f.size && f.size > 0);
                const imagePromises = validFiles.map(async (file, index) => {
                    const imageUrl = `/uploads/${file.filename}`;
                    // Only set as primary if there are no existing images and this is the primary index
                    const isPrimary = existingImages.length === 0 && index === primaryIndex;
                    const sortOrder = startOrder + index;
                    return executeQuery(
                        'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)',
                        [productId, imageUrl, isPrimary, sortOrder]
                    );
                });
                await Promise.all(imagePromises);
            }
        }

        logActivity('PRODUCT_UPDATED', { productId, name }, req.session.user.id);
        res.json({ success: true, message: 'Product updated successfully' });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, message: 'Failed to update product' });
    }
});

// Delete product (admin only)
router.delete('/admin/products/:id', isAdmin, async (req, res) => {
    try {
        const productId = req.params.id;
        
        // Get product info for logging
        const product = await getOne('SELECT name FROM products WHERE id = ?', [productId]);
        
        // Delete product images first
        await deleteProductImages(productId);
        
        // Delete product
        await executeQuery('DELETE FROM products WHERE id = ?', [productId]);

        logActivity('PRODUCT_DELETED', { productId, name: product?.name }, req.session.user.id);
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
});

// ==================== PRODUCT IMAGES MANAGEMENT ====================

// Get product images
router.get('/admin/products/:id/images', isAdmin, async (req, res) => {
    try {
        const productId = req.params.id;
        const images = await getProductImages(productId);
        res.json({ success: true, images });
    } catch (error) {
        console.error('Get product images error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch product images' });
    }
});

// Add images to existing product
router.post('/admin/products/:id/images', isAdmin, uploadMultiple, async (req, res) => {
    try {
        const productId = req.params.id;
        const { primaryImageIndex } = req.body;
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No images provided' });
        }

        const existingImages = await getProductImages(productId);
        const startOrder = existingImages.length;
        const primaryIndex = parseInt(primaryImageIndex) || 0;
        
        const imagePromises = req.files.map(async (file, index) => {
            const imageUrl = `/uploads/${file.filename}`;
            const isPrimary = existingImages.length === 0 && index === primaryIndex;
            const sortOrder = startOrder + index;
            
            return executeQuery(
                'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)',
                [productId, imageUrl, isPrimary, sortOrder]
            );
        });
        
        await Promise.all(imagePromises);
        
        const updatedImages = await getProductImages(productId);
        res.json({ success: true, message: 'Images added successfully', images: updatedImages });
    } catch (error) {
        console.error('Add product images error:', error);
        res.status(500).json({ success: false, message: 'Failed to add images' });
    }
});

// Delete specific image
router.delete('/admin/products/:productId/images/:imageId', isAdmin, async (req, res) => {
    try {
        const { productId, imageId } = req.params;
        
        // Get image info before deletion
        const image = await getOne('SELECT * FROM product_images WHERE id = ? AND product_id = ?', [imageId, productId]);
        
        if (!image) {
            return res.status(404).json({ success: false, message: 'Image not found' });
        }
        
        // Delete file from filesystem
        const filePath = path.join(__dirname, '..', 'public', image.image_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        // Delete from database
        await executeQuery('DELETE FROM product_images WHERE id = ? AND product_id = ?', [imageId, productId]);
        
        // If this was the primary image, set another image as primary
        if (image.is_primary) {
            const remainingImages = await getProductImages(productId);
            if (remainingImages.length > 0) {
                await executeQuery(
                    'UPDATE product_images SET is_primary = TRUE WHERE id = ?',
                    [remainingImages[0].id]
                );
            }
        }
        
        res.json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete product image error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete image' });
    }
});

// Set primary image
router.put('/admin/products/:productId/images/:imageId/primary', isAdmin, async (req, res) => {
    try {
        const { productId, imageId } = req.params;
        
        await setPrimaryImage(productId, imageId);
        
        res.json({ success: true, message: 'Primary image updated successfully' });
    } catch (error) {
        console.error('Set primary image error:', error);
        res.status(500).json({ success: false, message: 'Failed to set primary image' });
    }
});

// Update image order
router.put('/admin/products/:productId/images/:imageId/order', isAdmin, async (req, res) => {
    try {
        const { productId, imageId } = req.params;
        const { sortOrder } = req.body;
        
        if (sortOrder === undefined) {
            return res.status(400).json({ success: false, message: 'Sort order is required' });
        }
        
        await updateProductImageOrder(imageId, parseInt(sortOrder));
        
        res.json({ success: true, message: 'Image order updated successfully' });
    } catch (error) {
        console.error('Update image order error:', error);
        res.status(500).json({ success: false, message: 'Failed to update image order' });
    }
});

// ==================== CATEGORY ROUTES ====================

// Get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await executeQuery('SELECT * FROM categories ORDER BY name');
        res.json({ success: true, categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
});

// ==================== ORDER ROUTES ====================

// Create order
router.post('/orders', async (req, res) => {
    try {
        const { items, total, customer_info } = req.body;
        
        if (!items || !items.length || !total || !customer_info) {
            return res.status(400).json({ success: false, message: 'Invalid order data' });
        }

        const userId = req.session.user?.id || null;
        const totalAmount = parseFloat(total);

        // Create order with individual customer fields (matching current DB structure)
        const orderResult = await executeQuery(
            `INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, 
             shipping_address, city, zip_code, total_amount, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                customer_info.customerName,
                customer_info.customerEmail,
                customer_info.customerPhone || '',
                customer_info.shippingAddress,
                customer_info.city,
                customer_info.zipCode,
                totalAmount,
                'pending'
            ]
        );

        const orderId = orderResult.insertId;

        // Create order items with additional fields (matching current DB structure)
        for (const item of items) {
            // Get product info including current stock
            const product = await getOne('SELECT name, stock FROM products WHERE id = ?', [item.product_id]);
            if (!product) {
                throw new Error(`Product with ID ${item.product_id} not found`);
            }
            
            // Check if there's enough stock
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
            }
            
            const productName = product.name;
            const subtotal = item.price * item.quantity;

            await executeQuery(
                `INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [orderId, item.product_id, productName, item.price, item.quantity, subtotal]
            );

            // Update product stock - ensure it doesn't go below 0
            await executeQuery(
                'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        logActivity('ORDER_CREATED', { orderId, total: totalAmount, itemCount: items.length }, userId);
        res.json({ success: true, message: 'Order created successfully', orderId });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, message: 'Failed to create order' });
    }
});

// Get user orders
router.get('/orders', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const orders = await executeQuery(`
            SELECT o.*, 
                   GROUP_CONCAT(CONCAT(p.name, ' (', oi.quantity, ')') SEPARATOR ', ') as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `, [req.session.user.id]);

        res.json({ success: true, orders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
});

// ==================== ADMIN ORDER MANAGEMENT ====================

// Get all orders (admin only)
router.get('/admin/orders', isAdmin, async (req, res) => {
    try {
        const orders = await executeQuery(`
            SELECT o.*, u.name as user_name,
                   COUNT(oi.id) as items_count,
                   SUM(oi.quantity) as total_items_quantity,
                   GROUP_CONCAT(CONCAT(oi.product_name, ' (', oi.quantity, ')') SEPARATOR ', ') as items
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `);

        res.json({ success: true, orders });
    } catch (error) {
        console.error('Get admin orders error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
});

// Update order status (admin only)
router.put('/admin/orders/:id/status', isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        await executeQuery('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);

        logActivity('ORDER_STATUS_UPDATED', { orderId, status }, req.session.user.id);
        res.json({ success: true, message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
});

// Get order details for receipt (admin only)
router.get('/admin/orders/:id/details', isAdmin, async (req, res) => {
    try {
        const orderId = req.params.id;
        console.log('🔍 [ADMIN ORDER DETAILS] Starting request for order ID:', orderId);
        console.log('📋 [ADMIN ORDER DETAILS] Session user:', req.session.user);

        // Get order information
        console.log('🔄 [ADMIN ORDER DETAILS] Executing order query...');
        const order = await getOne(`
            SELECT o.*, u.name as user_name
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `, [orderId]);

        console.log('✅ [ADMIN ORDER DETAILS] Order query result:', order ? 'Found' : 'Not found');
        if (order) {
            console.log('📊 [ADMIN ORDER DETAILS] Order data:', {
                id: order.id,
                customer_name: order.customer_name,
                user_name: order.user_name,
                total_amount: order.total_amount,
                status: order.status
            });
        }

        if (!order) {
            console.log('❌ [ADMIN ORDER DETAILS] Order not found, returning 404');
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Get order items
        console.log('🔄 [ADMIN ORDER DETAILS] Executing order items query...');
        const orderItems = await executeQuery(`
            SELECT oi.*,
                   (oi.quantity * oi.product_price) as calculated_subtotal
            FROM order_items oi
            WHERE oi.order_id = ?
            ORDER BY oi.id
        `, [orderId]);

        console.log('✅ [ADMIN ORDER DETAILS] Order items query result:', orderItems.length, 'items found');
        if (orderItems.length > 0) {
            console.log('📊 [ADMIN ORDER DETAILS] First item sample:', {
                id: orderItems[0].id,
                product_name: orderItems[0].product_name,
                quantity: orderItems[0].quantity,
                product_price: orderItems[0].product_price
            });
        }

        // Add items count to order
        console.log('🔄 [ADMIN ORDER DETAILS] Building response object...');
        const orderWithCount = {
            ...order,
            items_count: orderItems.length
        };

        console.log('✅ [ADMIN ORDER DETAILS] Response ready, sending success');
        res.json({ 
            success: true, 
            order: orderWithCount,
            items: orderItems
        });
        console.log('🎉 [ADMIN ORDER DETAILS] Response sent successfully');
    } catch (error) {
        console.error('❌ [ADMIN ORDER DETAILS] ERROR occurred:', error);
        console.error('❌ [ADMIN ORDER DETAILS] Error stack:', error.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch order details' });
    }
});

// Delete order (admin only) - for delivered orders cleanup
router.delete('/admin/orders/:id', isAdmin, async (req, res) => {
    try {
        const orderId = req.params.id;
        console.log('🗑️ [DELETE ORDER] Request to delete order ID:', orderId);
        console.log('👤 [DELETE ORDER] Requested by admin:', req.session.user.name);
        
        // First, verify the order exists
        const orderResult = await executeQuery(
            'SELECT id, status FROM orders WHERE id = ?', 
            [orderId]
        );
        
        if (orderResult.length === 0) {
            console.log('❌ [DELETE ORDER] Order not found:', orderId);
            return res.status(404).json({ 
                success: false, 
                message: 'Commande non trouvée' 
            });
        }
        
        const order = orderResult[0];
        console.log('📋 [DELETE ORDER] Order found:', order);
        
        // Safety check - only allow deletion of delivered orders
        if (order.status !== 'delivered') {
            console.log('⚠️ [DELETE ORDER] Cannot delete non-delivered order:', order.status);
            return res.status(400).json({ 
                success: false, 
                message: 'Seules les commandes livrées peuvent être supprimées' 
            });
        }
        
        // Delete order items first (foreign key constraint)
        const deleteItemsResult = await executeQuery(
            'DELETE FROM order_items WHERE order_id = ?', 
            [orderId]
        );
        console.log('🔄 [DELETE ORDER] Deleted order items:', deleteItemsResult);
        
        // Delete the order
        const deleteOrderResult = await executeQuery(
            'DELETE FROM orders WHERE id = ?', 
            [orderId]
        );
        console.log('🔄 [DELETE ORDER] Deleted order:', deleteOrderResult);
        
        console.log('✅ [DELETE ORDER] Order deleted successfully:', orderId);
        res.json({ 
            success: true, 
            message: `Commande #${orderId} supprimée avec succès` 
        });
        
    } catch (error) {
        console.error('❌ [DELETE ORDER] ERROR occurred:', error);
        console.error('❌ [DELETE ORDER] Error stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la suppression de la commande' 
        });
    }
});

// ==================== ACCESS LINK SYSTEM ====================

// Generate access link (admin only)
router.post('/generate-link', isAdmin, async (req, res) => {
    try {
        console.log('🔗 Génération de lien demandée par:', req.session.user.name);
        const { expires_hours, description } = req.body;
        console.log('📝 Données reçues:', { expires_hours, description });
        
        // Check current number of active links
        const activeLinksResult = await executeQuery(
            'SELECT COUNT(*) as count FROM store_access_links WHERE status IN (?, ?)',
            ['active', 'used']
        );
        const activeLinksCount = activeLinksResult[0];
        console.log('📊 Liens actifs actuels:', activeLinksCount.count);
        
        if (activeLinksCount.count >= 300) {
            return res.status(400).json({ 
                success: false, 
                message: 'Limite de 300 liens atteinte. Veuillez supprimer des liens existants avant d\'en créer de nouveaux.' 
            });
        }
        
        // Generate random token (20 bytes = 40 hex characters for better security)
        const rawToken = crypto.randomBytes(20).toString('hex');
        const tokenHash = hashToken(rawToken);
        
        // Calculate expiration time
        let expiresAt = null;
        if (expires_hours && expires_hours > 0) {
            expiresAt = new Date(Date.now() + (expires_hours * 60 * 60 * 1000));
        }

        // Store hashed token in database with additional info
        console.log('💾 Insertion en base:', { tokenHash: tokenHash.substring(0, 8) + '...', expiresAt, description });
        const result = await executeQuery(
            'INSERT INTO store_access_links (token_hash, status, expires_at, description, created_by) VALUES (?, ?, ?, ?, ?)',
            [tokenHash, 'active', expiresAt, description || null, req.session.user.id]
        );
        console.log('✅ Lien créé avec ID:', result.insertId);

        logActivity('ACCESS_LINK_GENERATED', { 
            linkId: result.insertId,
            tokenHash: tokenHash.substring(0, 8) + '...', 
            expires_hours,
            description,
            totalLinks: activeLinksCount.count + 1,
            ip: req.ip 
        }, req.session.user.id);

        // Return raw token to admin (only time it's sent)
        res.json({ 
            success: true, 
            message: 'Lien d\'accès généré avec succès',
            linkId: result.insertId,
            token: rawToken,
            expires_at: expiresAt,
            description: description,
            link: `${req.protocol}://${req.get('host')}/access/${rawToken}`,
            totalActiveLinks: activeLinksCount.count + 1
        });
    } catch (error) {
        console.error('Generate link error:', error);
        logActivity('ACCESS_LINK_GENERATION_FAILED', { error: error.message, ip: req.ip }, req.session.user?.id);
        res.status(500).json({ success: false, message: 'Échec de la génération du lien d\'accès' });
    }
});

// Check access link
router.post('/check-link', async (req, res) => {
    try {
        const { token, deviceId } = req.body;
        
        if (!token || !deviceId) {
            return res.status(400).json({ success: false, message: 'Token and device ID required' });
        }

        // Validate token format (40 hex characters for new tokens)
        if (!/^[a-f0-9]{40}$/i.test(token)) {
            logActivity('ACCESS_LINK_CHECK_FAILED', { reason: 'invalid_format', ip: req.ip });
            return res.status(400).json({ success: false, message: 'Invalid token format' });
        }

        const tokenHash = hashToken(token);
        
        // Find the access link
        const link = await getOne(
            'SELECT * FROM store_access_links WHERE token_hash = ?',
            [tokenHash]
        );

        if (!link) {
            logActivity('ACCESS_LINK_CHECK_FAILED', { reason: 'not_found', tokenHash: tokenHash.substring(0, 8) + '...', ip: req.ip });
            return res.status(404).json({ success: false, message: 'Access link not found' });
        }

        // Check if expired
        if (link.expires_at && new Date() > new Date(link.expires_at)) {
            logActivity('ACCESS_LINK_CHECK_FAILED', { reason: 'expired', tokenHash: tokenHash.substring(0, 8) + '...', ip: req.ip });
            return res.status(403).json({ success: false, message: 'Access link has expired' });
        }

        // Check status and device
        if (link.status !== 'active' && link.used_by_device !== deviceId) {
            logActivity('ACCESS_LINK_CHECK_FAILED', { 
                reason: 'already_used_different_device', 
                tokenHash: tokenHash.substring(0, 8) + '...', 
                ip: req.ip 
            });
            return res.status(403).json({ success: false, message: 'Access link already used by another device' });
        }

        // If not used yet, mark as used and store device info
        if (!link.used_by_device) {
            const userAgent = req.get('User-Agent') || 'Unknown';
            const deviceInfo = JSON.stringify({
                userAgent: userAgent,
                ip: req.ip,
                timestamp: new Date().toISOString()
            });
            
            await executeQuery(
                'UPDATE store_access_links SET used_by_device = ?, status = ?, used_at = NOW(), device_info = ?, access_count = 1 WHERE token_hash = ?',
                [deviceId, 'used', deviceInfo, tokenHash]
            );
            
            logActivity('ACCESS_LINK_FIRST_USE', { 
                tokenHash: tokenHash.substring(0, 8) + '...', 
                deviceId: deviceId.substring(0, 8) + '...', 
                ip: req.ip 
            });
        } else {
            // Update last accessed and increment access count
            await executeQuery(
                'UPDATE store_access_links SET last_accessed = NOW(), access_count = access_count + 1 WHERE token_hash = ?',
                [tokenHash]
            );
            
            logActivity('ACCESS_LINK_REUSE', { 
                tokenHash: tokenHash.substring(0, 8) + '...', 
                deviceId: deviceId.substring(0, 8) + '...', 
                ip: req.ip 
            });
        }

        res.json({ success: true, message: 'Access granted' });
    } catch (error) {
        console.error('Check link error:', error);
        logActivity('ACCESS_LINK_CHECK_ERROR', { error: error.message, ip: req.ip });
        res.status(500).json({ success: false, message: 'Failed to check access link' });
    }
});

// List access links (admin only)
router.get('/admin/access-links', isAdmin, async (req, res) => {
    try {
        console.log('🔍 Admin access-links request from user:', req.session.user);
        
        const links = await executeQuery(`
            SELECT id, token_hash, status, description, created_at, expires_at, used_at, 
                   used_by_device, access_count, last_accessed,
                   (SELECT name FROM users WHERE id = store_access_links.created_by) as created_by_name
            FROM store_access_links 
            ORDER BY created_at DESC
        `);

        console.log('📊 Found', links.length, 'access links');

        // Truncate sensitive data for display and add computed fields
        const safeLinks = links.map(link => ({
            ...link,
            token_hash: link.token_hash.substring(0, 8) + '...',
            used_by_device: link.used_by_device ? link.used_by_device.substring(0, 8) + '...' : null,
            is_expired: link.expires_at && new Date() > new Date(link.expires_at),
            access_count: link.access_count || 0
        }));

        res.json({ success: true, links: safeLinks });
    } catch (error) {
        console.error('❌ List links error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch access links' });
    }
});

// Revoke access link (admin only)
router.put('/admin/access-links/:id/revoke', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await executeQuery(
            'UPDATE store_access_links SET status = ? WHERE id = ?',
            ['revoked', id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Lien d\'accès non trouvé' });
        }

        logActivity('ACCESS_LINK_REVOKED', { linkId: id, ip: req.ip }, req.session.user.id);
        res.json({ success: true, message: 'Lien d\'accès révoqué avec succès' });
    } catch (error) {
        console.error('Revoke link error:', error);
        res.status(500).json({ success: false, message: 'Échec de la révocation du lien' });
    }
});

// Delete access link (admin only)
router.delete('/admin/access-links/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await executeQuery(
            'DELETE FROM store_access_links WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Lien d\'accès non trouvé' });
        }

        logActivity('ACCESS_LINK_DELETED', { linkId: id, ip: req.ip }, req.session.user.id);
        res.json({ success: true, message: 'Lien d\'accès supprimé avec succès' });
    } catch (error) {
        console.error('Delete link error:', error);
        res.status(500).json({ success: false, message: 'Échec de la suppression du lien' });
    }
});

// Get access link statistics (admin only)
router.get('/admin/access-links/stats', isAdmin, async (req, res) => {
    try {
        const stats = await executeQuery(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) as used,
                SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired,
                SUM(CASE WHEN status = 'revoked' THEN 1 ELSE 0 END) as revoked,
                SUM(CASE WHEN expires_at IS NOT NULL AND expires_at < NOW() THEN 1 ELSE 0 END) as expired_by_time,
                SUM(access_count) as total_accesses
            FROM store_access_links
        `);

        res.json({ success: true, stats: stats[0] });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ success: false, message: 'Échec de récupération des statistiques' });
    }
});

// ===== GESTION DES CATÉGORIES (ADMIN) =====

// Récupérer toutes les catégories
router.get('/categories', async (req, res) => {
    try {
        const categories = await executeQuery('SELECT * FROM categories ORDER BY name');
        res.json({ success: true, categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des catégories' });
    }
});

// Ajouter une nouvelle catégorie (admin seulement)
router.post('/admin/categories', isAdmin, uploadCategoryImage, async (req, res) => {
    try {
        const { name, description, icon } = req.body;
        
        if (!name || !icon) {
            return res.status(400).json({ 
                success: false, 
                message: 'Le nom et l\'icône sont obligatoires' 
            });
        }
        
        // Vérifier si la catégorie existe déjà
        const existing = await getOne('SELECT id FROM categories WHERE name = ?', [name]);
        if (existing) {
            return res.status(400).json({ 
                success: false, 
                message: 'Une catégorie avec ce nom existe déjà' 
            });
        }
        
        // Gérer l'image uploadée
        let imageUrl = null;
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }
        
        const result = await executeQuery(
            'INSERT INTO categories (name, description, icon, image) VALUES (?, ?, ?, ?)',
            [name, description || null, icon, imageUrl]
        );
        
        const newCategory = await getOne('SELECT * FROM categories WHERE id = ?', [result.insertId]);
        
        logActivity('CATEGORY_CREATED', { categoryId: result.insertId, name, hasImage: !!imageUrl }, req.session.user.id);
        res.json({ 
            success: true, 
            message: 'Catégorie créée avec succès',
            category: newCategory 
        });
        
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la création de la catégorie' });
    }
});

// Modifier une catégorie (admin seulement)
router.put('/admin/categories/:id', isAdmin, uploadCategoryImage, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, icon } = req.body;
        
        if (!name || !icon) {
            return res.status(400).json({ 
                success: false, 
                message: 'Le nom et l\'icône sont obligatoires' 
            });
        }
        
        // Vérifier si la catégorie existe
        const category = await getOne('SELECT * FROM categories WHERE id = ?', [id]);
        if (!category) {
            return res.status(404).json({ 
                success: false, 
                message: 'Catégorie non trouvée' 
            });
        }
        
        // Vérifier si le nouveau nom existe déjà (sauf pour cette catégorie)
        const existing = await getOne('SELECT id FROM categories WHERE name = ? AND id != ?', [name, id]);
        if (existing) {
            return res.status(400).json({ 
                success: false, 
                message: 'Une catégorie avec ce nom existe déjà' 
            });
        }
        
        // Gérer l'image uploadée
        let imageUrl = category.image; // Garder l'image existante par défaut
        if (req.file) {
            // Supprimer l'ancienne image si elle existe
            if (category.image) {
                const oldImagePath = path.join(__dirname, '..', 'public', category.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            imageUrl = `/uploads/${req.file.filename}`;
        }
        
        await executeQuery(
            'UPDATE categories SET name = ?, description = ?, icon = ?, image = ? WHERE id = ?',
            [name, description || null, icon, imageUrl, id]
        );
        
        const updatedCategory = await getOne('SELECT * FROM categories WHERE id = ?', [id]);
        
        logActivity('CATEGORY_UPDATED', { categoryId: id, name }, req.session.user.id);
        res.json({ 
            success: true, 
            message: 'Catégorie modifiée avec succès',
            category: updatedCategory 
        });
        
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la modification de la catégorie' });
    }
});

// Supprimer une catégorie (admin seulement)
router.delete('/admin/categories/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Vérifier si la catégorie existe
        const category = await getOne('SELECT * FROM categories WHERE id = ?', [id]);
        if (!category) {
            return res.status(404).json({ 
                success: false, 
                message: 'Catégorie non trouvée' 
            });
        }
        
        // Vérifier si des produits utilisent cette catégorie
        const productsCount = await getOne('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [id]);
        if (productsCount.count > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Impossible de supprimer cette catégorie car ${productsCount.count} produit(s) l'utilisent` 
            });
        }
        
        await executeQuery('DELETE FROM categories WHERE id = ?', [id]);
        
        logActivity('CATEGORY_DELETED', { categoryId: id, name: category.name }, req.session.user.id);
        res.json({ 
            success: true, 
            message: 'Catégorie supprimée avec succès' 
        });
        
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la catégorie' });
    }
});

// Récupérer les icônes disponibles
router.get('/admin/categories/icons', isAdmin, async (req, res) => {
    try {
        const icons = [
            // Soins & Beauté
            { category: 'Soins & Beauté', icons: [
                'bi-magic', 'bi-stars', 'bi-sparkles', 'bi-droplet', 'bi-droplet-half',
                'bi-person-hearts', 'bi-suit-heart', 'bi-brush', 'bi-palette', 'bi-scissors',
                'bi-heart', 'bi-heart-fill', 'bi-gender-female', 'bi-gem', 'bi-lightning-charge'
            ]},
            // Nature & Bien-être
            { category: 'Nature & Bien-être', icons: [
                'bi-leaf', 'bi-flower1', 'bi-flower2', 'bi-flower3', 'bi-tree',
                'bi-moisture', 'bi-wind', 'bi-sun', 'bi-cloud-sun', 'bi-water',
                'bi-brightness-high', 'bi-cup-hot', 'bi-peace', 'bi-patch-check'
            ]},
            // Commerce & Cadeaux
            { category: 'Commerce & Cadeaux', icons: [
                'bi-shop', 'bi-shop-window', 'bi-bag', 'bi-bag-heart', 'bi-bag-check',
                'bi-cart', 'bi-cart-check', 'bi-gift', 'bi-gift-fill', 'bi-tag',
                'bi-tags', 'bi-percent', 'bi-credit-card', 'bi-cash', 'bi-receipt'
            ]},
            // Maison & Hammam
            { category: 'Maison & Hammam', icons: [
                'bi-house', 'bi-door-open', 'bi-lamp', 'bi-lightbulb', 'bi-box-seam',
                'bi-archive', 'bi-calendar-event', 'bi-clock', 'bi-geo-alt', 'bi-pin'
            ]},
            // Général
            { category: 'Général', icons: [
                'bi-star', 'bi-star-fill', 'bi-bookmark', 'bi-bookmark-heart', 'bi-flag',
                'bi-globe', 'bi-puzzle', 'bi-book', 'bi-journal', 'bi-image'
            ]}
        ];
        
        res.json({ success: true, icons });
    } catch (error) {
        console.error('Get icons error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des icônes' });
    }
});

// Migration des catégories avec icônes
router.post('/migrate-categories', async (req, res) => {
    try {
        console.log('🔄 Démarrage de la migration des catégories...');
        
        // 1. Vérifier si la colonne icon existe
        const checkColumnQuery = `
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'categories' AND COLUMN_NAME = 'icon'
        `;
        
        const columnCheck = await executeQuery(checkColumnQuery);
        
        // 2. Ajouter la colonne icon si elle n'existe pas
        if (columnCheck.length === 0) {
            console.log('➕ Ajout de la colonne icon...');
            await executeQuery(`
                ALTER TABLE categories 
                ADD COLUMN icon VARCHAR(50) DEFAULT 'bi-tag'
            `);
            console.log('✅ Colonne icon ajoutée');
        } else {
            console.log('✅ Colonne icon existe déjà');
        }
        
        // 3. Vérifier les catégories existantes
        const existingCategories = await executeQuery('SELECT * FROM categories');
        console.log(`📊 ${existingCategories.length} catégories existantes trouvées`);
        
        // 4. Catégories électroniques avec icônes
        const electronicCategories = [
            { name: 'Smartphones & Tablettes', description: 'Derniers smartphones, tablettes et accessoires mobiles', icon: 'bi-phone' },
            { name: 'Ordinateurs & Laptops', description: 'PC, laptops, stations de travail et composants', icon: 'bi-laptop' },
            { name: 'Audio & Casques', description: 'Casques, écouteurs, enceintes et équipements audio', icon: 'bi-headphones' },
            { name: 'Gaming & Consoles', description: 'Consoles de jeux, PC gaming et accessoires', icon: 'bi-controller' },
            { name: 'TV & Écrans', description: 'Téléviseurs, moniteurs et écrans professionnels', icon: 'bi-tv' },
            { name: 'Appareils Photo', description: 'Appareils photo, caméras et équipements vidéo', icon: 'bi-camera' },
            { name: 'Maison Connectée', description: 'Domotique, objets connectés et maison intelligente', icon: 'bi-house-gear' },
            { name: 'Accessoires Tech', description: 'Chargeurs, câbles, coques et accessoires divers', icon: 'bi-usb-plug' },
            { name: 'Électroménager', description: 'Appareils électroménagers intelligents et modernes', icon: 'bi-lightning' },
            { name: 'Wearables & Fitness', description: 'Montres connectées, bracelets fitness et santé', icon: 'bi-smartwatch' }
        ];
        
        let updatedCount = 0;
        let createdCount = 0;
        
        // 5. Mettre à jour ou créer les catégories
        for (const category of electronicCategories) {
            // Vérifier si la catégorie existe déjà (par nom)
            const existing = await executeQuery(
                'SELECT * FROM categories WHERE name = ?',
                [category.name]
            );
            
            if (existing.length > 0) {
                // Mettre à jour l'icône si elle n'est pas définie
                if (!existing[0].icon || existing[0].icon === 'bi-tag') {
                    await executeQuery(
                        'UPDATE categories SET icon = ?, description = ? WHERE id = ?',
                        [category.icon, category.description, existing[0].id]
                    );
                    updatedCount++;
                    console.log(`🔄 Mis à jour: ${category.name} -> ${category.icon}`);
                }
            } else {
                // Créer la nouvelle catégorie
                await executeQuery(
                    'INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)',
                    [category.name, category.description, category.icon]
                );
                createdCount++;
                console.log(`➕ Créé: ${category.name} -> ${category.icon}`);
            }
        }
        
        // 6. Récupérer toutes les catégories finales
        const finalCategories = await executeQuery('SELECT * FROM categories ORDER BY name');
        
        console.log('✅ Migration terminée');
        console.log(`📊 Résultat: ${createdCount} créées, ${updatedCount} mises à jour, ${finalCategories.length} total`);
        
        res.json({
            success: true,
            message: `Migration réussie! ${createdCount} catégories créées, ${updatedCount} mises à jour.`,
            categories: finalCategories,
            stats: {
                created: createdCount,
                updated: updatedCount,
                total: finalCategories.length
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur migration:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la migration: ' + error.message
        });
    }
});

module.exports = router;