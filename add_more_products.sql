-- Ajouter plus de produits par catégorie électronique
USE neosafi_store;

-- Smartphones & Tablettes (Catégorie 1) - Ajouter 15 produits
INSERT INTO products (name, description, price, stock, category_id, image, featured) VALUES 
('iPhone 14 Pro', 'iPhone 14 Pro avec puce A16 Bionic et système de caméra Pro avancé', 1099.99, 35, 1, '/images/iphone-14-pro.jpg', FALSE),
('Samsung Galaxy Z Fold 5', 'Smartphone pliable avec écran Dynamic AMOLED 2X de 7.6 pouces', 1799.99, 15, 1, '/images/galaxy-z-fold-5.jpg', TRUE),
('Google Pixel 7a', 'Smartphone Google avec appareil photo exceptionnel et IA avancée', 449.99, 60, 1, '/images/pixel-7a.jpg', FALSE),
('Xiaomi 13 Pro', 'Flagship Xiaomi avec Snapdragon 8 Gen 2 et caméra Leica', 899.99, 40, 1, '/images/xiaomi-13-pro.jpg', FALSE),
('OnePlus 11', 'Smartphone premium avec charge rapide 100W et écran 120Hz', 699.99, 45, 1, '/images/oneplus-11.jpg', FALSE),
('iPhone SE 2022', 'iPhone compact avec puce A15 Bionic et Touch ID', 429.99, 80, 1, '/images/iphone-se-2022.jpg', FALSE),
('Samsung Galaxy A54', 'Smartphone milieu de gamme avec écran Super AMOLED 120Hz', 449.99, 70, 1, '/images/galaxy-a54.jpg', FALSE),
('iPad Mini 6', 'Tablette compacte avec puce A15 Bionic et écran Liquid Retina 8.3"', 549.99, 30, 1, '/images/ipad-mini-6.jpg', FALSE),
('Samsung Galaxy Tab S9', 'Tablette Android premium avec S Pen et écran Dynamic AMOLED 2X', 799.99, 25, 1, '/images/galaxy-tab-s9.jpg', TRUE),
('Huawei MatePad Pro', 'Tablette professionnelle avec écran OLED et stylet M-Pencil', 649.99, 20, 1, '/images/huawei-matepad-pro.jpg', FALSE),
('Nothing Phone 2', 'Smartphone unique avec interface Glyph et design transparent', 599.99, 35, 1, '/images/nothing-phone-2.jpg', FALSE),
('Realme GT 3', 'Smartphone gaming avec charge ultra-rapide 240W', 649.99, 30, 1, '/images/realme-gt-3.jpg', FALSE),
('Oppo Find X6 Pro', 'Flagship avec système de caméra Hasselblad et charge 100W', 1199.99, 20, 1, '/images/oppo-find-x6-pro.jpg', FALSE),
('Motorola Edge 40 Pro', 'Smartphone avec écran incurvé 165Hz et charge sans fil 125W', 799.99, 25, 1, '/images/motorola-edge-40-pro.jpg', FALSE),
('Honor Magic 5 Pro', 'Smartphone premium avec caméra périscopique et écran incurvé', 1099.99, 18, 1, '/images/honor-magic-5-pro.jpg', FALSE);

