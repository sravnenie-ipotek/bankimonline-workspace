-- Fix remaining dropdown content in mortgage_calculation
-- Move them to appropriate mortgage_step locations
-- Author: System
-- Date: 2025-01-30

BEGIN;

-- Move first_home options to mortgage_step1
UPDATE content_items
SET screen_location = 'mortgage_step1'
WHERE screen_location = 'mortgage_calculation'
  AND content_key LIKE '%first%'
  AND component_type = 'option';

-- Move when_needed options to mortgage_step1
UPDATE content_items
SET screen_location = 'mortgage_step1'
WHERE screen_location = 'mortgage_calculation'
  AND content_key LIKE '%when%'
  AND component_type = 'option';

-- Move sphere (field of work) to mortgage_step3
UPDATE content_items
SET screen_location = 'mortgage_step3'
WHERE screen_location = 'mortgage_calculation'
  AND content_key LIKE '%sphere%';

-- Move bank dropdown to mortgage_step3
UPDATE content_items
SET screen_location = 'mortgage_step3'
WHERE screen_location = 'mortgage_calculation'
  AND content_key = 'mortgage_calculation.field.bank';

-- Move end_date to mortgage_step3 (it's related to employment)
UPDATE content_items
SET screen_location = 'mortgage_step3'
WHERE screen_location = 'mortgage_calculation'
  AND content_key = 'mortgage_calculation.field.end_date';

-- Move any remaining dropdown-related items
UPDATE content_items
SET screen_location = CASE
    WHEN content_key LIKE '%personal%' OR content_key LIKE '%birth%' OR content_key LIKE '%family%' THEN 'mortgage_step2'
    WHEN content_key LIKE '%income%' OR content_key LIKE '%employment%' OR content_key LIKE '%work%' THEN 'mortgage_step3'
    WHEN content_key LIKE '%offer%' OR content_key LIKE '%bank_offer%' THEN 'mortgage_step4'
    ELSE 'mortgage_step1'
  END
WHERE screen_location = 'mortgage_calculation'
  AND component_type IN ('dropdown', 'option', 'label', 'placeholder');

-- Check what's left in mortgage_calculation
SELECT 
    component_type,
    COUNT(*) as count
FROM content_items
WHERE screen_location = 'mortgage_calculation'
GROUP BY component_type
ORDER BY count DESC;

-- Show the moved items summary
SELECT 
    screen_location,
    COUNT(*) as total_items,
    COUNT(CASE WHEN component_type = 'dropdown' THEN 1 END) as dropdowns,
    COUNT(CASE WHEN component_type = 'option' THEN 1 END) as options
FROM content_items
WHERE screen_location LIKE 'mortgage_step%'
GROUP BY screen_location
ORDER BY screen_location;

COMMIT;