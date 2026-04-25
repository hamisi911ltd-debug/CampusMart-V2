# CampusMart V2 - Railway Deployment Guide

## Prerequisites

1. **GitHub Account** - Your code needs to be on GitHub
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **Domain (Optional)** - For custom domain setup

## Step 1: Push to GitHub

1. **Add all changes to git:**
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   ```

2. **Push to GitHub:**
   ```bash
   git push origin main
   ```

## Step 2: Deploy Backend on Railway

1. **Login to Railway** and create a new project
2. **Connect GitHub repository** - Select your CampusMart-V2 repo
3. **Configure deployment settings:**
   - **Root Directory**: Leave empty (Railway will detect)
   - **Build Command**: `cd artifacts/api-server && npm run build`
   - **Start Command**: `cd artifacts/api-server && npm start`
   - **Port**: `3001`

4. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

5. **Deploy** - Railway will automatically build and deploy

## Step 3: Deploy Frontend (Optional - Separate Service)

If you want to deploy the frontend separately:

1. **Create another Railway service**
2. **Connect the same GitHub repo**
3. **Configure for frontend:**
   - **Root Directory**: `artifacts/campusmart`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run preview`

4. **Set Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

## Step 4: Configure Custom Domain (Optional)

1. **In Railway dashboard**, go to your service
2. **Click "Settings" → "Domains"**
3. **Add your custom domain**
4. **Update DNS records** as instructed by Railway

## Environment Variables Explained

### Backend (.env)
```env
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-domain.railway.app/api
```

## Important Notes

### Database
- The app uses local JSON file storage (`local-laptop-database.json`)
- Data persists between deployments on Railway
- For production, consider migrating to a proper database

### File Structure
```
Your Railway Deployment:
├── Backend API: https://campusmart-api.railway.app
├── Frontend: https://campusmart.railway.app (if deployed separately)
└── Database: Local JSON file on Railway filesystem
```

### CORS Configuration
The backend is configured to accept requests from any origin in production. For security, update the CORS settings in `artifacts/api-server/src/app.ts` to only allow your frontend domain.

### Health Check
Railway will use `/api/health` endpoint to check if your service is running properly.

## Troubleshooting

### Build Fails
- Check that all dependencies are properly installed
- Ensure no references to deleted packages remain
- Verify TypeScript compilation passes

### Service Won't Start
- Check Railway logs for error messages
- Verify environment variables are set correctly
- Ensure port 3001 is being used

### Database Issues
- The JSON database file will be created automatically
- Data persists between deployments
- Check file permissions if issues occur

## Post-Deployment Checklist

- [ ] Backend API is accessible at your Railway URL
- [ ] Health check endpoint (`/api/health`) returns 200
- [ ] User registration/login works
- [ ] Product creation and listing works
- [ ] Cart functionality works
- [ ] WhatsApp integration works
- [ ] All API endpoints respond correctly

## Scaling Considerations

For production use, consider:
1. **Database Migration**: Move from JSON to PostgreSQL/MongoDB
2. **File Storage**: Use cloud storage for product images
3. **Caching**: Implement Redis for better performance
4. **Monitoring**: Set up error tracking and monitoring
5. **Security**: Implement rate limiting and security headers

## Support

If you encounter issues:
1. Check Railway deployment logs
2. Verify all environment variables
3. Test API endpoints directly
4. Check GitHub repository for any missing files

Your CampusMart V2 application is now ready for Railway deployment!