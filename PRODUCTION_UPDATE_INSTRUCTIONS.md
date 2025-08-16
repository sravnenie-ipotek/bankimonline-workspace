# 🚨 PRODUCTION UPDATE INSTRUCTIONS - August 16, 2025

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
# Pull from workspace repository (main monorepo)
git pull workspace main

# If you get permission errors, use:
git pull git@github.com:sravnenie-ipotek/bankimonline-workspace.git main
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

# Start servers with updated code
pm2 start server/server-db.js --name bankim-api

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

### Monorepo Status
- The monorepo structure (packages/) is NOT used in production
- Production uses: `server/server-db.js` and `mainapp/`
- Do NOT attempt to use packages/ directory in production

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

**Last Updated**: August 16, 2025
**Commit Hash**: 618615c8f
**Verified By**: Code verification completed, all bugs fixed
**Risk Level**: LOW - Only bug fixes, no breaking changes