# 🚨 PRODUCTION UPDATE INSTRUCTIONS - August 16, 2025

## Repository Information

### Git Repositories
- **Main Workspace**: `git@github.com:sravnenie-ipotek/bankimonline-workspace.git` (Primary - Contains monorepo structure but NOT USED)
- **API Repository**: `git@github.com:sravnenie-ipotek/bankimonline-api.git` (Backend deployment)
- **Web Repository**: `git@github.com:sravnenie-ipotek/bankimonline-web.git` (Frontend deployment)
- **Shared Docs**: `git@github.com:sravnenie-ipotek/bankimonline-shared.git` (Documentation)

### ⚠️ IMPORTANT: Monorepo vs Legacy Structure
- **Workspace contains**: Both monorepo (`packages/`) AND legacy structure (`server/`, `mainapp/`)
- **Production USES**: Legacy structure ONLY (`server/server-db.js` and `mainapp/`)
- **Monorepo status**: EXISTS but NOT ACTIVE - Ignore `packages/` directory
- **What to use**: Always use `server/server-db.js` for backend and `mainapp/` for frontend

### Current Push Status
✅ **Workspace Repository**: Updated with fixes (commit: 5b62d4c94) - Contains both structures
⏳ **API Repository**: May need sync if used separately
⏳ **Web Repository**: May need sync if used separately
⏳ **Shared Repository**: Documentation can be updated if needed

## Critical Bug Fixes Ready for Deployment

### Summary of Fixes
✅ **All critical bugs have been resolved**:
- Fixed port 8004 connection errors → All APIs now use port 8003
- Fixed dropdownData undefined errors → All imports corrected
- Fixed merge conflicts → Clean codebase
- Fixed JSON syntax errors → package.json validated
- Frontend builds successfully → Ready for deployment

## Production Pull & Update Procedure

### Step 1: Backup Current Production
```bash
# SSH into production server
ssh production-server

# Navigate to application directory
cd /path/to/bankDev2_standalone

# Create backup of current state
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz .
```

### Step 2: Pull Latest Changes
```bash
# Option A: Pull from workspace repository (main monorepo) - RECOMMENDED
git pull workspace main

# Option B: If workspace remote is not configured, add it first:
git remote add workspace git@github.com:sravnenie-ipotek/bankimonline-workspace.git
git pull workspace main

# Option C: Direct pull without adding remote:
git pull git@github.com:sravnenie-ipotek/bankimonline-workspace.git main

# If you need to pull from other repositories:
git pull api main      # For API-specific changes
git pull web main      # For frontend-specific changes
git pull shared main   # For documentation updates
```

### Step 3: Update Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd mainapp
npm install
cd ..
```

### Step 4: Build Frontend
```bash
# Build the frontend application
cd mainapp
npm run build

# Verify build success (should complete in ~7 seconds)
# Check for build output in mainapp/build/
```

### Step 5: Update PM2 Configuration
```bash
# Stop current PM2 processes
pm2 stop all

# Save current PM2 state (backup)
pm2 save
pm2 dump > pm2-backup-$(date +%Y%m%d).json

# Option A: Start servers individually
pm2 start server/server-db.js --name bankim-api

# Option B: Use PM2 development configuration (if available)
npm run pm2:dev  # This uses ecosystem.dev.config.js if configured

# Option C: Resurrect from PM2 dump (maintains all env variables)
pm2 resurrect  # Uses the saved dump file

# Verify processes are running
pm2 status
pm2 logs --lines 50
```

### Step 6: Database Sync (If Needed)
```bash
# Only if instructed - sync from Railway databases
# This depends on your production database sync procedure

# Test database connectivity first
node mainapp/test-content-tables.js

# If database sync is needed (coordinate with team):
# 1. Stop application traffic
# 2. Run sync procedure
# 3. Verify data integrity
# 4. Resume traffic
```

### Step 7: Verification Checklist
```bash
# 1. Check API endpoints are responding
curl http://localhost:8003/api/v1/banks
curl http://localhost:8003/api/v1/params

# 2. Check frontend is accessible
curl http://localhost:5173  # Or your production port

# 3. Check PM2 processes are stable
pm2 status
pm2 monit

# 4. Check logs for errors
pm2 logs --lines 100 | grep -i error

