# 🎯 REAL PRODUCTION ARCHITECTURE - THE TRUTH

**Date**: August 16, 2025  
**Critical Discovery**: The monorepo architecture described in many docs DOES NOT EXIST in production

---

## ⚠️ THE BIG REVELATION

After careful investigation, we discovered that:
1. **Production uses THREE SEPARATE REPOSITORIES** in three separate directories
2. **The monorepo (`packages/`) is NOT deployed** and NOT used
3. **The workspace repository is for development convenience only**
4. **Many documentation files describe an aspirational architecture that was never implemented**

---

## 🏗️ ACTUAL PRODUCTION STRUCTURE

```
/var/www/bankim/online/
├── web/                    # git@github.com:sravnenie-ipotek/bankimonline-web.git
│   ├── mainapp/           # React frontend application
│   │   ├── src/          # Source code
│   │   ├── build/        # Production build
│   │   └── package.json  # Frontend dependencies
│   └── [other files]
│
├── api/                    # git@github.com:sravnenie-ipotek/bankimonline-api.git
│   ├── server/
│   │   └── server-db.js  # Backend server (PORT 8004!)
│   ├── migrations/        # Database migrations
│   └── package.json      # Backend dependencies
│
└── shared/                 # git@github.com:sravnenie-ipotek/bankimonline-shared.git
    └── docs/             # Shared documentation
```

---

## 🔍 KEY DIFFERENCES: REALITY vs DOCUMENTATION

| What Docs Said | What's Actually True |
|----------------|---------------------|
| Monorepo with packages/ | NO monorepo in production |
| packages/server is production | server/server-db.js is production |
| packages/client is frontend | mainapp/ is frontend |
| Single workspace repository | Three separate repositories |
| Backend on port 8003 | Backend on port 8004 in prod |
| Hybrid architecture | Simple three-repo structure |

---

## 📦 REPOSITORY MAPPING

### Development Structure (bankDev2_standalone)
```
bankDev2_standalone/          # Development workspace repository
├── mainapp/                 # → Maps to web/mainapp/ in production
├── server/                  # → Maps to api/server/ in production
├── docs/                    # → Maps to shared/docs/ in production
└── packages/                # ❌ IGNORED - Not used anywhere!
```

### Production Repositories
1. **Frontend**: `bankimonline-web` → `/var/www/bankim/online/web/`
2. **Backend**: `bankimonline-api` → `/var/www/bankim/online/api/`
3. **Docs**: `bankimonline-shared` → `/var/www/bankim/online/shared/`

---

## 🚀 HOW TO DEPLOY TO PRODUCTION

### Step 1: Understand What Goes Where
```bash
# Your local changes in:
mainapp/           # → Need to push to bankimonline-web
server/            # → Need to push to bankimonline-api
docs/              # → Need to push to bankimonline-shared
packages/          # → IGNORE - Not used!
```

### Step 2: Production Pull Commands
```bash
# ON PRODUCTION SERVER:

# Pull frontend updates
cd /var/www/bankim/online/web
git pull origin main

# Pull backend updates
cd /var/www/bankim/online/api
git pull origin main

# Pull documentation updates
cd /var/www/bankim/online/shared
git pull origin main
```

### Step 3: Build and Restart
```bash
# Build frontend
cd /var/www/bankim/online/web/mainapp
npm install
npm run build

# Install backend dependencies
cd /var/www/bankim/online/api
npm install

# Restart with PM2
pm2 restart bankim-api
# Or resurrect from dump
pm2 resurrect
```

---

## ⚙️ PM2 CONFIGURATION REALITY

### PM2 Dump Contains Everything
The PM2 dump from **August 14, 2025** is the single source of truth:
- Contains ALL environment variables
- No .env files in production
- JWT_SECRET is in the dump
- Database URLs are in the dump
- Port configuration (8004) is in the dump

### To Update Environment Variables
```bash
# 1. Dump current config
pm2 dump > backup-$(date +%Y%m%d).json

# 2. Stop processes
pm2 stop all

# 3. Edit the dump file
vim ~/pm2-dump-20250814.json

# 4. Resurrect with new config
pm2 resurrect ~/pm2-dump-20250814.json

# 5. Save new state
pm2 save
```

---

## 🔴 CRITICAL WARNINGS

### 1. Port Confusion
- **Development**: Port 8003
- **Production**: Port 8004
- Don't mix them up!

### 2. Repository Confusion
- **workspace repo**: Development bundle (contains everything)
- **web/api/shared repos**: Production repos (separate)
- Production does NOT pull from workspace!

### 3. Monorepo Confusion
- **packages/ directory**: EXISTS but NOT USED
- **Don't deploy packages/**: It's an abandoned migration attempt
- **Use mainapp/ and server/**: These are the real code

### 4. Documentation Confusion
- Many docs describe aspirational architecture
- This document describes REALITY
- Trust PM2 dump and production server structure

---

## 📋 QUICK REFERENCE

### Development Commands
```bash
# Start development (port 8003)
npm run dev

# Build frontend
cd mainapp && npm run build

# Test locally
curl http://localhost:8003/api/v1/banks
```

### Production Commands
```bash
# Pull updates (THREE repos!)
cd /var/www/bankim/online/web && git pull origin main
cd /var/www/bankim/online/api && git pull origin main
cd /var/www/bankim/online/shared && git pull origin main

# Build and restart
cd web/mainapp && npm run build
pm2 restart bankim-api

# Check status
pm2 status
pm2 logs --lines 100
```

### Port Check
```bash
# Development
curl http://localhost:8003/api/v1/banks

# Production
curl http://localhost:8004/api/v1/banks
```

---

## 🎯 SUMMARY

**THE TRUTH**:
1. Production uses **THREE SEPARATE REPOSITORIES**
2. Backend runs on **PORT 8004** in production
3. **NO MONOREPO** in production
4. **PM2 dump** contains all configuration
5. **packages/** directory should be **IGNORED**

**FORGET ABOUT**:
- Hybrid architecture
- Monorepo workspace in production
- packages/server and packages/client
- Port 8003 in production
- .env files in production

---

**This document reflects the ACTUAL production architecture as discovered on August 16, 2025.**  
**Previous documentation was aspirational and did not match reality.**