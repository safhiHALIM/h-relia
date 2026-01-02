const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const db = require('./config/db');
const storeRoutes = require('./routes/store');

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter rate limiting for sensitive endpoints
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: 'Too many attempts, please try again later.',
});

// Middleware
// Trust proxy in production (needed for secure cookies behind load balancers)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(cors());

// Enable rate limiting only in production
if (process.env.NODE_ENV === 'production') {
    app.use(limiter);
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
// Also expose under /public for compatibility with absolute paths in static hosting
app.use('/public', express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', storeRoutes);

// Route temporaire pour migration des catégories
app.post('/api/migrate-categories', async (req, res) => {
    try {
        // Ajouter la colonne icon si elle n'existe pas
        await db.query(`
            ALTER TABLE categories 
            ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'bi-tag' AFTER description
        `);
        
        // Mettre à jour les catégories existantes vers le créneau Body Care
        const updates = [
            { name: 'Soins Visage', icon: 'bi-person-hearts' },
            { name: 'Soins Corps', icon: 'bi-droplet-half' },
            { name: 'Cheveux', icon: 'bi-scissors' },
            { name: 'Parfums', icon: 'bi-wind' },
            { name: 'Accessoires', icon: 'bi-gem' }
        ];
        
        for (const update of updates) {
            await db.query(`
                INSERT INTO categories (name, description, icon) 
                VALUES (?, ?, ?) 
                ON DUPLICATE KEY UPDATE 
                    icon = VALUES(icon)
            `, [update.name, `Gamme de produits pour ${update.name}`, update.icon]);
        }
        
        // Ajouter nouvelles catégories Tabrima
        const newCategories = [
            { name: 'Gommages & Tabrima', description: 'Gommages traditionnels et mélanges Tabrima', icon: 'bi-stars' },
            { name: 'Huiles Naturelles', description: 'Huiles de massage et soins hydratants', icon: 'bi-flower1' },
            { name: 'Savons Artisanaux', description: 'Savons naturels et gommants', icon: 'bi-box-seam' },
            { name: 'Kits Bien-être', description: 'Coffrets complets pour rituels de beauté', icon: 'bi-gift' }
        ];
        
        for (const category of newCategories) {
            await db.query(`
                INSERT INTO categories (name, description, icon) 
                VALUES (?, ?, ?) 
                ON DUPLICATE KEY UPDATE 
                    description = VALUES(description),
                    icon = VALUES(icon)
            `, [category.name, category.description, category.icon]);
        }
        
        // Récupérer toutes les catégories
        const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
        
        res.json({
            success: true,
            message: 'Migration des catégories terminée avec succès!',
            categories: categories
        });
        
    } catch (error) {
        console.error('Erreur migration catégories:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la migration',
            error: error.message
        });
    }
});

// Apply strict rate limiting to sensitive endpoints only in production
if (process.env.NODE_ENV === 'production') {
    app.use('/api/generate-link', strictLimiter);
    app.use('/api/check-link', strictLimiter);
    app.use('/api/admin/login', strictLimiter);
}

// Serve admin page (protected route will be handled by frontend)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve setup guide
app.get('/setup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'setup.html'));
});

// Serve access link page
app.get('/access/:token', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'access.html'));
});

// Catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    db.end(() => {
        console.log('Database connection closed');
        process.exit(0);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Tabrima Store server running on port ${PORT}`);
    console.log(`Niche: Female Body Care`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
});

module.exports = app;