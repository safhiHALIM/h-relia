-- Ajouter plus de catégories électroniques détaillées
USE neosafi_store;

-- Supprimer les anciennes catégories pour les remplacer
DELETE FROM categories;

-- Insérer des catégories électroniques détaillées avec des icônes
INSERT INTO categories (id, name, description) VALUES 
(1, 'Smartphones & Tablettes', 'Derniers smartphones, tablettes et accessoires mobiles'),
(2, 'Ordinateurs & Laptops', 'PC de bureau, ordinateurs portables et stations de travail'),
(3, 'Audio & Casques', 'Casques, écouteurs, haut-parleurs et équipements audio'),
(4, 'Gaming & Consoles', 'Consoles de jeux, PC gaming et accessoires de jeu'),
(5, 'TV & Écrans', 'Téléviseurs, moniteurs et écrans de toutes tailles'),
(6, 'Appareils Photo', 'Appareils photo, caméras et équipements de photographie'),
(7, 'Maison Connectée', 'Objets connectés, domotique et maison intelligente'),
(8, 'Accessoires Tech', 'Câbles, chargeurs, coques et accessoires électroniques'),
(9, 'Électroménager', 'Appareils électroménagers modernes et intelligents'),
(10, 'Wearables & Fitness', 'Montres connectées, trackers de fitness et wearables');

-- Mettre à jour les produits existants avec les nouvelles catégories
UPDATE products SET category_id = 1 WHERE name LIKE '%iPhone%' OR name LIKE '%Samsung%' OR name LIKE '%iPad%';
UPDATE products SET category_id = 2 WHERE name LIKE '%MacBook%' OR name LIKE '%laptop%';
UPDATE products SET category_id = 3 WHERE name LIKE '%Headphones%' OR name LIKE '%Speaker%';
UPDATE products SET category_id = 7 WHERE name LIKE '%Smart%' AND name LIKE '%Camera%';
UPDATE products SET category_id = 8 WHERE name LIKE '%Mount%' OR name LIKE '%Charger%';

-- Ajouter plus de produits électroniques
INSERT INTO products (name, description, price, stock, category_id, image, featured) VALUES 
-- Smartphones & Tablettes
('Samsung Galaxy S24 Ultra', 'Smartphone premium avec S Pen, caméra 200MP et écran Dynamic AMOLED 2X', 1299.99, 30, 1, '/images/samsung-s24-ultra.jpg', TRUE),
('Google Pixel 8 Pro', 'Smartphone Google avec IA avancée et appareil photo exceptionnel', 899.99, 40, 1, '/images/pixel-8-pro.jpg', FALSE),
('iPad Air M2', 'Tablette Apple avec puce M2, écran Liquid Retina 10.9 pouces', 699.99, 25, 1, '/images/ipad-air-m2.jpg', TRUE),
('OnePlus 12', 'Smartphone flagship avec charge rapide 100W et écran 120Hz', 799.99, 35, 1, '/images/oneplus-12.jpg', FALSE),

-- Ordinateurs & Laptops
('MacBook Pro 16" M3 Max', 'Ordinateur portable professionnel avec puce M3 Max et écran Liquid Retina XDR', 2499.99, 10, 2, '/images/macbook-pro-16.jpg', TRUE),
('Dell XPS 13 Plus', 'Ultrabook premium avec écran InfinityEdge et processeur Intel Core i7', 1399.99, 20, 2, '/images/dell-xps-13.jpg', FALSE),
('Gaming PC RTX 4080', 'PC gaming haute performance avec RTX 4080 et processeur AMD Ryzen 7', 1899.99, 15, 2, '/images/gaming-pc-rtx4080.jpg', TRUE),
('Surface Laptop Studio 2', 'Ordinateur portable créatif 2-en-1 avec écran tactile et stylet', 1699.99, 18, 2, '/images/surface-laptop-studio.jpg', FALSE),

-- Audio & Casques
('AirPods Pro 2', 'Écouteurs sans fil avec réduction de bruit active et audio spatial', 249.99, 80, 3, '/images/airpods-pro-2.jpg', TRUE),
('Bose QuietComfort Ultra', 'Casque premium avec réduction de bruit immersive', 429.99, 45, 3, '/images/bose-qc-ultra.jpg', FALSE),
('JBL Charge 5', 'Enceinte portable étanche avec 20h d\'autonomie', 179.99, 60, 3, '/images/jbl-charge-5.jpg', FALSE),
('Audio-Technica ATH-M50x', 'Casque studio professionnel pour monitoring audio', 149.99, 55, 3, '/images/audio-technica-m50x.jpg', FALSE),

