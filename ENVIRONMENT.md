# Environment Configuration Guide

## Required Environment Variables

### CONTENT_DATABASE_URL ⚠️ **CRITICAL**

**Purpose:** Controls which database the server uses for dropdown content.

**Problem:** Wrong database = zero dropdown options = broken forms

**Solution:**
```bash
# Create .env file with correct database
echo 'CONTENT_DATABASE_URL=postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway' > .env

# Restart server to pick up changes
npm run kill-ports
npm start
```

### Validation Commands

```bash
# 1. Verify database connectivity and content
npm run verify:database
# Should show: mortgage_step3: 109 items ✅

# 2. Test dropdown API endpoints  
npm run test:dropdowns
# Should show: All critical dropdown endpoints working correctly ✅

# 3. Test frontend forms
npm run smoke:forms  
# Should show: All critical forms are loading correctly ✅
```

## Environment Setup Checklist

**Before developing:**
- [ ] `.env` file exists with `CONTENT_DATABASE_URL`
- [ ] `npm run verify:database` passes
- [ ] `npm run test:dropdowns` passes  
- [ ] Server shows correct database in startup logs

**Debugging dropdown issues:**
1. **Always check database connectivity first** (`npm run verify:database`)
2. **Then check API endpoints** (`npm run test:dropdowns`) 
3. **Finally check frontend** (`npm run smoke:forms`)

## Common Issues

**❌ "CONTENT_DATABASE_URL not set"**
```bash
echo 'CONTENT_DATABASE_URL=postgresql://...' > .env
```

**❌ "Only 0 items (expected ≥50)"**  
```bash
# Wrong database URL - check .env file
# Server connecting to localhost instead of Railway
```

**❌ "Server not running on port 8003"**
```bash
npm start  # Start server first
```

## Railway Database URLs

- **Content DB (correct)**: `shortline.proxy.rlwy.net:33452` - Has mortgage content ✅
- **Legacy DB (wrong)**: `yamanote.proxy.rlwy.net:53119` - Missing content ❌  
- **Main DB**: `maglev.proxy.rlwy.net:43809` - Authentication only

Use **shortline** for content, **maglev** for auth.