-- Fix debt_types location - should be in mortgage_step3, not mortgage_step1
-- Author: System
-- Date: 2025-01-30

BEGIN;

-- Move debt_types from mortgage_step1 to mortgage_step3 where it belongs
UPDATE content_items
SET screen_location = 'mortgage_step3'
WHERE screen_location = 'mortgage_step1'
  AND content_key LIKE '%debt_types%';

-- Also check for any other misplaced content
-- Initial payment/fee should be in step1, not step3
UPDATE content_items
SET screen_location = 'mortgage_step1'
WHERE screen_location = 'mortgage_step3'
  AND content_key LIKE '%initial_payment%';

UPDATE content_items
SET screen_location = 'mortgage_step1'
WHERE screen_location = 'mortgage_step3'
  AND content_key LIKE '%initial_fee%';

-- Verify the changes
SELECT 
    screen_location,
    COUNT(*) as count,
    STRING_AGG(DISTINCT 
        CASE 
            WHEN content_key LIKE '%debt_types%' THEN 'debt_types'
            WHEN content_key LIKE '%initial%' THEN 'initial_payment/fee'
            WHEN content_key LIKE '%main_source%' THEN 'main_source'
            WHEN content_key LIKE '%property_ownership%' THEN 'property_ownership'
            ELSE 'other'
        END, ', '
    ) as content_groups
FROM content_items
WHERE screen_location IN ('mortgage_step1', 'mortgage_step3')
  AND component_type IN ('dropdown', 'option')
GROUP BY screen_location
ORDER BY screen_location;

COMMIT;