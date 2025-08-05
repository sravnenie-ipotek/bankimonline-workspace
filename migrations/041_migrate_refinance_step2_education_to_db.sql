-- Migration: Add Refinance Step 2 Education Dropdown to Database
-- Description: Migrate education dropdown from translation files to database content management
-- Date: 2025-07-30
-- Screen Location: refinance_step2
-- Process: Refinance Mortgage

-- Add Education dropdown label
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'refinance_step2_education', 'field_label', 'refinance_step2', 'personal_details', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'refinance_step2_education' 
    AND screen_location = 'refinance_step2'
);

-- Add Education dropdown placeholder
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'refinance_step2_education_ph', 'placeholder', 'refinance_step2', 'personal_details', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'refinance_step2_education_ph' 
    AND screen_location = 'refinance_step2'
);

-- Add Education Option 1: No high school certificate
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'refinance_step2_education_option_1', 'option', 'refinance_step2', 'personal_details', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'refinance_step2_education_option_1' 
    AND screen_location = 'refinance_step2'
);

-- Add Education Option 2: Partial high school certificate
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'refinance_step2_education_option_2', 'option', 'refinance_step2', 'personal_details', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'refinance_step2_education_option_2' 
    AND screen_location = 'refinance_step2'
);

-- Add Education Option 3: Full high school certificate
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'refinance_step2_education_option_3', 'option', 'refinance_step2', 'personal_details', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'refinance_step2_education_option_3' 
    AND screen_location = 'refinance_step2'
);

-- Add Education Option 4: Post-secondary education
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'refinance_step2_education_option_4', 'option', 'refinance_step2', 'personal_details', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'refinance_step2_education_option_4' 
    AND screen_location = 'refinance_step2'
);

-- Add Education Option 5: Bachelor's degree
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'refinance_step2_education_option_5', 'option', 'refinance_step2', 'personal_details', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'refinance_step2_education_option_5' 
    AND screen_location = 'refinance_step2'
);

-- Add Education Option 6: Master's degree
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'refinance_step2_education_option_6', 'option', 'refinance_step2', 'personal_details', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'refinance_step2_education_option_6' 
    AND screen_location = 'refinance_step2'
);

-- Add Education Option 7: Doctoral degree
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'refinance_step2_education_option_7', 'option', 'refinance_step2', 'personal_details', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'refinance_step2_education_option_7' 
    AND screen_location = 'refinance_step2'
);

-- Add English translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Education', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Select education level', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_ph' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'No high school certificate', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_option_1' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Partial high school certificate', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_option_2' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Full high school certificate', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_option_3' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Post-secondary education', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_option_4' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Bachelor''s degree', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_option_5' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Master''s degree', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_option_6' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Doctoral degree', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_option_7' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
  );

-- Add Hebrew translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'השכלה', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בחר רמת השכלה', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_ph' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'ללא תעודת בגרות', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_option_1' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'תעודת בגרות חלקית', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_option_2' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'תעודת בגרות מלאה', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_option_3' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'השכלה על-תיכונית', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_option_4' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'תואר ראשון', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_option_5' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'תואר שני', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_option_6' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'תואר שלישי', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_option_7' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
  );

-- Add Russian translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Образование', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Выберите уровень образования', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_ph' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Без аттестата средней школы', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_option_1' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Частичный аттестат средней школы', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_option_2' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Полный аттестат средней школы', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_option_3' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Послешкольное образование', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_option_4' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Степень бакалавра', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_option_5' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Степень магистра', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_option_6' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Докторская степень', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_step2_education_option_7' 
  AND ci.screen_location = 'refinance_step2'
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
  );

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