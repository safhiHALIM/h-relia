const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'neosafi_store'
};

async function verifyDatabaseStructure() {
    let connection;
    
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connected successfully');
        
        // Lister toutes les tables
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('\n📋 Structure complète de la base de données NeoSafi Store :');
        console.log('=' .repeat(60));
        
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            console.log(`\n🗂️  TABLE: ${tableName.toUpperCase()}`);
            console.log('-'.repeat(40));
            
            // Obtenir la structure de chaque table
            const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
            
            columns.forEach((column, index) => {
                const field = column.Field;
                const type = column.Type;
                const nullable = column.Null === 'YES' ? 'NULL' : 'NOT NULL';
                const key = column.Key ? `[${column.Key}]` : '';
                const defaultValue = column.Default !== null ? `DEFAULT: ${column.Default}` : '';
                const extra = column.Extra ? `(${column.Extra})` : '';
                
                console.log(`  ${index + 1}. ${field} - ${type} ${nullable} ${key} ${defaultValue} ${extra}`.trim());
            });
            
            // Compter les enregistrements
            const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
            console.log(`  📊 Enregistrements: ${count[0].count}`);
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('🎯 RÉSUMÉ DE LA BASE DE DONNÉES :');
        console.log('=' .repeat(60));
        
        // Résumé détaillé
        const tableDetails = {
            'users': 'Utilisateurs (admin et clients)',
            'categories': 'Catégories de produits',
            'products': 'Catalogue de produits',
            'orders': 'Commandes clients',
            'order_items': 'Articles des commandes',
            'access_links': 'Liens d\'accès rapide'
        };
        
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
            const description = tableDetails[tableName] || 'Table système';
            
            console.log(`✅ ${tableName.padEnd(15)} | ${count[0].count.toString().padStart(3)} enregistrements | ${description}`);
        }
        
        console.log('\n🎉 Base de données NeoSafi Store complète et opérationnelle !');
        
        // Vérifier les relations
        console.log('\n🔗 VÉRIFICATION DES RELATIONS :');
        console.log('-'.repeat(40));
        
        // Vérifier les foreign keys
        const [foreignKeys] = await connection.execute(`
            SELECT 
                TABLE_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE REFERENCED_TABLE_SCHEMA = 'neosafi_store'
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        
        if (foreignKeys.length > 0) {
            foreignKeys.forEach(fk => {
                console.log(`✅ ${fk.TABLE_NAME}.${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
            });
        } else {
            console.log('ℹ️  Aucune clé étrangère détectée');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

verifyDatabaseStructure();