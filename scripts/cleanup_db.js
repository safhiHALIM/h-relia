const mysql = require('mysql2/promise');

async function cleanup() {
    const dbConfig = {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'neosafi_store'
    };
    
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to neosafi_store');

        // Empty product table
        console.log('Emptying products table...');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('TRUNCATE TABLE products');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Products table emptied');

        // Delete access_links table
        console.log('Dropping access_links table...');
        await connection.execute('DROP TABLE IF EXISTS access_links');
        console.log('✅ access_links table dropped');

    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

cleanup();