-- Ordinateurs & Laptops (Catégorie 2) - Ajouter 12 produits
INSERT INTO products (name, description, price, stock, category_id, image, featured) VALUES 
('ASUS ROG Strix G15', 'Laptop gaming avec RTX 4060 et processeur AMD Ryzen 7', 1299.99, 20, 2, '/images/asus-rog-strix-g15.jpg', FALSE),
('HP Spectre x360', 'Ultrabook convertible 2-en-1 avec écran tactile OLED', 1499.99, 15, 2, '/images/hp-spectre-x360.jpg', TRUE),
('Lenovo ThinkPad X1 Carbon', 'Laptop professionnel ultra-léger avec sécurité avancée', 1799.99, 12, 2, '/images/thinkpad-x1-carbon.jpg', FALSE),
('Acer Predator Helios 300', 'PC gaming portable avec RTX 4070 et écran 144Hz', 1599.99, 18, 2, '/images/acer-predator-helios.jpg', FALSE),
('Microsoft Surface Pro 9', 'Tablette 2-en-1 avec processeur Intel Core i7 et Type Cover', 1299.99, 25, 2, '/images/surface-pro-9.jpg', FALSE),
('Razer Blade 15', 'Laptop gaming premium avec RTX 4080 et écran 240Hz', 2499.99, 8, 2, '/images/razer-blade-15.jpg', TRUE),
('ASUS ZenBook 14', 'Ultrabook élégant avec écran OLED 2.8K et NumberPad', 999.99, 30, 2, '/images/asus-zenbook-14.jpg', FALSE),
('MSI Creator Z16P', 'Laptop créatif avec RTX 4070 et écran Mini LED 165Hz', 2199.99, 10, 2, '/images/msi-creator-z16p.jpg', FALSE),
('Alienware m15 R7', 'PC gaming avec design futuriste et RTX 4060', 1899.99, 12, 2, '/images/alienware-m15-r7.jpg', FALSE),
('LG Gram 17', 'Laptop ultra-léger 17" avec autonomie exceptionnelle', 1399.99, 22, 2, '/images/lg-gram-17.jpg', FALSE),
('Framework Laptop', 'Laptop modulaire et réparable avec ports interchangeables', 1199.99, 15, 2, '/images/framework-laptop.jpg', FALSE),
('Gigabyte AERO 16', 'Laptop créateur avec écran 4K AMOLED et RTX 4070', 2299.99, 8, 2, '/images/gigabyte-aero-16.jpg', FALSE);

-- Audio & Casques (Catégorie 3) - Ajouter 15 produits
INSERT INTO products (name, description, price, stock, category_id, image, featured) VALUES 
('Sony WF-1000XM4', 'Écouteurs sans fil avec réduction de bruit leader du marché', 279.99, 60, 3, '/images/sony-wf-1000xm4.jpg', TRUE),
('Sennheiser HD 800S', 'Casque audiophile open-back de référence pour studio', 1699.99, 8, 3, '/images/sennheiser-hd-800s.jpg', FALSE),
('Beats Studio Pro', 'Casque sans fil avec réduction de bruit et audio spatial', 349.99, 45, 3, '/images/beats-studio-pro.jpg', FALSE),
('Shure SM7B', 'Microphone dynamique professionnel pour podcast et streaming', 399.99, 25, 3, '/images/shure-sm7b.jpg', FALSE),
('Marshall Acton III', 'Enceinte Bluetooth vintage avec son Marshall iconique', 279.99, 35, 3, '/images/marshall-acton-iii.jpg', FALSE),
('Focal Utopia', 'Casque audiophile haut de gamme avec transducteurs béryllium', 3999.99, 3, 3, '/images/focal-utopia.jpg', TRUE),
('JBL PartyBox 310', 'Enceinte portable avec éclairage LED et karaoké', 449.99, 20, 3, '/images/jbl-partybox-310.jpg', FALSE),
('Audio-Technica AT2020', 'Microphone à condensateur pour enregistrement studio', 149.99, 40, 3, '/images/audio-technica-at2020.jpg', FALSE),
('Bang & Olufsen Beoplay H95', 'Casque luxury avec réduction de bruit et 50h d\'autonomie', 799.99, 12, 3, '/images/bo-beoplay-h95.jpg', FALSE),
('Sonos Era 300', 'Enceinte intelligente avec audio spatial Dolby Atmos', 449.99, 30, 3, '/images/sonos-era-300.jpg', FALSE),
('Beyerdynamic DT 1990 Pro', 'Casque de monitoring professionnel open-back', 599.99, 18, 3, '/images/beyerdynamic-dt-1990.jpg', FALSE),
('Ultimate Ears MEGABOOM 3', 'Enceinte portable 360° étanche avec 20h d\'autonomie', 199.99, 50, 3, '/images/ue-megaboom-3.jpg', FALSE),
('Rode PodMic', 'Microphone dynamique spécialement conçu pour le podcasting', 199.99, 35, 3, '/images/rode-podmic.jpg', FALSE),
('Klipsch The Fives', 'Enceintes actives avec amplification intégrée et connectivité', 799.99, 15, 3, '/images/klipsch-the-fives.jpg', FALSE),
('HyperX Cloud Alpha', 'Casque gaming avec drivers dual chamber et micro détachable', 99.99, 80, 3, '/images/hyperx-cloud-alpha.jpg', FALSE);

