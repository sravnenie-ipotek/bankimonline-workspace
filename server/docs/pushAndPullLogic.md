# 🚀 **HYBRID ARCHITECTURE: Push and Pull Logic Guide for Developers**

**⚠️ UPDATED: Complete architecture documentation based on ACTUAL current hybrid monorepo + packages structure.**

---

## 🏗️ **ACTUAL CURRENT HYBRID ARCHITECTURE**

**Architecture**: Hybrid Monorepo with Modern Packages Structure + Legacy Support
- **Primary Monorepo**: `bankimonline-workspace` (workspace remote)
- **Modern Server**: `packages/server/src/server.js` (port 8003) ✅ **PRODUCTION**
- **Legacy Server**: `server/server-db.js` (port 8003) 📋 **BACKUP/COMPATIBILITY**
- **Frontend Application**: `packages/client/` (mainapp symlink) + `mainapp/` (port 5173)
- **Database**: Railway PostgreSQL dual-database (maglev + shortline)
- **Deployment**: Railway using Docker container
- **Git Workflow**: Multi-remote pushing to specialized repositories

**🔄 CRITICAL SYNC RULE**: **Packages structure is LEADING - Always sync changes FROM packages TO legacy**

**Key Repositories**:
- **workspace**: `sravnenie-ipotek/bankimonline-workspace` (main monorepo)
- **web**: `sravnenie-ipotek/bankimonline-web` (frontend deployment)
- **api**: `sravnenie-ipotek/bankimonline-api` (backend deployment)
- **shared**: `sravnenie-ipotek/bankimonline-shared` (documentation)

---

## 📁 **HYBRID PROJECT STRUCTURE**

```
bankDev2_standalone/
├── packages/                    # 🚀 MODERN STRUCTURE (LEADING)
│   ├── client/                 # Modern React frontend (workspace package)
│   ├── server/                 # 🎯 PRODUCTION SERVER (packages/server/src/server.js)
│   │   ├── src/server.js      # ✅ ACTIVE production server (port 8003)
│   │   ├── config/            # Modular database configuration
│   │   └── package.json       # @bankimonline/server workspace package
│   └── shared/                # Shared types and utilities
├── mainapp/                    # 📋 LEGACY FRONTEND (synced with packages/client)
│   ├── src/                   # React application source
│   ├── package.json           # Frontend dependencies
│   └── vite.config.ts         # Vite configuration
├── server/                     # 📋 LEGACY BACKEND (synced with packages/server)
│   ├── server-db.js           # 📋 BACKUP server (must stay in sync)
│   └── start-dev.js           # Development launcher
├── package.json               # Root monorepo dependencies and scripts
└── Dockerfile                 # Railway deployment configuration
```

**🔄 SYNC HIERARCHY**:
1. **Source of Truth**: `packages/server/src/server.js` (modern production server)
2. **Sync Target**: `server/server-db.js` (legacy backup server)
3. **Rule**: ALL changes must be applied to packages first, then synced to legacy

---

## 🔄 **PUSHING CODE CHANGES**

### **🔄 HYBRID SYNC COMMANDS (PACKAGES IS LEADING)**

```bash
# 🚀 MODERN DEVELOPMENT (RECOMMENDED)
npm run server:dev          # Start packages/server (modern production server)
npm run client:dev          # Start packages/client (modern frontend)
npm run dev:all             # Start both modern server + client

# 🔄 MANDATORY SYNC WORKFLOW (PACKAGES → LEGACY)
# STEP 1: Always make changes to packages/ first
# STEP 2: Sync changes to legacy structure
./sync-packages-to-legacy.sh    # Sync server changes
./sync-client-to-mainapp.sh     # Sync client changes

# 📋 LEGACY COMPATIBILITY (shows RED WARNING)
npm run dev                 # Uses server/server-db.js (legacy server - RED ALERT)
npm start                   # Uses server/server-db.js (legacy server - RED ALERT)
```

### **Quick Reference - Push Commands**

```bash
# Multi-repository push (RECOMMENDED for deployment)
./push-to-all-repos.sh "Your commit message"
npm run push:all "Your commit message"

# Individual repository pushes
git push workspace main     # Main monorepo repository
git push web main          # Web deployment repository
git push api main          # API deployment repository
git push shared main       # Shared documentation

# Modern workspace commands (packages-based)
npm run push-client        # Uses tools/dual-push.js
npm run push-server        # Uses tools/dual-push.js
npm run push-all           # Uses tools/dual-push.js
```

