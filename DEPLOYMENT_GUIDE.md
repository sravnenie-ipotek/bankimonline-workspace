# 🚀 Production Deployment Guide

## 📋 Current Setup Summary

### **Backend Analysis** ✅
- **Railway Node.js API**: `https://bankimonlineapi-production.up.railway.app/api/`
  - ✅ Has registration: `POST /api/register`
  - ✅ Has refinance: `GET /api/refinance-mortgage`, `GET /api/refinance-credit`
  - ✅ Has all business logic endpoints

### **Frontend App**
- **Main App** (`mainapp/`): Complete banking application with mortgage calculator, refinance services, and admin panel

## 🎯 Deployment Strategy: Railway-Only

### **1. Deploy Node.js Backend to Railway** 
**Domain**: `https://bankimonlineapi-production.up.railway.app`

```bash
# Deploy server code to Railway
cd server
railway login
railway init
railway up
```

**Configuration Files Created**:
- ✅ `railway.json` - Railway deployment config
- ✅ `server/package.json` - Server dependencies
- ✅ `server/server-db.js` - Main API server

### **2. Deploy Frontend to Railway**
**Domain**: `https://your-frontend-production.railway.app`

```bash
# Deploy React app to Railway
cd mainapp
npm install
npm run build
railway up
```

**Configuration Files Created**:
- ✅ `mainapp/vite.config.ts` - Build configuration
- ✅ `mainapp/package.json` - Frontend dependencies
- ✅ `mainapp/.env.production` - Production environment variables

## 🔧 Environment Variables

### **Main App** (`mainapp/.env.production`)
```env
VITE_API_BASE_URL=https://bankimonlineapi-production.up.railway.app/api
VITE_ENVIRONMENT=production
```

### **Server** (`server/.env`)
```env
DATABASE_URL=your_railway_postgresql_url
CONTENT_DATABASE_URL=your_railway_content_db_url
PORT=8003
NODE_ENV=production
```

## 📝 Deployment Steps

### **Step 1: Deploy Backend**
1. Create new Railway project for API server
2. Connect this repository
3. Set root directory to `/server`
4. Deploy using `railway.json` config
5. Set environment variables in Railway dashboard

### **Step 2: Deploy Frontend**
1. Create new Railway project for React app
2. Connect this repository
3. Set root directory to `/mainapp`
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Deploy

### **Step 3: Update CORS Configuration**
Update server CORS to allow Railway domains:
```javascript
// In server/server-db.js
const corsOptions = {
  origin: [
    'https://your-frontend-production.railway.app',
    'https://bankimonlineapi-production.up.railway.app'
  ],
  credentials: true
};
```

## 🔄 API Endpoint Mapping

### **All Services**
- **Development**: `localhost:8003/api/*`
- **Production**: `https://bankimonlineapi-production.up.railway.app/api/*`

### **Available Endpoints**
- ✅ Registration: `POST /api/register`
- ✅ Refinance Mortgage: `GET /api/refinance-mortgage`
- ✅ Refinance Credit: `GET /api/refinance-credit`
- ✅ Content API: `GET /api/content/:screen/:language`
- ✅ Admin APIs: `POST /api/admin/*`

## ⚠️ Important Notes

1. **Single Backend**: All APIs are now in Node.js server
2. **Database**: Uses Railway PostgreSQL database
3. **CORS**: Configured for Railway domains only
4. **Environment**: All variables set in Railway dashboard

## 🎉 Final Production URLs

- **Frontend**: `https://your-frontend-production.railway.app`
- **Backend API**: `https://bankimonlineapi-production.up.railway.app/api/`
- **Database**: Railway PostgreSQL (managed)

## 🚀 Ready to Deploy!

All configuration files are created and code is updated. You can now:
1. Deploy the backend to Railway
2. Deploy the frontend to Railway
3. Configure environment variables
4. Update CORS settings

**Everything is production-ready!** 🎯 