-- Gaming & Consoles (Catégorie 4) - Ajouter 18 produits
INSERT INTO products (name, description, price, stock, category_id, image, featured) VALUES 
('Steam Deck OLED', 'Console portable PC gaming avec écran OLED et SteamOS', 649.99, 25, 4, '/images/steam-deck-oled.jpg', TRUE),
('ASUS ROG Ally', 'Console portable Windows avec processeur AMD Z1 Extreme', 699.99, 20, 4, '/images/asus-rog-ally.jpg', FALSE),
('Logitech G Pro X Superlight', 'Souris gaming ultra-légère avec capteur HERO 25K', 149.99, 60, 4, '/images/logitech-g-pro-x.jpg', FALSE),
('Corsair K95 RGB Platinum', 'Clavier mécanique gaming avec switches Cherry MX et RGB', 199.99, 40, 4, '/images/corsair-k95-rgb.jpg', FALSE),
('SteelSeries Arctis Pro Wireless', 'Casque gaming sans fil avec audio haute résolution', 329.99, 30, 4, '/images/steelseries-arctis-pro.jpg', FALSE),
('Elgato Stream Deck', 'Contrôleur de streaming avec 15 touches LCD personnalisables', 149.99, 35, 4, '/images/elgato-stream-deck.jpg', FALSE),
('NZXT BLD Gaming PC', 'PC gaming pré-assemblé avec RTX 4070 et Ryzen 7', 1899.99, 10, 4, '/images/nzxt-bld-gaming-pc.jpg', TRUE),
('Thrustmaster T300 RS GT', 'Volant de course avec retour de force et pédalier', 399.99, 15, 4, '/images/thrustmaster-t300-rs.jpg', FALSE),
('Secretlab Titan Evo 2022', 'Chaise gaming ergonomique avec support lombaire ajustable', 519.99, 25, 4, '/images/secretlab-titan-evo.jpg', FALSE),
('Alienware AW3423DW', 'Moniteur gaming incurvé 34" QD-OLED avec 175Hz', 1299.99, 12, 4, '/images/alienware-aw3423dw.jpg', TRUE),
('Razer Huntsman V3 Pro', 'Clavier gaming avec switches optiques et repose-poignets', 249.99, 35, 4, '/images/razer-huntsman-v3-pro.jpg', FALSE),
('HTC Vive Pro 2', 'Casque VR professionnel avec résolution 5K et tracking précis', 1399.99, 8, 4, '/images/htc-vive-pro-2.jpg', FALSE),
('Meta Quest 3', 'Casque VR autonome avec réalité mixte et 128GB de stockage', 499.99, 30, 4, '/images/meta-quest-3.jpg', TRUE),
('Turtle Beach Stealth 700', 'Casque gaming sans fil avec son surround et micro flip', 149.99, 45, 4, '/images/turtle-beach-stealth-700.jpg', FALSE),
('Cooler Master MasterKeys Pro', 'Clavier mécanique compact avec switches Cherry MX', 129.99, 50, 4, '/images/cooler-master-masterkeys.jpg', FALSE),
('Roccat Kone Pro Air', 'Souris gaming sans fil avec capteur Owl-Eye 19K DPI', 129.99, 40, 4, '/images/roccat-kone-pro-air.jpg', FALSE),
('Blue Yeti X', 'Microphone USB professionnel avec éclairage LED intelligent', 169.99, 30, 4, '/images/blue-yeti-x.jpg', FALSE),
('ASUS TUF Gaming VG27AQ', 'Moniteur gaming 27" 1440p avec 165Hz et G-SYNC Compatible', 329.99, 25, 4, '/images/asus-tuf-vg27aq.jpg', FALSE);

