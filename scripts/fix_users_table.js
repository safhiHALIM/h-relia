const { promisePool } = require('../config/db');

async function fixUsersTable() {
    try {
        console.log('🔧 Correction de la table users...');
        
        // 1. Supprimer la table existante et la recréer correctement
        console.log('🗑️  Suppression de la table users existante...');
        await promisePool.execute('DROP TABLE IF EXISTS users');
        
        // 2. Créer la nouvelle table avec la structure correcte
        console.log('🏗️  Création de la nouvelle table users...');
        const createTableQuery = `
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await promisePool.execute(createTableQuery);
        
        // 3. Insérer des utilisateurs de test
        console.log('👤 Insertion des utilisateurs de test...');
        
        const users = [
            {
                username: 'admin',
                name: 'Administrateur',
                password: 'admin123',
                role: 'admin'
            },
            {
                username: 'user1',
                name: 'Utilisateur Test',
                password: 'user123',
                role: 'user'
            }
        ];
        
        for (const user of users) {
            await promisePool.execute(
                'INSERT INTO users (username, name, password, role) VALUES (?, ?, ?, ?)',
                [user.username, user.name, user.password, user.role]
            );
            console.log(`   ✅ Utilisateur créé : ${user.username} (${user.role})`);
        }
        
        // 4. Vérifier la structure finale
        console.log('📋 Structure finale de la table users :');
        const [structure] = await promisePool.execute('DESCRIBE users');
        console.table(structure);
        
        // 5. Afficher les utilisateurs créés
        console.log('👥 Utilisateurs dans la table :');
        const [finalUsers] = await promisePool.execute('SELECT id, username, name, role, created_at FROM users');
        console.table(finalUsers);
        
        console.log('✅ Table users corrigée avec succès !');
        console.log('🔑 Identifiants de connexion :');
        console.log('   Admin : username=admin, password=admin123');
        console.log('   User  : username=user1, password=user123');
        
    } catch (error) {
        console.error('❌ Erreur lors de la correction :', error.message);
    } finally {
        process.exit(0);
    }
}

fixUsersTable();