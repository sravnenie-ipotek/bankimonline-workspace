# 🚀 Production Deployment Guide

## 📋 Current Setup Summary

### **Backend Analysis** ✅
- **Railway Laravel API**: `https://bankimonlineapi-production.up.railway.app/api/v1/`
  - ✅ Has registration: `POST /api/v1/registration`
  - ❌ No refinance endpoints
- **Local Node.js API**: `http://localhost:8003/api/`
  - ✅ Has refinance: `GET /api/refinance-mortgage`, `GET /api/refinance-credit`
  - ✅ Has custom registration: `POST /api/register`

### **Frontend Apps**
1. **Main App** (`mainapp/`): Mortgage calculator, refinance services
2. **Account App** (`account/`): Personal account dashboard

## 🎯 Deployment Strategy: Option A (Separate Projects)

### **1. Deploy Account App to Vercel** 
**Domain**: `bankim-account-production.vercel.app`

```bash
# In account/ directory
cd account
npm install
npm run build

# Deploy to Vercel (you'll need to do this)
vercel --prod
```

**Configuration Files Created**:
- ✅ `account/vercel.json` - Vercel deployment config
- ✅ `account/.env.production` - Production environment variables
- ✅ Fixed PostCSS TypeScript error
- ✅ Updated homepage from `/account/` to `/`

### **2. Deploy Node.js Backend to Railway**
**Domain**: `your-node-api-production.railway.app`

```bash
# Create new Railway project for Node.js backend
railway login
railway init
railway up
```

**Configuration Files Created**:
- ✅ `railway.json` - Railway deployment config for Node.js

### **3. Update Main App Production URLs**
**Configuration Files Created**:
- ✅ `mainapp/.env.production` - Production environment variables
- ✅ Updated `mainapp/vite.config.js` - Environment variable support
- ✅ Updated API files to use environment variables:
  - `mainapp/src/services/api.ts`
  - `mainapp/src/pages/Services/pages/RefinanceCredit/api/refinanceCredit.ts`
  - `mainapp/src/pages/Services/pages/RefinanceMortgage/api/refinanceMortgage.ts`
  - `mainapp/src/pages/AuthModal/pages/SignUp/SignUp.tsx`

## 🔧 Environment Variables

### **Main App** (`mainapp/.env.production`)
```env
VITE_API_BASE_URL=https://bankimonlineapi-production.up.railway.app/api/v1
VITE_NODE_API_BASE_URL=https://your-node-api-production.railway.app/api
VITE_ACCOUNT_URL=https://bankim-account-production.vercel.app
VITE_ENVIRONMENT=production
```

### **Account App** (`account/.env.production`)
```env
VITE_API_BASE_URL=https://bankimonlineapi-production.up.railway.app/api/v1
VITE_ENVIRONMENT=production
```

## 📝 Deployment Steps

### **Step 1: Deploy Node.js Backend**
1. Create new Railway project
2. Connect this repository
3. Set root directory to `/` (contains `server-db.js`)
4. Deploy using `railway.json` config
5. **Update** `mainapp/.env.production` with actual Railway URL

### **Step 2: Deploy Account App**
1. Create new Vercel project
2. Connect this repository
3. Set root directory to `/account`
4. Deploy using `vercel.json` config
5. Domain will be: `bankim-account-production.vercel.app`

### **Step 3: Update Main App**
1. Update existing Vercel project for main app
2. Set root directory to `/mainapp`
3. Add production environment variables
4. Redeploy

### **Step 4: Update Laravel Backend CORS**
Add new domains to Laravel CORS configuration:
```php
// In Laravel backend
'allowed_origins' => [
    'https://bankimstandaloneprod-git-main-michaels-projects-8d0f6093.vercel.app',
    'https://bankim-account-production.vercel.app',
    // ... other domains
],
```

## 🔄 API Endpoint Mapping

### **Registration Flow**
- **Development**: `localhost:8003/api/register` → `localhost:3001/`
- **Production**: `https://bankimonlineapi-production.up.railway.app/api/v1/registration` → `https://bankim-account-production.vercel.app/`

### **Refinance Services**
- **Development**: `localhost:8003/api/refinance-*`
- **Production**: `https://your-node-api-production.railway.app/api/refinance-*`

### **Other Services**
- **Development**: `localhost:8003/api/*`
- **Production**: `https://bankimonlineapi-production.up.railway.app/api/v1/*`

## ⚠️ Important Notes

1. **Laravel vs Node.js**: You have TWO different backends
   - Laravel handles most APIs (registration, banks, etc.)
   - Node.js handles refinance calculations only

2. **Registration Endpoint**: Laravel uses `/api/v1/registration`, not `/api/register`

3. **CORS Configuration**: Update Laravel backend to allow new Vercel domains

4. **Database**: Both backends use same Railway PostgreSQL database

## 🎉 Final Production URLs

- **Main App**: `https://bankimstandaloneprod-git-main-michaels-projects-8d0f6093.vercel.app`
- **Account App**: `https://bankim-account-production.vercel.app`
- **Laravel API**: `https://bankimonlineapi-production.up.railway.app/api/v1/`
- **Node.js API**: `https://your-node-api-production.railway.app/api/`

## 🚀 Ready to Deploy!

All configuration files are created and code is updated. You can now:
1. Deploy the Node.js backend to Railway
2. Deploy the account app to Vercel
3. Update the main app with production environment variables
4. Update Laravel CORS settings

**Everything is production-ready!** 🎯 