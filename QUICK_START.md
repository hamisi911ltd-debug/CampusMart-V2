# 🚀 CampusMart V2 - Quick Start Guide

## Deploy in 3 Steps

### Step 1: Go to Railway
Visit https://railway.app and sign in with GitHub

### Step 2: Deploy from GitHub
- Click "New Project"
- Select "Deploy from GitHub repo"
- Search for "CampusMart-V2"
- Click "Deploy"

### Step 3: Wait & Access
- Railway builds automatically (~2-3 minutes)
- Your app is live at: `https://your-app-name.railway.app`

---

## 🎯 What's Included

✅ **Unified Server** - Single Node.js/Express server  
✅ **Integrated Database** - JSON file storage with persistence  
✅ **Frontend** - React app with Tailwind CSS  
✅ **API** - Complete marketplace API  
✅ **WhatsApp Integration** - Direct seller contact  
✅ **Health Checks** - Automatic monitoring  
✅ **Production Ready** - Optimized for Railway  

---

## 📱 Features

- User authentication (register/login)
- Product marketplace
- Shopping cart
- Checkout with WhatsApp
- Food ordering
- Room listings
- Admin panel
- Responsive design
- PWA support

---

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start server
npm start

# Access at http://localhost:3001
```

---

## 📊 API Endpoints

```
POST   /api/auth/register     # Register
POST   /api/auth/login        # Login
GET    /api/products          # List products
POST   /api/products          # Create product
GET    /api/cart              # Get cart
POST   /api/cart              # Add to cart
POST   /api/orders            # Create order
GET    /api/health            # Health check
```

---

## 💾 Database

- **Type**: JSON file (`database.json`)
- **Location**: Root directory (local) or `/app/data` (Railway)
- **Auto-save**: Changes saved automatically
- **Persistence**: Data survives server restarts

---

## 🔐 Authentication

1. Register with username, email, password, phone
2. Login to get authentication token
3. Include token in API requests: `Authorization: Bearer <token>`

---

## 📈 Scaling

Railway automatically handles:
- Traffic scaling
- Load balancing
- SSL certificates
- Custom domains
- Monitoring

---

## 🆘 Troubleshooting

### Server won't start
- Check port 3001 is available
- Verify `package.json` exists
- Check server logs

### Database not saving
- Ensure volume is mounted (Railway)
- Check file permissions
- Verify `database.json` exists

### API not responding
- Test `/api/health` endpoint
- Check authentication headers
- Review server logs

---

## 📚 Full Documentation

- **README.md** - Project overview
- **RAILWAY_SETUP.md** - Detailed deployment guide
- **DEPLOYMENT_SUMMARY.md** - Complete summary

---

## 🎉 You're Ready!

Your CampusMart V2 is production-ready. Deploy to Railway now! 🚀

**GitHub**: https://github.com/hamisi911ltd-debug/CampusMart-V2