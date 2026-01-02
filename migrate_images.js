const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateImages() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'neosafi_store'
    });

    try {
        console.log('🚀 Starting image migration...');

        // Create product_images table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS product_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                image_url VARCHAR(255) NOT NULL,
                alt_text VARCHAR(255),
                is_primary BOOLEAN DEFAULT FALSE,
                sort_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                INDEX idx_product_id (product_id),
                INDEX idx_is_primary (is_primary),
                INDEX idx_sort_order (sort_order)
            )
        `);
        console.log('✅ Table product_images created');

        // Migrate existing images
        const [products] = await connection.execute(
            'SELECT id, image FROM products WHERE image IS NOT NULL AND image != ""'
        );

        console.log(`📦 Found ${products.length} products with images to migrate`);

        for (const product of products) {
            await connection.execute(
                'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, TRUE, 0)',
                [product.id, product.image]
            );
            console.log(`✅ Migrated image for product ${product.id}`);
        }

        // Create composite indexes
        await connection.execute('CREATE INDEX idx_product_primary ON product_images (product_id, is_primary)');
        await connection.execute('CREATE INDEX idx_product_sort ON product_images (product_id, sort_order)');
        console.log('✅ Indexes created');

        console.log('🎉 Migration completed successfully!');
        console.log(`📊 Migrated ${products.length} product images`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrateImages();