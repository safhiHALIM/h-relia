const { executeQuery } = require('../config/db');

async function createStoreAccessLinksTable() {
    try {
        console.log('🔄 Création de la table store_access_links...');
        
        // Créer la nouvelle table pour les liens d'accès au store
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS store_access_links (
                id INT AUTO_INCREMENT PRIMARY KEY,
                token_hash VARCHAR(64) NOT NULL UNIQUE COMMENT 'SHA256 hash du token',
                used_by_device VARCHAR(64) NULL COMMENT 'SHA256 hash de empreinte appareil',
                device_info TEXT NULL COMMENT 'Informations sur appareil User-Agent etc',
                status ENUM('active', 'used', 'expired', 'revoked') DEFAULT 'active',
                description VARCHAR(255) NULL COMMENT 'Description du lien pour admin',
                created_by INT NULL COMMENT 'ID de admin qui a cree le lien',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NULL COMMENT 'NULL = pas expiration',
                used_at TIMESTAMP NULL COMMENT 'Premiere utilisation',
                last_accessed TIMESTAMP NULL COMMENT 'Dernier acces',
                access_count INT DEFAULT 0 COMMENT 'Nombre acces',
                
                INDEX idx_token_hash (token_hash),
                INDEX idx_status (status),
                INDEX idx_expires (expires_at),
                INDEX idx_created (created_at),
                INDEX idx_created_by (created_by),
                INDEX idx_device (used_by_device),
                
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            COMMENT='Liens acces uniques pour le store'
        `;
        
        await executeQuery(createTableSQL);
        console.log('✅ Table store_access_links créée avec succès');
        
        // Vérifier la structure
        const structure = await executeQuery('DESCRIBE store_access_links');
        console.log('\n📋 Structure de la table store_access_links:');
        structure.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
        });
        
        console.log('\n✅ Création terminée avec succès!');
        console.log('\n📝 Note: La table access_links existante reste intacte pour les liens de raccourcis.');
        console.log('📝 La nouvelle table store_access_links est utilisée pour les liens d\'accès au store.');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Erreur lors de la création:', error);
        process.exit(1);
    }
}

// Exécuter la création
createStoreAccessLinksTable();