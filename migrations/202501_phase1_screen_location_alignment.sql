-- Phase 1.1: Screen-location Alignment Migration
-- Moves content from mortgage_calculation to proper mortgage_step1, mortgage_step2, etc.
-- Author: System
-- Date: 2025-01-30

BEGIN;

-- First, let's see what we're about to change
SELECT 
    screen_location,
    COUNT(*) as count,
    STRING_AGG(DISTINCT content_key, ', ' ORDER BY content_key) as sample_keys
FROM content_items
WHERE screen_location = 'mortgage_calculation'
GROUP BY screen_location;

-- Step 1: Move mortgage_step1 content (property details, when needed, type, etc.)
UPDATE content_items
SET screen_location = 'mortgage_step1'
WHERE screen_location = 'mortgage_calculation'
  AND content_key ~* '(city|when_needed|type|first_home|property_ownership|initial_fee|initial_payment|price|period)';

-- Step 2: Move mortgage_step2 content (personal data)
UPDATE content_items
SET screen_location = 'mortgage_step2'
WHERE screen_location = 'mortgage_calculation'
  AND content_key ~* '(name_surname|birth_date|education|citizenship|tax|children|family_status|borrowers|partner)';

-- Step 3: Move mortgage_step3 content (income data)
UPDATE content_items
SET screen_location = 'mortgage_step3'
WHERE screen_location = 'mortgage_calculation'
  AND content_key ~* '(main_source|additional|debt_types|monthly_income|sfere|company|profession|start_date)';

-- Step 4: Move mortgage_step4 content (bank offers)
UPDATE content_items
SET screen_location = 'mortgage_step4'
WHERE screen_location = 'mortgage_calculation'
  AND content_key ~* '(final|warning|parameters|profile|filter|total|monthly|select_bank)';

-- Verify the results
SELECT 
    screen_location,
    COUNT(*) as count,
    STRING_AGG(DISTINCT component_type, ', ' ORDER BY component_type) as component_types
FROM content_items
WHERE screen_location LIKE 'mortgage_step%'
GROUP BY screen_location
ORDER BY screen_location;

-- Show what's left in mortgage_calculation (should be minimal)
SELECT 
    content_key,
    component_type
FROM content_items
WHERE screen_location = 'mortgage_calculation'
ORDER BY content_key;

COMMIT;

-- Rollback command if needed:
-- BEGIN;
-- UPDATE content_items SET screen_location = 'mortgage_calculation' WHERE screen_location LIKE 'mortgage_step%';
-- COMMIT;