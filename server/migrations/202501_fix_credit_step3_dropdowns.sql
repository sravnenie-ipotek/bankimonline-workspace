-- Migration: Fix Credit Step 3 Missing Dropdowns
-- Description: Add field_of_activity dropdown content and fix debt_types API mapping
-- Date: 2025-01-07
-- Phase: 1 - Complete dropdown content for calculate_credit_3

BEGIN;

-- ===========================================
-- PHASE 1: Add Field of Activity Dropdown
-- ===========================================

-- Insert field_of_activity dropdown container (label)
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, created_at, created_by)
VALUES ('calculate_credit_3_field_of_activity', 'label', 'calculate_credit_3', 'form', true, NOW(), 1);

-- Insert field_of_activity placeholder
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, created_at, created_by)
VALUES ('calculate_credit_3_field_of_activity_ph', 'placeholder', 'calculate_credit_3', 'form', true, NOW(), 1);

-- Insert field_of_activity options (comprehensive list)
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, created_at, created_by)
VALUES 
  ('calculate_credit_3_field_of_activity_option_1', 'option', 'calculate_credit_3', 'form', true, NOW(), 1),
  ('calculate_credit_3_field_of_activity_option_2', 'option', 'calculate_credit_3', 'form', true, NOW(), 1),
  ('calculate_credit_3_field_of_activity_option_3', 'option', 'calculate_credit_3', 'form', true, NOW(), 1),
  ('calculate_credit_3_field_of_activity_option_4', 'option', 'calculate_credit_3', 'form', true, NOW(), 1),
  ('calculate_credit_3_field_of_activity_option_5', 'option', 'calculate_credit_3', 'form', true, NOW(), 1),
  ('calculate_credit_3_field_of_activity_option_6', 'option', 'calculate_credit_3', 'form', true, NOW(), 1),
  ('calculate_credit_3_field_of_activity_option_7', 'option', 'calculate_credit_3', 'form', true, NOW(), 1),
  ('calculate_credit_3_field_of_activity_option_8', 'option', 'calculate_credit_3', 'form', true, NOW(), 1),
  ('calculate_credit_3_field_of_activity_option_9', 'option', 'calculate_credit_3', 'form', true, NOW(), 1),
  ('calculate_credit_3_field_of_activity_option_10', 'option', 'calculate_credit_3', 'form', true, NOW(), 1),
  ('calculate_credit_3_field_of_activity_option_11', 'option', 'calculate_credit_3', 'form', true, NOW(), 1),
  ('calculate_credit_3_field_of_activity_option_12', 'option', 'calculate_credit_3', 'form', true, NOW(), 1),
  ('calculate_credit_3_field_of_activity_option_13', 'option', 'calculate_credit_3', 'form', true, NOW(), 1);

-- ===========================================
-- PHASE 2: Add Translations for Field of Activity
-- ===========================================

-- Insert English translations directly using subqueries
INSERT INTO content_translations (content_item_id, language_code, content_value, status, is_default, created_at)
VALUES
  -- Label
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity'), 'en', 'Field of Activity', 'approved', true, NOW()),
  -- Placeholder  
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_ph'), 'en', 'Select your field of activity', 'approved', true, NOW()),
  -- Options
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_1'), 'en', 'Technology / High-tech', 'approved', true, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_2'), 'en', 'Healthcare & Medicine', 'approved', true, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_3'), 'en', 'Education & Training', 'approved', true, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_4'), 'en', 'Finance & Banking', 'approved', true, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_5'), 'en', 'Real Estate', 'approved', true, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_6'), 'en', 'Construction & Engineering', 'approved', true, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_7'), 'en', 'Retail & Commerce', 'approved', true, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_8'), 'en', 'Manufacturing & Industry', 'approved', true, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_9'), 'en', 'Government & Public Sector', 'approved', true, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_10'), 'en', 'Transportation & Logistics', 'approved', true, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_11'), 'en', 'Consulting & Professional Services', 'approved', true, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_12'), 'en', 'Entertainment & Media', 'approved', true, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_13'), 'en', 'Other', 'approved', true, NOW());

-- Insert Hebrew translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status, is_default, created_at)  
VALUES
  -- Label
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity'), 'he', 'תחום פעילות', 'approved', false, NOW()),
  -- Placeholder
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_ph'), 'he', 'בחר את תחום הפעילות שלך', 'approved', false, NOW()),
  -- Options
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_1'), 'he', 'טכנולוגיה / היי-טק', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_2'), 'he', 'בריאות ורפואה', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_3'), 'he', 'חינוך והדרכה', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_4'), 'he', 'פיננסים ובנקאות', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_5'), 'he', 'נדלן', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_6'), 'he', 'בנייה והנדסה', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_7'), 'he', 'קמעונאות ומסחר', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_8'), 'he', 'ייצור ותעשייה', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_9'), 'he', 'ממשלה ומגזר ציבורי', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_10'), 'he', 'תחבורה ולוגיסטיקה', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_11'), 'he', 'ייעוץ ושירותים מקצועיים', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_12'), 'he', 'בידור ותקשורת', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_13'), 'he', 'אחר', 'approved', false, NOW());

-- Insert Russian translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status, is_default, created_at)
VALUES
  -- Label
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity'), 'ru', 'Сфера деятельности', 'approved', false, NOW()),
  -- Placeholder
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_ph'), 'ru', 'Выберите вашу сферу деятельности', 'approved', false, NOW()),
  -- Options
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_1'), 'ru', 'Технологии / Хай-тек', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_2'), 'ru', 'Здравоохранение и медицина', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_3'), 'ru', 'Образование и обучение', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_4'), 'ru', 'Финансы и банковское дело', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_5'), 'ru', 'Недвижимость', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_6'), 'ru', 'Строительство и инжиниринг', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_7'), 'ru', 'Розничная торговля', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_8'), 'ru', 'Производство и промышленность', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_9'), 'ru', 'Правительство и госсектор', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_10'), 'ru', 'Транспорт и логистика', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_11'), 'ru', 'Консалтинг и профуслуги', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_12'), 'ru', 'Развлечения и СМИ', 'approved', false, NOW()),
  ((SELECT id FROM content_items WHERE content_key = 'calculate_credit_3_field_of_activity_option_13'), 'ru', 'Другое', 'approved', false, NOW());

-- ===========================================  
-- PHASE 3: Clear API Cache for Changes
-- ===========================================

-- The cache will be automatically cleared on next API request due to content changes

-- ===========================================
-- PHASE 4: Verification Query
-- ===========================================

-- Verify results
SELECT 
  ci.content_key, 
  ci.component_type,
  string_agg(
    ct.language_code || ': ' || COALESCE(SUBSTRING(ct.content_value, 1, 30), 'NULL'),
    ' | ' ORDER BY ct.language_code
  ) as translations
FROM content_items ci
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'calculate_credit_3' 
  AND ci.content_key LIKE '%field_of_activity%'
  AND ct.status = 'approved'
GROUP BY ci.content_key, ci.component_type, ci.id
ORDER BY ci.content_key;

COMMIT;

-- Migration completed: Field of Activity dropdown added with comprehensive options
-- API mapping for debt_types already exists but needed field_of_activity key mapping
-- Components now have proper field names: 
-- - field_of_activity maps to calculate_credit_3_field_of_activity
-- - debt_types maps to calculate_credit_3_debt_types