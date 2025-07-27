-- Migration: Fix Screen Location Naming Conventions
-- Date: 2024-01-XX
-- Purpose: Align database screen_location values with documented conventions in SystemAnalyse/procceessesPagesInDB.md

-- ==================================================
-- PHASE 1: FIX MORTGAGE CALCULATOR SCREEN LOCATIONS
-- ==================================================

-- Change mortgage_calculation → mortgage_step1
UPDATE content_items 
SET screen_location = 'mortgage_step1'
WHERE screen_location = 'mortgage_calculation';

-- Change generic 'mortgage' → mortgage_step1 (assuming these are step 1 content)
UPDATE content_items 
SET screen_location = 'mortgage_step1'
WHERE screen_location = 'mortgage';

-- ==================================================
-- PHASE 2: FIX CREDIT CALCULATOR SCREEN LOCATIONS
-- ==================================================

-- Change calculate_credit_1 → credit_step1
UPDATE content_items 
SET screen_location = 'credit_step1'
WHERE screen_location = 'calculate_credit_1';

-- Change calculate_credit_2 → credit_step2
UPDATE content_items 
SET screen_location = 'credit_step2'
WHERE screen_location = 'calculate_credit_2';

-- Change calculate_credit_3 → credit_step3
UPDATE content_items 
SET screen_location = 'credit_step3'
WHERE screen_location = 'calculate_credit_3';

-- Change calculate_credit_4 → credit_step4
UPDATE content_items 
SET screen_location = 'credit_step4'
WHERE screen_location = 'calculate_credit_4';

-- ==================================================
-- PHASE 3: FIX LEGACY CREDIT STEP NAMING
-- ==================================================

-- Change calculate_credit_step1 → credit_step1
UPDATE content_items 
SET screen_location = 'credit_step1'
WHERE screen_location = 'calculate_credit_step1';

-- ==================================================
-- PHASE 4: FIX SUB-SECTION SCREEN LOCATIONS
-- ==================================================

-- Fix sub-section naming that violates conventions
-- Change calculate_credit_3_header → credit_step3_header
UPDATE content_items 
SET screen_location = 'credit_step3_header'
WHERE screen_location = 'calculate_credit_3_header';

-- Change calculate_credit_3_personal_info → credit_step3_personal_info
UPDATE content_items 
SET screen_location = 'credit_step3_personal_info'
WHERE screen_location = 'calculate_credit_3_personal_info';

-- Change calculate_credit_4_header → credit_step4_header
UPDATE content_items 
SET screen_location = 'credit_step4_header'
WHERE screen_location = 'calculate_credit_4_header';

-- Change calculate_credit_4_employment → credit_step4_employment
UPDATE content_items 
SET screen_location = 'credit_step4_employment'
WHERE screen_location = 'calculate_credit_4_employment';

-- Change calculate_credit_4_income → credit_step4_income
UPDATE content_items 
SET screen_location = 'credit_step4_income'
WHERE screen_location = 'calculate_credit_4_income';

-- ==================================================
-- VERIFICATION QUERIES
-- ==================================================

-- Check that all mortgage content now uses correct screen_locations
SELECT 'MORTGAGE CHECK' as check_type, screen_location, COUNT(*) as count
FROM content_items 
WHERE screen_location LIKE '%mortgage%'
GROUP BY screen_location
ORDER BY screen_location;

-- Check that all credit content now uses correct screen_locations
SELECT 'CREDIT CHECK' as check_type, screen_location, COUNT(*) as count
FROM content_items 
WHERE screen_location LIKE '%credit%'
GROUP BY screen_location
ORDER BY screen_location;

-- Check for any remaining non-compliant screen_locations
SELECT 'NON-COMPLIANT CHECK' as check_type, screen_location, COUNT(*) as count
FROM content_items 
WHERE screen_location NOT IN (
    'mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4',
    'credit_step1', 'credit_step2', 'credit_step3', 'credit_step4',
    'credit_step3_header', 'credit_step3_personal_info', 
    'credit_step4_header', 'credit_step4_employment', 'credit_step4_income',
    'refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4',
    'sidebar', 'footer', 'bank_offers', 'bank_comparison',
    'home_page', 'about_page', 'contacts_page',
    'admin_dashboard', 'admin_content', 'admin_users'
)
AND screen_location IS NOT NULL
GROUP BY screen_location
ORDER BY screen_location;

-- Summary report
SELECT 
    'MIGRATION SUMMARY' as report_type,
    COUNT(*) as total_content_items,
    COUNT(DISTINCT screen_location) as unique_screen_locations
FROM content_items 
WHERE screen_location IS NOT NULL; 