const { promisePool } = require('../config/db');

async function updateUsersTable() {
    try {
        console.log('🔄 Début de la modification de la table users...');
        
        // 1. Vérifier la structure actuelle
        console.log('📋 Structure actuelle de la table users :');
        const [currentStructure] = await promisePool.execute('DESCRIBE users');
        console.table(currentStructure);
        
        // 2. Vérifier si la colonne username existe déjà
        const hasUsername = currentStructure.some(col => col.Field === 'username');
        const hasEmail = currentStructure.some(col => col.Field === 'email');
        
        if (hasUsername && !hasEmail) {
            console.log('✅ La table users a déjà la structure correcte (username au lieu d\'email)');
            return;
        }
        
        if (!hasEmail) {
            console.log('⚠️  La table users n\'a pas de colonne email à remplacer');
            return;
        }
        
        // 3. Sauvegarder les données existantes
        console.log('💾 Sauvegarde des utilisateurs existants...');
        const [existingUsers] = await promisePool.execute('SELECT * FROM users');
        console.log(`📊 ${existingUsers.length} utilisateur(s) trouvé(s)`);
        
        // 4. Ajouter la colonne username
        console.log('➕ Ajout de la colonne username...');
        await promisePool.execute('ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE AFTER id');
        
        // 5. Migrer les données email vers username
        console.log('🔄 Migration des données email vers username...');
        for (const user of existingUsers) {
            const username = user.email.split('@')[0]; // Prendre la partie avant @
            await promisePool.execute(
                'UPDATE users SET username = ? WHERE id = ?',
                [username, user.id]
            );
            console.log(`   ✅ ${user.email} → ${username}`);
        }
        
        // 6. Supprimer la colonne email
        console.log('🗑️  Suppression de la colonne email...');
        await promisePool.execute('ALTER TABLE users DROP COLUMN email');
        
        // 7. Vérifier la structure finale
        console.log('📋 Structure finale de la table users :');
        const [finalStructure] = await promisePool.execute('DESCRIBE users');
        console.table(finalStructure);
        
        // 8. Afficher les utilisateurs mis à jour
        console.log('👥 Utilisateurs après modification :');
        const [updatedUsers] = await promisePool.execute('SELECT id, username, name, role, created_at FROM users');
        console.table(updatedUsers);
        
        console.log('✅ Modification de la table users terminée avec succès !');
        
    } catch (error) {
        console.error('❌ Erreur lors de la modification de la table users :', error.message);
        console.error('🔧 Détails de l\'erreur :', error);
    } finally {
        process.exit(0);
    }
}

// Exécuter la modification
updateUsersTable();