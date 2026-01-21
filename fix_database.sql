-- Fix NeoSafi Store Database Issues
USE neosafi_store;

-- Drop existing users table if it has wrong structure
DROP TABLE IF EXISTS users;

-- Recreate users table with correct structure
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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

-- Insert admin user with CORRECT password hash for 'admin123'
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@neosafi.com', '$2b$10$V/fBt7Q/B3fJG8wFKRpgH.KyJ2kQXtAMOIY80AhPCtThb8XCm23He', 'admin');

-- Insert sample customer users
INSERT INTO users (name, email, password, role) VALUES 
('John Doe', 'john@example.com', '$2b$10$V/fBt7Q/B3fJG8wFKRpgH.KyJ2kQXtAMOIY80AhPCtThb8XCm23He', 'customer'),
('Jane Smith', 'jane@example.com', '$2b$10$V/fBt7Q/B3fJG8wFKRpgH.KyJ2kQXtAMOIY80AhPCtThb8XCm23He', 'customer'),
('Mike Johnson', 'mike@example.com', '$2b$10$V/fBt7Q/B3fJG8wFKRpgH.KyJ2kQXtAMOIY80AhPCtThb8XCm23He', 'customer');

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
(1, 'iPhone 15 Pro Max', 'Latest Apple iPhone with A17 Pro chip, titanium design, and advanced camera system.', 1199.99, 25, 1, '/images/iphone-15-pro.jpg', TRUE),
(2, 'Sony WH-1000XM5 Headphones', 'Industry-leading noise canceling wireless headphones with 30-hour battery life.', 399.99, 50, 1, '/images/sony-headphones.jpg', TRUE),
(3, 'MacBook Air M3', 'Ultra-thin laptop with M3 chip, 18-hour battery life, and stunning display.', 1299.99, 15, 1, '/images/macbook-air-m3.jpg', TRUE),
(4, 'Designer Leather Jacket', 'Premium genuine leather jacket with modern cut and timeless style.', 299.99, 30, 2, '/images/leather-jacket.jpg', TRUE),
(5, 'Nike Air Max 270', 'Comfortable running shoes with Max Air unit and breathable mesh upper.', 149.99, 75, 2, '/images/nike-air-max.jpg', FALSE),
(6, 'Web Developer Course Book', 'Comprehensive guide to modern web development including React and Node.js.', 49.99, 100, 3, '/images/web-dev-book.jpg', TRUE),
(7, 'Smart Security Camera', '4K wireless security camera with night vision and motion detection.', 199.99, 40, 4, '/images/security-camera.jpg', FALSE),
(8, 'Ergonomic Office Chair', 'Premium office chair with lumbar support and adjustable height.', 449.99, 20, 4, '/images/office-chair.jpg', TRUE),
(9, 'Premium Yoga Mat', 'Non-slip yoga mat with extra cushioning and eco-friendly materials.', 79.99, 60, 5, '/images/yoga-mat.jpg', FALSE),
(10, 'Bluetooth Speaker', 'Portable speaker with 360-degree sound and waterproof design.', 129.99, 45, 1, '/images/bluetooth-speaker.jpg', TRUE);

-- Insert sample orders
INSERT INTO orders (id, user_id, total, status, customer_name, customer_email, customer_phone, customer_address, customer_city, customer_zip) VALUES 
(1, 2, 1599.98, 'delivered', 'John Doe', 'john@example.com', '+1-555-0123', '123 Main Street', 'New York', '10001'),
(2, 3, 449.99, 'shipped', 'Jane Smith', 'jane@example.com', '+1-555-0456', '456 Oak Avenue', 'Los Angeles', '90210'),
(3, NULL, 179.98, 'processing', 'Guest Customer', 'guest@example.com', '+1-555-0789', '789 Pine Road', 'Chicago', '60601');

-- Insert order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES 
(1, 1, 1, 1199.99),  -- iPhone
(1, 2, 1, 399.99),   -- Headphones
(2, 8, 1, 449.99),   -- Office Chair
(3, 9, 1, 79.99),    -- Yoga Mat
(3, 10, 1, 129.99);  -- Speaker

-- Verify the setup
SELECT 'Database fixed successfully!' as Status;
SELECT 'Admin user created with email: admin@neosafi.com and password: admin123' as LoginInfo;
SELECT COUNT(*) as TotalUsers FROM users;
SELECT COUNT(*) as TotalProducts FROM products;
SELECT COUNT(*) as TotalOrders FROM orders;