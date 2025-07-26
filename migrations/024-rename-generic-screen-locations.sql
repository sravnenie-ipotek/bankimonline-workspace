-- Migration: Rename generic screen locations to credit-specific names
-- Date: 2025-01-24
-- Purpose: Update screen_location values from generic names to credit-specific names for consistency

-- Update step3_header to calculate_credit_3_header
UPDATE content_items 
SET screen_location = 'calculate_credit_3_header'
WHERE screen_location = 'step3_header';

-- Update step3_personal_info to calculate_credit_3_personal_info
UPDATE content_items 
SET screen_location = 'calculate_credit_3_personal_info'
WHERE screen_location = 'step3_personal_info';

-- Update step4_header to calculate_credit_4_header
UPDATE content_items 
SET screen_location = 'calculate_credit_4_header'
WHERE screen_location = 'step4_header';

-- Update step4_employment to calculate_credit_4_employment
UPDATE content_items 
SET screen_location = 'calculate_credit_4_employment'
WHERE screen_location = 'step4_employment';

-- Update step4_income to calculate_credit_4_income
UPDATE content_items 
SET screen_location = 'calculate_credit_4_income'
WHERE screen_location = 'step4_income';

-- Verify the changes
SELECT screen_location, COUNT(*) as item_count
FROM content_items
WHERE screen_location IN (
    'calculate_credit_3_header',
    'calculate_credit_3_personal_info',
    'calculate_credit_4_header',
    'calculate_credit_4_employment',
    'calculate_credit_4_income'
)
GROUP BY screen_location
ORDER BY screen_location;