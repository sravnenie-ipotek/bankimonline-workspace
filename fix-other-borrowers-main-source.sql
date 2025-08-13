-- Fix: Add missing dropdown for Other Borrowers Step 2: main_source
-- This fixes the issue where MainSourceOfIncome component expects main_source field
-- but the API endpoint /api/dropdowns/other_borrowers_step2/he only returns field_of_activity and obligations

-- 1) Container label (dropdown_container) - Already exists, ensure it's active
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

-- 2) Add placeholder option 
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('other_borrowers_step2.field.main_source_placeholder', 'other_borrowers_step2', 'placeholder', 'main_source', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Select main source of income', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_placeholder'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בחר מקור הכנסה עיקרי', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_placeholder'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Выберите основной источник дохода', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_placeholder'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- 3) Individual dropdown options
-- Employee
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('other_borrowers_step2.field.main_source_employee', 'other_borrowers_step2', 'dropdown_option', 'main_source', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Employee', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_employee'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'שכיר', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_employee'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Работник по найму', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_employee'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- Self-employed
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('other_borrowers_step2.field.main_source_selfemployed', 'other_borrowers_step2', 'dropdown_container', 'main_source', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Self-employed', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_selfemployed'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'עצמאי', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_selfemployed'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Самозанятый', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_selfemployed'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- Pension
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('other_borrowers_step2.field.main_source_pension', 'other_borrowers_step2', 'dropdown_option', 'main_source', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Pension', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_pension'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'פנסיה', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_pension'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Пенсия', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_pension'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- Unemployed
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('other_borrowers_step2.field.main_source_unemployed', 'other_borrowers_step2', 'dropdown_option', 'main_source', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Unemployed', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_unemployed'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'ללא הכנסה', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_unemployed'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Безработный', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_unemployed'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- Unpaid leave
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('other_borrowers_step2.field.main_source_unpaid_leave', 'other_borrowers_step2', 'dropdown_option', 'main_source', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Unpaid leave', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_unpaid_leave'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'חופשה ללא תשלום', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_unpaid_leave'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Отпуск без содержания', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_unpaid_leave'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- Student
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('other_borrowers_step2.field.main_source_student', 'other_borrowers_step2', 'dropdown_option', 'main_source', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Student', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_student'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'סטודנט', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_student'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Студент', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_student'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- Other
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('other_borrowers_step2.field.main_source_other', 'other_borrowers_step2', 'dropdown_option', 'main_source', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Other', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_other'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'אחר', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_other'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Другое', 'approved'
FROM content_items ci WHERE ci.content_key = 'other_borrowers_step2.field.main_source_other'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- End of migration
SELECT 'Migration completed: other_borrowers_step2 main_source dropdown added' as status;