# 🚨 CRITICAL: PRODUCTION DEPLOYMENT GUIDE - UNIFIED MONOREPO ARCHITECTURE

**Last Updated**: August 17, 2025
**Author**: System Architecture Team
**Status**: ✅ PRODUCTION UNIFIED WITH MONOREPO

## ⚠️ CRITICAL INFORMATION - READ FIRST

### Current Production Configuration (AS OF Aug 17, 2025)
- **Server**: `packages/server/src/server.js` (MONOREPO - SAME AS DEV)
- **Location**: `/opt/bankimonline_20250817_041201/packages/server/`
- **Process Name**: `bankimonline-monorepo`
- **Port**: 8003
- **Instances**: 2 (cluster mode)
- **PM2 ID**: 0, 1

### ❌ DEPRECATED - DO NOT USE
- **OLD Server**: `server/server-db.js` - NO LONGER IN USE
- **OLD Process**: `bankimonline-api` - DELETED

## 🎯 THE GOLDEN RULE

**PRODUCTION AND DEVELOPMENT MUST USE THE SAME SERVER CODE**

```
Development: packages/server/src/server.js ✅
Production:  packages/server/src/server.js ✅ (SAME!)
```

## 📋 Pre-Deployment Checklist

Before ANY deployment, verify:

```bash
# 1. Check what's currently running
ssh root@45.83.42.74
pm2 list
# Should show: bankimonline-monorepo (NOT bankimonline-api)

# 2. Verify the server path
pm2 show bankimonline-monorepo | grep "script path"
# Should show: /opt/*/packages/server/src/server.js

# 3. Test critical endpoints
curl -s 'http://localhost:8003/api/dropdowns/mortgage_step2/he' | grep -c family_status
# Should return: > 0
```

## 🚀 Deployment Process

### Step 1: Prepare Deployment Package
```bash
# From local development
cd /Users/michaelmishayev/Projects/bankDev2_standalone
tar -czf packages-server-deploy.tar.gz packages/server/
```

### Step 2: Deploy to Production
```bash
# Upload
scp packages-server-deploy.tar.gz root@45.83.42.74:/tmp/

# SSH to production
ssh root@45.83.42.74

# Backup current version
cd /opt/bankimonline_20250817_041201/
cp -r packages/server packages/server.backup.$(date +%Y%m%d_%H%M%S)

# Extract new version
tar -xzf /tmp/packages-server-deploy.tar.gz

# Install dependencies
cd packages/server
npm install --production

# Copy environment file
cp ../api/.env .env
```

### Step 3: Restart Services
```bash
# Restart PM2 processes
pm2 restart bankimonline-monorepo

# Clear cache
curl -X POST http://localhost:8003/api/cache/clear

# Verify
pm2 logs bankimonline-monorepo --lines 20
```

## 🔍 Monitoring & Health Checks

### Quick Health Check Script
```bash
#!/bin/bash
# Save as: /opt/health-check.sh

echo "=== Production Health Check ==="
echo "Date: $(date)"
echo ""

# Check PM2
echo "1. PM2 Status:"
pm2 list | grep bankimonline-monorepo
if [ $? -ne 0 ]; then
    echo "❌ CRITICAL: Monorepo server not running!"
    exit 1
fi

# Check API
echo ""
echo "2. API Response:"
curl -s http://localhost:8003/api/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ API responding"
else
    echo "❌ API not responding"
fi

# Check critical dropdowns
echo ""
echo "3. Critical Dropdowns:"
FAMILY=$(curl -s 'http://localhost:8003/api/dropdowns/mortgage_step2/he' | grep -c family_status)
if [ $FAMILY -gt 0 ]; then
    echo "✅ Family status dropdown: OK"
else
    echo "❌ Family status dropdown: MISSING"
fi

echo ""
echo "=== Health Check Complete ==="
```

### Daily Monitoring Checklist
- [ ] PM2 processes are running
- [ ] No error logs in last 24 hours
- [ ] API response time < 200ms
- [ ] All critical dropdowns working
- [ ] Database connections healthy

## 🚨 Troubleshooting Guide

### Problem: Dropdowns Missing (like family_status)

**IMMEDIATE CHECK**:
```bash
# 1. Which server is running?
pm2 list
# If shows bankimonline-api → WRONG! Need to switch to monorepo

# 2. Check server file
pm2 show [process-name] | grep "script path"
# Should show packages/server/src/server.js
```

**FIX**:
```bash
# Stop wrong server
pm2 stop bankimonline-api
pm2 delete bankimonline-api

# Start correct server
cd /opt/bankimonline*/packages/server
PORT=8003 pm2 start src/server.js --name bankimonline-monorepo -i 2
pm2 save
```

### Problem: Different Behavior Dev vs Prod

**ALWAYS CHECK**:
1. Are both using `packages/server/src/server.js`?
2. Same database connections?
3. Same environment variables?

```bash
# Compare checksums
# Local
md5sum packages/server/src/server.js

# Production
ssh root@45.83.42.74 'md5sum /opt/bankimonline*/packages/server/src/server.js'

# If different → DEPLOY LATEST VERSION
```

## 📊 Database Configuration

### Required Environment Variables
```bash
# In packages/server/.env
DATABASE_URL=postgresql://[main-database]
CONTENT_DATABASE_URL=postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway
PORT=8003
NODE_ENV=production
```

### Database Connections
- **Main DB**: maglev.proxy.rlwy.net:43809
- **Content DB**: shortline.proxy.rlwy.net:33452 (DROPDOWNS)
- **Management DB**: yamanote.proxy.rlwy.net:53119

## 🔐 Security Notes

- Never commit `.env` files
- Always use environment variables for secrets
- Keep PM2 logs clean of sensitive data
- Rotate database passwords regularly

## 📝 Change Log

### August 17, 2025
- **MAJOR**: Migrated production from `server/server-db.js` to `packages/server/src/server.js`
- **FIXED**: Family status dropdown missing on mortgage step 2
- **FIXED**: Mortgage timing and first property dropdowns on step 1
- **UNIFIED**: Dev and Prod now use same monorepo architecture

## ⚡ Quick Commands

```bash
# SSH to production
ssh root@45.83.42.74

# Check what's running
pm2 list

# Restart server
pm2 restart bankimonline-monorepo

# View logs
pm2 logs bankimonline-monorepo --lines 50

# Clear cache
curl -X POST http://localhost:8003/api/cache/clear

# Test dropdown API
curl -s 'http://localhost:8003/api/dropdowns/mortgage_step2/he' | jq '.options | keys'
```

## 🚦 Status Indicators

When everything is correct:
- ✅ `pm2 list` shows `bankimonline-monorepo`
- ✅ Server path contains `packages/server/src/server.js`
- ✅ Port 8003 is listening
- ✅ Dropdowns API returns data
- ✅ No errors in PM2 logs

## 🆘 Emergency Contacts

If production is down:
1. Check this guide first
2. Run health check script
3. Check PM2 logs
4. Verify database connections

## 🎯 Remember

**THE MOST IMPORTANT RULE**:
```
ALWAYS USE packages/server/src/server.js
NEVER USE server/server-db.js
```

This prevents ALL the confusion we experienced!