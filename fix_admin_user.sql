-- Script pour créer ou corriger l'utilisateur administrateur
-- Ce script résout le problème "Failed to fetch order details" en s'assurant 
-- qu'un utilisateur admin valide existe dans la base de données

USE neosafi_store;

-- D'abord, vérifions si l'utilisateur admin existe déjà
SELECT id, username, name, email, role, created_at FROM users WHERE role = 'admin';

-- Créer ou mettre à jour l'utilisateur admin
INSERT INTO users (username, password, name, email, role, created_at)
VALUES ('admin', 'admin123', 'Administrator', 'admin@neosafi.com', 'admin', NOW())
ON DUPLICATE KEY UPDATE 
    password = 'admin123',
    role = 'admin',
    name = 'Administrator';

-- Vérifier que l'utilisateur admin a été créé/mis à jour
SELECT id, username, name, email, role, created_at FROM users WHERE role = 'admin';

-- Statistiques de la base de données
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_users,
    (SELECT COUNT(*) FROM orders) as total_orders,
    (SELECT COUNT(*) FROM products) as total_products;