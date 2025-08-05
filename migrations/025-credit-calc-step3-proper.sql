-- Step 3: Personal Information for Credit Calculator (proper structure)
-- Insert content items for Step 3

-- Step 3 Title
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step3_title', 'text', 'credit_calculator_step3', 'step3_header', 'heading', 'Step 3 title for credit calculator', 'calculate_credit_step3_title', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'פרטי הלווה', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_title'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Borrower Details', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_title'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Данные заемщика', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_title'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- First Borrower Title
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_first_borrower_title', 'text', 'credit_calculator_step3', 'step3_first_borrower', 'section_title', 'First borrower section title', 'calculate_credit_first_borrower_title', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'פרטי לווה ראשי', 'approved' FROM content_items WHERE content_key = 'calculate_credit_first_borrower_title'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Primary Borrower Details', 'approved' FROM content_items WHERE content_key = 'calculate_credit_first_borrower_title'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Данные основного заемщика', 'approved' FROM content_items WHERE content_key = 'calculate_credit_first_borrower_title'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- Private Name
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step3_private_name', 'text', 'credit_calculator_step3', 'step3_personal_info', 'field_label', 'First name field label', 'calculate_credit_step3_private_name', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'שם פרטי', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_private_name'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'First Name', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_private_name'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Имя', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_private_name'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- Private Name Placeholder
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step3_private_name_ph', 'text', 'credit_calculator_step3', 'step3_personal_info', 'placeholder', 'First name field placeholder', 'calculate_credit_step3_private_name_ph', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הזן שם פרטי', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_private_name_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Enter first name', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_private_name_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Введите имя', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_private_name_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- Family Name
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step3_family_name', 'text', 'credit_calculator_step3', 'step3_personal_info', 'field_label', 'Last name field label', 'calculate_credit_step3_family_name', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'שם משפחה', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_family_name'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Last Name', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_family_name'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Фамилия', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_family_name'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- Family Name Placeholder
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step3_family_name_ph', 'text', 'credit_calculator_step3', 'step3_personal_info', 'placeholder', 'Last name field placeholder', 'calculate_credit_step3_family_name_ph', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הזן שם משפחה', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_family_name_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Enter last name', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_family_name_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Введите фамилию', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_family_name_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- ID Number
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step3_id', 'text', 'credit_calculator_step3', 'step3_personal_info', 'field_label', 'ID number field label', 'calculate_credit_step3_id', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'תעודת זהות', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_id'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'ID Number', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_id'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Номер удостоверения', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_id'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- ID Placeholder
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step3_id_ph', 'text', 'credit_calculator_step3', 'step3_personal_info', 'placeholder', 'ID number field placeholder', 'calculate_credit_step3_id_ph', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הזן תעודת זהות', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_id_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Enter ID number', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_id_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Введите номер удостоверения', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_id_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- Birthday
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step3_birthday', 'text', 'credit_calculator_step3', 'step3_personal_info', 'field_label', 'Birthday field label', 'calculate_credit_step3_birthday', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'תאריך לידה', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_birthday'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Date of Birth', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_birthday'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Дата рождения', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_birthday'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- Birthday Placeholder
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step3_birthday_ph', 'text', 'credit_calculator_step3', 'step3_personal_info', 'placeholder', 'Birthday field placeholder', 'calculate_credit_step3_birthday_ph', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'בחר תאריך לידה', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_birthday_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Select date of birth', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_birthday_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Выберите дату рождения', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_birthday_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- City
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step3_city', 'text', 'credit_calculator_step3', 'step3_personal_info', 'field_label', 'City field label', 'calculate_credit_step3_city', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'עיר מגורים', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_city'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'City of Residence', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_city'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Город проживания', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_city'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- City Placeholder
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step3_city_ph', 'text', 'credit_calculator_step3', 'step3_personal_info', 'placeholder', 'City field placeholder', 'calculate_credit_step3_city_ph', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'בחר עיר מגורים', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_city_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Select city of residence', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_city_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Выберите город проживания', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_city_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- Street
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step3_street', 'text', 'credit_calculator_step3', 'step3_personal_info', 'field_label', 'Street field label', 'calculate_credit_step3_street', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'רחוב', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_street'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Street', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_street'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Улица', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_street'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- Street Placeholder
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step3_street_ph', 'text', 'credit_calculator_step3', 'step3_personal_info', 'placeholder', 'Street field placeholder', 'calculate_credit_step3_street_ph', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הזן רחוב', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_street_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Enter street', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_street_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Введите улицу', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step3_street_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- Additional borrower section
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_add_borrower_title', 'text', 'credit_calculator_step3', 'step3_additional_borrower', 'section_title', 'Additional borrower section title', 'calculate_credit_add_borrower_title', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הוסף לווה נוסף', 'approved' FROM content_items WHERE content_key = 'calculate_credit_add_borrower_title'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Add Additional Borrower', 'approved' FROM content_items WHERE content_key = 'calculate_credit_add_borrower_title'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Добавить дополнительного заемщика', 'approved' FROM content_items WHERE content_key = 'calculate_credit_add_borrower_title'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- Add Additional Borrower Button
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_add_additional_borrower', 'text', 'credit_calculator_step3', 'step3_additional_borrower', 'button', 'Add additional borrower button', 'calculate_credit_add_additional_borrower', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הוסף לווה נוסף', 'approved' FROM content_items WHERE content_key = 'calculate_credit_add_additional_borrower'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Add Additional Borrower', 'approved' FROM content_items WHERE content_key = 'calculate_credit_add_additional_borrower'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Добавить дополнительного заемщика', 'approved' FROM content_items WHERE content_key = 'calculate_credit_add_additional_borrower'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;