# 🛡️ BULLETPROOF DEVELOPMENT INSTRUCTIONS

**🎯 GOAL**: Fix translation fallback mechanism to work in both dev server and production builds

---

## **CURRENT PROBLEM IDENTIFIED** 🔍

The translation system works in `npm run dev` (Vite dev server) but fails in production static builds, showing raw keys like `"app.refinance.step1.title"` instead of translated text.

**ROOT CAUSE**: Different behavior between Vite's dev proxy and static build environments.

---

## **IMMEDIATE FIXES REQUIRED** ⚡

### **1. ADD PREVIEW SCRIPT TO PACKAGE.JSON**

```bash
# Add this line to mainapp/package.json scripts section:
"preview": "vite preview --port 5173 --host"
```

This ensures consistent port usage (5173) across dev and preview modes.

### **2. UPDATE VITE.CONFIG.TS FOR PREVIEW MODE**

```typescript
// Update mainapp/vite.config.ts - add this to the config:
export default defineConfig({
  // ... existing config
  preview: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:8003',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // ... rest of config
})
```

### **3. CREATE ENVIRONMENT CONSISTENCY**

**Create `.env.development`:**
```bash
# mainapp/.env.development
VITE_NODE_API_BASE_URL=/api
VITE_API_TARGET=http://localhost:8003
```

**Create `.env.production`:**
```bash
# mainapp/.env.production  
VITE_NODE_API_BASE_URL=/api
```

---

## **CORRECTED DEVELOPMENT WORKFLOW** 🔄

### **Daily Development (keep using Vite dev server):**

```bash
# ✅ DAILY DEVELOPMENT - Keep using this for fast development
npm run dev
# Fast HMR, instant updates, great for coding
```

### **Pre-Deployment Testing (add this step):**

```bash
# ✅ BEFORE DEPLOYMENT - Test with production-like build
npm run build && npm run preview
# This catches dev/production differences
```

### **Pre-Deployment Testing Protocol:**

```bash
# 1. After finishing development with "npm run dev"
cd mainapp

# 2. Clean build artifacts
rm -rf build dist .vite node_modules/.cache

# 3. Build for production testing
npm run build

# 4. Test with production-like server
npm run preview

# 5. Open http://localhost:5173 
# 6. Test refinance page - should show Hebrew text, not "app.refinance.step1.title"
# 7. Test all dropdowns - should populate with data
# 8. If everything works, deploy. If not, fix and repeat.
```

---

## **DEBUGGING PROTOCOL** 🐛

### **When testing locally:**

1. **Check API server is running:**
   ```bash
   curl http://localhost:8003/api/v1/calculation-parameters?business_path=mortgage
   ```

2. **Check content API:**
   ```bash
   curl http://localhost:8003/api/content/refinance_step1/he
   ```

3. **Browser DevTools Network Tab:**
   - All API calls should go to `/api/*` (relative paths)
   - No hardcoded localhost URLs
   - No 404 errors on translations

4. **Console should show:**
   ```
   ✅ Content API loaded for refinance_step1
   ✅ Using database calculation parameters for mortgage
   ```

### **RED FLAGS (fix immediately):**

- Raw translation keys visible: `app.refinance.step1.title`
- Empty dropdowns despite API working
- Console errors: `Failed to load content for...`
- API calls to hardcoded URLs instead of `/api`

---

## **MANDATORY VERIFICATION CHECKLIST** ✅

**Before any deployment, verify:**

- [ ] **Backend running**: `lsof -i :8003` shows node process
- [ ] **Preview works**: `npm run build && npm run preview` → http://localhost:5173
- [ ] **Translations work**: All pages show Hebrew/English text, no raw keys
- [ ] **Dropdowns populated**: All forms have working dropdowns with data
- [ ] **API endpoints correct**: Network tab shows `/api/*` calls, not hardcoded URLs
- [ ] **No console errors**: No translation loading failures or API errors

---

## **CRITICAL RULES** 🚨

### **NEVER DO:**
- ❌ Deploy without testing `npm run preview` first
- ❌ Skip production build testing before deployment  
- ❌ Ignore raw translation keys in UI
- ❌ Skip API connectivity verification

### **ALWAYS DO:**
- ✅ Use `npm run dev` for daily development (fast HMR)
- ✅ Test with `npm run build && npm run preview` before deployment
- ✅ Verify all dropdowns work in both dev and preview
- ✅ Check console for translation errors
- ✅ Ensure API calls use relative paths (`/api`)

---

## **DEPLOYMENT VALIDATION** 🚀

### **After deployment to SSH server:**

1. **Test critical endpoints:**
   ```bash
   curl -H "Accept: application/json" "https://dev2.bankimonline.com/api/content/refinance_step1/he"
   curl -H "Accept: application/json" "https://dev2.bankimonline.com/api/v1/calculation-parameters?business_path=mortgage"
   ```

2. **Visual verification:**
   - Visit https://dev2.bankimonline.com/services/calculate-mortgage/refinance
   - Should see Hebrew text, not `"app.refinance.step1.title"`
   - All dropdowns should populate with options

3. **If issues persist on SSH:**
   - Check nginx configuration
   - Verify API proxy setup
   - Compare SSH environment to local

---

## **SUCCESS CRITERIA** 🎯

✅ **Development workflow**: `npm run dev` for coding + `npm run preview` before deployment  
✅ **Translation display**: All text shows in Hebrew/English, no raw keys  
✅ **Dropdown functionality**: All forms have populated dropdowns  
✅ **API consistency**: Same behavior between dev preview and production  
✅ **Zero surprises**: What you test locally matches production exactly  

---

**🔒 GOLDEN RULE**: Never deploy anything that doesn't work in `npm run preview` mode!