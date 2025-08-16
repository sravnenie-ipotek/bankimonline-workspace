# 🚀 PRODUCTION DEPLOYMENT - CLEAR INSTRUCTIONS

**Date**: August 16, 2025  
**Purpose**: Deploy critical bug fixes to production  
**Risk**: LOW - Only bug fixes, no breaking changes

---

## 📦 REPOSITORY INFORMATION

### All GitHub Repositories
| Repository Name | URL | Purpose | Status |
|-----------------|-----|---------|--------|
| **bankimonline-workspace** | `git@github.com:sravnenie-ipotek/bankimonline-workspace.git` | Main repository (contains everything) | ✅ UPDATED |
| **bankimonline-api** | `git@github.com:sravnenie-ipotek/bankimonline-api.git` | API deployment (if used separately) | ⏳ May need sync |
| **bankimonline-web** | `git@github.com:sravnenie-ipotek/bankimonline-web.git` | Frontend deployment (if used separately) | ⏳ May need sync |
| **bankimonline-shared** | `git@github.com:sravnenie-ipotek/bankimonline-shared.git` | Documentation | ⏳ Optional |

### ⚠️ CRITICAL: What Production Actually Uses

**PRODUCTION USES**:
- ✅ `server/server-db.js` - Backend server (port 8003)
- ✅ `mainapp/` - Frontend application
- ✅ PM2 for process management

**PRODUCTION DOES NOT USE**:
- ❌ `packages/server/` - Monorepo server (IGNORE THIS)
- ❌ `packages/client/` - Monorepo client (IGNORE THIS)  
- ❌ `packages/shared/` - Monorepo shared (IGNORE THIS)

**WHY THE CONFUSION?**
- The `bankimonline-workspace` repository contains BOTH the old structure AND the monorepo
- The monorepo (`packages/` folder) was an attempt to modernize but was NEVER deployed
- Production still uses the LEGACY structure

---

## 📋 STEP-BY-STEP DEPLOYMENT

### Step 1: Connect to Production Server
```bash
# SSH into your production server
ssh [your-production-server]

# Navigate to application directory
cd /path/to/bankDev2_standalone
```

### Step 2: Backup Current Production
```bash
# Create backup with timestamp
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz .

# Backup PM2 configuration
pm2 save
pm2 dump > pm2-backup-$(date +%Y%m%d-%H%M%S).json
```

### Step 3: Setup Git Remotes (One-Time Setup)
```bash
# Check if remotes exist
git remote -v

# If 'workspace' remote doesn't exist, add it:
git remote add workspace git@github.com:sravnenie-ipotek/bankimonline-workspace.git

# Verify it was added
git remote -v
# Should show:
# workspace  git@github.com:sravnenie-ipotek/bankimonline-workspace.git (fetch)
# workspace  git@github.com:sravnenie-ipotek/bankimonline-workspace.git (push)
```

### Step 4: Pull Latest Code
```bash
# Pull from the workspace repository (this is the main one)
git pull workspace main

# If that doesn't work, try:
git fetch workspace
git merge workspace/main

# Or as last resort:
git pull git@github.com:sravnenie-ipotek/bankimonline-workspace.git main
```

### Step 5: Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd mainapp
npm install
cd ..
```

### Step 6: Build Frontend
```bash
# Build the frontend application
cd mainapp
npm run build

# Verify build succeeded
ls -la build/
# Should see index.html and assets folder
cd ..
```

### Step 7: Update PM2 Processes
```bash
# Stop current processes
pm2 stop all

# Start the backend server (IMPORTANT: Use server/server-db.js)
pm2 start server/server-db.js --name "bankim-api" 

# DO NOT start packages/server/src/server.js - that's the monorepo version!

# Verify it's running
pm2 status
# Should show 'bankim-api' as 'online'

