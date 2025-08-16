# 🚀 **PRODUCTION ARCHITECTURE: Push and Pull Logic Guide**

**⚠️ CRITICAL UPDATE: This document now reflects ACTUAL production architecture as of August 16, 2025**

---

## 🏗️ **ACTUAL PRODUCTION ARCHITECTURE**

**Architecture**: Three Separate Repositories in Three Separate Directories
- **NO MONOREPO IN PRODUCTION** - The `packages/` directory is NOT used
- **Three Independent Repos**: web, api, shared - each in its own directory
- **Backend Server**: `/api/server/server-db.js` (port 8004 in production, 8003 in dev)
- **Frontend Application**: `/web/mainapp/` (port 5173)
- **Database**: PostgreSQL (synced from Railway to local production)
- **Process Manager**: PM2 with dump/resurrect configuration

**Production Directory Structure**:
```
/var/www/bankim/online/
├── web/                        # Frontend repository (bankimonline-web)
│   ├── mainapp/               # React application
│   │   ├── src/              # Source code
│   │   ├── build/            # Production build
│   │   └── package.json      # Frontend dependencies
│   └── [other web files]
├── api/                        # Backend repository (bankimonline-api)
│   ├── server/
│   │   └── server-db.js      # Main backend server (port 8004)
│   ├── migrations/            # Database migrations
│   └── package.json          # Backend dependencies
└── shared/                     # Documentation repository (bankimonline-shared)
    └── docs/                  # Shared documentation
```

**Key Repositories**:
- **web**: `git@github.com:sravnenie-ipotek/bankimonline-web.git` (Frontend)
- **api**: `git@github.com:sravnenie-ipotek/bankimonline-api.git` (Backend)
- **shared**: `git@github.com:sravnenie-ipotek/bankimonline-shared.git` (Documentation)

**⚠️ IMPORTANT**: The `bankimonline-workspace` repository exists but is NOT used in production!

---

## 📁 **DEVELOPMENT vs PRODUCTION**

### Development Structure (Local)
```
bankDev2_standalone/            # Single repository for development
├── mainapp/                   # Frontend (same as production web/mainapp)
├── server/                    # Backend (same as production api/server)
│   └── server-db.js          # Port 8003 in development
├── packages/                  # IGNORE - Not used anywhere
└── package.json              # Root dependencies
```

### Production Structure
```
/var/www/bankim/online/
├── web/                       # Separate git repository
├── api/                       # Separate git repository
└── shared/                    # Separate git repository
```

---

## 🔄 **PUSHING CODE CHANGES**

### **Development Workflow**

#### Step 1: Work in Development Structure
```bash
# Work in your local development environment
cd ~/Projects/bankDev2_standalone/

# Backend development
vim server/server-db.js        # Edit backend code

# Frontend development
cd mainapp
vim src/components/...         # Edit frontend code
npm run build                  # Build frontend
cd ..

# Test everything locally
npm run dev                    # Start dev servers (port 8003)
```

#### Step 2: Prepare for Production Push
```bash
# Since production uses separate repos, we need to sync our changes

# Option A: Manual sync to separate repos (if you have them cloned)
# Copy backend changes to api repo
cp -r server/* ../bankimonline-api/server/

# Copy frontend changes to web repo
cp -r mainapp/* ../bankimonline-web/mainapp/

# Option B: Push to workspace first, then production pulls what it needs
git add .
git commit -m "feat: your changes"
git push origin main
```

#### Step 3: Production Deployment
```bash
# ON PRODUCTION SERVER:

# Pull backend changes
cd /var/www/bankim/online/api
git pull origin main

# Pull frontend changes
cd /var/www/bankim/online/web
git pull origin main

# Pull documentation if needed
cd /var/www/bankim/online/shared
git pull origin main

# Rebuild frontend
cd /var/www/bankim/online/web/mainapp
npm run build

# Restart backend with PM2
pm2 restart bankim-api
# Or resurrect from dump
pm2 resurrect
```

---

## ⬇️ **PULLING CODE CHANGES**

### **For Development**
```bash
# If you're starting fresh development
cd ~/Projects/
git clone git@github.com:sravnenie-ipotek/bankimonline-workspace.git bankDev2_standalone
cd bankDev2_standalone

# Install dependencies
npm install
cd mainapp && npm install && cd ..

# Start development
npm run dev
```

### **For Production**
```bash
# Production pulls from three separate repositories
cd /var/www/bankim/online/web
git pull origin main

cd /var/www/bankim/online/api
git pull origin main

cd /var/www/bankim/online/shared
git pull origin main

# Rebuild and restart
cd /var/www/bankim/online/web/mainapp
npm install
npm run build

cd /var/www/bankim/online/api
npm install

# Restart services
pm2 restart all
```

---

## 🛠️ **CRITICAL DIFFERENCES: DEV vs PROD**

| Aspect | Development | Production |
|--------|-------------|------------|
| **Structure** | Single repo (workspace) | Three separate repos |
| **Backend Port** | 8003 | 8004 |
| **Backend Path** | `server/server-db.js` | `api/server/server-db.js` |
| **Frontend Path** | `mainapp/` | `web/mainapp/` |
| **Process Manager** | `npm run dev` or PM2 | PM2 with dump/resurrect |
| **Database** | Railway (remote) | Local (synced from Railway) |
| **Monorepo** | Exists but unused | Doesn't exist |

