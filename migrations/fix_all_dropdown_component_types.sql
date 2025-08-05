-- Migration: Fix All Dropdown Component Types
-- Date: 2025-01-22
-- Purpose: Fix main dropdown fields that have options but wrong component_type
-- Strategy: Update fields that have _option_* children to component_type = 'dropdown'

-- =====================================================
-- VERIFICATION QUERY - BEFORE CHANGES
-- =====================================================
-- Run this first to see current state
SELECT 
    ci.content_key,
    ci.component_type as current_type,
    ci.screen_location,
    COUNT(opt.id) as option_count,
    CASE 
        WHEN ci.component_type = 'dropdown' THEN '✅ ALREADY CORRECT'
        WHEN COUNT(opt.id) > 0 THEN '❌ NEEDS FIX (has options but not dropdown)'
        ELSE '⚠️ NO OPTIONS'
    END as status
FROM content_items ci
LEFT JOIN content_items opt ON opt.screen_location = ci.screen_location 
    AND opt.content_key LIKE ci.content_key || '_option_%' 
    AND opt.component_type = 'option'
WHERE ci.component_type IN ('text', 'label', 'field_label')
GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
HAVING COUNT(opt.id) > 0
ORDER BY ci.screen_location, ci.content_key;

-- =====================================================
-- STEP 1: CREDIT STEPS FIXES
-- =====================================================

-- Credit Step 1 (2 fields)
UPDATE content_items 
SET component_type = 'dropdown'
WHERE screen_location = 'credit_step1' 
AND content_key IN ('calculate_credit_prolong', 'calculate_credit_target')
AND component_type = 'field_label';

-- Credit Step 2 (7 fields)  
UPDATE content_items 
SET component_type = 'dropdown'
WHERE screen_location = 'credit_step2' 
AND content_key IN (
    'calculate_credit_citizenship',
    'calculate_credit_education', 
    'calculate_credit_family_status',
    'calculate_credit_foreigner',
    'calculate_credit_medical_insurance',
    'calculate_credit_public_person',
    'calculate_credit_us_tax_reporting'
)
AND component_type = 'field_label';

-- Credit Step 3 (4 fields)
UPDATE content_items 
SET component_type = 'dropdown'
WHERE screen_location = 'credit_step3' 
AND content_key IN (
    'calculate_credit_additional_income',
    'calculate_credit_existing_debts',
    'calculate_credit_main_source_income',
    'calculate_credit_professional_sphere'
)
AND component_type = 'field_label';

-- =====================================================
-- STEP 2: MORTGAGE STEPS FIXES  
-- =====================================================

-- Mortgage Step 1 (6 fields)
UPDATE content_items 
SET component_type = 'dropdown'
WHERE screen_location = 'mortgage_step1' 
AND content_key IN (
    'calculate_mortgage_city',
    'calculate_mortgage_debt_types',
    'calculate_mortgage_family_status', 
    'calculate_mortgage_has_additional',
    'calculate_mortgage_main_source',
    'mortgage_property_type'
)
AND component_type IN ('label', 'text', 'field_label');

-- Mortgage Step 2 (3 fields)
UPDATE content_items 
SET component_type = 'dropdown'
WHERE screen_location = 'mortgage_step2' 
AND content_key IN (
    'calculate_mortgage_borrowers',
    'calculate_mortgage_children18',
    'calculate_mortgage_citizenship'
)
AND component_type = 'label';

-- Mortgage Step 3 (1 field)
UPDATE content_items 
SET component_type = 'dropdown'
WHERE screen_location = 'mortgage_step3' 
AND content_key = 'calculate_mortgage_bank'
AND component_type = 'label';

-- =====================================================
-- STEP 3: REFINANCE STEPS FIXES
-- =====================================================

