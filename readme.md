# NeoSafi Store - Modern E-commerce Platform

A production-ready e-commerce platform with unique single-use access link system built with Node.js, Express, MySQL, and Bootstrap.

## Features

### Customer Features
- **Homepage**: Hero slider, featured products, category browsing
- **Product Catalog**: Server-side pagination, search, filters (category, price range)
- **Product Details**: Image gallery, descriptions, stock management, add to cart
- **Shopping Cart**: Full cart management with quantity controls
- **Checkout**: Simple checkout flow with customer information (payment stubs included)
- **User Accounts**: Registration, login, order history

### Admin Features
- **Admin Dashboard**: Statistics overview, recent orders
- **Product Management**: Full CRUD operations, image upload, stock control
- **Order Management**: View orders, update status, customer details
- **Access Link System**: Generate single-use, device-locked access tokens

### Unique Access Link System
- **Single-Use Tokens**: Each link can only be used once
- **Device Locking**: Links are tied to specific device fingerprints
- **Secure Storage**: Only SHA256 hashes stored in database
- **Expiration Support**: Optional time-based expiration
- **Admin Management**: Generate, list, revoke, and monitor links

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with connection pooling
- **Frontend**: HTML5, CSS3, Bootstrap 5, Vanilla JavaScript
- **Security**: bcrypt, SHA256 hashing, rate limiting, session management
- **File Upload**: Multer for image handling

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Local Development Setup

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd neosafi-store
   npm install
   ```

2. **Database Setup**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE neosafi_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'neosafi_user'@'localhost' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON neosafi_store.* TO 'neosafi_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   
   # Import schema and sample data
   mysql -u neosafi_user -p neosafi_store < sql/neosafi_schema.sql
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env file with your settings
   nano .env
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Store: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin
   - Admin Credentials: admin@neosafi.com / admin123

### Production Deployment

#### cPanel Deployment (if Node.js is supported)

1. **Upload Files**
   - Upload all project files to your cPanel file manager
   - Extract to your domain's public_html directory

2. **Database Setup**
   - Create MySQL database through cPanel
   - Import `sql/neosafi_schema.sql` through phpMyAdmin
   - Update `.env` with database credentials

3. **Node.js Configuration**
   - Enable Node.js in cPanel (if available)
   - Set startup file to `server.js`
   - Install dependencies: `npm install`
   - Start application

4. **Environment Variables**
   ```bash
   NODE_ENV=production
   DB_HOST=localhost
   DB_USER=your_cpanel_db_user
   DB_PASSWORD=your_cpanel_db_password
   DB_NAME=your_cpanel_db_name
   SESSION_SECRET=your_random_session_secret
   ```

#### Alternative Deployment Options

If cPanel doesn't support Node.js, consider these alternatives:

1. **VPS/Cloud Hosting**
   - DigitalOcean, Linode, AWS EC2
   - Full control over Node.js environment
   - Use PM2 for process management

2. **Platform-as-a-Service**
   - Heroku, Railway, Render
   - Automatic deployment from Git
   - Built-in database options

3. **Shared Hosting with Node.js**
   - A2 Hosting, InMotion, SiteGround
   - Look for "Node.js hosting" support

## API Endpoints

### Authentication
- `POST /api/login` - Customer login
- `POST /api/register` - Customer registration
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/check` - Check admin session

### Products
- `GET /api/products` - Get products (with pagination/filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/featured/list` - Get featured products
- `POST /api/admin/products` - Create product (admin)
- `PUT /api/admin/products/:id` - Update product (admin)
- `DELETE /api/admin/products/:id` - Delete product (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/admin/orders` - Get all orders (admin)
- `PUT /api/admin/orders/:id/status` - Update order status (admin)

### Access Links
- `POST /api/generate-link` - Generate access link (admin)
- `POST /api/check-link` - Verify access link
- `GET /api/admin/access-links` - List access links (admin)
- `PUT /api/admin/access-links/:hash/revoke` - Revoke link (admin)

### Categories
- `GET /api/categories` - Get all categories

## Testing

### Manual Testing with cURL

1. **Generate Access Link**
   ```bash
   # Login as admin first
   curl -X POST http://localhost:3000/api/admin/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@neosafi.com","password":"admin123"}' \
     -c cookies.txt
   
   # Generate link
   curl -X POST http://localhost:3000/api/generate-link \
     -H "Content-Type: application/json" \
     -d '{"expires_hours":24}' \
     -b cookies.txt
   ```

2. **Test Access Link**
   ```bash
   # Use the token from previous response
   curl -X POST http://localhost:3000/api/check-link \
     -H "Content-Type: application/json" \
     -d '{"token":"your_token_here","deviceId":"test_device_id"}'
   ```

3. **Test Product API**
   ```bash
   # Get products
   curl http://localhost:3000/api/products
   
   # Get single product
   curl http://localhost:3000/api/products/1
   ```

### Automated Testing

Run the included test script:
```bash
# Make test script executable
chmod +x test_api.sh

# Run tests
./test_api.sh
```

## Security Features

### Access Link Security
- **Token Hashing**: Raw tokens never stored, only SHA256 hashes
- **Device Fingerprinting**: Browser/system characteristics for device ID
- **Single Use**: Each token can only be claimed once
- **Device Locking**: Tokens tied to specific device fingerprints
- **Expiration**: Optional time-based expiration
- **Rate Limiting**: Prevents brute force attacks

### General Security
- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: Secure HTTP-only cookies
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **File Upload Security**: Type and size restrictions
- **HTTPS Ready**: Secure cookie settings for production

## Database Schema

### Core Tables
- `users` - Customer and admin accounts
- `categories` - Product categories
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `access_links` - Unique access token system

### Key Relationships
- Products belong to categories
- Orders can have multiple order items
- Orders can be linked to users (or guest orders)
- Access links are independent security tokens

## Configuration

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_USER=neosafi_user
DB_PASSWORD=secure_password
DB_NAME=neosafi_store
DB_PORT=3306

# Server
PORT=3000
NODE_ENV=development

# Security
SESSION_SECRET=random_secret_key

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=public/uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Default Admin Account
- **Email**: admin@neosafi.com
- **Password**: admin123
- **Role**: admin

*Change these credentials in production!*

## File Structure

```
neosafi-store/
├── config/
│   └── db.js                 # Database configuration
├── public/
│   ├── css/
│   │   └── style.css         # Custom styles
│   ├── js/
│   │   ├── app.js           # Main frontend logic
│   │   ├── admin.js         # Admin panel logic
│   │   └── device.js        # Device fingerprinting
│   ├── uploads/             # Product images
│   ├── index.html           # Main store page
│   ├── admin.html           # Admin panel
│   └── access.html          # Access link verification
├── routes/
│   └── store.js             # API routes
├── sql/
│   └── neosafi_schema.sql   # Database schema
├── .env.example             # Environment template
├── package.json             # Dependencies
├── server.js                # Main server file
└── README.md               # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue on GitHub
- Email: support@neosafi.com
- Documentation: Check this README and code comments

## Roadmap

### Phase 1 (Current)
- ✅ Basic e-commerce functionality
- ✅ Admin panel
- ✅ Access link system
- ✅ Responsive design

### Phase 2 (Future)
- [ ] Payment integration (Stripe/PayPal)
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Mobile app API
- [ ] Advanced search with Elasticsearch

### Phase 3 (Advanced)
- [ ] Multi-vendor marketplace
- [ ] Advanced inventory management
- [ ] Customer reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced reporting dashboard