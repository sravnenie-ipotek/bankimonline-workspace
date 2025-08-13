-- Add missing dropdown for Other Borrowers Step 2: main_source
-- Follows: dropDownLogicBankim.md and systemTranslationLogic.md
-- Pattern:
--   Database Content Key: {screen_location}.field.{field_name}_{option_value}
--   Screen Location: other_borrowers_step2
--   Field Name: main_source
--   API Key Generated: other_borrowers_step2_main_source

-- 1) Container label (dropdown_container)
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('other_borrowers_step2.field.main_source', 'other_borrowers_step2', 'dropdown_container', 'main_source', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

-- Translations for container label
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Main source of income', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'מקור הכנסה עיקרי', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Основной источник дохода', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- 2) Options (dropdown_option)
-- Values: employee, selfemployed, pension, unemployed, unpaid_leave, student, other
WITH opts(value, en, he, ru) AS (
  VALUES
    ('employee',      'Employee',         'שכיר',                     'Работник по найму'),
    ('selfemployed',  'Self-employed',    'עצמאי',                    'Самозанятый'),
    ('pension',       'Pension',          'פנסיה',                    'Пенсия'),
    ('unemployed',    'Unemployed',       'ללא הכנסה',                'Безработный'),
    ('unpaid_leave',  'Unpaid leave',     'חופשה ללא תשלום',          'Отпуск без содержания'),
    ('student',       'Student',          'סטודנט',                   'Студент'),
    ('other',         'Other',            'אחר',                      'Другое')
)
-- Create content_items for each option
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
SELECT 'other_borrowers_step2.field.main_source_' || o.value,
       'other_borrowers_step2',
       'dropdown_option',
       'main_source',
       true
FROM opts o
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

-- English translations for options
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', o.en, 'approved'
FROM content_items ci
JOIN opts o ON ci.content_key = 'other_borrowers_step2.field.main_source_' || o.value
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- Hebrew translations for options
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', o.he, 'approved'
FROM content_items ci
JOIN opts o ON ci.content_key = 'other_borrowers_step2.field.main_source_' || o.value
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- Russian translations for options
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', o.ru, 'approved'
FROM content_items ci
JOIN opts o ON ci.content_key = 'other_borrowers_step2.field.main_source_' || o.value
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- Note: Placeholder is optional. If desired later, add a placeholder row with component_type = 'placeholder'
-- and a content_key that still allows the server to map it to the 'main_source' field name.

-- End of migration

