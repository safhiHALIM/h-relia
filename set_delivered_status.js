/**
 * Script pour mettre quelques commandes en status "delivered" pour tester la suppression
 */

const { executeQuery } = require('./config/db');

async function setDeliveredStatus() {
    console.log('🚚 Configuration des commandes livrées pour les tests...\n');

    try {
        // Récupérer toutes les commandes
        const allOrders = await executeQuery('SELECT id, status, customer_name FROM orders ORDER BY id DESC LIMIT 10');
        console.log('📋 Commandes existantes:');
        allOrders.forEach(order => {
            console.log(`   #${order.id} - ${order.customer_name || 'N/A'} - Status: ${order.status}`);
        });

        // Choisir 3-4 commandes à marquer comme livrées
        const ordersToDeliver = allOrders.slice(2, 6); // Prendre quelques commandes du milieu

        console.log('\n🎯 Commandes à marquer comme livrées:');
        for (const order of ordersToDeliver) {
            if (order.status !== 'delivered') {
                await executeQuery('UPDATE orders SET status = ? WHERE id = ?', ['delivered', order.id]);
                console.log(`   ✅ #${order.id} - ${order.customer_name || 'N/A'} → DELIVERED`);
            } else {
                console.log(`   ⭐ #${order.id} - ${order.customer_name || 'N/A'} → Déjà DELIVERED`);
            }
        }

        // Vérifier le résultat
        const deliveredOrders = await executeQuery('SELECT id, customer_name, total_amount FROM orders WHERE status = "delivered"');
        console.log(`\n✅ Résultat: ${deliveredOrders.length} commande(s) livrée(s):`);
        deliveredOrders.forEach(order => {
            console.log(`   📦 #${order.id} - ${order.customer_name || 'N/A'} - $${order.total_amount}`);
        });

        console.log('\n🎉 Configuration terminée !');
        console.log('💡 Vous pouvez maintenant tester la suppression des commandes livrées dans le panel admin.');
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    }

    process.exit();
}

if (require.main === module) {
    setDeliveredStatus();
}