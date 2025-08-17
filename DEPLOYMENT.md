# 🚀 Server Deployment Guide

## **Free Hosting Options (Recommended)**

### 1. **Render.com (Best Free Option)**
- **Free Tier**: 750 hours/month (24/7 available)
- **Memory**: 512MB RAM
- **Database**: Free PostgreSQL included
- **Auto-deploy**: From GitHub
- **Custom domains**: Free

### 2. **Railway.app**
- **Free Tier**: $5 credit monthly
- **Memory**: 512MB RAM
- **Easy deployment**: Very simple setup

### 3. **Fly.io**
- **Free Tier**: 3 shared-cpu VMs, 3GB persistent volume
- **Global deployment**: Multiple regions

## **Deployment Steps for Render.com**

### **Step 1: Prepare Your Repository**
1. Make sure your code is pushed to GitHub
2. Ensure you have a `package.json` with start script

### **Step 2: Create Render Account**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"

### **Step 3: Connect Repository**
1. Connect your GitHub repository
2. Select the repository
3. Choose the branch (usually `main` or `master`)

### **Step 4: Configure Service**
```
Name: pixelsbee-api
Environment: Node
Build Command: npm install
Start Command: npm start
```

### **Step 5: Set Environment Variables**
Add these in Render dashboard:
```
NODE_ENV=production
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
```

### **Step 6: Deploy**
1. Click "Create Web Service"
2. Wait for build to complete
3. Your API will be available at: `https://your-service-name.onrender.com`

## **Environment Variables for Production**

Create a `.env.production` file (don't commit this to Git):

```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_super_secure_jwt_secret_here
FRONTEND_URL=https://your-frontend-domain.com
```

## **Update Frontend API URL**

After deployment, update your frontend API URL:

```javascript
// In client/src/utils/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-service-name.onrender.com/api';
```

## **Health Check**

Your deployed server will have a health check endpoint:
- `https://your-service-name.onrender.com/health`

## **Important Notes**

1. **Free tier limitations**: 
   - Render: 750 hours/month
   - Railway: $5 credit/month
   - Fly.io: 3 VMs

2. **Sleep mode**: Some free tiers sleep after inactivity
   - First request after sleep may take 10-30 seconds

3. **Database**: 
   - MongoDB Atlas has free tier (512MB)
   - Render includes free PostgreSQL

4. **File uploads**: 
   - Use Cloudinary for image storage
   - Don't store files on server (they get deleted)

## **Troubleshooting**

- **Build fails**: Check `package.json` scripts
- **Environment variables**: Ensure all required vars are set
- **CORS errors**: Update `FRONTEND_URL` in environment
- **Database connection**: Verify MongoDB URI is correct

## **Next Steps After Deployment**

1. Test all API endpoints
2. Update frontend API URL
3. Test user registration/login
4. Test file uploads
5. Monitor logs for errors
