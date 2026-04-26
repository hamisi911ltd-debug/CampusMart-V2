# 🚀 CampusMart V2 - Railway Deployment Setup

## ✅ What's Ready for Railway

Your CampusMart V2 application is now **fully configured** for Railway deployment as a **single unified package** with:

- ✅ **Unified Express Server** - Single Node.js server serving both API and frontend
- ✅ **Integrated Database** - JSON-based persistent storage with Railway volume support
- ✅ **Production Build** - Optimized for Railway's Nixpacks builder
- ✅ **Health Checks** - Automatic monitoring and restart on failure
- ✅ **Environment Ready** - Auto-configured for Railway's environment variables

---

## 🎯 Quick Start on Railway

### Step 1: Go to Railway Dashboard
1. Visit [railway.app](https://railway.app)
2. Sign in with your GitHub account

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Search for **"CampusMart-V2"**
4. Click **"Deploy"**

### Step 3: Configure Environment
Railway will automatically:
- Detect the `railway.json` configuration
- Build using Nixpacks
- Install dependencies
- Start the server on port 3001

### Step 4: Access Your App
Once deployed, your app will be available at:
```
https://your-app-name.railway.app
```

---

## 📊 Database Storage

### How It Works
- **Type**: JSON file-based database
- **Location**: Railway volume mount at `/app/data/database.json`
- **Persistence**: Data persists across deployments
- **Auto-save**: Changes saved automatically

### Database Structure
```json
{
  "users": [],
  "products": [],
  "orders": [],
  "cart": [],
  "categories": [...],
  "food": [],
  "rooms": []
}
```

### Adding Railway Volume
1. In Railway dashboard, go to your project
2. Click **"Settings"** → **"Volumes"**
3. Click **"Add Volume"**
4. Mount path: `/app/data`
5. Size: 1GB (or as needed)

---

## 🔧 Server Configuration

### Port
- **Default**: 3001
- **Railway**: Auto-assigned via `$PORT` environment variable
- **Health Check**: `/api/health`

### Environment Variables
```
NODE_ENV=production
PORT=$PORT (auto-set by Railway)
```

### Build Process
```
1. npm install (server dependencies)
2. npm run build (creates dist/ with frontend)
3. npm start (starts unified server)
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create new product (auth required)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove from cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders

### Food
- `GET /api/food` - List food items
- `POST /api/food` - Create food listing

### Rooms
- `GET /api/rooms` - List rooms
- `POST /api/rooms` - Create room listing

### Categories
- `GET /api/categories` - Get all categories

---

## 📱 Frontend

### Static Files
- Built frontend served from `/dist` directory
- Automatically built during deployment
- Responsive design with Tailwind CSS

### Features
- ✅ User authentication
- ✅ Product marketplace
- ✅ Shopping cart
- ✅ WhatsApp integration
- ✅ Food ordering
- ✅ Room listings
- ✅ Admin panel
- ✅ PWA support

---

## 🔍 Monitoring & Logs

### View Logs
1. Go to Railway dashboard
2. Select your CampusMart project
3. Click **"Logs"** tab
4. View real-time server logs

### Health Check
Test the health endpoint:
```bash
curl https://your-app-name.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-04-26T09:51:47.837Z"
}
```

---

## 🚨 Troubleshooting

### Build Fails
- Check `railway.json` configuration
- Verify all dependencies in `package.json`
- Check build logs in Railway dashboard

### Server Won't Start
- Check port availability
- Verify environment variables
- Check database file permissions

### Database Issues
- Ensure volume is mounted
- Check database.json file exists
- Verify write permissions

### API Not Responding
- Check health endpoint: `/api/health`
- Verify CORS headers
- Check request headers include `Authorization` if needed

---

## 📈 Scaling

Railway automatically handles:
- **Auto-scaling** based on traffic
- **Load balancing** across instances
- **SSL certificates** (HTTPS)
- **Custom domains** support
- **Environment management**

---

## 🔐 Security

### Best Practices
- Use strong passwords for admin accounts
- Enable HTTPS (automatic on Railway)
- Keep dependencies updated
- Monitor logs for suspicious activity
- Use environment variables for secrets

### Production Checklist
- [ ] Database volume configured
- [ ] Environment variables set
- [ ] Health checks passing
- [ ] Logs being monitored
- [ ] Custom domain configured (optional)
- [ ] Backups enabled (optional)

---

## 📞 Support

### Resources
- [Railway Documentation](https://docs.railway.app)
- [Express.js Guide](https://expressjs.com)
- [Node.js Best Practices](https://nodejs.org/en/docs)

### Common Issues
1. **Port already in use** - Railway auto-assigns ports
2. **Database not persisting** - Ensure volume is mounted
3. **Build timeout** - Increase build timeout in Railway settings
4. **Memory issues** - Upgrade Railway plan

---

## ✨ Next Steps

1. **Deploy to Railway** - Follow Quick Start above
2. **Test API endpoints** - Use provided curl commands
3. **Add sample data** - Create test products/users
4. **Configure domain** - Add custom domain in Railway
5. **Monitor performance** - Check logs and metrics
6. **Scale as needed** - Upgrade Railway plan if needed

---

## 🎉 You're Ready!

Your CampusMart V2 application is production-ready for Railway deployment. The unified server with integrated database makes deployment simple and scalable.

**Happy deploying! 🚀**