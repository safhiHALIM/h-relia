const http = require('http');

function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(body)
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: body
                    });
                }
            });
        });
        
        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testAuth() {
    console.log('🧪 Test de l\'authentification...\n');
    
    try {
        // Test Admin Login
        console.log('1️⃣ Test Admin Login avec username...');
        
        const loginOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/admin/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const loginData = {
            username: 'admin',
            password: 'admin123'
        };
        
        const response = await makeRequest(loginOptions, loginData);
        console.log(`   Status: ${response.status}`);
        console.log(`   Response:`, response.data);
        
        if (response.data.success) {
            console.log('   ✅ Login réussi !');
            console.log(`   👤 User: ${response.data.user.username} (${response.data.user.role})`);
            
            // Vérifier la structure
            const user = response.data.user;
            const hasUsername = 'username' in user;
            const hasEmail = 'email' in user;
            
            console.log(`   📊 Structure:`);
            console.log(`      - Username: ${hasUsername ? '✅' : '❌'}`);
            console.log(`      - Email: ${hasEmail ? '⚠️ (présent)' : '✅ (absent)'}`);
            
        } else {
            console.log('   ❌ Login échoué');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

testAuth();