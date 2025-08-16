# 🚨 Frontend API URL Fix - Deployment Guide

## Issue Summary

**Problem**: The frontend build contains hardcoded API URLs pointing to `https://bankimonline.com` instead of using relative paths, causing SSL certificate errors when `dev2.bankimonline.com` tries to call `bankimonline.com` APIs.

**Root Cause**: Multiple service files had hardcoded fallback URLs to `https://bankimonline.com/api` instead of using relative paths.

## ✅ Fixed Files

The following files have been updated to use relative paths (`/api`) instead of hardcoded URLs:

1. **mainapp/src/services/api.ts** - Main API service
2. **mainapp/src/services/calculationService.ts** - Calculation service
3. **mainapp/src/services/bankWorkerApi.ts** - Bank worker API
4. **mainapp/src/pages/Services/pages/CalculateMortgage/pages/FirstStep/FirstStepForm/FirstStepForm.tsx** - Mortgage form

## 📋 Deployment Instructions

### Step 1: Build Frontend with Fixed URLs

```bash
# Navigate to main app directory
cd mainapp

# Install dependencies (if needed)
npm install

# Build the frontend with the fixes
npm run build

# Verify build completed successfully
ls -la build/
```

### Step 2: Deploy to Production

Follow the deployment process outlined in `server/docs/pushAndPullLogic.md`:

```bash
# Push changes to repository
git add .
git commit -m "fix: Replace hardcoded API URLs with relative paths for SSL compatibility"
git push origin main

# On production server, pull frontend changes
cd /var/www/bankim/online/web
git pull origin main

# Rebuild frontend
cd mainapp
npm install
npm run build

# Restart services if needed
pm2 restart all
```

### Step 3: Verify Fix

1. **Test API calls work with relative paths:**
   ```bash
   # Should work for both domains now:
   curl https://dev2.bankimonline.com/api/v1/banks
   curl https://bankimonline.com/api/v1/banks
   ```

2. **Check browser console for errors:**
   - No SSL certificate errors
   - All API calls use same domain as frontend
   - No mixed content warnings

## 🔧 Technical Details

### Before Fix
```typescript
// ❌ Hardcoded URL causing SSL issues
return import.meta.env.VITE_NODE_API_BASE_URL || 'https://bankimonline.com/api'
```

### After Fix
```typescript
// ✅ Relative path using same domain
return import.meta.env.VITE_NODE_API_BASE_URL || '/api'
```

### How It Works

1. **Development**: Uses `/api` which Vite proxies to backend
2. **Production**: Uses `/api` which resolves to same domain as frontend
   - `dev2.bankimonline.com/api` → backend at same domain
   - `bankimonline.com/api` → backend at same domain
3. **Environment Override**: Still respects `VITE_NODE_API_BASE_URL` if set

## 🌐 Environment Variable (Optional)

If you need to point to a different API server, set:

```bash
# In production environment
VITE_NODE_API_BASE_URL=https://api.bankimonline.com
```

But for standard deployment, the relative path `/api` is the correct solution.

## ✅ Benefits of This Fix

1. **SSL Compatibility**: No more certificate mismatches
2. **Domain Flexibility**: Works with any domain (dev2, main, etc.)
3. **Security**: No mixed content issues
4. **Maintainability**: No hardcoded URLs to update
5. **Environment Agnostic**: Same code works everywhere

## 🔍 Files Already Correctly Configured

These files were already using relative paths correctly:
- `mainapp/src/services/bankOffersApi.ts`
- `mainapp/src/services/lawyerFormApi.ts`
- `mainapp/src/pages/Services/api/api.ts`
- `mainapp/src/pages/Services/pages/RefinanceCredit/api/refinanceCredit.ts`
- `mainapp/src/pages/Services/pages/RefinanceMortgage/api/refinanceMortgage.ts`
- `mainapp/src/utils/validationHelpers.ts`

## 🚀 Immediate Workaround

Until deployment completes, users can access the fully working version at:
- **Main Domain**: https://bankimonline.com/services/calculate-mortgage/4

## 📞 Post-Deployment Verification

1. Test both domains work correctly:
   - https://dev2.bankimonline.com/services/calculate-mortgage/4
   - https://bankimonline.com/services/calculate-mortgage/4

2. Verify no console errors in browser developer tools

3. Check that all API calls use same domain as the frontend

---

**Status**: ✅ Ready for deployment  
**Priority**: High - Fixes SSL certificate errors  
**Impact**: Resolves dev2 subdomain issues permanently
