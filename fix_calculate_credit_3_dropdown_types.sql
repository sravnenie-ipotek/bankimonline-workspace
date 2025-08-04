-- Fix Calculate Credit Step 3 Dropdown Component Types
-- Date: 2025-08-03
-- Purpose: Update field_label components to dropdown for calculate_credit_3 screen
-- This fixes the issue where dropdowns don't show on http://localhost:5173/services/calculate-credit/3

-- Before: field_label components don't work with the dropdown API
-- After: dropdown components will be returned by /api/dropdowns/calculate_credit_3/en

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
    AND opt.component_type = 'field_option'
WHERE ci.screen_location = 'calculate_credit_3'
    AND ci.component_type IN ('field_label', 'label', 'text')
GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
HAVING COUNT(opt.id) > 0
ORDER BY ci.content_key;

-- =====================================================
-- MAIN FIX
-- =====================================================

-- Fix Calculate Credit Step 3 dropdown fields
UPDATE content_items 
SET component_type = 'dropdown'
WHERE screen_location = 'calculate_credit_3' 
AND content_key IN (
    'calculate_mortgage_main_source',       -- Main source of income
    'calculate_mortgage_has_additional',    -- Additional income
    'calculate_mortgage_debt_types'         -- Obligations/debt types
)
AND component_type = 'field_label';

-- Also update the field options to 'option' type
UPDATE content_items 
SET component_type = 'option'
WHERE screen_location = 'calculate_credit_3' 
AND component_type = 'field_option';

-- =====================================================
-- VERIFICATION QUERY - AFTER CHANGES
-- =====================================================
-- Run this after to verify the fix
SELECT 
    ci.content_key,
    ci.component_type as updated_type,
    ci.screen_location,
    COUNT(opt.id) as option_count,
    CASE 
        WHEN ci.component_type = 'dropdown' THEN '✅ FIXED'
        ELSE '❌ STILL BROKEN'
    END as status
FROM content_items ci
LEFT JOIN content_items opt ON opt.screen_location = ci.screen_location 
    AND opt.content_key LIKE ci.content_key || '_option_%' 
    AND opt.component_type = 'option'
WHERE ci.screen_location = 'calculate_credit_3'
    AND ci.content_key IN (
        'calculate_mortgage_main_source',
        'calculate_mortgage_has_additional', 
        'calculate_mortgage_debt_types'
    )
GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
ORDER BY ci.content_key;

-- =====================================================
-- TEST QUERY - Check API endpoint data
-- =====================================================
-- This query simulates what the API endpoint returns
SELECT 
    'Main dropdown fields' as section,
    ci.content_key,
    ci.component_type
FROM content_items ci
WHERE ci.screen_location = 'calculate_credit_3' 
    AND ci.component_type = 'dropdown'
    AND ci.is_active = true

UNION ALL

SELECT 
    'Options available' as section,
    ci.content_key,
    ci.component_type
FROM content_items ci
WHERE ci.screen_location = 'calculate_credit_3' 
    AND ci.component_type = 'option'
    AND ci.is_active = true
ORDER BY section, content_key;