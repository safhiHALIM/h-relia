-- hérbilia Store Database Schema
-- MySQL/MariaDB compatible

-- Create database (run this separately if needed)
-- CREATE DATABASE herbilia_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE herbilia_store;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- Users table (customers and admins)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    category_id INT,
    image VARCHAR(255),
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_featured (featured),
    INDEX idx_price (price),
    INDEX idx_stock (stock)
);

-- Orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL, -- NULL for guest orders
    total DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    customer_info JSON, -- Store customer details for guest orders
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- Order items table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL, -- Price at time of order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
);

-- Insert sample data

-- Insert admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('Admin hérbilia', 'admin@herbilia.com', '$2b$12$LQv3c1yqBWVHxkd0LQ1Gv.6FqvyHdHDHHmk4f7u/Oo9X8KeOeKlW2', 'admin');

-- Insert sample customer (password: customer123)
INSERT INTO users (name, email, password, role) VALUES 
('John Doe', 'john@example.com', '$2b$12$LQv3c1yqBWVHxkd0LQ1Gv.6FqvyHdHDHHmk4f7u/Oo9X8KeOeKlW2', 'customer');

-- Insert categories
INSERT INTO categories (name, description) VALUES 
('Gommages & hérbilia', 'Gommages traditionnels et mélanges hérbilia pour une peau éclatante'),
('Huiles Naturelles', 'Huiles de massage et soins hydratants aux extraits naturels'),
('Soins Visage', 'Produits spécifiques pour l''éclat et la pureté du visage'),
('Savons Artisanaux', 'Savons naturels fabriqués à la main'),
('Kits Bien-être', 'Coffrets complets pour vos rituels de beauté à domicile');

-- Insert sample products
INSERT INTO products (name, description, price, stock, category_id, featured) VALUES 
('Mélange hérbilia Royal', 'Le secret ancestral pour une peau unifiée et éclatante. Mélange de 14 herbes naturelles.', 150.00, 100, 1, TRUE),
('Huile d''Argan Pure', 'Huile d''argan cosmétique pressée à froid, 100% bio.', 120.00, 50, 2, TRUE),
('Savon Noir à l''Eucalyptus', 'Savon traditionnel pour un gommage profond au hammam.', 45.00, 200, 4, TRUE),
('Masque à l''Argile Rose', 'Purifie et adoucit les peaux sensibles.', 85.00, 75, 3, TRUE),
('Kit Rituel Hammam', 'Coffret comprenant savon noir, kessa, et hérbilia.', 250.00, 30, 5, TRUE),
('Gommage au Sucre & Rose', 'Exfoliant doux parfumé à la rose de Damas.', 95.00, 120, 1, FALSE),
('Lait de Corps Karité', 'Hydratation intense au beurre de karité pur.', 110.00, 60, 2, FALSE),
('Eau de Rose Distillée', 'Tonique naturel pour rafraîchir le teint.', 65.00, 150, 3, FALSE);

-- Insert sample orders (for demonstration)
INSERT INTO orders (user_id, total, status, customer_info) VALUES 
(2, 1349.98, 'delivered', '{"name": "John Doe", "email": "john@example.com", "address": "123 Main St, City, State 12345", "phone": "+1234567890"}'),
(2, 79.99, 'processing', '{"name": "John Doe", "email": "john@example.com", "address": "123 Main St, City, State 12345", "phone": "+1234567890"}');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES 
(1, 1, 1, 999.99),
(1, 2, 1, 299.99),
(1, 4, 1, 49.99),
(2, 4, 1, 79.99);

-- Create indexes for better performance
CREATE INDEX idx_products_search ON products(name, description);
CREATE INDEX idx_orders_date_status ON orders(created_at, status);

-- Display table information
SELECT 'Database schema created successfully!' as message;
SELECT 'Tables created:' as info;
SHOW TABLES;

-- Display sample data counts
SELECT 'Sample data inserted:' as info;
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Order Items', COUNT(*) FROM order_items;