-- TV & Écrans (Catégorie 5) - Ajouter 12 produits
INSERT INTO products (name, description, price, stock, category_id, image, featured) VALUES 
('Sony A95L OLED 77"', 'TV OLED QD premium avec processeur Cognitive XR et 4K 120Hz', 3499.99, 5, 5, '/images/sony-a95l-77.jpg', TRUE),
('TCL C845 Mini LED 65"', 'TV QLED avec rétroéclairage Mini LED et Google TV', 1299.99, 15, 5, '/images/tcl-c845-65.jpg', FALSE),
('Philips OLED+ 55"', 'TV OLED avec son Bowers & Wilkins et Ambilight 4 côtés', 1799.99, 12, 5, '/images/philips-oled-plus-55.jpg', FALSE),
('Hisense U8K ULED 75"', 'TV ULED avec Quantum Dot et Dolby Vision IQ', 1599.99, 10, 5, '/images/hisense-u8k-75.jpg', FALSE),
('LG StanbyME 27"', 'Écran portable sur roulettes avec batterie intégrée', 999.99, 8, 5, '/images/lg-standbyme-27.jpg', FALSE),
('Samsung The Frame 55"', 'TV lifestyle qui se transforme en œuvre d\'art', 1499.99, 20, 5, '/images/samsung-the-frame-55.jpg', TRUE),
('ASUS ProArt PA32UCG', 'Moniteur professionnel 32" 4K avec Mini LED et HDR1600', 2999.99, 6, 5, '/images/asus-proart-pa32ucg.jpg', FALSE),
('BenQ SW321C', 'Moniteur photo 32" 4K avec calibrage matériel et Adobe RGB', 1899.99, 8, 5, '/images/benq-sw321c.jpg', FALSE),
('Apple Studio Display', 'Écran 27" 5K avec caméra Ultra Wide et audio spatial', 1599.99, 15, 5, '/images/apple-studio-display.jpg', TRUE),
('Dell UltraSharp U4323QE', 'Moniteur 43" 4K USB-C avec KVM intégré', 1199.99, 12, 5, '/images/dell-ultrasharp-u4323qe.jpg', FALSE),
('Gigabyte M32U', 'Moniteur gaming 32" 4K avec 144Hz et KVM switch', 699.99, 18, 5, '/images/gigabyte-m32u.jpg', FALSE),
('ViewSonic VP2786-4K', 'Moniteur professionnel 27" avec calibrage Delta E<2', 799.99, 10, 5, '/images/viewsonic-vp2786-4k.jpg', FALSE);

-- Appareils Photo (Catégorie 6) - Ajouter 15 produits
INSERT INTO products (name, description, price, stock, category_id, image, featured) VALUES 
('Fujifilm X-T5', 'Appareil photo hybride 40MP avec stabilisation 5 axes', 1699.99, 15, 6, '/images/fujifilm-x-t5.jpg', TRUE),
('Nikon Z9', 'Appareil photo professionnel 45MP avec vidéo 8K', 5499.99, 5, 6, '/images/nikon-z9.jpg', FALSE),
('Leica Q2', 'Appareil photo compact plein format avec objectif 28mm f/1.7', 4995.99, 3, 6, '/images/leica-q2.jpg', TRUE),
('Panasonic GH6', 'Caméra hybride 4K/120p pour vidéastes professionnels', 2199.99, 10, 6, '/images/panasonic-gh6.jpg', FALSE),
('Olympus OM-1', 'Appareil photo Micro 4/3 avec stabilisation 8 stops', 2199.99, 12, 6, '/images/olympus-om-1.jpg', FALSE),
('DJI Air 3', 'Drone avec double caméra 4K et évitement d\'obstacles', 1049.99, 20, 6, '/images/dji-air-3.jpg', FALSE),
('Insta360 X3', 'Caméra 360° avec écran tactile et stabilisation FlowState', 449.99, 25, 6, '/images/insta360-x3.jpg', FALSE),
('Sony FX30', 'Caméra cinéma Super 35 avec monture E et 4K 120p', 1799.99, 8, 6, '/images/sony-fx30.jpg', FALSE),
('Canon EOS R5', 'Appareil photo hybride 45MP avec vidéo 8K RAW', 3899.99, 6, 6, '/images/canon-eos-r5.jpg', TRUE),
('Blackmagic Pocket 6K Pro', 'Caméra cinéma avec écran LCD inclinable et CFast', 2535.99, 7, 6, '/images/blackmagic-pocket-6k-pro.jpg', FALSE),
('Ricoh GR IIIx', 'Appareil photo compact avec objectif 40mm équivalent', 899.99, 18, 6, '/images/ricoh-gr-iiix.jpg', FALSE),
('Sigma fp L', 'Appareil photo plein format ultra-compact 61MP', 2499.99, 5, 6, '/images/sigma-fp-l.jpg', FALSE),
('DJI Pocket 2', 'Caméra stabilisée ultra-compacte avec gimbal 3 axes', 369.99, 30, 6, '/images/dji-pocket-2.jpg', FALSE),
('Hasselblad X2D 100C', 'Appareil photo moyen format 100MP avec écran inclinable', 8199.99, 2, 6, '/images/hasselblad-x2d-100c.jpg', TRUE),
('Phase One XF IQ4', 'Système photo moyen format professionnel 150MP', 39990.99, 1, 6, '/images/phase-one-xf-iq4.jpg', FALSE);

