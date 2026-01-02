-- Complete NeoSafi Store Database Setup
-- Run this in phpMyAdmin SQL tab

USE neosafi_store;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    category_id INT,
    image VARCHAR(255),
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_address TEXT,
    customer_city VARCHAR(100),
    customer_zip VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create access_links table
CREATE TABLE IF NOT EXISTS access_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    status ENUM('active', 'used', 'revoked', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    used_at TIMESTAMP NULL,
    used_by_device VARCHAR(255) NULL,
    revoked_at TIMESTAMP NULL
);

-- Insert default admin user (if not exists)
INSERT IGNORE INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@neosafi.com', '$2b$10$8K1p/a0dclxKoNGuDF/my.Uizm.JHueMiZjKjixbqCzHm5OHfyus6', 'admin');

-- Insert sample customer users
INSERT IGNORE INTO users (name, email, password, role) VALUES 
('John Doe', 'john@example.com', '$2b$10$8K1p/a0dclxKoNGuDF/my.Uizm.JHueMiZjKjixbqCzHm5OHfyus6', 'customer'),
('Jane Smith', 'jane@example.com', '$2b$10$8K1p/a0dclxKoNGuDF/my.Uizm.JHueMiZjKjixbqCzHm5OHfyus6', 'customer'),
('Mike Johnson', 'mike@example.com', '$2b$10$8K1p/a0dclxKoNGuDF/my.Uizm.JHueMiZjKjixbqCzHm5OHfyus6', 'customer');

-- Insert categories
INSERT INTO categories (id, name, description) VALUES 
(1, 'Electronics', 'Latest electronic devices, smartphones, laptops, and gadgets'),
(2, 'Clothing & Fashion', 'Trendy clothing, shoes, and fashion accessories'),
(3, 'Books & Education', 'Books, educational materials, and learning resources'),
(4, 'Home & Garden', 'Home improvement, furniture, and garden supplies'),
(5, 'Sports & Fitness', 'Sports equipment, fitness gear, and outdoor activities'),
(6, 'Beauty & Health', 'Cosmetics, skincare, and health products'),
(7, 'Toys & Games', 'Toys, board games, and entertainment for all ages'),
(8, 'Automotive', 'Car accessories, tools, and automotive supplies');

-- Insert featured products
INSERT INTO products (id, name, description, price, stock, category_id, image, featured) VALUES 
(1, 'iPhone 15 Pro Max', 'Latest Apple iPhone with A17 Pro chip, titanium design, and advanced camera system. Perfect for photography and professional use.', 1199.99, 25, 1, '/images/iphone-15-pro.jpg', TRUE),
(2, 'Sony WH-1000XM5 Headphones', 'Industry-leading noise canceling wireless headphones with 30-hour battery life and premium sound quality.', 399.99, 50, 1, '/images/sony-headphones.jpg', TRUE),
(3, 'MacBook Air M3', 'Ultra-thin laptop with M3 chip, 18-hour battery life, and stunning Liquid Retina display. Perfect for work and creativity.', 1299.99, 15, 1, '/images/macbook-air-m3.jpg', TRUE),
(4, 'Designer Leather Jacket', 'Premium genuine leather jacket with modern cut and timeless style. Available in black and brown.', 299.99, 30, 2, '/images/leather-jacket.jpg', TRUE),
(5, 'Nike Air Max 270', 'Comfortable running shoes with Max Air unit and breathable mesh upper. Perfect for daily wear and workouts.', 149.99, 75, 2, '/images/nike-air-max.jpg', FALSE),
(6, 'The Complete Web Developer Course', 'Comprehensive guide to modern web development including HTML, CSS, JavaScript, React, and Node.js.', 49.99, 100, 3, '/images/web-dev-book.jpg', TRUE),
(7, 'Smart Home Security Camera', '4K wireless security camera with night vision, motion detection, and smartphone alerts.', 199.99, 40, 4, '/images/security-camera.jpg', FALSE),
(8, 'Ergonomic Office Chair', 'Premium office chair with lumbar support, adjustable height, and breathable mesh back for all-day comfort.', 449.99, 20, 4, '/images/office-chair.jpg', TRUE),
(9, 'Yoga Mat Premium', 'Non-slip yoga mat with extra cushioning and eco-friendly materials. Perfect for yoga, pilates, and fitness.', 79.99, 60, 5, '/images/yoga-mat.jpg', FALSE),
(10, 'Wireless Bluetooth Speaker', 'Portable speaker with 360-degree sound, waterproof design, and 12-hour battery life.', 129.99, 45, 1, '/images/bluetooth-speaker.jpg', TRUE);