-- Refinance Credit 2 (3 fields)
UPDATE content_items 
SET component_type = 'dropdown'
WHERE screen_location = 'refinance_credit_2' 
AND content_key IN (
    'calculate_mortgage_borrowers',
    'calculate_mortgage_children18', 
    'calculate_mortgage_citizenship'
)
AND component_type = 'label';

-- Refinance Mortgage 1 (1 field)
UPDATE content_items 
SET component_type = 'dropdown'
WHERE screen_location = 'refinance_mortgage_1' 
AND content_key = 'mortgage_refinance_why'
AND component_type = 'text';

-- =====================================================
-- VERIFICATION QUERY - AFTER CHANGES
-- =====================================================
-- Run this to verify all fixes were applied correctly
SELECT 
    ci.content_key,
    ci.component_type as new_type,
    ci.screen_location,
    COUNT(opt.id) as option_count,
    CASE 
        WHEN ci.component_type = 'dropdown' AND COUNT(opt.id) > 0 THEN '✅ FIXED CORRECTLY'
        WHEN ci.component_type = 'dropdown' AND COUNT(opt.id) = 0 THEN '⚠️ DROPDOWN BUT NO OPTIONS'
        WHEN ci.component_type != 'dropdown' AND COUNT(opt.id) > 0 THEN '❌ STILL BROKEN'
        ELSE '✅ OK'
    END as status
FROM content_items ci
LEFT JOIN content_items opt ON opt.screen_location = ci.screen_location 
    AND opt.content_key LIKE ci.content_key || '_option_%' 
    AND opt.component_type = 'option'
WHERE ci.content_key IN (
    -- Credit fields
    'calculate_credit_prolong', 'calculate_credit_target',
    'calculate_credit_citizenship', 'calculate_credit_education', 'calculate_credit_family_status',
    'calculate_credit_foreigner', 'calculate_credit_medical_insurance', 'calculate_credit_public_person', 'calculate_credit_us_tax_reporting',
    'calculate_credit_additional_income', 'calculate_credit_existing_debts', 'calculate_credit_main_source_income', 'calculate_credit_professional_sphere',
    -- Mortgage fields  
    'calculate_mortgage_city', 'calculate_mortgage_debt_types', 'calculate_mortgage_family_status', 
    'calculate_mortgage_has_additional', 'calculate_mortgage_main_source', 'mortgage_property_type',
    'calculate_mortgage_borrowers', 'calculate_mortgage_children18', 'calculate_mortgage_citizenship',
    'calculate_mortgage_bank',
    -- Refinance fields
    'mortgage_refinance_why'
)
GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
ORDER BY ci.screen_location, ci.content_key;

-- =====================================================
-- SUMMARY STATISTICS
-- =====================================================
-- Final summary of all dropdown fields
SELECT 
    screen_location,
    COUNT(*) as total_dropdowns,
    SUM(CASE WHEN component_type = 'dropdown' THEN 1 ELSE 0 END) as correct_dropdowns,
    SUM(CASE WHEN component_type != 'dropdown' THEN 1 ELSE 0 END) as still_broken
FROM content_items 
WHERE content_key IN (
    'calculate_credit_prolong', 'calculate_credit_target',
    'calculate_credit_citizenship', 'calculate_credit_education', 'calculate_credit_family_status',
    'calculate_credit_foreigner', 'calculate_credit_medical_insurance', 'calculate_credit_public_person', 'calculate_credit_us_tax_reporting',
    'calculate_credit_additional_income', 'calculate_credit_existing_debts', 'calculate_credit_main_source_income', 'calculate_credit_professional_sphere',
    'calculate_mortgage_city', 'calculate_mortgage_debt_types', 'calculate_mortgage_family_status', 
    'calculate_mortgage_has_additional', 'calculate_mortgage_main_source', 'mortgage_property_type',
    'calculate_mortgage_borrowers', 'calculate_mortgage_children18', 'calculate_mortgage_citizenship',
    'calculate_mortgage_bank', 'mortgage_refinance_why'
)
GROUP BY screen_location
ORDER BY screen_location; 