-- Maison Connectée (Catégorie 7) - Ajouter 20 produits
INSERT INTO products (name, description, price, stock, category_id, image, featured) VALUES 
('Google Nest Hub Max', 'Écran intelligent 10" avec caméra et contrôle maison connectée', 229.99, 35, 7, '/images/google-nest-hub-max.jpg', FALSE),
('Arlo Pro 5S', 'Caméra de sécurité sans fil 2K avec projecteur intégré', 279.99, 25, 7, '/images/arlo-pro-5s.jpg', FALSE),
('Ecobee SmartThermostat', 'Thermostat intelligent avec capteur de présence', 249.99, 30, 7, '/images/ecobee-smartthermostat.jpg', FALSE),
('August Wi-Fi Smart Lock', 'Serrure connectée avec déverrouillage automatique', 279.99, 20, 7, '/images/august-wifi-smart-lock.jpg', FALSE),
('Lutron Caseta Wireless', 'Interrupteur intelligent avec variateur et télécommande', 79.99, 50, 7, '/images/lutron-caseta-wireless.jpg', FALSE),
('Sonos Beam Gen 2', 'Barre de son compacte avec Dolby Atmos et contrôle vocal', 449.99, 25, 7, '/images/sonos-beam-gen-2.jpg', TRUE),
('iRobot Roomba j7+', 'Aspirateur robot avec vidage automatique et évitement d\'objets', 799.99, 15, 7, '/images/irobot-roomba-j7-plus.jpg', FALSE),
('Wyze Cam v3', 'Caméra de sécurité abordable avec vision nocturne couleur', 35.99, 100, 7, '/images/wyze-cam-v3.jpg', FALSE),
('TP-Link Kasa Smart Plug', 'Prise connectée avec contrôle vocal et programmation', 14.99, 150, 7, '/images/tp-link-kasa-smart-plug.jpg', FALSE),
('Ring Video Doorbell 4', 'Sonnette vidéo avec détection de mouvement améliorée', 199.99, 40, 7, '/images/ring-video-doorbell-4.jpg', FALSE),
('Nanoleaf Shapes', 'Panneaux lumineux modulaires avec 16M de couleurs', 199.99, 30, 7, '/images/nanoleaf-shapes.jpg', FALSE),
('Yale Assure Lock SL', 'Serrure intelligente sans clé avec écran tactile', 279.99, 18, 7, '/images/yale-assure-lock-sl.jpg', FALSE),
('Honeywell T9 Smart Thermostat', 'Thermostat avec capteurs de température à distance', 199.99, 25, 7, '/images/honeywell-t9-smart.jpg', FALSE),
('Philips Hue Go', 'Lampe portable avec 16M de couleurs et effets lumineux', 79.99, 45, 7, '/images/philips-hue-go.jpg', FALSE),
('Nest Protect', 'Détecteur de fumée et CO intelligent avec alertes mobiles', 119.99, 35, 7, '/images/nest-protect.jpg', FALSE),
('Eero Pro 6E', 'Routeur mesh Wi-Fi 6E pour couverture maison complète', 299.99, 20, 7, '/images/eero-pro-6e.jpg', FALSE),
('Chamberlain MyQ', 'Contrôleur de porte de garage intelligent', 99.99, 40, 7, '/images/chamberlain-myq.jpg', FALSE),
('Rachio 3 Smart Sprinkler', 'Contrôleur d\'arrosage intelligent avec météo intégrée', 229.99, 15, 7, '/images/rachio-3-smart-sprinkler.jpg', FALSE),
('Aqara Hub M2', 'Hub central pour écosystème domotique Zigbee 3.0', 59.99, 50, 7, '/images/aqara-hub-m2.jpg', FALSE),
('Govee Immersion TV Light Strip', 'Bande LED réactive avec caméra pour TV', 99.99, 60, 7, '/images/govee-immersion-tv.jpg', FALSE);

