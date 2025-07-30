# Mortgage Step 1 Screen Location Mapping Issue

## Executive Summary

There is a critical mismatch between the URL routing and database screen_location values for the mortgage calculator step 1. The frontend expects content at `mortgage_step1` but most content is stored under `mortgage_calculation`.

## The Problem

### URL vs Database Mismatch
- **Frontend URL**: `/services/calculate-mortgage/1` (step 1)
- **Expected screen_location**: `mortgage_step1`
- **Actual content location**: `mortgage_calculation`

### Current State
1. **mortgage_step1** contains:
   - Only 1 dropdown with key `app.mortgage.step1.dropdown.property_ownership`
   - Incorrectly shows "Credit Calculator" as the English value
   - Missing all actual form fields

2. **mortgage_calculation** contains:
   - 168 text items including all step 1 form fields:
     - Property ownership dropdown (with correct options)
     - Property price field
     - Initial fee (down payment) field
     - Loan period field
     - City dropdown
     - First home dropdown
     - When needed dropdown

## Root Cause Analysis

The content migration process incorrectly assigned screen_location values. All the form fields that should be in `mortgage_step1` were migrated to `mortgage_calculation` instead.

## Evidence

### Database Query Results

```sql
-- mortgage_step1 has only 1 item:
SELECT * FROM content_items WHERE screen_location = 'mortgage_step1';
-- Result: 1 row (app.mortgage.step1.dropdown.property_ownership)

-- mortgage_calculation has the actual step 1 content:
SELECT content_key FROM content_items 
WHERE screen_location = 'mortgage_calculation' 
AND content_key LIKE '%calculate_mortgage%';
-- Result: Multiple rows including property_ownership, price, initial_fee, period, etc.
```

### View Definition
The `view_mortgage_step1` correctly filters by `screen_location = 'mortgage_step1'` but finds almost no content because it's in the wrong location.

## Impact

1. The mortgage calculator step 1 page cannot display its dropdowns and form fields
2. The DROPDOWNS_BY_SCREEN.md report correctly shows only 1 dropdown for mortgage_step1
3. Users cannot complete the mortgage calculation process

## Recommended Solution

### Option 1: Update Database Content (Recommended)
Move all relevant content from `mortgage_calculation` to `mortgage_step1`:

```sql
-- Update all step 1 related content
UPDATE content_items 
SET screen_location = 'mortgage_step1'
WHERE screen_location = 'mortgage_calculation'
AND content_key IN (
    'app.mortgage.form.calculate_mortgage_property_ownership',
    'app.mortgage.form.calculate_mortgage_property_ownership_option_1',
    'app.mortgage.form.calculate_mortgage_property_ownership_option_2',
    'app.mortgage.form.calculate_mortgage_property_ownership_option_3',
    'app.mortgage.form.calculate_mortgage_property_ownership_ph',
    'app.mortgage.form.calculate_mortgage_price',
    'app.mortgage.form.calculate_mortgage_initial_fee',
    'app.mortgage.form.calculate_mortgage_period',
    'app.mortgage.form.calculate_mortgage_city',
    'app.mortgage.form.calculate_mortgage_first',
    'app.mortgage.form.calculate_mortgage_first_options_1',
    'app.mortgage.form.calculate_mortgage_first_options_2',
    'app.mortgage.form.calculate_mortgage_first_options_3',
    'app.mortgage.form.calculate_mortgage_when',
    'app.mortgage.form.calculate_mortgage_when_options_1',
    'app.mortgage.form.calculate_mortgage_when_options_2',
    'app.mortgage.form.calculate_mortgage_when_options_3',
    'app.mortgage.form.calculate_mortgage_when_options_4'
);
```

### Option 2: Update Frontend Code
Change the frontend to look for content in `mortgage_calculation` instead of `mortgage_step1` for step 1.

### Option 3: Create a Mapping Table
Create a table that maps URLs to screen_locations to handle such mismatches.

## Additional Findings

1. There are similar screen_location entries that might have the same issue:
   - `mortgage_step2`, `mortgage_step3`, `mortgage_step4` - should verify these too
   - `refinance_credit_1`, `refinance_credit_2`, etc. - naming inconsistency

2. The view `view_mortgage_calculator` might be aggregating all steps - need to verify its usage

3. Content type inconsistency: `mortgage_step1` uses 'json' type while others use 'text'

## Next Steps

1. Verify which screen_location the frontend actually queries
2. Check if other steps (2, 3, 4) have similar issues
3. Create a migration script to fix the screen_location values
4. Update the incorrectly labeled "Credit Calculator" content
5. Re-run the DROPDOWNS_BY_SCREEN report after fixes