### **Step-by-Step Push Workflow**

#### **1. Complete Your Development Work (MODERN PACKAGES-FIRST APPROACH)**
```bash
# Navigate to project root
cd bankDev2_standalone/

# 🚀 MODERN DEVELOPMENT WORKFLOW
# Work in packages/ structure (SOURCE OF TRUTH)
cd packages/server && npm run dev       # Modern server development
cd packages/client && npm run dev       # Modern client development

# Test the modern packages structure
npm test                                 # Run Playwright tests
npm run client:test                     # Run frontend tests via workspace

# Build frontend to verify compilation
npm run client:build                    # Build modern client via workspace

# 🔄 SYNC TO LEGACY (MANDATORY BEFORE PUSH)
./sync-packages-to-legacy.sh            # Sync server changes
./sync-client-to-mainapp.sh             # Sync client changes

# 📋 VERIFY LEGACY COMPATIBILITY
node server/server-db.js                # Verify legacy server starts (with synced changes)
cd mainapp && npm run build             # Verify legacy frontend builds
```

#### **2. Stage and Commit Your Changes (INCLUDE BOTH PACKAGES + LEGACY)**
```bash
# Check what files have changed (should include both packages/ and legacy/)
git status

# Add BOTH packages (source of truth) AND legacy (synced) files
git add packages/server/src/server.js           # Modern server (source)
git add server/server-db.js                     # Legacy server (synced)
git add packages/client/src/components/         # Modern client (source)
git add mainapp/src/components/                 # Legacy client (synced)

# Include workspace and sync files
git add package.json                            # Root workspace config
git add packages/server/package.json           # Modern server package
git add packages/client/package.json           # Modern client package

# Commit with clear conventional commit message
git commit -m "feat: add new mortgage calculator feature

- Implement modern calculator in packages/server
- Sync changes to legacy server/server-db.js  
- Update both packages/client and mainapp/
- Maintain backward compatibility"

git commit -m "fix: resolve authentication issue in login flow

- Fix applied to packages/server/src/server.js (source)
- Synced to server/server-db.js (legacy backup)
- Both servers now include JWT_SECRET and role field fix"
```

#### **3. Choose Your Push Strategy**

**Option A: Multi-Repository Push (RECOMMENDED for production)**
```bash
# Push to all repositories with automated commit and push
./push-to-all-repos.sh "feat: add new mortgage calculator feature"

# Alternative using npm script
npm run push:all "feat: add new mortgage calculator feature"
```

**Option B: Individual Repository Push**
```bash
# Push only to specific repositories
git push workspace main    # Main monorepo only
```

**Option C: Specific Repository Deployment**
```bash
# Deploy only to specific repositories
git push web main          # Frontend deployment
git push api main          # Backend deployment
git push shared main       # Documentation deployment
```

#### **4. Verify Push Success**

The push scripts will show detailed results:
```bash
🚀 Pushing to all BankIM repositories...
📝 Commit message: feat: add new feature

✅ Successfully pushed to workspace repository
✅ Successfully pushed to web repository  
✅ Successfully pushed to API repository
✅ Successfully pushed to shared documents repository

🎉 Push operation completed\!
```

---

## ⬇️ **PULLING CODE CHANGES**

### **Quick Reference - Pull Commands**

```bash
# Pull from all repositories at once (RECOMMENDED)
./pull-from-all-repos.sh
npm run pull:all

# Pull from individual repositories
git pull workspace main    # Main monorepo (most important)
git pull web main          # Web deployment repository
git pull api main          # API deployment repository  
git pull shared main       # Shared documentation

# Using npm scripts for individual pulls
npm run pull:workspace     # Pull from workspace only
npm run pull:web          # Pull from web repository
npm run pull:api          # Pull from API repository
npm run pull:shared       # Pull from shared repository

# Fresh environment setup (after major changes)
npm install
npm install --prefix mainapp
npm run build:all

# Start development environment
npm run dev                # Starts both backend and file server
```

### **Step-by-Step Pull Workflow**

#### **1. Pull Latest Changes**
```bash
# Navigate to project root
cd bankDev2_standalone/

# Pull latest changes from main monorepo
git pull workspace main

# If you have local changes, use rebase
git pull --rebase workspace main
```

#### **2. Update Dependencies and Build**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd mainapp && npm install && cd ..

# Build shared package if it exists and was updated
npm run shared:build

