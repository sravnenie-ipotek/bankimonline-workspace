# BankIM - Vercel Deployment Guide

## 🏗️ Architecture Overview

The BankIM application uses a **hybrid deployment architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🌐 VERCEL (Frontend)          📡 RAILWAY (Backend API)     │
│  ┌─────────────────────┐      ┌─────────────────────┐      │
│  │   React App         │─────▶│   Node.js API       │      │
│  │   Static Files      │      │   Port 8003         │      │
│  │   Admin Panels      │      │   Database Logic    │      │
│  │                     │      │   SMS Services      │      │
│  └─────────────────────┘      └─────────────────────┘      │
│  bankim-standalone.vercel.app  bankim-nodejs-api.railway    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## ✅ **YES, IT WILL WORK ON VERCEL!**

### How It Works:

1. **Vercel** serves the React frontend and static HTML files
2. **Railway** hosts the Node.js API server with database connections
3. **Environment variables** connect frontend to backend API
4. **Cross-origin requests** handle API communication

## 🚀 Vercel Deployment Steps

### 1. Environment Variables in Vercel Dashboard

Set these in your Vercel project settings:

```bash
VITE_NODE_API_BASE_URL=https://bankim-nodejs-api-production.up.railway.app/api
VITE_API_BASE_URL=https://bankimonlineapi-production.up.railway.app/api/v1
VITE_ACCOUNT_URL=https://your-vercel-app.vercel.app
VITE_ENVIRONMENT=production
```

### 2. Deploy Frontend to Vercel

```bash
# Push to your connected Git repository
git add .
git commit -m "Deploy to Vercel"
git push origin main

# Vercel will automatically:
# 1. Run: cd mainapp && npm install
# 2. Run: cd mainapp && npm run build  
# 3. Serve from: mainapp/build/
```

### 3. Deploy Backend to Railway

```bash
# Deploy server-db.js to Railway
# Railway will automatically:
# 1. Install dependencies
# 2. Start: node server-db.js
# 3. Provide database connection
# 4. Assign public URL
```

## 🔧 Development vs Production

### Development (Local):
```bash
# Start both servers locally
node start-dev.js

# Frontend: http://localhost:3001
# Backend:  http://localhost:8003
```

### Production (Cloud):
```bash
# Frontend: https://your-app.vercel.app
# Backend:  https://your-api.railway.app
```

## 📱 SMS Service Configuration

### Development:
- Uses **mock SMS** with console logging
- Any 4-digit code works for testing

### Production:
- Requires **real SMS service** integration
- Update `server-db.js` with Twilio/AWS SNS
- See `TODO_BEFORE_PRODUCTION.txt` for details

## 🌐 Static Files Served by Vercel

These files are served directly by Vercel:
- `admin.html` - Admin panel
- `customer-approval-check.html` - Calculator
- `mainapp/build/` - React app build
- `css/`, `js/`, `locales/` - Static assets

## 🔗 API Endpoints

### Served by Railway (Node.js):
- `POST /api/sms-login` - SMS authentication
- `POST /api/sms-code-login` - Code verification  
- `POST /api/customer/submit-application` - Loan applications
- `POST /api/customer/compare-banks` - Bank comparison
- `GET /api/applications/:id/status` - Application tracking
- `POST /api/admin/login` - Admin authentication

### Served by Vercel (Static):
- `/` - React app
- `/admin-panel` - Admin HTML
- `/customer-approval-check` - Calculator HTML

## ⚙️ Vercel Configuration

The `vercel.json` file handles:
- **Build process**: Builds React app in `mainapp/`
- **Environment variables**: Injects API URLs
- **Routing**: Maps URLs to correct files
- **Static serving**: Serves HTML and assets

## 🔒 Security Considerations

### CORS Configuration:
The Railway API must allow requests from Vercel domain:
```javascript
app.use(cors({ 
  origin: [
    'https://your-vercel-app.vercel.app',
    'https://your-custom-domain.com'
  ] 
}));
```

### Environment Variables:
- ✅ Set in Vercel dashboard (secure)
- ❌ Never commit API keys to Git
- ✅ Use different URLs for dev/prod

## 🧪 Testing Deployment

### 1. Test API Connection:
```bash
curl https://bankim-nodejs-api-production.up.railway.app/api/admin/stats
```

### 2. Test Frontend Build:
```bash
cd mainapp
npm run build
# Check build/ directory is created
```

### 3. Test Environment Variables:
```bash
# In browser console on deployed site:
console.log(process.env.VITE_NODE_API_BASE_URL)
```

## 🚨 Common Issues & Solutions

### Issue: "Connection Refused" in Production
**Solution**: Check Railway API is deployed and accessible

### Issue: CORS Errors
**Solution**: Update CORS settings in `server-db.js` for Vercel domain

### Issue: Environment Variables Not Loading
**Solution**: Verify variables are set in Vercel dashboard, redeploy

### Issue: Static Files Not Found
**Solution**: Check file paths in `vercel.json` rewrites

## 📋 Deployment Checklist

**Before Deploying:**
- [ ] Test local build: `cd mainapp && npm run build`
- [ ] Verify API endpoints work locally
- [ ] Check environment variables in `vercel.json`
- [ ] Update CORS settings for production domain

**After Deploying:**
- [ ] Test SMS login flow
- [ ] Test loan application submission
- [ ] Test admin panel access
- [ ] Verify all static assets load
- [ ] Check browser console for errors

## 🎯 **Final Answer: YES, it will work on Vercel!**

The architecture is specifically designed for this deployment model:
- **Vercel** = Frontend hosting (what it's best at)
- **Railway** = Backend API hosting (database + logic)
- **Environment variables** = Connect them together

Your `start-dev.js` script is **only for local development**. In production, each service runs independently on its respective platform. 