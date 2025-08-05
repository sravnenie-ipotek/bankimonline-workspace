-- Query to get all 5 dropdowns from mortgage calculator step 1
-- These are stored under 'mortgage_calculation' screen location

WITH dropdown_content AS (
  SELECT 
    ci.id,
    ci.content_key,
    ci.component_type,
    ci.parent_id,
    ct.language,
    ct.content as translation,
    CASE 
      -- Map content keys to dropdown names from the UI
      WHEN ci.content_key LIKE '%city%' THEN '1. עיר בא נמצא הנכס (City)'
      WHEN ci.content_key LIKE '%when_needed%' THEN '2. מתי תזדקק למשכנתא (When needed)'
      WHEN ci.content_key LIKE '%type%' AND ci.content_key NOT LIKE '%component_type%' THEN '3. סוג משכנתא (Property type)'
      WHEN ci.content_key LIKE '%first_home%' THEN '4. האם מדובר בדירה ראשונה (First home)'
      WHEN ci.content_key LIKE '%property_ownership%' THEN '5. סטטוס בעלות על נכס (Property ownership)'
      ELSE 'Other'
    END as dropdown_name,
    CASE
      WHEN ci.content_key LIKE '%_ph' THEN 'placeholder'
      WHEN ci.content_key LIKE '%option%' THEN 'option'
      WHEN ci.parent_id IS NULL AND ci.component_type = 'dropdown' THEN 'title'
      ELSE 'field'
    END as content_type
  FROM content_items ci
  JOIN content_translations ct ON ci.id = ct.content_item_id
  WHERE ci.screen_location = 'mortgage_calculation'
    AND ci.is_active = true
    AND ct.status = 'approved'
    AND ct.language = 'he'  -- Hebrew language for the UI shown
    AND (
      -- City dropdown
      ci.content_key LIKE '%city%'
      -- When needed dropdown
      OR ci.content_key LIKE '%when_needed%'
      -- Property type dropdown
      OR (ci.content_key LIKE '%type%' AND ci.content_key NOT LIKE '%component_type%')
      -- First home dropdown
      OR ci.content_key LIKE '%first_home%'
      -- Property ownership dropdown
      OR ci.content_key LIKE '%property_ownership%'
    )
)
SELECT 
  dropdown_name,
  content_key,
  content_type,
  translation as hebrew_text,
  CASE 
    WHEN content_key LIKE '%option_1%' THEN 1
    WHEN content_key LIKE '%option_2%' THEN 2
    WHEN content_key LIKE '%option_3%' THEN 3
    WHEN content_key LIKE '%option_4%' THEN 4
    ELSE 0
  END as option_order
FROM dropdown_content
WHERE dropdown_name != 'Other'
ORDER BY 
  dropdown_name,
  content_type DESC,  -- title first, then placeholder, then options
  option_order;

-- Alternative query to get exact dropdown structure with parent-child relationships
WITH RECURSIVE dropdown_hierarchy AS (
  -- Get dropdown parents
  SELECT 
    ci.id,
    ci.content_key,
    ci.component_type,
    ci.parent_id,
    ct.content as hebrew_text,
    0 as level
  FROM content_items ci
  JOIN content_translations ct ON ci.id = ct.content_item_id
  WHERE ci.screen_location = 'mortgage_calculation'
    AND ci.is_active = true
    AND ct.status = 'approved'
    AND ct.language = 'he'
    AND ci.parent_id IS NULL
    AND ci.component_type = 'dropdown'
    AND (
      ci.content_key LIKE '%city%'
      OR ci.content_key LIKE '%when_needed%'
      OR (ci.content_key LIKE '%type%' AND ci.content_key NOT LIKE '%component_type%')
      OR ci.content_key LIKE '%first_home%'
      OR ci.content_key LIKE '%property_ownership%'
    )
  
  UNION ALL
  
  -- Get dropdown children (options)
  SELECT 
    ci.id,
    ci.content_key,
    ci.component_type,
    ci.parent_id,
    ct.content as hebrew_text,
    dh.level + 1
  FROM content_items ci
  JOIN content_translations ct ON ci.id = ct.content_item_id
  JOIN dropdown_hierarchy dh ON ci.parent_id = dh.id
  WHERE ci.is_active = true
    AND ct.status = 'approved'
    AND ct.language = 'he'
)
SELECT 
  CASE level
    WHEN 0 THEN content_key
    ELSE CONCAT('  └─ ', content_key)
  END as content_structure,
  hebrew_text,
  component_type
FROM dropdown_hierarchy
ORDER BY 
  CASE 
    WHEN content_key LIKE '%city%' THEN 1
    WHEN content_key LIKE '%when_needed%' THEN 2
    WHEN content_key LIKE '%type%' THEN 3
    WHEN content_key LIKE '%first_home%' THEN 4
    WHEN content_key LIKE '%property_ownership%' THEN 5
  END,
  level,
  content_key;