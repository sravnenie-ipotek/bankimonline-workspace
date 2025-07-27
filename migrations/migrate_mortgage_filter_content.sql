-- ================================================================
-- MORTGAGE FILTER CONTENT MIGRATION
-- Following @translationRules conventions exactly
-- Screen location: mortgage_step4 (for results/filtering page)
-- ================================================================

BEGIN;

-- Clean up any existing mortgage filter content first
DELETE FROM content_translations 
WHERE content_item_id IN (
  SELECT id FROM content_items 
  WHERE screen_location = 'mortgage_step4' 
  AND content_key LIKE 'mortgage_filter%'
);

DELETE FROM content_items 
WHERE screen_location = 'mortgage_step4' 
AND content_key LIKE 'mortgage_filter%';

-- Insert content items for mortgage filter following translationRules patterns
INSERT INTO content_items (content_key, component_type, category, screen_location, is_active) VALUES
-- Filter Title and Placeholder
('mortgage_filter_title', 'field_label', 'filter', 'mortgage_step4', true),
('mortgage_filter_placeholder', 'placeholder', 'filter', 'mortgage_step4', true),

-- Filter Options (sequential numbering as per rules)
('mortgage_filter_option_1', 'option', 'filter', 'mortgage_step4', true), -- All Programs
('mortgage_filter_option_2', 'option', 'filter', 'mortgage_step4', true), -- Prime Rate
('mortgage_filter_option_3', 'option', 'filter', 'mortgage_step4', true), -- Fixed Rate
('mortgage_filter_option_4', 'option', 'filter', 'mortgage_step4', true); -- Variable Rate

-- English translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 
  CASE ci.content_key
    -- Filter Labels
    WHEN 'mortgage_filter_title' THEN 'Mortgage Type'
    WHEN 'mortgage_filter_placeholder' THEN 'Select mortgage type'
    
    -- Filter Options
    WHEN 'mortgage_filter_option_1' THEN 'All Mortgage Programs'
    WHEN 'mortgage_filter_option_2' THEN 'Prime Rate Mortgages'
    WHEN 'mortgage_filter_option_3' THEN 'Fixed Rate Mortgages'
    WHEN 'mortgage_filter_option_4' THEN 'Variable Rate Mortgages'
  END, 'approved'
FROM content_items ci
WHERE ci.screen_location = 'mortgage_step4' 
AND ci.content_key LIKE 'mortgage_filter%';

-- Hebrew translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 
  CASE ci.content_key
    -- Filter Labels
    WHEN 'mortgage_filter_title' THEN 'סוג משכנתא'
    WHEN 'mortgage_filter_placeholder' THEN 'בחר סוג משכנתא'
    
    -- Filter Options
    WHEN 'mortgage_filter_option_1' THEN 'כל תוכניות המשכנתא'
    WHEN 'mortgage_filter_option_2' THEN 'משכנתאות בריבית פריים'
    WHEN 'mortgage_filter_option_3' THEN 'משכנתאות בריבית קבועה'
    WHEN 'mortgage_filter_option_4' THEN 'משכנתאות בריבית משתנה'
  END, 'approved'
FROM content_items ci
WHERE ci.screen_location = 'mortgage_step4' 
AND ci.content_key LIKE 'mortgage_filter%';

-- Russian translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 
  CASE ci.content_key
    -- Filter Labels
    WHEN 'mortgage_filter_title' THEN 'Тип ипотеки'
    WHEN 'mortgage_filter_placeholder' THEN 'Выберите тип ипотеки'
    
    -- Filter Options
    WHEN 'mortgage_filter_option_1' THEN 'Все программы ипотеки'
    WHEN 'mortgage_filter_option_2' THEN 'Ипотека по основной ставке'
    WHEN 'mortgage_filter_option_3' THEN 'Ипотека с фиксированной ставкой'
    WHEN 'mortgage_filter_option_4' THEN 'Ипотека с переменной ставкой'
  END, 'approved'
FROM content_items ci
WHERE ci.screen_location = 'mortgage_step4' 
AND ci.content_key LIKE 'mortgage_filter%';

COMMIT;

-- Verify the migration
SELECT 
  ci.content_key,
  ci.component_type,
  ci.category,
  ci.screen_location,
  ct_en.content_value AS english,
  ct_he.content_value AS hebrew,
  ct_ru.content_value AS russian
FROM content_items ci
LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
WHERE ci.screen_location = 'mortgage_step4' 
AND ci.content_key LIKE 'mortgage_filter%'
ORDER BY ci.content_key; 