const fetch = require('node-fetch');

async function testAuthentication() {
    const baseUrl = 'http://localhost:3000/api';
    
    console.log('🧪 Test de l\'authentification NeoSafi Store...\n');
    
    try {
        // Test 1: Admin Login avec username
        console.log('1️⃣ Test Admin Login avec username...');
        const loginResponse = await fetch(`${baseUrl}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('   Réponse:', loginData);
        
        if (loginData.success) {
            console.log('   ✅ Admin login réussi !');
            console.log(`   👤 Utilisateur: ${loginData.user.username} (${loginData.user.role})`);
        } else {
            console.log('   ❌ Admin login échoué');
        }
        
        console.log('');
        
        // Test 2: Login avec mauvais credentials
        console.log('2️⃣ Test avec mauvais credentials...');
        const badLoginResponse = await fetch(`${baseUrl}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'wrongpassword'
            })
        });
        
        const badLoginData = await badLoginResponse.json();
        console.log('   Réponse:', badLoginData);
        
        if (!badLoginData.success) {
            console.log('   ✅ Rejet des mauvais credentials confirmé');
        } else {
            console.log('   ❌ Sécurité compromise - mauvais credentials acceptés');
        }
        
        console.log('');
        
        // Test 3: Test des routes désactivées
        console.log('3️⃣ Test des routes client désactivées...');
        
        const registerResponse = await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'test',
                password: 'test123'
            })
        });
        
        const registerData = await registerResponse.json();
        console.log('   Register Response:', registerData);
        
        if (registerResponse.status === 404) {
            console.log('   ✅ Route register correctement désactivée');
        } else {
            console.log('   ⚠️  Route register encore active');
        }
        
        console.log('');
        
        // Test 4: Vérification de la structure des données
        console.log('4️⃣ Vérification de la structure des données...');
        
        if (loginData.success && loginData.user) {
            const user = loginData.user;
            const hasUsername = 'username' in user;
            const hasEmail = 'email' in user;
            
            console.log(`   Username présent: ${hasUsername ? '✅' : '❌'}`);
            console.log(`   Email présent: ${hasEmail ? '⚠️' : '✅'} (doit être absent)`);
            console.log(`   Structure: ${JSON.stringify(Object.keys(user))}`);
            
            if (hasUsername && !hasEmail) {
                console.log('   ✅ Structure correcte : username utilisé au lieu d\'email');
            } else {
                console.log('   ❌ Structure incorrecte');
            }
        }
        
        console.log('\n🎉 Tests terminés !');
        
    } catch (error) {
        console.error('❌ Erreur lors des tests:', error.message);
    }
}

// Exécuter les tests
testAuthentication();