# Production Scripts - Obligations Dropdown Fix

## Overview

This directory contains production-ready SQL scripts to fix the Hebrew obligations dropdown issue that was showing English text instead of Hebrew options in the banking application.

**Issue**: Hebrew obligations dropdown showing "Select obligation type" in English instead of Hebrew options
**Root Cause**: Missing obligations dropdown content in database for `refinance_step3` and potentially `credit_step3`
**Solution**: Copy complete obligations dropdown content from working `mortgage_step3` to broken screens

## Script Execution Order

### 1. Pre-Deployment Assessment

```bash
# Run validation script to assess current state
psql $DATABASE_URL -f 002_validate_all_obligations_dropdowns.sql
```

This will tell you which screens need fixing.

### 2. Fix Scripts (Run Based on Validation Results)

#### Fix Refinance Step 3 (Primary Issue)
```bash
# Fix the main issue - refinance obligations dropdown
psql $DATABASE_URL -f 001_fix_refinance_obligations_dropdown.sql
```

#### Fix Credit Step 3 (If Needed)
```bash
# Only run if validation shows credit_step3 is missing obligations
psql $DATABASE_URL -f 003_fix_credit_obligations_dropdown.sql
```

### 3. Post-Deployment Cache Clear

```bash
# Clear server cache to serve fresh dropdown data
# This is informational - provides curl commands to run
psql $DATABASE_URL -f 004_clear_server_cache.sql
```

Then run the cache clear API calls shown in the script output:
```bash
curl -X DELETE "https://your-domain/api/dropdowns/cache/clear"
```

### 4. Final Validation

```bash
# Verify all fixes worked correctly
psql $DATABASE_URL -f 002_validate_all_obligations_dropdowns.sql
```

## Script Details

### 001_fix_refinance_obligations_dropdown.sql
- **Purpose**: Fix missing Hebrew obligations dropdown for refinance mortgage step 3
- **Action**: Copies obligations content from `mortgage_step3` to `refinance_step3`
- **Safety**: Creates backup tables, atomic transaction, comprehensive validation
- **Rollback**: `001_rollback_refinance_obligations.sql`

### 002_validate_all_obligations_dropdowns.sql
- **Purpose**: Comprehensive validation of all obligations dropdowns
- **Action**: Read-only assessment of dropdown content across all screens
- **Output**: Detailed report on what's working and what needs fixing
- **Safety**: No changes made, pure validation

### 003_fix_credit_obligations_dropdown.sql
- **Purpose**: Fix missing Hebrew obligations dropdown for credit calculator step 3
- **Action**: Copies obligations content from `mortgage_step3` to `credit_step3`
- **Safety**: Same safety measures as refinance fix
- **Rollback**: Available (can be created based on refinance rollback pattern)

### 004_clear_server_cache.sql
- **Purpose**: Instructions and verification for clearing server-side NodeCache
- **Action**: Provides curl commands and validation queries
- **Safety**: Read-only, no database changes

## Rollback Procedures

### Quick Rollback (If Issues Occur)
```bash
# Rollback refinance fix if problems occur
psql $DATABASE_URL -f 001_rollback_refinance_obligations.sql
```

### Manual Rollback (If Automated Rollback Fails)
```sql
-- Emergency manual rollback
DELETE FROM content_translations WHERE content_item_id IN (
    SELECT id FROM content_items 
    WHERE screen_location = 'refinance_step3' 
    AND content_key LIKE '%obligations%'
    AND created_at > '2025-01-12'
);

DELETE FROM content_items 
WHERE screen_location = 'refinance_step3' 
AND content_key LIKE '%obligations%'
AND created_at > '2025-01-12';
```

## Production Verification

### 1. Database Verification
```sql
-- Check that obligations exist for all screens
SELECT 
    screen_location,
    COUNT(*) as obligations_count
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.content_key LIKE '%obligations%'
    AND ci.component_type = 'dropdown_option'
    AND ct.language_code = 'he'
    AND ct.status = 'approved'
GROUP BY screen_location
ORDER BY screen_location;
```

Expected results:
- `credit_step3`: 5+ obligations
- `mortgage_step3`: 5+ obligations  
- `refinance_step3`: 5+ obligations

### 2. API Verification
```bash
# Test each screen's API endpoint
curl "https://your-domain/api/dropdowns/mortgage_step3/he" | jq '.options.mortgage_step3_obligations | length'
curl "https://your-domain/api/dropdowns/credit_step3/he" | jq '.options.credit_step3_obligations | length'
curl "https://your-domain/api/dropdowns/refinance_step3/he" | jq '.options.refinance_step3_obligations | length'
```

Expected: All should return numbers > 0 (not null)

### 3. Frontend Verification
Test these URLs with Hebrew language selected:
- https://your-domain/services/calculate-mortgage/3
- https://your-domain/services/calculate-credit/3  
- https://your-domain/services/refinance-mortgage/3

Expected: All obligations dropdowns show Hebrew options instead of "Select obligation type"

## Safety Features

### 1. Atomic Transactions
All modification scripts use BEGIN/COMMIT transactions that rollback completely if any step fails.

### 2. Backup Tables
Scripts automatically create backup tables before making changes:
- `content_items_backup_20250112`
- `content_translations_backup_20250112`

### 3. Duplicate Prevention
Scripts use `NOT EXISTS` clauses to prevent creating duplicate content.

### 4. Comprehensive Validation
Each script validates results at multiple steps and provides detailed success/failure reporting.

### 5. Read-Only Validation
Validation scripts are read-only and can be run safely at any time.

## Timeline

These scripts fix the issue discovered on **January 12, 2025** where:
1. Hebrew users saw "Select obligation type" in English on refinance mortgage step 3
2. Root cause analysis revealed missing obligations content in database  
3. Development testing confirmed the fix worked by copying from working mortgage_step3
4. Production scripts were created with full safety measures and rollback capability

## Support

If issues occur during deployment:
1. Check script output for specific error messages
2. Run validation script to assess current state
3. Use rollback scripts if needed to restore original state
4. Verify API endpoints manually with curl
5. Test frontend functionality in incognito mode

All scripts include comprehensive logging and validation to help diagnose any issues.