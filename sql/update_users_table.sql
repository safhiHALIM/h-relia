-- Modification de la table users : remplacer email par username
-- NeoSafi Store Database Update

USE neosafi_store;

-- 1. Ajouter la colonne username
ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE NOT NULL AFTER id;

-- 2. Mettre à jour les données existantes (convertir email en username)
UPDATE users SET username = SUBSTRING_INDEX(email, '@', 1) WHERE email IS NOT NULL;

-- 3. Supprimer la colonne email
ALTER TABLE users DROP COLUMN email;

-- 4. Vérifier la structure finale
DESCRIBE users;

-- 5. Afficher les utilisateurs mis à jour
SELECT * FROM users;

-- Structure finale attendue :
-- +----------+------------------+------+-----+---------+----------------+
-- | Field    | Type             | Null | Key | Default | Extra          |
-- +----------+------------------+------+-----+---------+----------------+
-- | id       | int(11)          | NO   | PRI | NULL    | auto_increment |
-- | username | varchar(50)      | NO   | UNI | NULL    |                |
-- | name     | varchar(100)     | NO   |     | NULL    |                |
-- | password | varchar(255)     | NO   |     | NULL    |                |
-- | role     | enum('user','admin') | NO |     | user    |                |
-- | created_at | timestamp      | NO   |     | CURRENT_TIMESTAMP |        |
-- +----------+------------------+------+-----+---------+----------------+