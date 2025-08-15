# Database Connection Failure Prevention Guide

## 🚨 Critical Database Architecture

### Railway Database Environment
```
┌─────────────────────────────────────────────────────────────┐
│ PRODUCTION RAILWAY DATABASES (DO NOT MODIFY)               │
├─────────────────────────────────────────────────────────────┤
│ 1. MAIN DATABASE (Authentication & Calculations)           │
│    Host: maglev.proxy.rlwy.net:43809                      │
│    Purpose: users, clients, bank_offers, calculations      │
│    Status: ✅ CRITICAL - Required for bank offers API     │
│                                                             │
│ 2. CONTENT DATABASE (Dropdowns & Translations)            │
│    Host: shortline.proxy.rlwy.net:33452                   │
│    Purpose: content_items, content_translations, dropdowns │
│    Status: ✅ CRITICAL - Required for dropdown APIs       │
│                                                             │
│ 3. LEGACY DATABASE (UNUSED - DO NOT USE)                   │
│    Host: yamanote.proxy.rlwy.net:53119                    │
│    Purpose: Legacy/abandoned database                      │
│    Status: ❌ DEPRECATED - Causes failures if used        │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Required Environment Configuration

### Mandatory .env File
```bash
# Main database (authentication, bank calculations)
DATABASE_URL=postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway

# Content database (dropdowns, translations)
CONTENT_DATABASE_URL=postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway
```

### ⚠️ Critical Password Details
- Main DB password starts with: `lgq` (NOT `lqq`)
- Content DB password starts with: `SuF` (NOT `hNm`)
- Wrong passwords = complete system failure

## 🛡️ Prevention Protocols

### 1. Pre-Startup Validation
**MANDATORY**: Run these commands before starting server:
```bash
# Validate environment configuration
npm run verify:database

# Test critical API endpoints  
npm run test:dropdowns

# Validate both database connections
npm run validate:connections
```

### 2. Server Startup Monitoring
**Watch for these SUCCESS indicators**:
```
✅ Main Database connected successfully
✅ Content Database connected successfully
📊 [main] DB Config: postgresql://***@maglev.proxy.rlwy.net:43809
📊 [content] DB Config: postgresql://***@shortline.proxy.rlwy.net:33452
```

**STOP IMMEDIATELY if you see**:
```
❌ Main Database connection failed: password authentication failed
❌ Content Database connection failed: password authentication failed
📊 [*] DB Config: ***@yamanote.proxy.rlwy.net:53119  ← WRONG DATABASE!
```

### 3. API Health Validation
**After startup, verify**:
```bash
# Dropdowns working (should return items)
curl -s http://localhost:8003/api/dropdowns/mortgage_step3/he | jq '.performance.total_items'
# Expected: 87+ items

# Bank offers working (should return success)
curl -X POST http://localhost:8003/api/customer/compare-banks \
  -H "Content-Type: application/json" \
  -d '{"loan_type": "mortgage", "amount": 500000, "monthly_income": 15000, "age": 30}' \
  -s | jq '.status'
# Expected: "success"
```

### 4. Configuration File Consistency
**Keep these files synchronized**:
- `.env` - Environment variables (PRIMARY)
- `server/config/database-core.js` - Fallback URLs (SECONDARY)
- `PRODUCTION_DATABASE_CONFIG_FIXED.js` - Reference documentation

## 🚨 Emergency Recovery Procedures

### If Dropdowns Show No Options
```bash
# 1. Check content database connection
npm run verify:database

# 2. Check if server connected to wrong database
grep "yamanote\|53119" server logs  # Should find NOTHING

# 3. Restart with explicit environment
source .env && npm start
```

### If Bank Offers Return 500 Errors  
```bash
# 1. Check main database authentication
curl http://localhost:8003/health

# 2. Verify .env has correct main DATABASE_URL with lgq password
grep "DATABASE_URL.*lgq" .env

# 3. Kill and restart server completely
npm run kill-ports && npm start
```

## 🔍 Configuration Audit Checklist

### Before Any Deployment
- [ ] `.env` file exists with both DATABASE_URL and CONTENT_DATABASE_URL
- [ ] Main database password starts with `lgq` (not `lqq`)
- [ ] Content database password starts with `SuF` (not `hNm`) 
- [ ] No references to `yamanote` or port `53119` in active config
- [ ] `npm run verify:database` passes
- [ ] `npm run test:dropdowns` shows 9/9 tests passed
- [ ] Server logs show both databases connected successfully

### Monthly Configuration Validation
```bash
# Run comprehensive database validation
npm run validate:all-databases

# Check for configuration drift
npm run audit:database-config

# Update documentation if changes found
npm run generate:database-docs
```

## 📊 Monitoring & Alerting

### Key Metrics to Monitor
- Database connection success rate (should be 100%)
- Dropdown API response times (<100ms)
- Bank offers API success rate (>95%)
- Number of dropdown items returned (mortgage_step3: 80+)

### Automated Alerts
- **CRITICAL**: Database connection failures
- **WARNING**: Dropdown APIs returning <50 items
- **WARNING**: Bank offers API failure rate >5%
- **INFO**: Server startup with fallback database URLs

## 🎯 Development Best Practices

### 1. Environment Management
- Always use `.env` for sensitive credentials
- Never commit database passwords to git
- Test in isolated environments before production

### 2. Configuration Changes
- Update all related files simultaneously
- Test configuration changes in development first
- Document any database credential updates

### 3. Debugging Database Issues
- Always check database connection logs first
- Verify environment variables are loaded correctly
- Test individual database connections before full server startup

### 4. Code Review Requirements
- Database configuration changes require 2+ approvals
- All database-related changes must include validation tests
- Environment variable changes must be documented

## 🛠️ Automated Prevention Tools

### Pre-commit Hooks
```bash
# Install database validation hooks
npm run setup:database-hooks

# Validates .env consistency before commits
# Prevents commits with yamanote references
# Requires database connection tests to pass
```

### CI/CD Pipeline Validation
```yaml
database_validation:
  - name: Validate Database Configuration
    run: npm run verify:database
  
  - name: Test Critical API Endpoints
    run: npm run test:dropdowns
    
  - name: Verify No Legacy Database References
    run: grep -r "yamanote\|53119" . && exit 1 || exit 0
```

## 📚 Reference Documentation

### Database Connection Strings (For Reference Only)
```bash
# CORRECT - Main Database (Authentication)
postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway

# CORRECT - Content Database (Dropdowns)  
postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway

# WRONG - Legacy Database (DO NOT USE)
postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway
```

### Common Error Messages & Solutions
| Error | Cause | Solution |
|-------|-------|----------|
| `password authentication failed` | Wrong password in DATABASE_URL | Check .env file, ensure lgq prefix |
| `Only 0 items (expected ≥50)` | Wrong content database | Verify CONTENT_DATABASE_URL points to shortline |
| `API Error: 500` | Main database connection failed | Restart server with correct DATABASE_URL |
| `yamanote.proxy.rlwy.net` in logs | Using legacy database | Update configuration to use maglev/shortline |

---

**Remember**: Database configuration errors cause complete system failures. When in doubt, always run `npm run verify:database` first.