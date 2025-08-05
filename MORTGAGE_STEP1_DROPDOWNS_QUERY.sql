-- Complete query to get all 5 dropdowns from mortgage calculator step 1
-- These dropdowns are shown in the Hebrew UI screenshot

-- Query to get all dropdown content with Hebrew translations
WITH dropdown_content AS (
  SELECT 
    ci.id,
    ci.content_key,
    ci.component_type,
    ct.content_value as hebrew_text,
    ct.language_code,
    CASE 
      -- Map content keys to the 5 dropdowns visible in the UI
      WHEN ci.content_key LIKE 'mortgage_calculation.field.city%' THEN '1. עיר בא נמצא הנכס'
      WHEN ci.content_key LIKE 'mortgage_calculation.field.when_needed%' THEN '2. מתי תזדקק למשכנתא'
      WHEN ci.content_key LIKE 'mortgage_calculation.field.type%' THEN '3. סוג משכנתא'
      WHEN ci.content_key LIKE 'mortgage_calculation.field.first_home%' THEN '4. האם מדובר בדירה ראשונה'
      WHEN ci.content_key LIKE 'mortgage_calculation.field.property_ownership%' THEN '5. סטטוס בעלות על נכס'
    END as dropdown_name,
    CASE
      WHEN ci.content_key LIKE '%_ph' THEN 'placeholder'
      WHEN ci.content_key LIKE '%_option_%' THEN 'option'
      ELSE 'title'
    END as element_type,
    CASE 
      WHEN ci.content_key LIKE '%_option_1' THEN 1
      WHEN ci.content_key LIKE '%_option_2' THEN 2
      WHEN ci.content_key LIKE '%_option_3' THEN 3
      WHEN ci.content_key LIKE '%_option_4' THEN 4
      ELSE 0
    END as option_order
  FROM content_items ci
  JOIN content_translations ct ON ci.id = ct.content_item_id
  WHERE ci.screen_location = 'mortgage_calculation'
    AND ci.is_active = true
    AND ct.status = 'approved'
    AND ct.language_code = 'he'  -- Hebrew language
    AND ci.content_key IN (
      -- City dropdown
      'mortgage_calculation.field.city',
      'mortgage_calculation.field.city_ph',
      
      -- When needed dropdown
      'mortgage_calculation.field.when_needed',
      'mortgage_calculation.field.when_needed_ph',
      'mortgage_calculation.field.when_needed_option_1',
      'mortgage_calculation.field.when_needed_option_2',
      'mortgage_calculation.field.when_needed_option_3',
      'mortgage_calculation.field.when_needed_option_4',
      
      -- Property type dropdown
      'mortgage_calculation.field.type',
      'mortgage_calculation.field.type_ph',
      'mortgage_calculation.field.type_option_1',
      'mortgage_calculation.field.type_option_2',
      'mortgage_calculation.field.type_option_3',
      'mortgage_calculation.field.type_option_4',
      
      -- First home dropdown
      'mortgage_calculation.field.first_home',
      'mortgage_calculation.field.first_home_ph',
      'mortgage_calculation.field.first_home_option_1',
      'mortgage_calculation.field.first_home_option_2',
      'mortgage_calculation.field.first_home_option_3',
      
      -- Property ownership dropdown
      'mortgage_calculation.field.property_ownership',
      'mortgage_calculation.field.property_ownership_ph',
      'mortgage_calculation.field.property_ownership_option_1',
      'mortgage_calculation.field.property_ownership_option_2',
      'mortgage_calculation.field.property_ownership_option_3'
    )
)
SELECT 
  dropdown_name,
  element_type,
  content_key,
  hebrew_text,
  option_order
FROM dropdown_content
WHERE dropdown_name IS NOT NULL
ORDER BY 
  dropdown_name,
  CASE element_type 
    WHEN 'title' THEN 1
    WHEN 'placeholder' THEN 2
    WHEN 'option' THEN 3
  END,
  option_order;

-- Summary of what each dropdown contains:
-- 1. City (עיר בא נמצא הנכס): Dynamic dropdown populated from API /api/get-cities
-- 2. When Needed (מתי תזדקק למשכנתא): 4 time period options
-- 3. Property Type (סוג משכנתא): 5 property type options
-- 4. First Home (האם מדובר בדירה ראשונה): 3 ownership status options
-- 5. Property Ownership (סטטוס בעלות על נכס): 3 options that affect LTV ratios (75%, 50%, 70%)