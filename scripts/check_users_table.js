const { promisePool } = require('../config/db');

async function checkUsersTable() {
    try {
        console.log('🔍 Vérification de la table users...');
        
        // 1. Structure de la table
        console.log('📋 Structure de la table users :');
        const [structure] = await promisePool.execute('DESCRIBE users');
        console.table(structure);
        
        // 2. Contenu de la table
        console.log('👥 Utilisateurs dans la table :');
        const [users] = await promisePool.execute('SELECT * FROM users');
        
        if (users.length > 0) {
            console.table(users);
        } else {
            console.log('📭 Aucun utilisateur trouvé dans la table');
        }
        
        console.log(`📊 Total : ${users.length} utilisateur(s)`);
        
    } catch (error) {
        console.error('❌ Erreur lors de la vérification :', error.message);
    } finally {
        process.exit(0);
    }
}

checkUsersTable();