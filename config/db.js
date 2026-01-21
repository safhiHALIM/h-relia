const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool for better performance and connection management
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'neosafi_store',
    port: process.env.DB_PORT || 3306,
    // Enable SSL for managed MySQL providers (e.g., PlanetScale) when DB_SSL=true
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

// Promisify pool for async/await usage
const promisePool = pool.promise();

// Test database connection (non-blocking)
let dbConnected = false;

const testConnection = async () => {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ Database connected successfully');
        dbConnected = true;
        connection.release();
        return true;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('📋 Please ensure:');
        console.error('   1. MySQL is running');
        console.error('   2. Database credentials in .env are correct');
        console.error('   3. Database exists and user has permissions');
        console.error('');
        console.error('🔧 To set up the database:');
        console.error('   mysql -u root -p < sql/neosafi_schema.sql');
        console.error('');
        console.error('⚠️  Server will continue running but database features will be unavailable');
        dbConnected = false;
        return false;
    }
};

// Test connection on startup (non-blocking)
testConnection();

// Helper function to execute queries with error handling
const executeQuery = async (query, params = []) => {
    try {
        const [rows] = await promisePool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// Helper function to get single row
const getOne = async (query, params = []) => {
    const rows = await executeQuery(query, params);
    return rows.length > 0 ? rows[0] : null;
};

// Helper function to check if table exists
const tableExists = async (tableName) => {
    try {
        const query = `
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = ? AND table_name = ?
        `;
        const result = await getOne(query, [process.env.DB_NAME, tableName]);
        return result.count > 0;
    } catch (error) {
        console.error(`Error checking if table ${tableName} exists:`, error);
        return false;
    }
};

// Initialize database tables if they don't exist
const initializeDatabase = async () => {
    if (!dbConnected) {
        return; // Skip initialization if database is not connected
    }
    
    try {
        const tables = ['users', 'categories', 'products', 'orders', 'order_items'];
        
        for (const table of tables) {
            const exists = await tableExists(table);
            if (!exists) {
                console.log(`⚠️  Table ${table} does not exist. Please run the SQL schema file.`);
            }
        }
        
        console.log('✅ Database initialization check completed');
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
    }
};

// Run initialization after connection test
setTimeout(() => {
    initializeDatabase();
}, 1000);

module.exports = {
    pool,
    promisePool,
    executeQuery,
    getOne,
    tableExists,
    testConnection,
    get dbConnected() { return dbConnected; }
};