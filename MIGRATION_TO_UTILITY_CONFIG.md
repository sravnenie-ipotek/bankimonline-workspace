# Migration Guide: Removing Hardcoded Database URLs

## Overview
To ensure `.env` is the SOURCE OF TRUTH, all hardcoded database URLs must be migrated to use configuration modules.

## Configuration Modules

### 1. Production Code
**Module**: `server/config/database-truth.js`
```javascript
const { getDatabaseUrl } = require('../server/config/database-truth');
const connectionString = getDatabaseUrl('main');
```

### 2. Utility Scripts
**Module**: `config/utility-database-config.js`
```javascript
const { getUtilityDatabaseUrl } = require('../config/utility-database-config');
const connectionString = getUtilityDatabaseUrl('content');
```

### 3. Test Files
Use mock URLs for unit tests:
```javascript
const TEST_DB_URL = 'postgresql://test:test@localhost:5432/testdb';
```

## Files Requiring Migration

### High Priority (Production-adjacent)
- [ ] `scripts/pre-deployment-check.js` - Already uses database-truth ✅
- [ ] `scripts/validate-migrations.js` - Already uses database-truth ✅
- [ ] `server/__tests__/auth-integration.test.js` - Already uses database-truth ✅

### Medium Priority (Utility Scripts)
- [ ] `scripts/check-and-fix-railway-keys.js` - MIGRATED ✅
- [ ] `scripts/update-hebrew-via-api.js`
- [ ] `scripts/update-homepage-hebrew.js`
- [ ] `scripts/update-railway-specific-keys.js`
- [ ] `scripts/cleanup-env-files.sh`
- [ ] `scripts/backup-all-railway-databases.sh`

### Low Priority (One-time scripts)
- [ ] `run-migration.js`
- [ ] `mainapp/check_content_items_schema.js`
- [ ] `mainapp/analyze-*.js` files
- [ ] `mainapp/test-*.js` files

## Migration Example

### Before:
```javascript
const pool = new Pool({
  connectionString: 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});
```

### After:
```javascript
const { getUtilityDatabaseUrl } = require('../config/utility-database-config');

const pool = new Pool({
  connectionString: getUtilityDatabaseUrl('main')
});
```

## Benefits
1. **Single Source of Truth**: `.env` controls all database connections
2. **Environment Flexibility**: Easy to switch between local/dev/prod
3. **Security**: No credentials in code
4. **CI/CD Compliance**: Passes enforcement checks

## Enforcement
The `npm run enforce:no-hardcoded` command will fail CI/CD if hardcoded URLs are found in critical files.

## Acceptable Exceptions
Only these hardcoded URLs are acceptable:
1. Test mock URLs (`postgresql://test:test@localhost`)
2. URLs in `config/utility-databases.json` (configuration file)
3. Old backup directories (`railway_backups_*`)

All other hardcoded URLs MUST be migrated!