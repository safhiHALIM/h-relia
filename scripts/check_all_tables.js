const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'neosafi_store'
};

async function checkAllTables() {
    let connection;
    
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connected successfully');
        
        // Lister toutes les tables
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('\n📋 Tables existantes dans la base de données :');
        
        if (tables.length === 0) {
            console.log('❌ Aucune table trouvée');
            return;
        }
        
        tables.forEach((table, index) => {
            const tableName = Object.values(table)[0];
            console.log(`${index + 1}. ✅ ${tableName}`);
        });
        
        // Vérifier les tables spécifiques manquantes
        const requiredTables = ['orders', 'order_items', 'access_links'];
        const existingTableNames = tables.map(table => Object.values(table)[0]);
        
        console.log('\n🔍 Vérification des tables requises :');
        requiredTables.forEach(tableName => {
            if (existingTableNames.includes(tableName)) {
                console.log(`✅ ${tableName} - Existe`);
            } else {
                console.log(`❌ ${tableName} - Manquante`);
            }
        });
        
        console.log(`\n📊 Total : ${tables.length} table(s) existante(s)`);
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkAllTables();