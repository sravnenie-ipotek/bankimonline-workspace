# Duplicate Data Issue - Root Cause and Fix

## Problem Description

The user interface was showing duplicate entries in the mortgage calculator dropdown data. Specifically, the "Это ваша первая квартира?" (Is this your first apartment?) field was appearing twice with identical content.

## Root Cause Analysis

### Database Investigation
1. **Initial Check**: No actual database duplicates were found in the `content_items` table
2. **Screen Location Analysis**: Found that content was incorrectly placed in multiple screen locations
3. **Content Key Analysis**: Discovered that the same content existed with different content keys:
   - `mortgage_calculation.field.first_home` (incorrectly placed in `mortgage_step1` screen)
   - `mortgage_step1.field.first_home` (correctly placed in `mortgage_step1` screen)

### API Behavior
The dropdown API endpoint (`/api/dropdowns/mortgage_step1/ru`) was correctly filtering by screen location, but the database contained content with the wrong content key prefix in the `mortgage_step1` screen location.

## The Issue

During the content migration process, some content was copied from `mortgage_calculation` to `mortgage_step1` but retained the original content key prefix instead of being updated to the correct `mortgage_step1.field.*` format.

### Affected Content
The following content keys were incorrectly placed in the `mortgage_step1` screen location:
- `mortgage_calculation.field.first_home`
- `mortgage_calculation.field.first_home_ph`
- `mortgage_calculation.field.when_needed`
- `mortgage_calculation.field.when_needed_ph`
- `mortgage_calculation.field.property_ownership`
- `mortgage_calculation.field.property_ownership_ph`
- `mortgage_calculation.field.type`
- `mortgage_calculation.field.type_ph`
- And 7 other fields...

## Solution

### Fix Applied
1. **Identified Incorrect Content**: Found all content keys starting with `mortgage_calculation.field.` in the `mortgage_step1` screen location
2. **Removed Duplicates**: Deleted 15 incorrectly placed content items from the `mortgage_step1` screen location
3. **Verified Fix**: Confirmed that only the correct `mortgage_step1.field.*` content remains

### Before vs After
**Before Fix:**
- 7 items for first_home in mortgage_step1 (including duplicates)
- Mixed content keys: `mortgage_calculation.field.*` and `mortgage_step1.field.*`

**After Fix:**
- 5 items for first_home in mortgage_step1 (only correct ones)
- Consistent content keys: Only `mortgage_step1.field.*`

## Verification

### Database Checks
- ✅ No database duplicates found
- ✅ No content keys in multiple screen locations
- ✅ Only correct content keys remain in mortgage_step1

### API Response
The dropdown API now returns clean data without duplicates because:
1. Only one set of content exists per field
2. Content keys are consistent with screen location
3. No conflicting data from different screen locations

## Prevention

To prevent this issue in the future:
1. **Migration Scripts**: Ensure content migration scripts properly update content keys when moving between screen locations
2. **Validation**: Add database constraints or validation to prevent content keys from being placed in wrong screen locations
3. **Testing**: Implement automated tests to verify content key consistency after migrations

## Files Modified
- `fix-duplicate-content-keys.js` - Script to identify and remove duplicate content
- `test-dropdown-duplicates.js` - Script to test and verify the fix
- `check-screen-locations.js` - Script to analyze screen location distribution

## Status
✅ **RESOLVED** - Duplicate data issue has been fixed and verified. 