-- Gaming & Consoles
('PlayStation 5 Slim', 'Console de jeu nouvelle génération avec SSD ultra-rapide', 499.99, 25, 4, '/images/ps5-slim.jpg', TRUE),
('Xbox Series X', 'Console gaming 4K avec 12 téraflops de puissance', 499.99, 30, 4, '/images/xbox-series-x.jpg', TRUE),
('Nintendo Switch OLED', 'Console hybride avec écran OLED 7 pouces', 349.99, 40, 4, '/images/switch-oled.jpg', FALSE),
('Razer DeathAdder V3', 'Souris gaming ergonomique avec capteur Focus Pro 30K', 89.99, 70, 4, '/images/razer-deathadder-v3.jpg', FALSE),

-- TV & Écrans
('Samsung Neo QLED 65"', 'TV 4K avec technologie Quantum Matrix et HDR10+', 1799.99, 12, 5, '/images/samsung-neo-qled-65.jpg', TRUE),
('LG OLED C3 55"', 'TV OLED 4K avec processeur α9 Gen6 AI et Dolby Vision', 1399.99, 15, 5, '/images/lg-oled-c3-55.jpg', TRUE),
('Dell UltraSharp 27" 4K', 'Moniteur professionnel 4K avec USB-C et hub intégré', 599.99, 25, 5, '/images/dell-ultrasharp-27-4k.jpg', FALSE),
('ASUS ROG Swift 32" Gaming', 'Moniteur gaming 4K 144Hz avec G-SYNC Ultimate', 899.99, 20, 5, '/images/asus-rog-swift-32.jpg', FALSE),

-- Appareils Photo
('Canon EOS R6 Mark II', 'Appareil photo hybride plein format avec stabilisation 8 stops', 2499.99, 8, 6, '/images/canon-eos-r6-mark2.jpg', TRUE),
('Sony Alpha A7 IV', 'Appareil photo hybride 33MP avec vidéo 4K 60p', 2199.99, 10, 6, '/images/sony-alpha-a7-iv.jpg', FALSE),
('DJI Mini 4 Pro', 'Drone compact 4K avec évitement d\'obstacles omnidirectionnel', 759.99, 22, 6, '/images/dji-mini-4-pro.jpg', TRUE),
('GoPro Hero 12 Black', 'Caméra d\'action 5.3K avec stabilisation HyperSmooth 6.0', 399.99, 35, 6, '/images/gopro-hero-12.jpg', FALSE),

-- Maison Connectée
('Amazon Echo Show 15', 'Écran intelligent 15.6" pour contrôler la maison connectée', 249.99, 30, 7, '/images/echo-show-15.jpg', FALSE),
('Philips Hue Starter Kit', 'Kit d\'éclairage intelligent avec 3 ampoules et pont', 199.99, 45, 7, '/images/philips-hue-starter.jpg', TRUE),
('Nest Thermostat', 'Thermostat intelligent avec apprentissage automatique', 249.99, 25, 7, '/images/nest-thermostat.jpg', FALSE),
('Ring Video Doorbell Pro 2', 'Sonnette vidéo intelligente avec détection 3D', 279.99, 40, 7, '/images/ring-doorbell-pro-2.jpg', FALSE),

-- Accessoires Tech
('Anker PowerBank 20000mAh', 'Batterie externe rapide avec charge sans fil et USB-C PD', 79.99, 100, 8, '/images/anker-powerbank-20000.jpg', FALSE),
('Belkin 3-in-1 Wireless Charger', 'Chargeur sans fil pour iPhone, Apple Watch et AirPods', 149.99, 60, 8, '/images/belkin-3in1-charger.jpg', FALSE),
('USB-C Hub 11-en-1', 'Hub multiport avec HDMI 4K, Ethernet et lecteur de cartes', 89.99, 80, 8, '/images/usb-c-hub-11in1.jpg', FALSE),
('Apple MagSafe Charger', 'Chargeur sans fil magnétique pour iPhone avec USB-C', 39.99, 120, 8, '/images/magsafe-charger.jpg', FALSE),

-- Wearables & Fitness
('Apple Watch Series 9', 'Montre connectée avec puce S9 et écran Always-On Retina', 429.99, 50, 10, '/images/apple-watch-series-9.jpg', TRUE),
('Samsung Galaxy Watch 6', 'Montre intelligente avec suivi de santé avancé', 329.99, 40, 10, '/images/galaxy-watch-6.jpg', FALSE),
('Fitbit Charge 6', 'Bracelet fitness avec GPS intégré et suivi du stress', 159.99, 70, 10, '/images/fitbit-charge-6.jpg', FALSE),
('Garmin Forerunner 965', 'Montre GPS premium pour running avec cartes couleur', 649.99, 25, 10, '/images/garmin-forerunner-965.jpg', FALSE);

SELECT 'Catégories électroniques ajoutées avec succès!' as Status;
SELECT COUNT(*) as TotalCategories FROM categories;
SELECT COUNT(*) as TotalProducts FROM products;