-- Insert regular products
INSERT INTO products (name, description, price, stock, category_id, image, featured) VALUES 
('Samsung Galaxy S24', 'Latest Samsung flagship with AI features and professional camera', 999.99, 35, 1, '/images/samsung-s24.jpg', FALSE),
('iPad Pro 12.9"', 'Professional tablet with M2 chip and Apple Pencil support', 1099.99, 20, 1, '/images/ipad-pro.jpg', FALSE),
('Casual Cotton T-Shirt', 'Comfortable 100% cotton t-shirt in various colors', 24.99, 150, 2, '/images/cotton-tshirt.jpg', FALSE),
('Denim Jeans Classic', 'Classic fit denim jeans with premium quality fabric', 89.99, 80, 2, '/images/denim-jeans.jpg', FALSE),
('JavaScript: The Definitive Guide', 'Complete reference for JavaScript programming', 59.99, 50, 3, '/images/js-book.jpg', FALSE),
('Python Programming Handbook', 'Learn Python from basics to advanced concepts', 45.99, 65, 3, '/images/python-book.jpg', FALSE),
('Smart LED Light Bulbs (4-Pack)', 'WiFi-enabled color-changing LED bulbs', 79.99, 90, 4, '/images/smart-bulbs.jpg', FALSE),
('Coffee Maker Deluxe', 'Programmable coffee maker with thermal carafe', 159.99, 25, 4, '/images/coffee-maker.jpg', FALSE),
('Fitness Tracker Watch', 'Advanced fitness tracking with heart rate monitor', 199.99, 55, 5, '/images/fitness-tracker.jpg', FALSE),
('Resistance Bands Set', 'Complete set of resistance bands for home workouts', 39.99, 70, 5, '/images/resistance-bands.jpg', FALSE),
('Moisturizing Face Cream', 'Anti-aging face cream with natural ingredients', 34.99, 85, 6, '/images/face-cream.jpg', FALSE),
('Vitamin C Serum', 'Brightening vitamin C serum for glowing skin', 29.99, 95, 6, '/images/vitamin-c-serum.jpg', FALSE),
('Board Game Collection', 'Classic board games for family entertainment', 49.99, 40, 7, '/images/board-games.jpg', FALSE),
('Remote Control Drone', 'HD camera drone with GPS and auto-return feature', 299.99, 15, 7, '/images/rc-drone.jpg', FALSE),
('Car Phone Mount', 'Magnetic phone holder for car dashboard', 19.99, 120, 8, '/images/phone-mount.jpg', FALSE),
('Tire Pressure Gauge', 'Digital tire pressure gauge with LED display', 24.99, 75, 8, '/images/tire-gauge.jpg', FALSE);

-- Insert sample orders
INSERT INTO orders (id, user_id, total, status, customer_name, customer_email, customer_phone, customer_address, customer_city, customer_zip) VALUES 
(1, 2, 1599.98, 'delivered', 'John Doe', 'john@example.com', '+1-555-0123', '123 Main Street, Apt 4B', 'New York', '10001'),
(2, 3, 449.98, 'shipped', 'Jane Smith', 'jane@example.com', '+1-555-0456', '456 Oak Avenue', 'Los Angeles', '90210'),
(3, NULL, 179.98, 'processing', 'Guest Customer', 'guest@example.com', '+1-555-0789', '789 Pine Road', 'Chicago', '60601'),
(4, 4, 89.99, 'pending', 'Mike Johnson', 'mike@example.com', '+1-555-0321', '321 Elm Street', 'Houston', '77001'),
(5, 2, 299.99, 'delivered', 'John Doe', 'john@example.com', '+1-555-0123', '123 Main Street, Apt 4B', 'New York', '10001');

-- Insert order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES 
-- Order 1: John's big purchase
(1, 1, 1, 1199.99),  -- iPhone 15 Pro Max
(1, 2, 1, 399.99),   -- Sony Headphones
-- Order 2: Jane's home office setup
(2, 8, 1, 449.99),   -- Office Chair
-- Order 3: Guest fitness purchase
(3, 9, 1, 79.99),    -- Yoga Mat
(3, 19, 1, 199.99),  -- Fitness Tracker (corrected product_id)
-- Order 4: Mike's casual wear
(4, 13, 1, 89.99),   -- Denim Jeans
-- Order 5: John's second purchase
(5, 4, 1, 299.99);   -- Leather Jacket

-- Insert sample access links (for testing the unique link system)
INSERT INTO access_links (token_hash, status, created_at, expires_at) VALUES 
('a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456', 'active', NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR)),
('b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567a', 'used', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 22 HOUR)),
('c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567ab2', 'revoked', DATE_SUB(NOW(), INTERVAL 1 DAY), NULL);

-- Show completion message
SELECT 'All tables created and populated successfully!' as Status,
       (SELECT COUNT(*) FROM categories) as Categories,
       (SELECT COUNT(*) FROM products) as Products,
       (SELECT COUNT(*) FROM users) as Users,
       (SELECT COUNT(*) FROM orders) as Orders,
       (SELECT COUNT(*) FROM access_links) as AccessLinks;