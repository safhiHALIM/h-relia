-- Ajouter la colonne icon à la table categories
ALTER TABLE categories ADD COLUMN icon VARCHAR(50) DEFAULT 'bi-tag' AFTER description;

-- Mettre à jour les catégories existantes avec des icônes
UPDATE categories SET icon = 'bi-phone' WHERE name = 'Electronics';
UPDATE categories SET icon = 'bi-person-fill' WHERE name = 'Clothing';
UPDATE categories SET icon = 'bi-book' WHERE name = 'Books';
UPDATE categories SET icon = 'bi-house' WHERE name = 'Home & Garden';
UPDATE categories SET icon = 'bi-trophy' WHERE name = 'Sports';

-- Ajouter quelques catégories électroniques avec icônes
INSERT INTO categories (name, description, icon) VALUES 
('Smartphones', 'Téléphones intelligents et accessoires', 'bi-phone'),
('Ordinateurs', 'Ordinateurs portables et de bureau', 'bi-laptop'),
('Audio', 'Écouteurs, haut-parleurs et équipements audio', 'bi-headphones'),
('Photo & Vidéo', 'Appareils photo, caméras et accessoires', 'bi-camera'),
('Gaming', 'Consoles de jeux et accessoires gaming', 'bi-controller'),
('Montres Connectées', 'Smartwatches et montres fitness', 'bi-smartwatch'),
('Tablettes', 'Tablettes et accessoires', 'bi-tablet'),
('Accessoires Tech', 'Câbles, chargeurs et accessoires divers', 'bi-usb-plug')
ON DUPLICATE KEY UPDATE 
    description = VALUES(description),
    icon = VALUES(icon);

SELECT 'Colonne icon ajoutée et catégories mises à jour!' as message;
SELECT * FROM categories ORDER BY name;