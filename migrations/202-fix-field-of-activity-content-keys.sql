-- Migration: Fix Field of Activity Content Keys
-- Update content keys to use the correct dot notation pattern

-- Update main dropdown container
UPDATE content_items 
SET content_key = 'mortgage_step3.field.field_of_activity' 
WHERE content_key = 'mortgage_step3_field_of_activity';

-- Update dropdown options
UPDATE content_items 
SET content_key = 'mortgage_step3.field.field_of_activity_agriculture' 
WHERE content_key = 'mortgage_step3_field_of_activity_agriculture';

UPDATE content_items 
SET content_key = 'mortgage_step3.field.field_of_activity_technology' 
WHERE content_key = 'mortgage_step3_field_of_activity_technology';

UPDATE content_items 
SET content_key = 'mortgage_step3.field.field_of_activity_healthcare' 
WHERE content_key = 'mortgage_step3_field_of_activity_healthcare';

UPDATE content_items 
SET content_key = 'mortgage_step3.field.field_of_activity_education' 
WHERE content_key = 'mortgage_step3_field_of_activity_education';

UPDATE content_items 
SET content_key = 'mortgage_step3.field.field_of_activity_finance' 
WHERE content_key = 'mortgage_step3_field_of_activity_finance';

UPDATE content_items 
SET content_key = 'mortgage_step3.field.field_of_activity_real_estate' 
WHERE content_key = 'mortgage_step3_field_of_activity_real_estate';

UPDATE content_items 
SET content_key = 'mortgage_step3.field.field_of_activity_construction' 
WHERE content_key = 'mortgage_step3_field_of_activity_construction';

UPDATE content_items 
SET content_key = 'mortgage_step3.field.field_of_activity_retail' 
WHERE content_key = 'mortgage_step3_field_of_activity_retail';

UPDATE content_items 
SET content_key = 'mortgage_step3.field.field_of_activity_manufacturing' 
WHERE content_key = 'mortgage_step3_field_of_activity_manufacturing';

UPDATE content_items 
SET content_key = 'mortgage_step3.field.field_of_activity_government' 
WHERE content_key = 'mortgage_step3_field_of_activity_government';

UPDATE content_items 
SET content_key = 'mortgage_step3.field.field_of_activity_transport' 
WHERE content_key = 'mortgage_step3_field_of_activity_transport';

UPDATE content_items 
SET content_key = 'mortgage_step3.field.field_of_activity_consulting' 
WHERE content_key = 'mortgage_step3_field_of_activity_consulting';

UPDATE content_items 
SET content_key = 'mortgage_step3.field.field_of_activity_entertainment' 
WHERE content_key = 'mortgage_step3_field_of_activity_entertainment';

UPDATE content_items 
SET content_key = 'mortgage_step3.field.field_of_activity_other' 
WHERE content_key = 'mortgage_step3_field_of_activity_other';

-- Update placeholder
UPDATE content_items 
SET content_key = 'mortgage_step3.field.field_of_activity_ph' 
WHERE content_key = 'mortgage_step3_field_of_activity_ph';

-- Update label
UPDATE content_items 
SET content_key = 'mortgage_step3.field.field_of_activity_label' 
WHERE content_key = 'mortgage_step3_field_of_activity_label'; 