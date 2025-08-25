# 🚨 CRITICAL: Production Environment Configuration

## PROBLEM DISCOVERED
The TEST server was using the WRONG database! It was pointing to the CONTENT database instead of the CORE database, causing all authentication and validation failures.

## CORRECT DATABASE ARCHITECTURE

### Database Purposes:
1. **CORE Database (maglev)** - Main application data
   - URL: `postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway`
   - Contains: users, clients, banks, banking_standards
   - Has all required columns: role, value_type, standard_category

2. **CONTENT Database (shortline)** - Content management
   - URL: `postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway`
   - Contains: content_items, content_translations
   - MISSING critical columns in duplicate tables

## REQUIRED .env Configuration

### TEST Environment (.env)
```bash
# CRITICAL: DATABASE_URL must point to CORE (maglev), not CONTENT!
DATABASE_URL=postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway
CONTENT_DATABASE_URL=postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway
MANAGEMENT_DATABASE_URL=postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_BANK_SECRET=your-bank-secret-key-2024
PORT=8003
NODE_ENV=production
```

### PRODUCTION Environment (.env)
```bash
# CRITICAL: DATABASE_URL must point to CORE (maglev), not CONTENT!
DATABASE_URL=postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway
CONTENT_DATABASE_URL=postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway
MANAGEMENT_DATABASE_URL=postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway
JWT_SECRET=production-secret-key-must-be-different-and-secure-2024
JWT_BANK_SECRET=production-bank-secret-key-must-be-different-2024
PORT=8003
NODE_ENV=production
```

## STATUS UPDATE

### ✅ TEST Server (45.83.42.74) - FIXED
- **Previous Issue**: DATABASE_URL pointed to shortline (CONTENT) ❌
- **Current Status**: DATABASE_URL points to maglev (CORE) ✅
- **Result**: Authentication endpoints now working

### ⚠️ PRODUCTION Server (185.253.72.80) - NEEDS SETUP
- **Current Status**: Not deployed yet or different directory structure
- **Action Required**: Ensure .env is created with correct URLs when deploying

## VERIFICATION COMMANDS

### Check which database is being used:
```javascript
// Run on server to verify
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

// Should return true for CORE database
const hasRole = await client.query("SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'role')");
console.log('Using correct database:', hasRole.rows[0].exists);
```

### Test authentication endpoint:
```bash
curl -X POST http://SERVER_IP:8003/api/auth-verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "972544123456"}'
```

## CRITICAL LESSONS LEARNED

1. **DATABASE_URL must ALWAYS point to CORE database (maglev)**
2. **CONTENT_DATABASE_URL is for content management only**
3. **Never mix up the databases - they have different schemas**
4. **Always verify column existence after deployment**
5. **LOCAL .env is SOURCE OF TRUTH - must be synced to servers**

## GitHub Secrets Update Required

Run these commands to update GitHub secrets:
```bash
gh secret set DATABASE_URL --body "postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway"
gh secret set CONTENT_DATABASE_URL --body "postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway"
gh secret set JWT_SECRET --body "your-production-secret-key-here"
```

## DEPLOYMENT CHECKLIST

- [ ] Verify DATABASE_URL points to maglev (CORE)
- [ ] Verify CONTENT_DATABASE_URL points to shortline (CONTENT)
- [ ] Test auth-verify endpoint responds without errors
- [ ] Check PM2 logs for database connection confirmations
- [ ] Run validation scripts to ensure columns exist