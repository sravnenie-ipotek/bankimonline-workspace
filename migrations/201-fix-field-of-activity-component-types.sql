-- Migration: Fix Field of Activity Component Types
-- Update component types to match API endpoint expectations

-- Update main dropdown container to use dropdown_container
UPDATE content_items 
SET component_type = 'dropdown_container' 
WHERE content_key = 'mortgage_step3_field_of_activity' 
AND component_type = 'dropdown';

-- Update dropdown options to use dropdown_option
UPDATE content_items 
SET component_type = 'dropdown_option' 
WHERE content_key LIKE 'mortgage_step3_field_of_activity_%' 
AND component_type = 'option'
AND content_key != 'mortgage_step3_field_of_activity_label'
AND content_key != 'mortgage_step3_field_of_activity_ph'; 