const { executeQuery } = require('../config/db');

async function migrateAccessLinks() {
    try {
        console.log('🔄 Migration des liens d\'accès...');
        
        // Ajouter les colonnes manquantes
        const migrations = [
            {
                name: 'description',
                sql: 'ALTER TABLE access_links ADD COLUMN IF NOT EXISTS description VARCHAR(255) NULL AFTER expires_at'
            },
            {
                name: 'created_by',
                sql: 'ALTER TABLE access_links ADD COLUMN IF NOT EXISTS created_by INT NULL AFTER description'
            },
            {
                name: 'device_info',
                sql: 'ALTER TABLE access_links ADD COLUMN IF NOT EXISTS device_info TEXT NULL AFTER used_by_device'
            },
            {
                name: 'last_accessed',
                sql: 'ALTER TABLE access_links ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP NULL AFTER used_at'
            }
        ];
        
        for (const migration of migrations) {
            try {
                await executeQuery(migration.sql);
                console.log(`✅ Colonne ${migration.name} ajoutée/vérifiée`);
            } catch (error) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log(`ℹ️  Colonne ${migration.name} existe déjà`);
                } else {
                    console.error(`❌ Erreur lors de l'ajout de la colonne ${migration.name}:`, error.message);
                }
            }
        }
        
        // Ajouter les index pour les performances
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_access_links_created_by ON access_links(created_by)',
            'CREATE INDEX IF NOT EXISTS idx_access_links_description ON access_links(description)',
            'CREATE INDEX IF NOT EXISTS idx_access_links_last_accessed ON access_links(last_accessed)'
        ];
        
        for (const indexSql of indexes) {
            try {
                await executeQuery(indexSql);
                console.log('✅ Index créé/vérifié');
            } catch (error) {
                if (error.code === 'ER_DUP_KEYNAME') {
                    console.log('ℹ️  Index existe déjà');
                } else {
                    console.error('❌ Erreur lors de la création de l\'index:', error.message);
                }
            }
        }
        
        // Vérifier la structure finale
        const structure = await executeQuery('DESCRIBE access_links');
        console.log('\n📋 Structure finale de la table access_links:');
        structure.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
        });
        
        // Compter les liens existants
        const count = await executeQuery('SELECT COUNT(*) as total FROM access_links');
        console.log(`\n📊 Nombre total de liens d'accès: ${count[0].total}`);
        
        console.log('\n✅ Migration terminée avec succès!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        process.exit(1);
    }
}

// Exécuter la migration
migrateAccessLinks();