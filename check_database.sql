-- Check Database Status
USE neosafi_store;

-- Check if tables exist
SHOW TABLES;

-- Check users table structure
DESCRIBE users;

-- Check if admin user exists
SELECT id, name, email, role, created_at FROM users WHERE email = 'admin@neosafi.com';

-- Check all users
SELECT id, name, email, role, created_at FROM users;

-- Check password hash for admin user
SELECT email, password FROM users WHERE email = 'admin@neosafi.com';