# Start development servers to verify everything works
npm run dev
```

#### **3. Handle Merge Conflicts** (if any)
```bash
# See which files have conflicts
git status

# Open conflicted files and resolve
# Look for <<<<<<< HEAD and >>>>>>> markers
# Edit files to resolve conflicts

# Stage resolved files
git add resolved-file.ts
git add mainapp/src/resolved-component.tsx

# Complete merge
git commit
```

---

## 🛠️ **DEVELOPMENT WORKFLOWS**

### **🔄 MODERN HYBRID DEVELOPMENT WORKFLOW**

#### **Start of Development Session (MODERN APPROACH)**
```bash
# Pull latest changes
git pull workspace main

# Install dependencies for monorepo workspace
npm install                                   # Root workspace dependencies
npm run install:all                          # All workspace packages

# 🚀 START MODERN DEVELOPMENT ENVIRONMENT
npm run dev:all                              # Modern: packages/server + packages/client
# Alternative: Individual services
npm run server:dev                           # Modern server only
npm run client:dev                           # Modern client only
```

#### **During Development (PACKAGES-FIRST DEVELOPMENT)**
```bash
# 🚀 MODERN DEVELOPMENT (PRIMARY)
cd packages/server                           # Modern server development
npm run dev                                  # Auto-reload server on changes

cd packages/client                           # Modern frontend development  
npm run dev                                  # Vite dev server on port 5173

# Test your changes in modern environment
npm test                                     # Run Playwright tests
npm run client:test                          # Run frontend tests via workspace

# 🔄 SYNC TO LEGACY (PERIODIC - NOT EVERY CHANGE)
./sync-packages-to-legacy.sh                # Sync server changes when needed
./sync-client-to-mainapp.sh                 # Sync client changes when needed

# 📋 LEGACY COMPATIBILITY TESTING (BEFORE PUSH)
npm run dev                                  # Test legacy server compatibility
cd mainapp && npm run test                   # Test legacy frontend
```

#### **End of Development Session (SYNC & COMMIT)**
```bash
# 🔄 MANDATORY SYNC BEFORE COMMIT
./sync-packages-to-legacy.sh                # Ensure legacy is in sync
./sync-client-to-mainapp.sh                 # Ensure mainapp is in sync

# Commit changes (BOTH packages and legacy)
git add packages/ server/ mainapp/          # Add both modern and legacy
git commit -m "feat: implement new feature

- Primary implementation in packages/server|client
- Synced to legacy server/server-db.js and mainapp/
- Maintains backward compatibility"

# Deploy to all repositories
./push-to-all-repos.sh "feat: implement new feature"

# Or push to specific repository only
git push workspace main
```

### **Feature Branch Workflow**

#### **Creating a Feature Branch**
```bash
# Create and switch to feature branch
git checkout -b feature/new-calculator

# Work on your feature in actual application structure
# Edit files in mainapp/ and server/

# Push feature branch for collaboration
git push workspace feature/new-calculator
```

#### **Merging Feature Branch**
```bash
# Switch to main branch
git checkout main

# Pull latest changes
git pull workspace main

# Merge feature branch
git merge feature/new-calculator

# Deploy to all repositories
./push-to-all-repos.sh "feat: complete new calculator feature"

# Clean up
git branch -d feature/new-calculator
git push workspace --delete feature/new-calculator
```

---

## 🛡️ **DATABASE SAFETY PROCEDURES**

### **Database Architecture (Railway)**
```bash
# Two-database architecture - DO NOT MODIFY CONNECTIONS WITHOUT BACKUP

# Content Database (shortline) - CMS content (1,342+ items)
CONTENT_DATABASE_URL=postgresql://postgres:[REDACTED]@shortline.proxy.rlwy.net:33452/railway

# Main Database (maglev) - User data (226+ production users)
DATABASE_URL=postgresql://postgres:[REDACTED]@maglev.proxy.rlwy.net:43809/railway
```

### **Database Safety Checklist**
```bash
# BEFORE making database changes:
- [ ] Backup production data
- [ ] Test on development database first
- [ ] Verify migration scripts
- [ ] Have rollback plan ready
- [ ] Notify team of database maintenance

# Test database connectivity
node mainapp/test-content-tables.js
node mainapp/test-all-dropdown-apis.js
```

---

## 🚨 **EMERGENCY PROCEDURES**

### **Immediate Production Rollback**
```bash
# 1. Identify problematic commit
git log --oneline -10

# 2. Revert the commit (replace abc123 with actual hash)
git revert abc123

