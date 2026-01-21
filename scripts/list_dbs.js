const mysql = require('mysql2/promise');

async function listDbs() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });
        const [rows] = await connection.execute('SHOW DATABASES');
        console.log('Databases:', rows.map(r => r.Database));
        await connection.end();
    } catch (e) {
        console.error(e);
    }
}
listDbs();
