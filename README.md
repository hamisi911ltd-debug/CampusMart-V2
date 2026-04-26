# CampusMart V2 - Campus Marketplace Platform

A modern, full-featured campus marketplace platform built with React, Express, and Node.js. Buy, sell, and discover everything you need on campus.

## 🌟 Features

### Core Marketplace
- 📚 **Textbooks & Books** - Buy/sell academic materials
- 🍕 **Food Delivery** - Order from campus restaurants
- 🏠 **Housing** - Find rooms and apartments
- 👕 **Fashion & Accessories** - Browse student fashion
- 🛋️ **Furniture** - Buy/sell dorm furniture
- 🎓 **Services** - Student services marketplace

### User Features
- 👤 **User Authentication** - Secure registration and login
- 🛒 **Shopping Cart** - Add/remove items, manage quantities
- 💳 **Checkout** - Delivery address input and order confirmation
- 📱 **WhatsApp Integration** - Direct seller contact via WhatsApp
- ⭐ **Wishlist** - Save favorite items
- 📦 **Order Tracking** - View order history and status
- 🔔 **Notifications** - Real-time order updates

### Admin Features
- 📊 **Dashboard** - Sales analytics and metrics
- 📝 **Content Management** - Manage products and categories
- 👥 **User Management** - Manage user accounts
- 📈 **Reports** - Sales and activity reports

### Technical Features
- 📱 **Responsive Design** - Works on mobile, tablet, desktop
- 🎨 **Modern UI** - Built with Tailwind CSS and Radix UI
- ⚡ **Fast Performance** - Optimized React components
- 🔒 **Secure** - Token-based authentication
- 💾 **Persistent Database** - JSON-based file storage
- 🌐 **PWA Support** - Install as mobile app
- 🚀 **Production Ready** - Railway deployment configured

## 🚀 Quick Start

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the server**
   ```bash
   npm start
   ```

3. **Access the application**
   - Frontend: http://localhost:3001
   - API: http://localhost:3001/api
   - Health check: http://localhost:3001/api/health

### Railway Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Railway"
   git push origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "Deploy from GitHub repo"
   - Select CampusMart-V2
   - Railway will automatically build and deploy

3. **Access your app**
   ```
   https://your-app-name.railway.app
   ```

See [RAILWAY_SETUP.md](./RAILWAY_SETUP.md) for detailed deployment instructions.

## 📁 Project Structure

```
CampusMart-V2/
├── server.js                 # Unified Express server
├── build-for-railway.js      # Build script for Railway
├── package.json              # Server dependencies
├── railway.json              # Railway configuration
├── nixpacks.toml             # Nixpacks build config
├── Dockerfile                # Docker configuration
├── database.json             # JSON database file
├── dist/                     # Built frontend files
└── artifacts/
    ├── api-server/           # Original API server (reference)
    └── campusmart/           # React frontend (reference)
```

## 🔧 API Endpoints

### Authentication
```
POST   /api/auth/register     # Register new user
POST   /api/auth/login        # Login user
```

### Products
```
GET    /api/products          # List products
GET    /api/products/:id      # Get product details
POST   /api/products          # Create product (auth required)
```

### Cart
```
GET    /api/cart              # Get user's cart
POST   /api/cart              # Add to cart
PUT    /api/cart/:itemId      # Update cart item
DELETE /api/cart/:itemId      # Remove from cart
```

### Orders
```
POST   /api/orders            # Create order
GET    /api/orders            # Get user's orders
```

### Other
```
GET    /api/categories        # Get categories
GET    /api/food              # List food items
GET    /api/rooms             # List rooms
GET    /api/health            # Health check
```

## 💾 Database

The application uses a **JSON-based file database** that:
- Stores all data in `database.json`
- Persists across server restarts
- Auto-saves on changes
- Supports Railway volume mounting

### Database Schema
```json
{
  "users": [
    {
      "id": "unique_id",
      "username": "string",
      "email": "string",
      "phone": "string",
      "token": "string",
      "createdAt": "ISO_DATE"
    }
  ],
  "products": [
    {
      "id": "unique_id",
      "title": "string",
      "description": "string",
      "price": "number",
      "category": "string",
      "image": "url",
      "sellerId": "user_id",
      "sellerUsername": "string",
      "sellerPhone": "string",
      "createdAt": "ISO_DATE"
    }
  ],
  "orders": [
    {
      "id": "unique_id",
      "orderId": "CM_timestamp",
      "userId": "user_id",
      "items": "array",
      "totalAmount": "number",
      "deliveryAddress": "string",
      "status": "pending|confirmed|delivered",
      "createdAt": "ISO_DATE"
    }
  ],
  "cart": [
    {
      "id": "unique_id",
      "userId": "user_id",
      "productId": "product_id",
      "quantity": "number",
      "price": "number",
      "createdAt": "ISO_DATE"
    }
  ],
  "categories": [
    {
      "id": "string",
      "name": "string",
      "description": "string"
    }
  ],
  "food": [],
  "rooms": []
}
```

## 🔐 Authentication

The application uses **token-based authentication**:

1. **Register**: Create new account with username, email, password, phone
2. **Login**: Get authentication token
3. **API Requests**: Include token in `Authorization: Bearer <token>` header
4. **Protected Routes**: Only authenticated users can access cart, orders, etc.

## 🌐 Environment Variables

```
NODE_ENV=production          # Set to production on Railway
PORT=3001                    # Server port (auto-set by Railway)
RAILWAY_VOLUME_MOUNT_PATH    # Database volume path (Railway)
```

## 📦 Dependencies

### Server
- **express** - Web framework
- **cors** - Cross-origin support

### Frontend (Built separately)
- **react** - UI library
- **tailwindcss** - Styling
- **react-query** - Data fetching
- **wouter** - Routing
- **lucide-react** - Icons

## 🚀 Deployment

### Railway (Recommended)
- Automatic builds from GitHub
- Integrated database storage
- Auto-scaling and monitoring
- Custom domain support
- SSL certificates included

See [RAILWAY_SETUP.md](./RAILWAY_SETUP.md) for detailed instructions.

### Docker
```bash
docker build -t campusmart .
docker run -p 3001:3001 campusmart
```

### Manual
```bash
npm install
npm run build
npm start
```

## 📊 Performance

- **Build Time**: ~2-3 minutes on Railway
- **Startup Time**: <5 seconds
- **Database**: JSON file (suitable for small-medium scale)
- **Scalability**: Horizontal scaling via Railway

## 🔍 Monitoring

### Health Check
```bash
curl https://your-app.railway.app/api/health
```

### Logs
View real-time logs in Railway dashboard:
1. Go to your project
2. Click "Logs" tab
3. Monitor server activity

## 🛠️ Development

### Local Setup
```bash
# Install dependencies
npm install

# Start server
npm start

# Server runs on http://localhost:3001
```

### Building Frontend
```bash
npm run build
```

### Testing API
```bash
# Health check
curl http://localhost:3001/api/health

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"pass","phone":"254700000000"}'
```

## 📝 License

MIT License - See LICENSE file for details

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions:
1. Check [RAILWAY_SETUP.md](./RAILWAY_SETUP.md) for deployment help
2. Review API documentation above
3. Check server logs for errors

## 🎯 Roadmap

- [ ] PostgreSQL database integration
- [ ] Payment gateway integration
- [ ] Advanced search and filtering
- [ ] User reviews and ratings
- [ ] Messaging system
- [ ] Admin analytics dashboard
- [ ] Mobile app (React Native)

---

**CampusMart V2** - Making campus commerce simple and accessible. 🚀