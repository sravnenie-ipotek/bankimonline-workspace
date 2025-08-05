-- Migration: Fix Refinance Step 2 Education Dropdown with Descriptive Naming
-- Description: Replace numeric naming (_option_1, _option_2) with descriptive naming (_no_certificate, _partial_certificate, etc.)
-- Date: 2025-07-30
-- Screen Location: refinance_step2
-- Process: Refinance Mortgage
-- Follows: @dropDownsInDBLogic naming conventions

-- First, remove the incorrectly named content items
DELETE FROM content_translations 
WHERE content_item_id IN (
    SELECT id FROM content_items 
    WHERE screen_location = 'refinance_step2' 
    AND content_key LIKE 'refinance_step2_education_option_%'
);

DELETE FROM content_items 
WHERE screen_location = 'refinance_step2' 
AND content_key LIKE 'refinance_step2_education_option_%';

-- Add education dropdown with descriptive naming
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES 
-- Education dropdown container
('refinance_step2_education', 'dropdown', 'refinance_step2', 'form', true),

-- Education options with descriptive naming
('refinance_step2_education_no_certificate', 'option', 'refinance_step2', 'form', true),
('refinance_step2_education_partial_certificate', 'option', 'refinance_step2', 'form', true),
('refinance_step2_education_full_certificate', 'option', 'refinance_step2', 'form', true),
('refinance_step2_education_post_secondary', 'option', 'refinance_step2', 'form', true),
('refinance_step2_education_bachelors', 'option', 'refinance_step2', 'form', true),
('refinance_step2_education_masters', 'option', 'refinance_step2', 'form', true),
('refinance_step2_education_doctorate', 'option', 'refinance_step2', 'form', true),

-- Placeholder
('refinance_step2_education_ph', 'placeholder', 'refinance_step2', 'form', true),

-- Label
('refinance_step2_education_label', 'label', 'refinance_step2', 'form', true);

-- Add English translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Education', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_label' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Select education level', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_ph' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'No high school certificate', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_no_certificate' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Partial high school certificate', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_partial_certificate' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Full high school certificate', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_full_certificate' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Post-secondary education', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_post_secondary' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Bachelor''s degree', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_bachelors' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Master''s degree', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_masters' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Doctoral degree', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_doctorate' 
  AND ci.screen_location = 'refinance_step2';

-- Add Hebrew translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'השכלה', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_label' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בחר רמת השכלה', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_ph' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'ללא תעודת בגרות', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_no_certificate' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'תעודת בגרות חלקית', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_partial_certificate' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'תעודת בגרות מלאה', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_full_certificate' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'השכלה על-תיכונית', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_post_secondary' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'תואר ראשון', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_bachelors' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'תואר שני', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_masters' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'תואר שלישי', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_doctorate' 
  AND ci.screen_location = 'refinance_step2';

-- Add Russian translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Образование', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_label' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Выберите уровень образования', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_ph' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Без аттестата средней школы', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_no_certificate' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Частичный аттестат средней школы', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_partial_certificate' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Полный аттестат средней школы', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_full_certificate' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Послешкольное образование', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_post_secondary' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Степень бакалавра', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_bachelors' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Степень магистра', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_masters' 
  AND ci.screen_location = 'refinance_step2';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Докторская степень', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_doctorate' 
  AND ci.screen_location = 'refinance_step2';

-- Verify migration
SELECT 
    ci.content_key,
    ci.component_type,
    ci.screen_location,
    ct.language_code,
    ct.content_value
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'refinance_step2' 
  AND ci.content_key LIKE 'refinance_step2_education%'
ORDER BY ci.content_key, ct.language_code; 