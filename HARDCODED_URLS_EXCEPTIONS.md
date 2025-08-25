# Hardcoded URLs Exceptions List

## Overview
This document tracks remaining hardcoded database URLs that are acceptable exceptions to the SOURCE OF TRUTH enforcement.

## Acceptable Exceptions

### 1. Test Files
- `mainapp/src/services/__tests__/backend-server.test.ts` - Mock database URL for unit testing
  - Uses: `postgresql://test:test@localhost:5432/testdb`
  - Reason: This is a mock URL for testing, not actual connection

### 2. Backup Scripts (Not Deployed)
These scripts are utility scripts for manual backup operations, not part of deployed code:
- `scripts/backup-all-railway-databases.sh`
- `railway_backups_*/restore_all_databases.sh`
- `scripts/start-ssh-tunnels.sh`

### 3. Old Migration Utilities (Not Deployed)
Historical migration scripts that are no longer used:
- `run-migration.js`
- `scripts/update-hebrew-via-api.js`
- `scripts/update-homepage-hebrew.js`
- `scripts/update-railway-specific-keys.js`

### 4. Test/Analysis Utilities in mainapp/
Development utilities for testing and content analysis:
- `mainapp/check_content_items_schema.js`
- `mainapp/check_cooperation_database.js`
- `mainapp/analyze-*.js`
- `mainapp/create_*.js`
- `mainapp/migrate_*.js`

## Critical Code Status
✅ **ALL PRODUCTION CODE** now uses `server/config/database-truth.js` for database connections:
- ✅ `server/server-db.js` - Main API server
- ✅ `scripts/pre-deployment-check.js` - Deployment validation
- ✅ `scripts/validate-migrations.js` - Migration validation
- ✅ `server/__tests__/auth-integration.test.js` - Integration tests

## Enforcement Strategy
1. The `enforce-no-hardcoded-urls.js` script will continue to flag these as warnings
2. CI/CD will not block on these exceptions since they're not deployed code
3. New production code MUST use database-truth.js module

## Next Steps
1. Gradually migrate utility scripts to use database-truth.js
2. Archive old backup scripts that are no longer needed
3. Update test files to use environment variables where possible

---
**Last Updated**: August 25, 2025
**Source of Truth**: LOCAL .env file via `server/config/database-truth.js`