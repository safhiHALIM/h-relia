const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'neosafi_store'
};

async function createMissingTables() {
    let connection;
    
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connected successfully');
        
        // 1. Créer la table orders
        console.log('\n📦 Création de la table orders...');
        const createOrdersTable = `
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                customer_name VARCHAR(100) NOT NULL,
                customer_email VARCHAR(100) NOT NULL,
                customer_phone VARCHAR(20),
                shipping_address TEXT NOT NULL,
                city VARCHAR(50) NOT NULL,
                zip_code VARCHAR(10) NOT NULL,
                total_amount DECIMAL(10, 2) NOT NULL,
                status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await connection.execute(createOrdersTable);
        console.log('✅ Table orders créée avec succès');
        
        // 2. Créer la table order_items
        console.log('\n📋 Création de la table order_items...');
        const createOrderItemsTable = `
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                product_name VARCHAR(255) NOT NULL,
                product_price DECIMAL(10, 2) NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                subtotal DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await connection.execute(createOrderItemsTable);
        console.log('✅ Table order_items créée avec succès');
        
        // 3. Créer la table access_links
        console.log('\n🔗 Création de la table access_links...');
        const createAccessLinksTable = `
            CREATE TABLE IF NOT EXISTS access_links (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                url VARCHAR(500) NOT NULL,
                description TEXT,
                category VARCHAR(100),
                is_active BOOLEAN DEFAULT TRUE,
                click_count INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await connection.execute(createAccessLinksTable);
        console.log('✅ Table access_links créée avec succès');
        
        // Vérifier que toutes les tables ont été créées
        console.log('\n🔍 Vérification des tables créées...');
        const [tables] = await connection.execute('SHOW TABLES');
        const tableNames = tables.map(table => Object.values(table)[0]);
        
        const requiredTables = ['orders', 'order_items', 'access_links'];
        requiredTables.forEach(tableName => {
            if (tableNames.includes(tableName)) {
                console.log(`✅ ${tableName} - Créée avec succès`);
            } else {
                console.log(`❌ ${tableName} - Échec de création`);
            }
        });
        
        // Ajouter quelques données de test pour access_links
        console.log('\n📝 Ajout de données de test pour access_links...');
        const insertAccessLinks = `
            INSERT INTO access_links (title, url, description, category) VALUES
            ('Google', 'https://www.google.com', 'Moteur de recherche Google', 'Search'),
            ('GitHub', 'https://github.com', 'Plateforme de développement collaboratif', 'Development'),
            ('Stack Overflow', 'https://stackoverflow.com', 'Communauté de développeurs', 'Development'),
            ('Bootstrap Documentation', 'https://getbootstrap.com/docs', 'Documentation officielle Bootstrap', 'Documentation'),
            ('MDN Web Docs', 'https://developer.mozilla.org', 'Documentation web Mozilla', 'Documentation')
            ON DUPLICATE KEY UPDATE title = VALUES(title)
        `;
        
        await connection.execute(insertAccessLinks);
        console.log('✅ Données de test ajoutées pour access_links');
        
        console.log('\n🎉 Toutes les tables manquantes ont été créées avec succès !');
        console.log('\n📊 Structure finale de la base de données :');
        
        const [finalTables] = await connection.execute('SHOW TABLES');
        finalTables.forEach((table, index) => {
            const tableName = Object.values(table)[0];
            console.log(`${index + 1}. ✅ ${tableName}`);
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la création des tables:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createMissingTables();