# Check logs for errors
pm2 logs bankim-api --lines 50
```

### Step 8: Verify Everything Works
```bash
# Test API is responding
curl http://localhost:8003/api/v1/banks
# Should return JSON data

# Check for errors in logs
pm2 logs --lines 100 | grep -i error
# Should be empty or show old errors only

# Monitor processes
pm2 monit
# CPU and memory should be stable
```

---

## ✅ WHAT WAS FIXED

### Bug Fixes in This Update:
1. **Port 8004 errors** → Fixed to use port 8003
2. **dropdownData undefined** → All imports corrected
3. **Merge conflicts** → Resolved in package.json
4. **JSON syntax errors** → Fixed missing commas
5. **Build failures** → Frontend now builds successfully

### Files That Changed:
- `package.json` - Fixed JSON syntax
- `mainapp/src/pages/Services/pages/CalculateMortgage/pages/FirstStep/FirstStepForm/FirstStepForm.tsx` - Fixed merge conflicts
- Various import statements - Fixed dropdownData imports

---

## 🔴 IF SOMETHING GOES WRONG

### Rollback Procedure
```bash
# 1. Stop everything
pm2 stop all

# 2. Restore code from backup
cd /path/to
tar -xzf backup-[timestamp].tar.gz

# 3. Restore PM2 configuration
pm2 delete all
pm2 resurrect pm2-backup-[timestamp].json

# 4. Verify services are running
pm2 status
```

### Common Issues & Solutions

**Issue**: "Cannot find module" errors
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
cd mainapp && rm -rf node_modules package-lock.json && npm install
```

**Issue**: PM2 shows process as "errored"
```bash
# Check the logs
pm2 logs bankim-api --lines 100

# Common fix: JWT_SECRET not set
# Add to PM2 environment or use dump file with JWT_SECRET
```

**Issue**: Frontend not loading
```bash
# Rebuild frontend
cd mainapp
npm run build
# Check for build errors
```

---

## 📊 QUICK VERIFICATION CHECKLIST

After deployment, verify:

- [ ] `pm2 status` shows "online" for bankim-api
- [ ] `curl http://localhost:8003/api/v1/banks` returns data
- [ ] No errors in `pm2 logs --lines 50`
- [ ] Frontend build completed: `ls mainapp/build/index.html`
- [ ] Can login to the application
- [ ] Mortgage calculator works

---

## 🎯 SUMMARY FOR PRODUCTION TEAM

### What You Need to Know:
1. **Pull from**: `bankimonline-workspace` repository
2. **Use**: `server/server-db.js` for backend (NOT packages/server)
3. **Use**: `mainapp/` for frontend (NOT packages/client)
4. **Port**: 8003 (NOT 8004)
5. **Ignore**: Everything in `packages/` folder

### Key Commands:
```bash
# Pull latest
git pull workspace main

# Build frontend
cd mainapp && npm run build && cd ..

# Restart backend
pm2 restart bankim-api

# Or start fresh
pm2 stop all
pm2 start server/server-db.js --name bankim-api

# Check status
pm2 status
pm2 logs --lines 50
```

### Latest Commit Information:
- **Repository**: bankimonline-workspace
- **Branch**: main
- **Commit**: ac8eacf33
- **Date**: August 16, 2025
- **Changes**: Bug fixes only, no new features

---

## 📞 HELP & SUPPORT

If you encounter issues:

1. **First**: Check PM2 logs: `pm2 logs --lines 200`
2. **Second**: Verify correct files are being used (server/server-db.js, NOT packages/)
3. **Third**: Ensure PORT=8003 in environment
4. **Fourth**: Check database connectivity: `node mainapp/test-content-tables.js`

Remember: The `packages/` folder exists but should be COMPLETELY IGNORED in production!

---

**IMPORTANT REMINDER**: 
- ✅ USE: `server/server-db.js` and `mainapp/`
- ❌ DON'T USE: `packages/` anything
- The monorepo structure exists in the repository but is NOT active in production