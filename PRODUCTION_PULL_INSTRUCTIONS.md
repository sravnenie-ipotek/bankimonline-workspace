# Production Pull & Apply Instructions

**Date**: August 16, 2025  
**Commit**: 72445ba87  
**Branch**: main

## What's New in This Update

1. **PM2 Development Configuration** - Match production's PM2 setup locally
2. **Security Documentation** - Critical JWT_SECRET vulnerability identified
3. **Production-Ops Subagent** - AI assistant that knows your PM2-dump architecture
4. **Environment Comparison** - Clear documentation of dev vs prod differences

## Files for Production Team

### Critical Security Fix Required
- **`SECURITY_WARNING_JWT.md`** - ⚠️ READ IMMEDIATELY
  - Production is missing JWT_SECRET in PM2 dump
  - Using weak hardcoded defaults
  - Contains fix instructions

### Production Update Guide
- **`server/docs/prod/updateDumpFileProd.md`** - How to update PM2 environment variables
  - Step-by-step instructions
  - Backup procedures
  - Rollback guide

### Documentation
- **`DEV_PROD_ENVIRONMENT_COMPARISON.md`** - Complete environment comparison
- **`server/docs/prod/prodArchitecture.md`** - Your unique PM2-dump architecture explained

## How to Pull These Changes to Production

### Step 1: Backup Current State
```bash
# ALWAYS backup first!
cd /var/www/bankim/online/api
cp ~/.pm2/dump.pm2 /var/www/bankim/config-backups/pm2-dump-$(date +%Y%m%d_%H%M%S).pm2
pm2 save
```

### Step 2: Pull Latest Changes
```bash
# Check current branch
git branch

# Pull latest from main
git pull origin main

# Verify the pull
git log --oneline -5
```

### Step 3: Review Security Warning
```bash
# READ THE SECURITY WARNING
cat SECURITY_WARNING_JWT.md

# This file explains the JWT_SECRET vulnerability
```

### Step 4: Apply JWT_SECRET Fix (CRITICAL)
```bash
# Generate secure secrets
JWT_SECRET=$(openssl rand -hex 64)
JWT_BANK_SECRET=$(openssl rand -hex 64)

echo "JWT_SECRET: $JWT_SECRET"
echo "JWT_BANK_SECRET: $JWT_BANK_SECRET"

# Delete current PM2 process
pm2 delete bankim-online-server

# Recreate with JWT secrets
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bankim_core" \
CONTENT_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bankim_content" \
MANAGEMENT_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bankim_management" \
JWT_SECRET="$JWT_SECRET" \
JWT_BANK_SECRET="$JWT_BANK_SECRET" \
PORT=8004 \
NODE_ENV=production \
pm2 start server/server-db.js --name bankim-online-server -i 2

# CRITICAL: Save the new configuration
pm2 save

# Backup the new dump immediately
cp ~/.pm2/dump.pm2 /var/www/bankim/config-backups/pm2-dump-JWT-FIXED-$(date +%Y%m%d).pm2
```

### Step 5: Verify the Fix
```bash
# Check JWT_SECRET is now set
pm2 show bankim-online-server | grep JWT

# Should see:
# │ JWT_SECRET │ [your-generated-secret]
# │ JWT_BANK_SECRET │ [your-generated-secret]

# Test the application
curl http://localhost:8004/api/health
```

### Step 6: Test System Restart
```bash
# Ensure changes survive restart
sudo systemctl restart pm2-root
sleep 5
pm2 status

# Verify JWT still set after restart
pm2 show bankim-online-server | grep JWT
```

## What NOT to Do

❌ **DON'T** edit .env files - Production ignores them  
❌ **DON'T** skip `pm2 save` - Changes will be lost  
❌ **DON'T** skip backup - Always backup before changes  
❌ **DON'T** use weak JWT secrets - Use the openssl command  

## Files You Can Ignore (Development Only)

These files are for development environment only:
- `ecosystem.dev.config.js` - Development PM2 config
- `PM2_DEVELOPMENT.md` - Development PM2 guide
- `.env.development-railway` - Development database config
- `package.json` PM2 scripts - Development convenience

## Support Files

- **Production Architecture**: `server/docs/prod/prodArchitecture.md`
- **Update Procedures**: `server/docs/prod/updateDumpFileProd.md`
- **Subagent Help**: `.claude/agents/production-ops.md`

## Emergency Rollback

If something goes wrong:
```bash
# Stop PM2
pm2 kill

# Restore backup dump
cp /var/www/bankim/config-backups/pm2-dump-[BACKUP-DATE].pm2 ~/.pm2/dump.pm2

# Resurrect from backup
pm2 resurrect

# Verify
pm2 status
```

## Summary

1. **Pull the latest code** from main branch
2. **READ** SECURITY_WARNING_JWT.md
3. **FIX** the JWT_SECRET vulnerability immediately
4. **BACKUP** before and after changes
5. **TEST** that changes survive restart

The system has been stable for 30+ days, but the JWT_SECRET vulnerability needs immediate attention!

---
**Questions?** Review the documentation or use the production-ops subagent for guidance.