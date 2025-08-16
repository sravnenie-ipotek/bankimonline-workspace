# Development vs Production Environment Comparison

**Last Updated**: August 16, 2025  
**Production Stable Since**: August 14, 2025 (30+ days uptime)

## Environment Variables Comparison

| Variable | Development (Railway) | Production (Local) | Notes |
|----------|----------------------|-------------------|--------|
| **DATABASE_URL** | `postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway` | `postgresql://postgres:postgres@localhost:5432/bankim_core` | Dev uses Railway cloud |
| **CONTENT_DATABASE_URL** | `postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway` | `postgresql://postgres:postgres@localhost:5432/bankim_content` | Dev uses Railway cloud |
| **MANAGEMENT_DATABASE_URL** | Same as DATABASE_URL | `postgresql://postgres:postgres@localhost:5432/bankim_management` | Dev can reuse main DB |
| **PORT** | `8003` | `8004` | Different to avoid conflicts |
| **NODE_ENV** | `development` | `production` | Standard practice |
| **JWT_SECRET** | Set in .env | **⚠️ NOT SET** | **CRITICAL SECURITY ISSUE** |
| **JWT_BANK_SECRET** | Set in .env | **⚠️ NOT SET** | **CRITICAL SECURITY ISSUE** |

## Architecture Differences

| Aspect | Development | Production |
|--------|------------|------------|
| **Database Location** | Railway (cloud) | Local PostgreSQL |
| **Configuration Method** | .env files | PM2 dump file |
| **PM2 Mode** | Fork (1 instance) | Cluster (2 instances) |
| **PM2 Process IDs** | Dynamic | IDs 4 & 5 |
| **Auto-restart** | Optional (PM2) | systemd + PM2 |
| **Config Changes** | Edit .env file | PM2 delete/start/save |

## Database Architecture

### Development (Railway Cloud)
```
┌─────────────────────────┐
│   Your Local Machine    │
│                         │
│  App (Port 8003)        │
│         ↓               │
└─────────────────────────┘
         ↓ Internet
┌─────────────────────────┐
│    Railway Cloud        │
│                         │
│  • Main Database        │
│  • Content Database     │
│  • Management Database  │
└─────────────────────────┘
```

### Production (Local PostgreSQL)
```
┌─────────────────────────┐
│  Production Server      │
│                         │
│  App (Port 8004)        │
│         ↓ localhost     │
│  PostgreSQL (5432)      │
│  • bankim_core          │
│  • bankim_content       │
│  • bankim_management    │
└─────────────────────────┘
```

## Quick Setup for Development

```bash
# 1. Ensure you're using Railway databases
cp .env.development-railway .env

# 2. Choose your launch method:

# Option A: Traditional (simple)
npm run dev

# Option B: PM2 (production-like)
npm run pm2:dev
npm run pm2:logs  # View logs
```

## How to Apply Changes

### Development (Your Environment)
```bash
# Edit .env file
nano .env

# Restart services
npm run pm2:restart  # If using PM2
# OR
# Ctrl+C and npm run dev  # If using traditional
```

### Production (PM2 Dump Method)
```bash
# NEVER edit .env files in production!
# Must recreate PM2 process:

pm2 delete bankim-online-server
DATABASE_URL="postgresql://..." \
PORT=8004 \
pm2 start server/server-db.js --name bankim-online-server -i 2
pm2 save  # CRITICAL!
```

## Security Issues in Production

### 🔴 CRITICAL: Missing JWT_SECRET
Production has NO JWT_SECRET configured, using hardcoded defaults:
- `JWT_SECRET = 'secret'`
- `JWT_BANK_SECRET = 'bank-employee-secret'`

**This allows anyone to forge authentication tokens!**

### Fix for Production
```bash
# Generate secure secrets
JWT_SECRET=$(openssl rand -hex 64)
JWT_BANK_SECRET=$(openssl rand -hex 64)

# Apply to production (see SECURITY_WARNING_JWT.md)
```

## Key Takeaways

1. **Development uses Railway** - Cloud databases for flexibility
2. **Production uses local PostgreSQL** - Better performance, no external dependencies
3. **JWT_SECRET missing in production** - Critical security vulnerability
4. **PM2 dump is stable** - 30+ days uptime despite security issue
5. **Simple is working** - Only 5 environment variables in production

## Commands Reference

### Development Commands
```bash
npm run dev          # Traditional start
npm run pm2:dev      # PM2 start (production-like)
npm run pm2:logs     # View PM2 logs
npm run pm2:status   # Check status
npm run pm2:stop     # Stop PM2
```

### Testing Database Connection
```bash
# Verify Railway connection
npm run verify:database

# Should see your Railway databases working
```

## Important Notes

- ✅ Keep using Railway for development (as requested)
- ⚠️ Production JWT_SECRET needs immediate fix
- 📊 Production has been stable for 30+ days with this simple setup
- 🔄 Development can simulate production with PM2
- 🚀 Both environments work with the same codebase