-- Accessoires Tech (Catégorie 8) - Ajouter 25 produits
INSERT INTO products (name, description, price, stock, category_id, image, featured) VALUES 
('Apple MagSafe Battery Pack', 'Batterie externe magnétique pour iPhone avec charge sans fil', 99.99, 80, 8, '/images/apple-magsafe-battery.jpg', FALSE),
('Samsung 45W USB-C Charger', 'Chargeur rapide USB-C avec Power Delivery 3.0', 49.99, 120, 8, '/images/samsung-45w-charger.jpg', FALSE),
('Anker 737 PowerBank', 'Batterie externe 24000mAh avec charge rapide 140W', 149.99, 60, 8, '/images/anker-737-powerbank.jpg', TRUE),
('CalDigit TS4 Thunderbolt 4 Dock', 'Station d\'accueil avec 18 ports et charge 98W', 379.99, 25, 8, '/images/caldigit-ts4-dock.jpg', FALSE),
('Peak Design Everyday Backpack', 'Sac à dos modulaire pour photographes et créateurs', 259.99, 30, 8, '/images/peak-design-backpack.jpg', FALSE),
('Logitech MX Master 3S', 'Souris ergonomique avec défilement ultra-rapide', 99.99, 70, 8, '/images/logitech-mx-master-3s.jpg', FALSE),
('Apple Magic Keyboard', 'Clavier sans fil avec Touch ID et rétroéclairage', 179.99, 45, 8, '/images/apple-magic-keyboard.jpg', FALSE),
('SanDisk Extreme Pro SSD 2TB', 'SSD portable avec vitesses jusqu\'à 2000 MB/s', 299.99, 40, 8, '/images/sandisk-extreme-pro-ssd.jpg', FALSE),
('Twelve South BookBook', 'Étui iPhone en cuir vintage style livre ancien', 79.99, 50, 8, '/images/twelve-south-bookbook.jpg', FALSE),
('Moft Laptop Stand', 'Support laptop invisible et portable ultra-fin', 49.99, 80, 8, '/images/moft-laptop-stand.jpg', FALSE),
('Nomad Base Station Pro', 'Chargeur sans fil 3-en-1 pour Apple avec FreePower', 229.99, 20, 8, '/images/nomad-base-station-pro.jpg', FALSE),
('Keychron K8 Pro', 'Clavier mécanique sans fil avec switches hot-swap', 109.99, 35, 8, '/images/keychron-k8-pro.jpg', FALSE),
('Bellroy Leather Case Wallet', 'Étui iPhone en cuir avec porte-cartes intégré', 89.99, 60, 8, '/images/bellroy-leather-case.jpg', FALSE),
('Ugreen Nexode 100W GaN', 'Chargeur GaN compact 4 ports avec charge rapide', 79.99, 90, 8, '/images/ugreen-nexode-100w.jpg', FALSE),
('Spigen Tough Armor Case', 'Coque de protection renforcée avec support intégré', 29.99, 150, 8, '/images/spigen-tough-armor.jpg', FALSE),
('HyperDrive 6-in-1 USB-C Hub', 'Hub compact avec HDMI 4K et lecteur de cartes', 69.99, 75, 8, '/images/hyperdrive-6in1-hub.jpg', FALSE),
('Moment Lens Case', 'Étui iPhone avec système de fixation pour objectifs', 49.99, 40, 8, '/images/moment-lens-case.jpg', FALSE),
('Anker Wireless PowerWave', 'Chargeur sans fil 15W avec refroidissement actif', 39.99, 100, 8, '/images/anker-powerwave-15w.jpg', FALSE),
('Native Union Drop XL', 'Chargeur sans fil en tissu pour plusieurs appareils', 99.99, 30, 8, '/images/native-union-drop-xl.jpg', FALSE),
('Elago W4 Apple Watch Stand', 'Support Apple Watch design rétro Macintosh', 14.99, 120, 8, '/images/elago-w4-stand.jpg', FALSE),
('Joby GripTight ONE', 'Support smartphone universel avec pieds flexibles', 24.99, 80, 8, '/images/joby-griptight-one.jpg', FALSE),
('PopSockets PopGrip', 'Support et poignée extensible pour smartphone', 14.99, 200, 8, '/images/popsockets-popgrip.jpg', FALSE),
('Tile Mate Bluetooth Tracker', 'Traceur Bluetooth pour retrouver objets perdus', 24.99, 100, 8, '/images/tile-mate-tracker.jpg', FALSE),
('Lamicall Adjustable Phone Stand', 'Support téléphone ajustable en aluminium', 19.99, 150, 8, '/images/lamicall-phone-stand.jpg', FALSE),
('JSAUX Steam Deck Dock', 'Station d\'accueil pour Steam Deck avec HDMI 4K', 59.99, 45, 8, '/images/jsaux-steam-deck-dock.jpg', FALSE);

