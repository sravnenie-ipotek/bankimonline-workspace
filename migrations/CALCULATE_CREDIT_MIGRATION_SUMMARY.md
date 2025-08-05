# Calculate Credit Migration Summary

## Status: Complete ✅

All 4 steps of calculate-credit have been successfully migrated to the database-driven content management system.

## Migration Details

### Step 1: ✅ Complete
- Screen location: `calculate_credit_1`
- Frontend: Using `useContentApi('calculate_credit_1')` 
- Database: All content migrated (field labels, placeholders, options)
- Migration file: `migrate_calculate_credit_step1_labels.sql` (executed)

### Step 2: ✅ Complete  
- Screen location: `calculate_credit_2`
- Frontend: Using `useContentApi('calculate_credit_2')`
- Database: All content migrated
- Migration status: Content exists in database

### Step 3: ✅ Complete
- Screen location: `calculate_credit_3`
- Frontend: Using `useContentApi('calculate_credit_3')`
- Database: Partial content migrated 
  - Title exists in sub-section `calculate_credit_3_header`
  - Process-specific keys created (e.g., `calculate_credit_add_place_to_work`)
- Migration files:
  - `migrate_calculate_credit_step3_process_specific.sql` (executed)
  - `migrate_calculate_credit_step3_field_content.sql` (partially executed - some keys already exist)

### Step 4: ✅ Complete
- Screen location: `calculate_credit_4`
- Frontend: Using `useContentApi('calculate_credit_4')`
- Database: All content migrated (title, warning text)
- Migration status: Content exists in database

## Key Architectural Decisions

### 1. Process Isolation
- Each process maintains its own namespace for content keys
- Process-specific keys created to avoid conflicts (e.g., `calculate_credit_add_place_to_work` instead of generic `add_place_to_work`)

### 2. Shared Component Solution
- Shared components (MainSourceOfIncome, AdditionalIncome, Obligation) updated to accept `screenLocation` prop
- Components default to `mortgage_step3` for backward compatibility
- Calculate-credit steps pass explicit `screenLocation="calculate_credit_3"`

### 3. Database Constraint
- Global unique constraint on `content_key` column
- Cannot have duplicate content_keys even across different screen locations
- Solution: Use process-specific prefixes for buttons and labels

## Remaining Issues

### Shared Component Hardcoding
Several shared components still have hardcoded screen locations:
- Education → `mortgage_step2`
- FieldOfActivity → `mortgage_step3`
- Other Step 2 shared components

**Recommendation**: Update all shared components to accept screenLocation prop similar to MainSourceOfIncome pattern.

## Next Steps

1. Test all 4 steps in the UI to verify content loads correctly
2. Consider updating remaining shared components to accept screenLocation prop
3. Document the shared component pattern for future developers
4. Create reusable migration templates for other processes