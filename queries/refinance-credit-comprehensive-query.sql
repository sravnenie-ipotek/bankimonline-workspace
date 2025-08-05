-- =====================================================
-- COMPREHENSIVE REFINANCE CREDIT CONTENT QUERY
-- =====================================================
-- Purpose: Retrieve ALL content for refinance credit calculator across all steps
-- URLs covered:
--   - http://localhost:5173/services/refinance-credit/1
--   - http://localhost:5173/services/refinance-credit/2
--   - http://localhost:5173/services/refinance-credit/3
--   - http://localhost:5173/services/refinance-credit/4
--
-- API Usage:
--   - GET /api/content/refinance_credit_1/en (or he, ru)
--   - GET /api/content/refinance_credit_2/en (or he, ru)
--   - GET /api/content/refinance_credit_3/en (or he, ru)
--   - GET /api/content/refinance_credit_4/en (or he, ru)
-- =====================================================

-- Summary of refinance credit content by step
SELECT 
    screen_location,
    COUNT(DISTINCT ci.id) as total_items,
    COUNT(DISTINCT CASE WHEN ct_en.id IS NOT NULL THEN ci.id END) as items_with_english,
    COUNT(DISTINCT CASE WHEN ct_he.id IS NOT NULL THEN ci.id END) as items_with_hebrew,
    COUNT(DISTINCT CASE WHEN ct_ru.id IS NOT NULL THEN ci.id END) as items_with_russian,
    COUNT(DISTINCT ci.component_type) as component_types,
    COUNT(DISTINCT ci.category) as categories
FROM content_items ci
LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
WHERE ci.screen_location LIKE 'refinance_credit_%'
GROUP BY screen_location
ORDER BY screen_location;

-- Detailed content for all refinance credit steps with all languages
SELECT 
    ci.screen_location,
    ci.content_key,
    ci.component_type,
    ci.category,
    ci.description,
    -- English translation
    ct_en.content_value as value_en,
    ct_en.status as status_en,
    -- Hebrew translation  
    ct_he.content_value as value_he,
    ct_he.status as status_he,
    -- Russian translation
    ct_ru.content_value as value_ru,
    ct_ru.status as status_ru,
    -- Metadata
    ci.legacy_translation_key,
    ci.migration_status,
    ci.is_active,
    ci.created_at,
    ci.updated_at
FROM content_items ci
-- Join translations for all languages
LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
WHERE ci.screen_location LIKE 'refinance_credit_%'
ORDER BY 
    CASE 
        WHEN ci.screen_location = 'refinance_credit_1' THEN 1
        WHEN ci.screen_location = 'refinance_credit_2' THEN 2
        WHEN ci.screen_location = 'refinance_credit_3' THEN 3
        WHEN ci.screen_location = 'refinance_credit_4' THEN 4
    END,
    ci.content_key;

-- Component type distribution for refinance credit
SELECT 
    screen_location,
    component_type,
    COUNT(*) as count
FROM content_items
WHERE screen_location LIKE 'refinance_credit_%'
GROUP BY screen_location, component_type
ORDER BY screen_location, count DESC;

-- Category distribution for refinance credit
SELECT 
    screen_location,
    category,
    COUNT(*) as count
FROM content_items
WHERE screen_location LIKE 'refinance_credit_%'
GROUP BY screen_location, category
ORDER BY screen_location, count DESC;

-- Translation status overview
SELECT 
    ci.screen_location,
    ct.language_code,
    ct.status,
    COUNT(*) as count
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location LIKE 'refinance_credit_%'
GROUP BY ci.screen_location, ct.language_code, ct.status
ORDER BY ci.screen_location, ct.language_code, ct.status;

-- Missing translations check
SELECT 
    ci.screen_location,
    ci.content_key,
    ci.component_type,
    CASE WHEN ct_en.id IS NULL THEN 'Missing English' END as missing_en,
    CASE WHEN ct_he.id IS NULL THEN 'Missing Hebrew' END as missing_he,
    CASE WHEN ct_ru.id IS NULL THEN 'Missing Russian' END as missing_ru
FROM content_items ci
LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
WHERE ci.screen_location LIKE 'refinance_credit_%'
  AND (ct_en.id IS NULL OR ct_he.id IS NULL OR ct_ru.id IS NULL)
ORDER BY ci.screen_location, ci.content_key;

-- Example API responses for each step
/*
Example API calls:

1. Get all content for refinance credit step 1 in English:
   GET http://localhost:8003/api/content/refinance_credit_1/en

2. Get all content for refinance credit step 2 in Hebrew:
   GET http://localhost:8003/api/content/refinance_credit_2/he

3. Get all content for refinance credit step 3 in Russian:
   GET http://localhost:8003/api/content/refinance_credit_3/ru

4. Get all content for refinance credit step 4 in English:
   GET http://localhost:8003/api/content/refinance_credit_4/en

Response format:
{
  "status": "success",
  "screen_location": "refinance_credit_1",
  "language_code": "en",
  "content_count": 52,
  "content": {
    "content_key": {
      "value": "Translation text",
      "component_type": "label|button|title|etc",
      "category": "form_field|navigation|etc",
      "language": "en",
      "status": "approved"
    }
  }
}
*/

-- Query to export for documentation
SELECT 
    'Refinance Credit Step ' || 
    CASE 
        WHEN screen_location = 'refinance_credit_1' THEN '1 - Initial Credit Details'
        WHEN screen_location = 'refinance_credit_2' THEN '2 - Personal Information'
        WHEN screen_location = 'refinance_credit_3' THEN '3 - Income Details'
        WHEN screen_location = 'refinance_credit_4' THEN '4 - Summary and Submission'
    END as step,
    COUNT(DISTINCT ci.id) as total_content_items,
    STRING_AGG(DISTINCT ci.component_type, ', ' ORDER BY ci.component_type) as component_types,
    STRING_AGG(DISTINCT ci.category, ', ' ORDER BY ci.category) as categories
FROM content_items ci
WHERE ci.screen_location LIKE 'refinance_credit_%'
GROUP BY screen_location
ORDER BY screen_location;