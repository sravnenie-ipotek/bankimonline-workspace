-- Fix refinance credit progress bar translations
-- These are used in the ProgressBar component for refinance credit flow

-- Insert progress bar step labels for refinance credit
INSERT INTO content_items (content_key, component_type, category, screen_location, is_active, created_at, updated_at)
VALUES 
('refinance_credit_mobile_step_1', 'text', 'navigation', 'refinance_credit_progress', true, NOW(), NOW()),
('refinance_credit_mobile_step_2', 'text', 'navigation', 'refinance_credit_progress', true, NOW(), NOW()),
('refinance_credit_mobile_step_3', 'text', 'navigation', 'refinance_credit_progress', true, NOW(), NOW()),
('refinance_credit_mobile_step_4', 'text', 'navigation', 'refinance_credit_progress', true, NOW(), NOW())
ON CONFLICT (content_key, screen_location) DO UPDATE
SET updated_at = NOW();

-- Insert translations for all languages
-- English translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT id, 'en', 
  CASE content_key
    WHEN 'refinance_credit_mobile_step_1' THEN 'Calculator'
    WHEN 'refinance_credit_mobile_step_2' THEN 'Personal Details'
    WHEN 'refinance_credit_mobile_step_3' THEN 'Income'
    WHEN 'refinance_credit_mobile_step_4' THEN 'Programs'
  END,
  'approved', NOW(), NOW()
FROM content_items 
WHERE content_key IN ('refinance_credit_mobile_step_1', 'refinance_credit_mobile_step_2', 'refinance_credit_mobile_step_3', 'refinance_credit_mobile_step_4')
  AND screen_location = 'refinance_credit_progress'
ON CONFLICT (content_item_id, language_code) DO UPDATE
SET content_value = EXCLUDED.content_value, updated_at = NOW();

-- Hebrew translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT id, 'he', 
  CASE content_key
    WHEN 'refinance_credit_mobile_step_1' THEN 'מחשבון'
    WHEN 'refinance_credit_mobile_step_2' THEN 'פרטים אישיים'
    WHEN 'refinance_credit_mobile_step_3' THEN 'הכנסות'
    WHEN 'refinance_credit_mobile_step_4' THEN 'תוכניות'
  END,
  'approved', NOW(), NOW()
FROM content_items 
WHERE content_key IN ('refinance_credit_mobile_step_1', 'refinance_credit_mobile_step_2', 'refinance_credit_mobile_step_3', 'refinance_credit_mobile_step_4')
  AND screen_location = 'refinance_credit_progress'
ON CONFLICT (content_item_id, language_code) DO UPDATE
SET content_value = EXCLUDED.content_value, updated_at = NOW();

-- Russian translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT id, 'ru', 
  CASE content_key
    WHEN 'refinance_credit_mobile_step_1' THEN 'Калькулятор'
    WHEN 'refinance_credit_mobile_step_2' THEN 'Личные данные'
    WHEN 'refinance_credit_mobile_step_3' THEN 'Доходы'
    WHEN 'refinance_credit_mobile_step_4' THEN 'Программы'
  END,
  'approved', NOW(), NOW()
FROM content_items 
WHERE content_key IN ('refinance_credit_mobile_step_1', 'refinance_credit_mobile_step_2', 'refinance_credit_mobile_step_3', 'refinance_credit_mobile_step_4')
  AND screen_location = 'refinance_credit_progress'
ON CONFLICT (content_item_id, language_code) DO UPDATE
SET content_value = EXCLUDED.content_value, updated_at = NOW();