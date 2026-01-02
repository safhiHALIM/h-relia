-- Script pour ajouter la fonctionnalité de plusieurs images par produit

-- Créer la table product_images
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_is_primary (is_primary),
    INDEX idx_sort_order (sort_order)
);

-- Migrer les images existantes de la table products vers product_images
INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
SELECT id, image, TRUE, 0
FROM products 
WHERE image IS NOT NULL AND image != '';

-- Optionnel : Supprimer la colonne image de la table products après migration
-- ALTER TABLE products DROP COLUMN image;

-- Créer un index composite pour optimiser les requêtes
CREATE INDEX idx_product_primary ON product_images (product_id, is_primary);
CREATE INDEX idx_product_sort ON product_images (product_id, sort_order);