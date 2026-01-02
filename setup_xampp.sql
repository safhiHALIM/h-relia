-- NeoSafi Store Database Setup for XAMPP
-- Run this in phpMyAdmin or MySQL command line

-- Create database
CREATE DATABASE IF NOT EXISTS neosafi_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE neosafi_store;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
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

-- Insert default admin user
INSERT IGNORE INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@neosafi.com', '$2b$10$8K1p/a0dclxKoNGuDF/my.Uizm.JHueMiZjKjixbqCzHm5OHfyus6', 'admin');

-- Insert sample categories
INSERT IGNORE INTO categories (id, name, description) VALUES 
(1, 'Electronics', 'Electronic devices and gadgets'),
(2, 'Clothing', 'Fashion and apparel'),
(3, 'Books', 'Books and educational materials'),
(4, 'Home & Garden', 'Home improvement and garden supplies'),
(5, 'Sports', 'Sports equipment and accessories');

-- Insert sample products
INSERT IGNORE INTO products (id, name, description, price, stock, category_id, featured) VALUES 
(1, 'Smartphone Pro Max', 'Latest flagship smartphone with advanced features', 999.99, 50, 1, TRUE),
(2, 'Wireless Headphones', 'Premium noise-cancelling wireless headphones', 299.99, 100, 1, TRUE),
(3, 'Designer T-Shirt', 'Premium cotton t-shirt with modern design', 49.99, 200, 2, FALSE),
(4, 'Programming Guide', 'Complete guide to modern web development', 39.99, 75, 3, TRUE),
(5, 'Smart Home Hub', 'Central control for all your smart home devices', 199.99, 30, 4, FALSE),
(6, 'Running Shoes', 'Professional running shoes for athletes', 129.99, 80, 5, TRUE);

-- Insert sample orders
INSERT IGNORE INTO orders (id, total, status, customer_name, customer_email, customer_phone, customer_address, customer_city, customer_zip) VALUES 
(1, 1299.98, 'delivered', 'John Doe', 'john@example.com', '+1234567890', '123 Main St', 'New York', '10001'),
(2, 49.99, 'processing', 'Jane Smith', 'jane@example.com', '+1987654321', '456 Oak Ave', 'Los Angeles', '90210');

-- Insert sample order items
INSERT IGNORE INTO order_items (order_id, product_id, quantity, price) VALUES 
(1, 1, 1, 999.99),
(1, 2, 1, 299.99),
(2, 3, 1, 49.99);

-- Show success message
SELECT 'Database setup completed successfully!' as message;