# 3. Deploy rollback to all repositories IMMEDIATELY
./push-to-all-repos.sh "fix: emergency rollback of problematic commit abc123"

# 4. Verify Railway deployment is restored
# Check Railway dashboard: https://railway.app/
```

### **Database Recovery Procedures**
```bash
# If database connection is lost:

# 1. Check Railway service status
# Visit Railway dashboard and check database status

# 2. Test connectivity
node mainapp/test-content-tables.js

# 3. If database is corrupted, restore from backup
# Contact Railway support if needed

# 4. Restart Railway deployment
# Use Railway dashboard to restart the service
```

### **Server Recovery**
```bash
# If server fails to start:

# 1. Check for port conflicts
lsof -i :8003
lsof -i :5173

# 2. Kill conflicting processes
./kill-ports.sh

# 3. Restart development environment
npm run dev

# 4. Check server logs for errors
tail -f server.log
```

---

## 🧪 **TESTING AND VALIDATION**

### **Testing Commands (Validated)**
```bash
# Backend testing (Playwright)
npm test              # Run all tests
npm run test:headed   # Run with browser visible
npm run test:ui       # Interactive UI mode

# Frontend testing (Cypress)  
cd mainapp
npm run cypress       # Open Cypress test runner
npm run test:e2e      # Run E2E tests

# Translation testing
cd mainapp
npm run test:translations
npm run test:translations:screenshots
```

### **Pre-Deployment Validation (HYBRID ARCHITECTURE)**
```bash
# 🔄 MANDATORY SYNC VALIDATION
- [ ] Changes applied to packages/ first (source of truth)
- [ ] Legacy synced: ./sync-packages-to-legacy.sh completed
- [ ] Legacy synced: ./sync-client-to-mainapp.sh completed

# 🚀 MODERN PACKAGES VALIDATION
- [ ] Modern tests pass: `npm run client:test && npm test`
- [ ] Modern builds: `npm run client:build`  
- [ ] Modern server starts: `npm run server:dev`

# 📋 LEGACY COMPATIBILITY VALIDATION
- [ ] Legacy frontend builds: `cd mainapp && npm run build`
- [ ] Legacy server starts: `node server/server-db.js`
- [ ] Legacy tests pass: `cd mainapp && npm run test`

# 🌐 CROSS-SYSTEM VALIDATION
- [ ] Database connects: `node mainapp/test-content-tables.js`
- [ ] No console errors in browser (both modern & legacy)
- [ ] API endpoints respond correctly (both servers)
- [ ] JWT_SECRET configured in both .env files
- [ ] Both servers have synchronized authentication fixes
```

---

## 📊 **MONITORING AND DEPLOYMENT STATUS**

### **Railway Deployment Monitoring**
```bash
# Check deployment status
# Railway Dashboard: https://railway.app/project/your-project-id

# View deployment logs
railway logs

# Monitor database status
# Check Railway database dashboard for connection metrics
```

### **Application Health Checks**
```bash
# Test API connectivity
curl http://localhost:8003/api/v1/banks
curl http://localhost:8003/api/v1/params

# Test frontend
curl http://localhost:5173

# Database connectivity
node mainapp/test-content-tables.js
```

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues and Solutions**

#### **Port Conflicts**
```bash
# Error: EADDRINUSE: address already in use :::8003

# Solution: Kill processes using the ports
./kill-ports.sh
npm run kill-ports:all

# Or manually
lsof -i :8003 && kill -9 <PID>
lsof -i :5173 && kill -9 <PID>
```

#### **Database Connection Errors**
```bash
# Error: connect ECONNREFUSED or timeout

# 1. Verify environment variables
cat .env | grep DATABASE_URL

# 2. Test Railway database connectivity
node mainapp/test-content-tables.js

# 3. Check Railway service status in dashboard
```

#### **Frontend Build Failures**
```bash
# Error: Build fails with TypeScript or dependency errors

# Solution: Clean rebuild
cd mainapp
rm -rf node_modules build .vite
npm install
npm run build
```

#### **Git Push Failures**
```bash
# Error: remote rejected or authentication failed

# 1. Check git remote configuration  
git remote -v

# 2. Verify SSH keys or credentials
ssh -T git@github.com

# 3. Pull latest changes first
git pull workspace main

# 4. Try push again
./push-to-all-repos.sh "your commit message"
```

### **Cache Issues**
```bash
# Browser shows old version after deployment

