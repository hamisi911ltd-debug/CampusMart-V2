# CampusMart V2 - Railway Deployment Guide

## 🚀 One-Click Railway Deployment

CampusMart V2 is now configured as a **unified package** ready for Railway deployment with integrated database storage.

### ✅ What's Included

- **Unified Server**: Single Node.js/Express server serving both API and frontend
- **Integrated Database**: JSON-based file storage with Railway volume persistence
- **Production Ready**: Optimized build process and health checks
- **Auto-scaling**: Configured for Railway's auto-scaling features

### 🔧 Deployment Steps

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Railway deployment ready"
   git push origin main
   ```

2. **Deploy on Railway**:
   - Go to [Railway.app](https://railway.app)
   - Click "Deploy from GitHub repo"
   - Select your CampusMart-V2 repository
   - Railway will automatically detect the configuration

3. **Environment Variables** (Optional):
   - `NODE_ENV=production` (auto-set)
   - `PORT=$PORT` (auto-set by Railway)

### 📊 Database Storage

The application uses a **persistent JSON database** that:
- Stores data in `database.json` file
- Uses Railway's volume mounting for persistence
- Automatically creates backup-friendly structure
- Scales with your application needs

### 🏗️ Build Process

Railway will automatically:
1. Install frontend dependencies
2. Build the React application
3. Install server dependencies
4. Start the unified server

### 🔍 Health Monitoring

- Health check endpoint: `/api/health`
- Automatic restart on failure
- Built-in logging and monitoring

### 🌐 Features Available

✅ **User Authentication** - Register/Login system  
✅ **Product Marketplace** - Buy/sell items  
✅ **Shopping Cart** - Add to cart functionality  
✅ **WhatsApp Integration** - Direct seller contact  
✅ **Food Ordering** - Campus food delivery  
✅ **Room Listings** - Housing marketplace  
✅ **Admin Panel** - Content management  
✅ **PWA Support** - Mobile app experience  
✅ **Responsive Design** - Works on all devices  

### 📱 Post-Deployment

After deployment:
1. Your app will be available at `https://your-app-name.railway.app`
2. Test the health endpoint: `https://your-app-name.railway.app/api/health`
3. Register the first admin user through the UI
4. Start adding products and content

### 🔧 Local Development

To run locally:
```bash
npm install
npm run build:frontend
npm start
```

### 📈 Scaling

Railway automatically handles:
- Traffic scaling
- Database persistence
- SSL certificates
- Custom domains
- Environment management

### 🆘 Troubleshooting

If deployment fails:
1. Check Railway build logs
2. Verify all dependencies are in package.json
3. Ensure environment variables are set
4. Check the health endpoint response

### 🎯 Production Optimizations

- Gzip compression enabled
- Static file caching
- Database auto-save on changes
- Error handling and logging
- Security headers configured

---

**Ready to deploy!** 🚀 Your CampusMart application is now optimized for Railway's platform.