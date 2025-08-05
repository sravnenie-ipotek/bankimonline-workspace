-- Create views for each mortgage step to aggregate content by forms
-- This makes it easy to query all content for specific mortgage form steps

-- ============================================
-- MORTGAGE CALCULATOR (MAIN) VIEW
-- ============================================
CREATE OR REPLACE VIEW view_mortgage_calculator AS
SELECT 
    ci.id as content_item_id,
    ci.content_key,
    ci.component_type,
    ci.category,
    ci.screen_location,
    ct.language_code,
    ct.value as content_value,
    ci.description,
    ci.is_active,
    ci.created_at,
    ci.updated_at
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'mortgage_calculation'
    AND ci.is_active = true
ORDER BY ci.category, ci.component_type, ci.content_key;

-- ============================================
-- MORTGAGE STEP 1 VIEW
-- ============================================
CREATE OR REPLACE VIEW view_mortgage_step1 AS
SELECT 
    ci.id as content_item_id,
    ci.content_key,
    ci.component_type,
    ci.category,
    ci.screen_location,
    ct.language_code,
    ct.value as content_value,
    ci.description,
    ci.is_active,
    ci.created_at,
    ci.updated_at
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'mortgage_step1'
    AND ci.is_active = true
ORDER BY ci.category, ci.component_type, ci.content_key;

-- ============================================
-- MORTGAGE STEP 2 VIEW
-- ============================================
CREATE OR REPLACE VIEW view_mortgage_step2 AS
SELECT 
    ci.id as content_item_id,
    ci.content_key,
    ci.component_type,
    ci.category,
    ci.screen_location,
    ct.language_code,
    ct.value as content_value,
    ci.description,
    ci.is_active,
    ci.created_at,
    ci.updated_at
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'mortgage_step2'
    AND ci.is_active = true
ORDER BY ci.category, ci.component_type, ci.content_key;

-- ============================================
-- MORTGAGE STEP 3 VIEW
-- ============================================
CREATE OR REPLACE VIEW view_mortgage_step3 AS
SELECT 
    ci.id as content_item_id,
    ci.content_key,
    ci.component_type,
    ci.category,
    ci.screen_location,
    ct.language_code,
    ct.value as content_value,
    ci.description,
    ci.is_active,
    ci.created_at,
    ci.updated_at
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'mortgage_step3'
    AND ci.is_active = true
ORDER BY ci.category, ci.component_type, ci.content_key;

-- ============================================
-- MORTGAGE STEP 4 VIEW
-- ============================================
CREATE OR REPLACE VIEW view_mortgage_step4 AS
SELECT 
    ci.id as content_item_id,
    ci.content_key,
    ci.component_type,
    ci.category,
    ci.screen_location,
    ct.language_code,
    ct.value as content_value,
    ci.description,
    ci.is_active,
    ci.created_at,
    ci.updated_at
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'mortgage_step4'
    AND ci.is_active = true
ORDER BY ci.category, ci.component_type, ci.content_key;

-- ============================================
-- COMBINED MORTGAGE FORMS VIEW
-- ============================================
CREATE OR REPLACE VIEW view_mortgage_all_steps AS
SELECT 
    ci.id as content_item_id,
    ci.content_key,
    ci.component_type,
    ci.category,
    ci.screen_location,
    ct.language_code,
    ct.value as content_value,
    ci.description,
    ci.is_active,
    ci.created_at,
    ci.updated_at,
    -- Add step number for easy sorting
    CASE 
        WHEN ci.screen_location = 'mortgage_calculation' THEN 0
        WHEN ci.screen_location = 'mortgage_step1' THEN 1
        WHEN ci.screen_location = 'mortgage_step2' THEN 2
        WHEN ci.screen_location = 'mortgage_step3' THEN 3
        WHEN ci.screen_location = 'mortgage_step4' THEN 4
        ELSE 99
    END as step_number
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location IN (
    'mortgage_calculation',
    'mortgage_step1', 
    'mortgage_step2', 
    'mortgage_step3', 
    'mortgage_step4'
)
    AND ci.is_active = true
ORDER BY step_number, ci.category, ci.component_type, ci.content_key;

-- ============================================
-- MORTGAGE FORM CATEGORIES SUMMARY VIEW
-- ============================================
CREATE OR REPLACE VIEW view_mortgage_categories_summary AS
SELECT 
    ci.screen_location,
    ci.category,
    ci.component_type,
    COUNT(*) as item_count,
    COUNT(DISTINCT ct.language_code) as language_count,
    array_agg(DISTINCT ct.language_code) as available_languages,
    MIN(ci.created_at) as first_created,
    MAX(ci.updated_at) as last_updated
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location IN (
    'mortgage_calculation',
    'mortgage_step1', 
    'mortgage_step2', 
    'mortgage_step3', 
    'mortgage_step4'
)
    AND ci.is_active = true
GROUP BY ci.screen_location, ci.category, ci.component_type
ORDER BY ci.screen_location, ci.category, ci.component_type;

-- ============================================
-- MORTGAGE FORM COMPONENTS VIEW (for admin)
-- ============================================
CREATE OR REPLACE VIEW view_mortgage_form_components AS
SELECT 
    ci.screen_location,
    ci.component_type,
    COUNT(*) as total_components,
    COUNT(DISTINCT CASE WHEN ci.category = 'form' THEN ci.id END) as form_components,
    COUNT(DISTINCT CASE WHEN ci.category = 'options' THEN ci.id END) as option_components,
    COUNT(DISTINCT CASE WHEN ci.category = 'labels' THEN ci.id END) as label_components,
    COUNT(DISTINCT CASE WHEN ci.category = 'placeholders' THEN ci.id END) as placeholder_components,
    array_agg(DISTINCT ci.category) as all_categories
FROM content_items ci
WHERE ci.screen_location IN (
    'mortgage_calculation',
    'mortgage_step1', 
    'mortgage_step2', 
    'mortgage_step3', 
    'mortgage_step4'
)
    AND ci.is_active = true
GROUP BY ci.screen_location, ci.component_type
ORDER BY ci.screen_location, ci.component_type; 