# Clear development caches
cd mainapp
rm -rf .vite dist node_modules/.cache

# Force browser hard refresh
# Ctrl+F5 or Cmd+Shift+R

# Test in incognito/private mode
```

---

## 📋 **CHECKLISTS**

### **Before Every Deployment Checklist**
- [ ] Latest changes pulled: `git pull workspace main`
- [ ] Dependencies updated: `npm install && cd mainapp && npm install`
- [ ] All tests pass: `npm test && cd mainapp && npm run test`
- [ ] Frontend builds successfully: `cd mainapp && npm run build`
- [ ] Server starts without errors: `node server/server-db.js`
- [ ] Database connectivity verified: `node mainapp/test-content-tables.js`
- [ ] API endpoints respond: `curl http://localhost:8003/api/v1/banks`
- [ ] No sensitive data committed (API keys, passwords)
- [ ] Commit message follows conventional format
- [ ] Team notified if breaking changes

### **After Deployment Checklist**  
- [ ] Railway deployment succeeded (check dashboard)
- [ ] Application loads without errors
- [ ] Database connections stable
- [ ] API responses correct
- [ ] Frontend functionality intact
- [ ] No console errors in browser
- [ ] Translation loading works
- [ ] File upload functionality tested (if changed)

### **Weekly Maintenance Checklist**
- [ ] Security audit: `npm audit`
- [ ] Dependency updates: `npm update`
- [ ] Database backup verification
- [ ] Railway service health check
- [ ] Performance monitoring review
- [ ] Error log analysis
- [ ] Team sync on upcoming changes

---

## ⚡ **PERFORMANCE OPTIMIZATION**

### **Development Performance**
```bash
# Optimize development environment
export NODE_OPTIONS="--max-old-space-size=8192"

# Use faster package manager if needed
# Consider pnpm or yarn for faster installs

# Optimize Vite dev server
# Check mainapp/vite.config.ts for optimization settings
```

### **Build Optimization**  
```bash
# Production build optimization
cd mainapp
npm run build

# Analyze bundle size
npm run build -- --analyze

# Check build output in mainapp/build/
du -sh mainapp/build/
```

---

## 📞 **GETTING HELP**

### **Quick Debug Commands**
```bash
# Show available npm scripts
npm run

# Show git configuration  
git remote -v
git status
git log --oneline -10

# Show current processes
ps aux | grep node
lsof -i :8003
lsof -i :5173

# Show environment status
node --version
npm --version
```

### **Documentation Resources**
- **Project Documentation**: `/server/docs/` folder
- **Database Architecture**: `/server/docs/Architecture/DBConfig.md`
- **Frontend Guide**: `/mainapp/README_CYPRESS.md`
- **API Documentation**: Check server/server-db.js comments
- **Railway Dashboard**: https://railway.app/

### **Emergency Contacts**
- **Railway Issues**: Use Railway dashboard support
- **GitHub Issues**: Create issue in sravnenie-ipotek/bankimonline-workspace
- **Code Review**: Use pull requests for major changes

---

## 🔒 **SECURITY GUIDELINES**

### **Secrets Management**
```bash
# NEVER commit these files:
.env
.env.local
.env.production

# Verify no secrets in git history:
git log --all --grep="password\|secret\|key" --oneline

# Check current commit for secrets:
git diff --cached | grep -i "password\|secret\|key"
```

### **Database Security**
- Production database contains 226+ real users
- Always use separate development/testing environments
- Never run destructive queries on production
- Database URLs contain credentials - keep secure
- Regular security audits: `npm audit`

---

**⚠️ CRITICAL HYBRID ARCHITECTURE INFORMATION**

**Last Updated**: 2025-08-15  
**Architecture Version**: 3.0 (Hybrid Monorepo + Packages)  
**Source of Truth**: `packages/server/src/server.js` ✅ PRODUCTION  
**Legacy Sync Target**: `server/server-db.js` 📋 BACKUP  
**Sync Rule**: ALWAYS packages → legacy, NEVER legacy → packages  
**Validation Status**: Both modern and legacy commands tested and verified  
**Database Status**: Production-safe with 226+ users  
**Authentication Status**: JWT_SECRET and role field fixes applied to BOTH servers  
**Deployment Status**: Railway-ready with Docker

**🔄 CRITICAL SYNC REQUIREMENT**: All development must occur in `packages/` first, then sync to legacy structure for backward compatibility. The packages structure is the LEADING architecture.**
EOF < /dev/null