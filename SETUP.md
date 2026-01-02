# NeoSafi Store - Quick Setup Guide

## 🚀 Current Status
✅ **Server is running successfully on http://localhost:3000**  
⚠️ **Database connection needed for full functionality**

## 📋 What's Working Right Now
- ✅ Frontend interface (store and admin panel)
- ✅ Static content serving
- ✅ Basic routing
- ❌ Database features (products, orders, access links)

## 🔧 Complete Setup (with Database)

### Option 1: Quick MySQL Setup (Recommended)

#### Windows (using Chocolatey)
```bash
# Install Chocolatey if not installed
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install MySQL
choco install mysql

# Start MySQL service
net start mysql80
```

#### Windows (Manual Download)
1. Download MySQL from: https://dev.mysql.com/downloads/mysql/
2. Install with default settings
3. Remember the root password you set during installation

#### macOS
```bash
# Using Homebrew
brew install mysql
brew services start mysql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

### Step 2: Create Database and User

```bash
# Connect to MySQL as root
mysql -u root -p

# Create database and user
CREATE DATABASE neosafi_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'neosafi_user'@'localhost' IDENTIFIED BY 'secure_password_123';
GRANT ALL PRIVILEGES ON neosafi_store.* TO 'neosafi_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Import Database Schema

```bash
# From the project directory
mysql -u neosafi_user -p neosafi_store < sql/neosafi_schema.sql
```

### Step 4: Update Environment Configuration

Edit the `.env` file with your database credentials:

```bash
# Database Configuration
DB_HOST=localhost
DB_USER=neosafi_user
DB_PASSWORD=secure_password_123
DB_NAME=neosafi_store
DB_PORT=3306

# Server Configuration
PORT=3000
NODE_ENV=development

# Security (change this!)
SESSION_SECRET=your_random_session_secret_change_in_production_12345
```

### Step 5: Restart the Server

```bash
# Stop current server (Ctrl+C in the terminal)
# Then restart
npm start
```

## 🎯 Testing the Complete System

### 1. Access the Store
- **Main Store**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

### 2. Default Admin Credentials
- **Email**: admin@neosafi.com
- **Password**: admin123

### 3. Test Access Link System
1. Login to admin panel
2. Go to "Access Links" section
3. Generate a new access link
4. Copy the generated link
5. Open in a different browser/incognito mode
6. Verify the unique link system works

## 🔍 Troubleshooting

### Database Connection Issues

**Error**: `Database connection failed: ECONNREFUSED`
- **Solution**: Make sure MySQL service is running
- **Windows**: `net start mysql80`
- **macOS**: `brew services start mysql`
- **Linux**: `sudo systemctl start mysql`

**Error**: `Access denied for user`
- **Solution**: Check username/password in `.env` file
- **Verify**: Try connecting manually: `mysql -u neosafi_user -p`

**Error**: `Unknown database 'neosafi_store'`
- **Solution**: Create the database first (see Step 2 above)

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use a different port
PORT=3001 npm start
```

### Permission Issues

**Error**: File upload or image issues
```bash
# Make sure uploads directory is writable
chmod 755 public/uploads  # Linux/macOS
# Windows: Right-click folder → Properties → Security → Edit permissions
```

## 🌐 Alternative Database Options

### Option 1: SQLite (Simpler, File-based)
If you prefer not to install MySQL, you can modify the project to use SQLite:

1. Install SQLite package: `npm install sqlite3`
2. Modify `config/db.js` to use SQLite instead of MySQL
3. Convert the SQL schema to SQLite format

### Option 2: Online Database Services
- **PlanetScale**: Free MySQL-compatible database
- **Railway**: Free PostgreSQL/MySQL hosting
- **Supabase**: Free PostgreSQL with additional features

## 📱 Mobile Testing

The interface is responsive and works on mobile devices:
- Test on different screen sizes
- Use browser developer tools to simulate mobile devices
- Access from mobile devices on the same network using your computer's IP

## 🚀 Production Deployment

When ready for production:

1. **Change default credentials** in the database
2. **Update SESSION_SECRET** in `.env`
3. **Set NODE_ENV=production**
4. **Use HTTPS** in production
5. **Set up proper backup** for the database
6. **Configure firewall** rules
7. **Use PM2** for process management: `npm install -g pm2`

## 📞 Need Help?

1. **Check the logs** in the terminal where the server is running
2. **Verify all steps** were completed correctly
3. **Test database connection** manually with MySQL client
4. **Check firewall settings** if accessing from other devices
5. **Review the main README.md** for detailed documentation

## 🎉 Success Indicators

When everything is working correctly, you should see:
- ✅ Server starts without errors
- ✅ Database connection successful message
- ✅ Admin panel login works
- ✅ Products display on homepage
- ✅ Access link generation works
- ✅ Orders can be placed

---

**Current Server Status**: 🟢 Running on http://localhost:3000  
**Database Status**: 🔴 Not connected (follow setup above)  
**Next Step**: Set up MySQL database for full functionality