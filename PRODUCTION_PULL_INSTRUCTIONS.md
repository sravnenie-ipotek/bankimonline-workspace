# 📥 PRODUCTION PULL INSTRUCTIONS - WHAT TO PULL FROM WHERE

**Date**: August 16, 2025  
**Critical**: Follow these EXACT instructions for production deployment

---

## 🎯 QUICK ANSWER: WHAT TO PULL

### For Production Server
```bash
# YOU DON'T PULL FROM WORKSPACE IN PRODUCTION!
# Production uses THREE SEPARATE repositories:

cd /var/www/bankim/online/web
git pull origin main

cd /var/www/bankim/online/api  
git pull origin main

cd /var/www/bankim/online/shared
git pull origin main
```

**THAT'S IT!** Production pulls from three separate repos, NOT from workspace.

---

## 📦 UNDERSTANDING THE REPOSITORY STRUCTURE

### What Each Repository Contains

| Repository | Production Path | Contains | GitHub URL |
|------------|----------------|----------|------------|
| **bankimonline-web** | `/var/www/bankim/online/web/` | Frontend (mainapp/) | `git@github.com:sravnenie-ipotek/bankimonline-web.git` |
| **bankimonline-api** | `/var/www/bankim/online/api/` | Backend (server/) | `git@github.com:sravnenie-ipotek/bankimonline-api.git` |
| **bankimonline-shared** | `/var/www/bankim/online/shared/` | Documentation | `git@github.com:sravnenie-ipotek/bankimonline-shared.git` |

### What About bankimonline-workspace?
- **Development Only**: Used for local development
- **NOT for Production**: Production doesn't pull from workspace
- **Contains Everything**: Has all code but production uses separate repos

---

## 🚀 STEP-BY-STEP PRODUCTION DEPLOYMENT

### Step 1: SSH to Production Server
```bash
ssh your-production-server
```

### Step 2: Navigate to Production Directory
```bash
cd /var/www/bankim/online/
ls -la
# You should see: web/ api/ shared/
```

### Step 3: Pull Frontend Updates
```bash
cd /var/www/bankim/online/web
git status                    # Check current state
git pull origin main          # Pull latest frontend
```

### Step 4: Pull Backend Updates
```bash
cd /var/www/bankim/online/api
git status                    # Check current state
git pull origin main          # Pull latest backend
```

### Step 5: Pull Documentation Updates (Optional)
```bash
cd /var/www/bankim/online/shared
git status                    # Check current state
git pull origin main          # Pull latest docs
```

### Step 6: Install Dependencies & Build
```bash
# Frontend dependencies and build
cd /var/www/bankim/online/web/mainapp
npm install                   # If package.json changed
npm run build                 # Build production frontend

# Backend dependencies
cd /var/www/bankim/online/api
npm install                   # If package.json changed
```

### Step 7: Restart Services with PM2
```bash
# Check current PM2 status
pm2 status

# Restart backend (runs on port 8004!)
pm2 restart bankim-api

# Or if you need to resurrect from dump
pm2 resurrect

# Check logs
pm2 logs --lines 50
```

---

## ⚠️ CRITICAL REMINDERS

### Port Configuration
- **Production Backend**: PORT 8004
- **Development Backend**: PORT 8003
- **Don't mix them up!**

### PM2 Configuration
- All config is in PM2 dump from Aug 14, 2025
- No .env files needed
- JWT_SECRET is in the dump
- Database URLs are in the dump

### Directory Structure
```
/var/www/bankim/online/
├── web/                      # Frontend repo (separate)
│   └── mainapp/             # React app here
├── api/                      # Backend repo (separate)
│   └── server/
│       └── server-db.js     # Runs on port 8004
└── shared/                   # Docs repo (separate)
```

---

## 🔍 VERIFICATION CHECKLIST

After pulling and deploying:

### 1. Check Git Status
```bash
cd /var/www/bankim/online/web && git status
cd /var/www/bankim/online/api && git status
cd /var/www/bankim/online/shared && git status
# All should show "Your branch is up to date"
```

### 2. Check PM2 Processes
```bash
pm2 status
# Should show bankim-api as "online"
```

### 3. Test API Endpoints
```bash
# Remember: PORT 8004 in production!
curl http://localhost:8004/api/v1/banks
curl http://localhost:8004/api/v1/params
```

### 4. Check Frontend Build
```bash
ls -la /var/www/bankim/online/web/mainapp/build/
# Should see index.html and assets/
```

### 5. Monitor Logs
```bash
pm2 logs --lines 100
# Look for any errors
```

---

## 🚫 WHAT NOT TO DO

### DON'T Pull from Workspace
```bash
# WRONG - Don't do this in production:
git pull workspace main  # ❌ NO!
```

### DON'T Use Monorepo Packages
```bash
# WRONG - These don't exist in production:
cd packages/server  # ❌ Doesn't exist!
cd packages/client  # ❌ Doesn't exist!
```

### DON'T Use Port 8003
```bash
# WRONG - Production uses 8004:
curl http://localhost:8003/api  # ❌ Wrong port!
```

---

## 📊 REPOSITORY MAPPING REFERENCE

### If Developer Says Update Was Made To:
| Developer Says | Pull From Repository | In Directory |
|----------------|---------------------|--------------|
| "mainapp/" | bankimonline-web | `/var/www/bankim/online/web/` |
| "server/server-db.js" | bankimonline-api | `/var/www/bankim/online/api/` |
| "server/migrations/" | bankimonline-api | `/var/www/bankim/online/api/` |
| "docs/" | bankimonline-shared | `/var/www/bankim/online/shared/` |
| "packages/" | IGNORE | Doesn't exist in production! |

---

## 🔄 QUICK COMMAND SUMMARY

```bash
# The ONLY commands you need for production deployment:

# 1. Pull updates
cd /var/www/bankim/online/web && git pull origin main
cd /var/www/bankim/online/api && git pull origin main
cd /var/www/bankim/online/shared && git pull origin main

# 2. Build frontend
cd /var/www/bankim/online/web/mainapp && npm run build

# 3. Restart backend
pm2 restart bankim-api

# 4. Check status
pm2 status
pm2 logs --lines 50
```

---

## 🆘 TROUBLESHOOTING

### "Repository not found"
```bash
# Check your remotes
git remote -v
# Should show origin pointing to correct repo
# If not, add it:
git remote add origin git@github.com:sravnenie-ipotek/bankimonline-[web|api|shared].git
```

### "Port 8003 connection refused"
```bash
# WRONG PORT! Production uses 8004
curl http://localhost:8004/api/v1/banks  # Correct!
```

### "Cannot find packages/ directory"
```bash
# It doesn't exist in production!
# Use these instead:
# /var/www/bankim/online/web/mainapp/  (frontend)
# /var/www/bankim/online/api/server/    (backend)
```

---

## 📝 SUMMARY

**Production uses THREE SEPARATE REPOSITORIES:**
1. **web** → Frontend at `/var/www/bankim/online/web/`
2. **api** → Backend at `/var/www/bankim/online/api/`
3. **shared** → Docs at `/var/www/bankim/online/shared/`

**Production does NOT use:**
- ❌ workspace repository directly
- ❌ packages/ directory
- ❌ monorepo structure
- ❌ port 8003 (uses 8004)

**Always pull from the three separate repos, not from workspace!**

---

**Last Updated**: August 16, 2025  
**Status**: ACCURATE - Based on actual production structure