-- Wearables & Fitness (Catégorie 10) - Ajouter 15 produits
INSERT INTO products (name, description, price, stock, category_id, image, featured) VALUES 
('Garmin Fenix 7X Solar', 'Montre GPS multisport avec recharge solaire et cartes', 899.99, 15, 10, '/images/garmin-fenix-7x-solar.jpg', TRUE),
('Polar Vantage V2', 'Montre de sport premium avec tests de performance', 499.99, 20, 10, '/images/polar-vantage-v2.jpg', FALSE),
('Suunto 9 Peak Pro', 'Montre GPS ultra-fine avec 170h d\'autonomie', 569.99, 18, 10, '/images/suunto-9-peak-pro.jpg', FALSE),
('Oura Ring Gen3', 'Bague connectée pour suivi du sommeil et récupération', 299.99, 40, 10, '/images/oura-ring-gen3.jpg', FALSE),
('Whoop 4.0', 'Bracelet fitness sans écran avec coaching personnalisé', 239.99, 35, 10, '/images/whoop-4-0.jpg', FALSE),
('Amazfit GTR 4', 'Montre connectée avec GPS dual-band et 14 jours d\'autonomie', 199.99, 50, 10, '/images/amazfit-gtr-4.jpg', FALSE),
('Coros Pace 3', 'Montre GPS running ultra-légère avec 38h d\'autonomie', 229.99, 30, 10, '/images/coros-pace-3.jpg', FALSE),
('Withings ScanWatch', 'Montre hybride avec ECG et détection d\'apnée du sommeil', 279.99, 25, 10, '/images/withings-scanwatch.jpg', FALSE),
('Garmin Venu 3', 'Montre GPS avec écran AMOLED et fonctions santé avancées', 449.99, 22, 10, '/images/garmin-venu-3.jpg', FALSE),
('Huawei Watch GT 4', 'Montre connectée avec design premium et 14 jours d\'autonomie', 249.99, 35, 10, '/images/huawei-watch-gt-4.jpg', FALSE),
('Fossil Gen 6 Wellness', 'Montre Wear OS avec capteurs santé et charge rapide', 255.99, 28, 10, '/images/fossil-gen-6-wellness.jpg', FALSE),
('TicWatch Pro 5', 'Montre Wear OS avec double écran et 80h d\'autonomie', 359.99, 20, 10, '/images/ticwatch-pro-5.jpg', FALSE),
('Xiaomi Mi Band 8', 'Bracelet fitness abordable avec écran AMOLED', 39.99, 100, 10, '/images/xiaomi-mi-band-8.jpg', FALSE),
('Honor Band 7', 'Bracelet connecté avec écran couleur et 12 jours d\'autonomie', 49.99, 80, 10, '/images/honor-band-7.jpg', FALSE),
('Realme Watch S2', 'Montre connectée avec GPS et surveillance santé 24/7', 89.99, 60, 10, '/images/realme-watch-s2.jpg', FALSE);

SELECT 'Tous les nouveaux produits ajoutés avec succès!' as Status;
SELECT 
    c.name as Categorie,
    COUNT(p.id) as NombreProduits,
    MIN(p.price) as PrixMin,
    MAX(p.price) as PrixMax,
    AVG(p.price) as PrixMoyen
FROM categories c 
LEFT JOIN products p ON c.id = p.category_id 
GROUP BY c.id, c.name 
ORDER BY c.id;