---

## 🚨 **PM2 CONFIGURATION IN PRODUCTION**

### Production PM2 Setup
```bash
# Production uses PM2 dump from August 14, 2025
# This dump contains ALL environment variables

# View current PM2 processes
pm2 status

# The dump file contains:
# - All environment variables (DATABASE_URL, JWT_SECRET, etc.)
# - Process configurations
# - Memory limits and restart strategies

# To update environment variables:
# 1. Stop processes
pm2 stop all

# 2. Edit the dump file (carefully!)
vim ~/pm2-dump-YYYYMMDD.json

# 3. Resurrect with new config
pm2 resurrect ~/pm2-dump-YYYYMMDD.json

# 4. Save new state
pm2 save
```

---

## 🛡️ **SYNCHRONIZING DEVELOPMENT WITH PRODUCTION**

### Making Development Match Production

#### Option 1: Use Separate Repos Locally (Recommended)
```bash
# Clone all three repos locally
mkdir ~/Projects/bankim-separate
cd ~/Projects/bankim-separate

git clone git@github.com:sravnenie-ipotek/bankimonline-web.git web
git clone git@github.com:sravnenie-ipotek/bankimonline-api.git api
git clone git@github.com:sravnenie-ipotek/bankimonline-shared.git shared

# Work exactly like production
cd web/mainapp && npm install
cd ../../api && npm install

# Start servers (adjust port in api/server/server-db.js to 8004 if needed)
```

#### Option 2: Keep Single Repo but Understand Mapping
```bash
# Work in bankDev2_standalone but understand the mapping:
# mainapp/ → will go to web/mainapp/ in production
# server/ → will go to api/server/ in production
# docs/ → will go to shared/docs/ in production

# When ready to deploy, sync to appropriate repos
```

---

## 📋 **DEPLOYMENT CHECKLIST**

### Before Deployment
- [ ] Test locally with port 8003 (dev) 
- [ ] Build frontend: `cd mainapp && npm run build`
- [ ] Verify no errors in console
- [ ] Check database connectivity

### Production Deployment Steps
1. [ ] SSH to production server
2. [ ] Backup current state: `pm2 dump > backup-$(date +%Y%m%d).json`
3. [ ] Pull from THREE repos:
   - [ ] `cd /var/www/bankim/online/web && git pull origin main`
   - [ ] `cd /var/www/bankim/online/api && git pull origin main`
   - [ ] `cd /var/www/bankim/online/shared && git pull origin main`
4. [ ] Install dependencies if needed:
   - [ ] `cd web/mainapp && npm install`
   - [ ] `cd api && npm install`
5. [ ] Build frontend: `cd web/mainapp && npm run build`
6. [ ] Restart PM2: `pm2 restart all` or `pm2 resurrect`
7. [ ] Verify services: `pm2 status`
8. [ ] Check logs: `pm2 logs --lines 100`

### After Deployment
- [ ] Test API: `curl http://localhost:8004/api/v1/banks`
- [ ] Check frontend loads
- [ ] Monitor PM2: `pm2 monit`
- [ ] Watch for errors: `pm2 logs --lines 100 | grep -i error`

---

## 🔧 **TROUBLESHOOTING**

### Common Issues

#### Port Confusion
```bash
# Development uses port 8003
# Production uses port 8004

# If getting connection refused:
# Check which port the server is actually running on
lsof -i :8003
lsof -i :8004

# Edit server port if needed
vim api/server/server-db.js
# Look for: app.listen(PORT || 8004)
```

#### Repository Confusion
```bash
# Remember:
# - workspace repo = development convenience bundle
# - web repo = production frontend
# - api repo = production backend
# - shared repo = documentation

# Production does NOT use workspace repo directly!
```

#### PM2 Issues
```bash
# If PM2 won't start:
pm2 delete all
pm2 resurrect  # Uses the saved dump

# If environment variables are missing:
# They're ALL in the PM2 dump file!
pm2 info bankim-api  # Shows all env vars
```

---

## 📞 **CRITICAL POINTS TO REMEMBER**

1. **PRODUCTION USES THREE SEPARATE REPOSITORIES** - Not a monorepo!
2. **Backend runs on port 8004 in production** (8003 in development)
3. **PM2 dump contains all configuration** - No .env files in production
4. **The `packages/` directory should be ignored** - It's not used anywhere
5. **Development can use single workspace repo** - But understand the mapping

---

## 🔒 **SECURITY NOTES**

- **JWT_SECRET** is stored in PM2 dump (not in .env files)
- **Database credentials** are in PM2 dump (not in code)
- **Never commit sensitive data** to any repository
- **PM2 dump files** should be kept secure and backed up

---

**⚠️ THIS DOCUMENT REFLECTS ACTUAL PRODUCTION ARCHITECTURE**

**Last Updated**: August 16, 2025  
**Verified Against**: Production server structure  
**Status**: ACCURATE - Based on real production configuration  

**Previous versions of this document described an aspirational monorepo architecture that was never deployed. This version reflects reality.**