# 5. Test critical user flows
# - Login flow
# - Mortgage calculator
# - Bank offers
```

## Critical Information

### Port Configuration
- **API Server**: Port 8003 (NOT 8004!)
- **Frontend Dev**: Port 5173
- **File Server**: Port 3001

### Fixed Issues
1. **Port 8004 Errors**: All references updated to 8003
2. **dropdownData undefined**: All imports fixed
3. **Merge Conflicts**: Resolved in package.json and FirstStepForm.tsx
4. **Build Errors**: JSON syntax fixed, builds successfully

### Environment Variables Required
Ensure these are set in your PM2 dump or .env:
```bash
DATABASE_URL=postgresql://[your-production-db-url]
CONTENT_DATABASE_URL=postgresql://[your-production-content-db-url]
JWT_SECRET=[MUST BE SET - CRITICAL SECURITY]
NODE_ENV=production
PORT=8003
```

## Rollback Procedure (If Needed)

### Emergency Rollback
```bash
# 1. Stop current processes
pm2 stop all

# 2. Restore previous code
git log --oneline -5  # Find previous commit
git reset --hard [previous-commit-hash]

# 3. Restore PM2 configuration
pm2 delete all
pm2 resurrect pm2-backup-[date].json

# 4. Restart services
pm2 start all

# 5. Verify services are running
pm2 status
```

## Monitoring After Update

### First 30 Minutes
- Monitor PM2 logs: `pm2 logs --lines 100`
- Check error rates
- Monitor response times
- Watch memory usage: `pm2 monit`

### First 24 Hours
- Check for any user-reported issues
- Monitor database connections
- Review error logs
- Check performance metrics

## Contact for Issues

If you encounter any issues during deployment:

1. **Check logs first**: `pm2 logs --lines 200`
2. **Test database connectivity**: `node mainapp/test-content-tables.js`
3. **Verify API responses**: Test endpoints manually
4. **Check build artifacts**: Ensure mainapp/build exists

## Important Notes

### Monorepo Clarification
⚠️ **CRITICAL UNDERSTANDING**:
- **Workspace repository**: Contains BOTH monorepo (`packages/`) and legacy structures
- **Monorepo (`packages/`)**: EXISTS in the repository but is NOT USED in production
- **Production uses**: ONLY the legacy structure:
  - Backend: `server/server-db.js` (NOT `packages/server/`)
  - Frontend: `mainapp/` (NOT `packages/client/`)
- **Do NOT**: Attempt to use or reference `packages/` directory in production
- **Future plan**: Monorepo will be disabled (see DISABLE_MONOREPO_PLAN.md)

### Security Critical
⚠️ **JWT_SECRET MUST be set in production environment**
- Check PM2 dump file includes JWT_SECRET
- Never commit JWT_SECRET to git

### Database Safety
- Production uses local databases that sync from Railway
- Always backup before any database operations
- Test connectivity before starting services

## Verification Commands Summary
```bash
# Quick health check
pm2 status
curl http://localhost:8003/api/v1/banks
pm2 logs --lines 50 | grep -i error

# Full verification
node mainapp/test-content-tables.js
cd mainapp && npm run build
pm2 monit
```

## Success Criteria
✅ All PM2 processes show "online" status
✅ API endpoints respond with data
✅ No errors in PM2 logs
✅ Frontend builds successfully
✅ Database connectivity confirmed
✅ User login flow works

---

## Repository Quick Reference

### Adding Git Remotes (if needed)
```bash
# Add all remotes at once
git remote add workspace git@github.com:sravnenie-ipotek/bankimonline-workspace.git
git remote add api git@github.com:sravnenie-ipotek/bankimonline-api.git
git remote add web git@github.com:sravnenie-ipotek/bankimonline-web.git
git remote add shared git@github.com:sravnenie-ipotek/bankimonline-shared.git

# Verify remotes are configured
git remote -v
```

### PM2 Commands Reference
```bash
# Development
npm run pm2:dev         # Start with ecosystem.dev.config.js
npm run pm2:stop        # Stop all PM2 processes
npm run pm2:restart     # Restart all processes
npm run pm2:logs        # View logs
npm run pm2:status      # Check status
npm run pm2:monit       # Monitor processes
npm run pm2:clean       # Clean all processes

# Production (from PM2 dump)
pm2 resurrect           # Restore from dump file
pm2 save               # Save current state
pm2 dump               # Create dump file
```

---

**Last Updated**: August 16, 2025
**Primary Repository**: workspace (bankimonline-workspace)
**Latest Commit**: c2c916f94
**Verified By**: Code verification completed, all bugs fixed
**Risk Level**: LOW - Only bug fixes, no breaking changes