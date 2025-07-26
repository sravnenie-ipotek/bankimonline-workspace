-- Migration: Refinance Credit Step 2 - Complete Personal Details
-- Date: 2025-01-26
-- Purpose: Add all content for refinance credit step 2 form (personal details)

-- =====================================================
-- REFINANCE CREDIT STEP 2 - PAGE TITLE AND CAPTIONS
-- =====================================================

INSERT INTO content_items (
    content_key, 
    content_type, 
    category, 
    screen_location, 
    component_type,
    description,
    is_active, 
    legacy_translation_key,
    created_at
) VALUES
-- Page title
('calculate_mortgage_step2_title', 'title', 'page', 'refinance_credit_2', 'text', 'Personal Details', true, 'calculate_mortgage_step2_title', NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Add translations for page title
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- English
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_step2_title' AND screen_location = 'refinance_credit_2'), 'en', 'Personal Details', true, 'approved', NOW()),
-- Hebrew
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_step2_title' AND screen_location = 'refinance_credit_2'), 'he', 'פרטים אישיים', false, 'approved', NOW()),
-- Russian
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_step2_title' AND screen_location = 'refinance_credit_2'), 'ru', 'Личные данные', false, 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- =====================================================
-- BASIC FIELDS - LABELS AND PLACEHOLDERS
-- =====================================================

INSERT INTO content_items (
    content_key, 
    content_type, 
    category, 
    screen_location, 
    component_type,
    description,
    is_active, 
    legacy_translation_key,
    created_at
) VALUES
-- Name and surname
('calculate_mortgage_name', 'label', 'form_field', 'refinance_credit_2', 'text', 'Full name', true, 'calculate_mortgage_name', NOW()),
('calculate_mortgage_name_ph', 'placeholder', 'form_field', 'refinance_credit_2', 'text', 'Enter full name', true, 'calculate_mortgage_name_ph', NOW()),

-- Birthday
('calculate_mortgage_birthday', 'label', 'form_field', 'refinance_credit_2', 'text', 'Date of birth', true, 'calculate_mortgage_birthday', NOW()),
('calculate_mortgage_birthday_ph', 'placeholder', 'form_field', 'refinance_credit_2', 'text', 'Select date', true, 'calculate_mortgage_birthday_ph', NOW()),

-- Education
('calculate_mortgage_education', 'label', 'form_field', 'refinance_credit_2', 'text', 'Education level', true, 'calculate_mortgage_education', NOW()),
('calculate_mortgage_education_ph', 'placeholder', 'form_field', 'refinance_credit_2', 'text', 'Select education level', true, 'calculate_mortgage_education_ph', NOW()),

-- Additional citizenships
('calculate_mortgage_additional_citizenships', 'label', 'form_field', 'refinance_credit_2', 'text', 'Additional citizenships', true, 'calculate_mortgage_additional_citizenships', NOW()),
('calculate_mortgage_citizenships_dropdown', 'label', 'form_field', 'refinance_credit_2', 'text', 'Select citizenships', true, 'calculate_mortgage_citizenships_dropdown', NOW()),
('calculate_mortgage_citizenships_dropdown_ph', 'placeholder', 'form_field', 'refinance_credit_2', 'text', 'Select countries', true, 'calculate_mortgage_citizenships_dropdown_ph', NOW()),

-- Taxes
('calculate_mortgage_taxes', 'label', 'form_field', 'refinance_credit_2', 'text', 'Do you pay taxes abroad?', true, 'calculate_mortgage_taxes', NOW()),
('calculate_mortgage_countries_pay_taxes', 'label', 'form_field', 'refinance_credit_2', 'text', 'Countries where you pay taxes', true, 'calculate_mortgage_countries_pay_taxes', NOW()),
('calculate_mortgage_countries_pay_taxes_ph', 'placeholder', 'form_field', 'refinance_credit_2', 'text', 'Select countries', true, 'calculate_mortgage_countries_pay_taxes_ph', NOW()),

-- Children
('calculate_mortgage_childrens', 'label', 'form_field', 'refinance_credit_2', 'text', 'Do you have children?', true, 'calculate_mortgage_childrens', NOW()),
('calculate_mortgage_how_much_childrens', 'label', 'form_field', 'refinance_credit_2', 'text', 'Number of children', true, 'calculate_mortgage_how_much_childrens', NOW()),

-- Medical insurance
('calculate_mortgage_medical_insurance', 'label', 'form_field', 'refinance_credit_2', 'text', 'Do you have medical insurance?', true, 'calculate_mortgage_medical_insurance', NOW()),

-- Is foreigner
('calculate_mortgage_is_foreigner', 'label', 'form_field', 'refinance_credit_2', 'text', 'Are you a foreign resident?', true, 'calculate_mortgage_is_foreigner', NOW()),

-- Public person
('calculate_mortgage_public_person', 'label', 'form_field', 'refinance_credit_2', 'text', 'Are you a public figure?', true, 'calculate_mortgage_public_person', NOW()),

-- Borrowers
('calculate_mortgage_borrowers', 'label', 'form_field', 'refinance_credit_2', 'text', 'Are there other borrowers?', true, 'calculate_mortgage_borrowers', NOW()),

-- Family status
('calculate_mortgage_family_status', 'label', 'form_field', 'refinance_credit_2', 'text', 'Marital status', true, 'calculate_mortgage_family_status', NOW()),
('calculate_mortgage_family_status_ph', 'placeholder', 'form_field', 'refinance_credit_2', 'text', 'Select marital status', true, 'calculate_mortgage_family_status_ph', NOW()),

-- Partner pays mortgage
('calculate_mortgage_partner_pay_mortgage', 'label', 'form_field', 'refinance_credit_2', 'text', 'Will your partner participate in loan payments?', true, 'calculate_mortgage_partner_pay_mortgage', NOW()),

-- Add partner
('calculate_mortgage_add_partner', 'label', 'form_field', 'refinance_credit_2', 'text', 'Add partner as borrower?', true, 'calculate_mortgage_add_partner', NOW()),
('calculate_mortgage_add_partner_ph', 'placeholder', 'form_field', 'refinance_credit_2', 'text', 'Select option', true, 'calculate_mortgage_add_partner_ph', NOW()),

-- Yes/No options
('calculate_mortgage_yes', 'label', 'option', 'refinance_credit_2', 'text', 'Yes', true, 'calculate_mortgage_yes', NOW()),
('calculate_mortgage_no', 'label', 'option', 'refinance_credit_2', 'text', 'No', true, 'calculate_mortgage_no', NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- =====================================================
-- EDUCATION DROPDOWN OPTIONS
-- =====================================================

INSERT INTO content_items (
    content_key, 
    content_type, 
    category, 
    screen_location, 
    component_type,
    description,
    is_active, 
    legacy_translation_key,
    created_at
) VALUES
('calculate_mortgage_education_option_1', 'dropdown_option', 'education', 'refinance_credit_2', 'option', 'No high school diploma', true, 'calculate_mortgage_education_option_1', NOW()),
('calculate_mortgage_education_option_2', 'dropdown_option', 'education', 'refinance_credit_2', 'option', 'Partial high school diploma', true, 'calculate_mortgage_education_option_2', NOW()),
('calculate_mortgage_education_option_3', 'dropdown_option', 'education', 'refinance_credit_2', 'option', 'Full high school diploma', true, 'calculate_mortgage_education_option_3', NOW()),
('calculate_mortgage_education_option_4', 'dropdown_option', 'education', 'refinance_credit_2', 'option', 'Post-secondary education', true, 'calculate_mortgage_education_option_4', NOW()),
('calculate_mortgage_education_option_5', 'dropdown_option', 'education', 'refinance_credit_2', 'option', 'Bachelor\'s degree', true, 'calculate_mortgage_education_option_5', NOW()),
('calculate_mortgage_education_option_6', 'dropdown_option', 'education', 'refinance_credit_2', 'option', 'Master\'s degree', true, 'calculate_mortgage_education_option_6', NOW()),
('calculate_mortgage_education_option_7', 'dropdown_option', 'education', 'refinance_credit_2', 'option', 'Doctoral degree', true, 'calculate_mortgage_education_option_7', NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- =====================================================
-- FAMILY STATUS DROPDOWN OPTIONS
-- =====================================================

INSERT INTO content_items (
    content_key, 
    content_type, 
    category, 
    screen_location, 
    component_type,
    description,
    is_active, 
    legacy_translation_key,
    created_at
) VALUES
('calculate_mortgage_family_status_option_1', 'dropdown_option', 'family_status', 'refinance_credit_2', 'option', 'Single', true, 'calculate_mortgage_family_status_option_1', NOW()),
('calculate_mortgage_family_status_option_2', 'dropdown_option', 'family_status', 'refinance_credit_2', 'option', 'Married', true, 'calculate_mortgage_family_status_option_2', NOW()),
('calculate_mortgage_family_status_option_3', 'dropdown_option', 'family_status', 'refinance_credit_2', 'option', 'Divorced', true, 'calculate_mortgage_family_status_option_3', NOW()),
('calculate_mortgage_family_status_option_4', 'dropdown_option', 'family_status', 'refinance_credit_2', 'option', 'Widowed', true, 'calculate_mortgage_family_status_option_4', NOW()),
('calculate_mortgage_family_status_option_5', 'dropdown_option', 'family_status', 'refinance_credit_2', 'option', 'Common-law partner', true, 'calculate_mortgage_family_status_option_5', NOW()),
('calculate_mortgage_family_status_option_6', 'dropdown_option', 'family_status', 'refinance_credit_2', 'option', 'Other', true, 'calculate_mortgage_family_status_option_6', NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- =====================================================
-- CITIZENSHIP DROPDOWN OPTIONS
-- =====================================================

INSERT INTO content_items (
    content_key, 
    content_type, 
    category, 
    screen_location, 
    component_type,
    description,
    is_active, 
    legacy_translation_key,
    created_at
) VALUES
('calculate_mortgage_citizenship_option_1', 'dropdown_option', 'citizenship', 'refinance_credit_2', 'option', 'Israel', true, 'calculate_mortgage_citizenship_option_1', NOW()),
('calculate_mortgage_citizenship_option_2', 'dropdown_option', 'citizenship', 'refinance_credit_2', 'option', 'United States', true, 'calculate_mortgage_citizenship_option_2', NOW()),
('calculate_mortgage_citizenship_option_3', 'dropdown_option', 'citizenship', 'refinance_credit_2', 'option', 'Russia', true, 'calculate_mortgage_citizenship_option_3', NOW()),
('calculate_mortgage_citizenship_option_4', 'dropdown_option', 'citizenship', 'refinance_credit_2', 'option', 'Germany', true, 'calculate_mortgage_citizenship_option_4', NOW()),
('calculate_mortgage_citizenship_option_5', 'dropdown_option', 'citizenship', 'refinance_credit_2', 'option', 'France', true, 'calculate_mortgage_citizenship_option_5', NOW()),
('calculate_mortgage_citizenship_option_6', 'dropdown_option', 'citizenship', 'refinance_credit_2', 'option', 'United Kingdom', true, 'calculate_mortgage_citizenship_option_6', NOW()),
('calculate_mortgage_citizenship_option_7', 'dropdown_option', 'citizenship', 'refinance_credit_2', 'option', 'Canada', true, 'calculate_mortgage_citizenship_option_7', NOW()),
('calculate_mortgage_citizenship_option_8', 'dropdown_option', 'citizenship', 'refinance_credit_2', 'option', 'Ukraine', true, 'calculate_mortgage_citizenship_option_8', NOW()),
('calculate_mortgage_citizenship_option_9', 'dropdown_option', 'citizenship', 'refinance_credit_2', 'option', 'Other', true, 'calculate_mortgage_citizenship_option_9', NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- =====================================================
-- ADD PARTNER OPTIONS
-- =====================================================

INSERT INTO content_items (
    content_key, 
    content_type, 
    category, 
    screen_location, 
    component_type,
    description,
    is_active, 
    legacy_translation_key,
    created_at
) VALUES
('calculate_mortgage_add_partner_option_1', 'dropdown_option', 'add_partner', 'refinance_credit_2', 'option', 'As primary borrower', true, 'calculate_mortgage_add_partner_option_1', NOW()),
('calculate_mortgage_add_partner_option_2', 'dropdown_option', 'add_partner', 'refinance_credit_2', 'option', 'As secondary borrower', true, 'calculate_mortgage_add_partner_option_2', NOW()),
('calculate_mortgage_add_partner_option_3', 'dropdown_option', 'add_partner', 'refinance_credit_2', 'option', 'No', true, 'calculate_mortgage_add_partner_option_3', NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- =====================================================
-- ADD ALL TRANSLATIONS
-- =====================================================

-- Basic field translations
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- Name translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_name' AND screen_location = 'refinance_credit_2'), 'en', 'Full name', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_name' AND screen_location = 'refinance_credit_2'), 'he', 'שם מלא', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_name' AND screen_location = 'refinance_credit_2'), 'ru', 'Полное имя', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_name_ph' AND screen_location = 'refinance_credit_2'), 'en', 'Enter full name', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_name_ph' AND screen_location = 'refinance_credit_2'), 'he', 'הזן שם מלא', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_name_ph' AND screen_location = 'refinance_credit_2'), 'ru', 'Введите полное имя', false, 'approved', NOW()),

-- Birthday translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_birthday' AND screen_location = 'refinance_credit_2'), 'en', 'Date of birth', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_birthday' AND screen_location = 'refinance_credit_2'), 'he', 'תאריך לידה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_birthday' AND screen_location = 'refinance_credit_2'), 'ru', 'Дата рождения', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_birthday_ph' AND screen_location = 'refinance_credit_2'), 'en', 'Select date', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_birthday_ph' AND screen_location = 'refinance_credit_2'), 'he', 'בחר תאריך', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_birthday_ph' AND screen_location = 'refinance_credit_2'), 'ru', 'Выберите дату', false, 'approved', NOW()),

-- Education translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education' AND screen_location = 'refinance_credit_2'), 'en', 'Education level', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education' AND screen_location = 'refinance_credit_2'), 'he', 'רמת השכלה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education' AND screen_location = 'refinance_credit_2'), 'ru', 'Уровень образования', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_ph' AND screen_location = 'refinance_credit_2'), 'en', 'Select education level', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_ph' AND screen_location = 'refinance_credit_2'), 'he', 'בחר רמת השכלה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_ph' AND screen_location = 'refinance_credit_2'), 'ru', 'Выберите уровень образования', false, 'approved', NOW()),

-- Additional citizenships translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_additional_citizenships' AND screen_location = 'refinance_credit_2'), 'en', 'Additional citizenships', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_additional_citizenships' AND screen_location = 'refinance_credit_2'), 'he', 'אזרחויות נוספות', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_additional_citizenships' AND screen_location = 'refinance_credit_2'), 'ru', 'Дополнительные гражданства', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenships_dropdown' AND screen_location = 'refinance_credit_2'), 'en', 'Select citizenships', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenships_dropdown' AND screen_location = 'refinance_credit_2'), 'he', 'בחר אזרחויות', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenships_dropdown' AND screen_location = 'refinance_credit_2'), 'ru', 'Выберите гражданства', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenships_dropdown_ph' AND screen_location = 'refinance_credit_2'), 'en', 'Select countries', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenships_dropdown_ph' AND screen_location = 'refinance_credit_2'), 'he', 'בחר מדינות', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenships_dropdown_ph' AND screen_location = 'refinance_credit_2'), 'ru', 'Выберите страны', false, 'approved', NOW()),

-- Taxes translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_taxes' AND screen_location = 'refinance_credit_2'), 'en', 'Do you pay taxes abroad?', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_taxes' AND screen_location = 'refinance_credit_2'), 'he', 'האם אתה משלם מסים בחו"ל?', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_taxes' AND screen_location = 'refinance_credit_2'), 'ru', 'Платите ли вы налоги за границей?', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_countries_pay_taxes' AND screen_location = 'refinance_credit_2'), 'en', 'Countries where you pay taxes', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_countries_pay_taxes' AND screen_location = 'refinance_credit_2'), 'he', 'מדינות בהן אתה משלם מסים', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_countries_pay_taxes' AND screen_location = 'refinance_credit_2'), 'ru', 'Страны, где вы платите налоги', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_countries_pay_taxes_ph' AND screen_location = 'refinance_credit_2'), 'en', 'Select countries', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_countries_pay_taxes_ph' AND screen_location = 'refinance_credit_2'), 'he', 'בחר מדינות', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_countries_pay_taxes_ph' AND screen_location = 'refinance_credit_2'), 'ru', 'Выберите страны', false, 'approved', NOW()),

-- Children translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_childrens' AND screen_location = 'refinance_credit_2'), 'en', 'Do you have children?', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_childrens' AND screen_location = 'refinance_credit_2'), 'he', 'האם יש לך ילדים?', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_childrens' AND screen_location = 'refinance_credit_2'), 'ru', 'Есть ли у вас дети?', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_how_much_childrens' AND screen_location = 'refinance_credit_2'), 'en', 'Number of children', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_how_much_childrens' AND screen_location = 'refinance_credit_2'), 'he', 'מספר ילדים', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_how_much_childrens' AND screen_location = 'refinance_credit_2'), 'ru', 'Количество детей', false, 'approved', NOW()),

-- Medical insurance translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_medical_insurance' AND screen_location = 'refinance_credit_2'), 'en', 'Do you have medical insurance?', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_medical_insurance' AND screen_location = 'refinance_credit_2'), 'he', 'האם יש לך ביטוח רפואי?', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_medical_insurance' AND screen_location = 'refinance_credit_2'), 'ru', 'Есть ли у вас медицинская страховка?', false, 'approved', NOW()),

-- Is foreigner translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_is_foreigner' AND screen_location = 'refinance_credit_2'), 'en', 'Are you a foreign resident?', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_is_foreigner' AND screen_location = 'refinance_credit_2'), 'he', 'האם אתה תושב חוץ?', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_is_foreigner' AND screen_location = 'refinance_credit_2'), 'ru', 'Вы иностранный резидент?', false, 'approved', NOW()),

-- Public person translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_public_person' AND screen_location = 'refinance_credit_2'), 'en', 'Are you a public figure?', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_public_person' AND screen_location = 'refinance_credit_2'), 'he', 'האם אתה איש ציבור?', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_public_person' AND screen_location = 'refinance_credit_2'), 'ru', 'Вы публичная личность?', false, 'approved', NOW()),

-- Borrowers translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_borrowers' AND screen_location = 'refinance_credit_2'), 'en', 'Are there other borrowers?', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_borrowers' AND screen_location = 'refinance_credit_2'), 'he', 'האם יש לווים נוספים?', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_borrowers' AND screen_location = 'refinance_credit_2'), 'ru', 'Есть ли другие заемщики?', false, 'approved', NOW()),

-- Family status translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status' AND screen_location = 'refinance_credit_2'), 'en', 'Marital status', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status' AND screen_location = 'refinance_credit_2'), 'he', 'מצב משפחתי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status' AND screen_location = 'refinance_credit_2'), 'ru', 'Семейное положение', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status_ph' AND screen_location = 'refinance_credit_2'), 'en', 'Select marital status', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status_ph' AND screen_location = 'refinance_credit_2'), 'he', 'בחר מצב משפחתי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status_ph' AND screen_location = 'refinance_credit_2'), 'ru', 'Выберите семейное положение', false, 'approved', NOW()),

-- Partner pays mortgage translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_partner_pay_mortgage' AND screen_location = 'refinance_credit_2'), 'en', 'Will your partner participate in loan payments?', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_partner_pay_mortgage' AND screen_location = 'refinance_credit_2'), 'he', 'האם בן/בת הזוג ישתתף בהחזרי ההלוואה?', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_partner_pay_mortgage' AND screen_location = 'refinance_credit_2'), 'ru', 'Будет ли ваш партнер участвовать в выплатах по кредиту?', false, 'approved', NOW()),

-- Add partner translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_add_partner' AND screen_location = 'refinance_credit_2'), 'en', 'Add partner as borrower?', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_add_partner' AND screen_location = 'refinance_credit_2'), 'he', 'להוסיף את בן/בת הזוג כלווה?', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_add_partner' AND screen_location = 'refinance_credit_2'), 'ru', 'Добавить партнера как заемщика?', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_add_partner_ph' AND screen_location = 'refinance_credit_2'), 'en', 'Select option', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_add_partner_ph' AND screen_location = 'refinance_credit_2'), 'he', 'בחר אפשרות', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_add_partner_ph' AND screen_location = 'refinance_credit_2'), 'ru', 'Выберите опцию', false, 'approved', NOW()),

-- Yes/No translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_yes' AND screen_location = 'refinance_credit_2'), 'en', 'Yes', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_yes' AND screen_location = 'refinance_credit_2'), 'he', 'כן', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_yes' AND screen_location = 'refinance_credit_2'), 'ru', 'Да', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_no' AND screen_location = 'refinance_credit_2'), 'en', 'No', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_no' AND screen_location = 'refinance_credit_2'), 'he', 'לא', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_no' AND screen_location = 'refinance_credit_2'), 'ru', 'Нет', false, 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Education option translations
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- English
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_option_1' AND screen_location = 'refinance_credit_2'), 'en', 'No high school diploma', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_option_2' AND screen_location = 'refinance_credit_2'), 'en', 'Partial high school diploma', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_option_3' AND screen_location = 'refinance_credit_2'), 'en', 'Full high school diploma', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_option_4' AND screen_location = 'refinance_credit_2'), 'en', 'Post-secondary education', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_option_5' AND screen_location = 'refinance_credit_2'), 'en', 'Bachelor''s degree', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_option_6' AND screen_location = 'refinance_credit_2'), 'en', 'Master''s degree', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_option_7' AND screen_location = 'refinance_credit_2'), 'en', 'Doctoral degree', false, 'approved', NOW()),

-- Hebrew
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_option_1' AND screen_location = 'refinance_credit_2'), 'he', 'ללא תעודת בגרות', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_option_2' AND screen_location = 'refinance_credit_2'), 'he', 'תעודת בגרות חלקית', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_option_3' AND screen_location = 'refinance_credit_2'), 'he', 'תעודת בגרות מלאה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_option_4' AND screen_location = 'refinance_credit_2'), 'he', 'השכלה על-תיכונית', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_option_5' AND screen_location = 'refinance_credit_2'), 'he', 'תואר ראשון', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_option_6' AND screen_location = 'refinance_credit_2'), 'he', 'תואר שני', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_option_7' AND screen_location = 'refinance_credit_2'), 'he', 'תואר שלישי', false, 'approved', NOW()),

-- Russian
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_option_1' AND screen_location = 'refinance_credit_2'), 'ru', 'Без аттестата о среднем образовании', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_option_2' AND screen_location = 'refinance_credit_2'), 'ru', 'Неполное среднее образование', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_option_3' AND screen_location = 'refinance_credit_2'), 'ru', 'Полное среднее образование', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_option_4' AND screen_location = 'refinance_credit_2'), 'ru', 'Среднее специальное образование', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_option_5' AND screen_location = 'refinance_credit_2'), 'ru', 'Степень бакалавра', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_option_6' AND screen_location = 'refinance_credit_2'), 'ru', 'Степень магистра', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_education_option_7' AND screen_location = 'refinance_credit_2'), 'ru', 'Докторская степень', false, 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Family status option translations
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- English
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status_option_1' AND screen_location = 'refinance_credit_2'), 'en', 'Single', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status_option_2' AND screen_location = 'refinance_credit_2'), 'en', 'Married', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status_option_3' AND screen_location = 'refinance_credit_2'), 'en', 'Divorced', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status_option_4' AND screen_location = 'refinance_credit_2'), 'en', 'Widowed', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status_option_5' AND screen_location = 'refinance_credit_2'), 'en', 'Common-law partner', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status_option_6' AND screen_location = 'refinance_credit_2'), 'en', 'Other', false, 'approved', NOW()),

-- Hebrew
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status_option_1' AND screen_location = 'refinance_credit_2'), 'he', 'רווק/ה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status_option_2' AND screen_location = 'refinance_credit_2'), 'he', 'נשוי/אה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status_option_3' AND screen_location = 'refinance_credit_2'), 'he', 'גרוש/ה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status_option_4' AND screen_location = 'refinance_credit_2'), 'he', 'אלמן/ה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status_option_5' AND screen_location = 'refinance_credit_2'), 'he', 'ידוע/ה בציבור', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status_option_6' AND screen_location = 'refinance_credit_2'), 'he', 'אחר', false, 'approved', NOW()),

-- Russian
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status_option_1' AND screen_location = 'refinance_credit_2'), 'ru', 'Холост/Не замужем', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status_option_2' AND screen_location = 'refinance_credit_2'), 'ru', 'Женат/Замужем', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status_option_3' AND screen_location = 'refinance_credit_2'), 'ru', 'Разведен/а', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status_option_4' AND screen_location = 'refinance_credit_2'), 'ru', 'Вдовец/Вдова', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status_option_5' AND screen_location = 'refinance_credit_2'), 'ru', 'Гражданский брак', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_family_status_option_6' AND screen_location = 'refinance_credit_2'), 'ru', 'Другое', false, 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Citizenship option translations
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- English
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_1' AND screen_location = 'refinance_credit_2'), 'en', 'Israel', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_2' AND screen_location = 'refinance_credit_2'), 'en', 'United States', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_3' AND screen_location = 'refinance_credit_2'), 'en', 'Russia', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_4' AND screen_location = 'refinance_credit_2'), 'en', 'Germany', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_5' AND screen_location = 'refinance_credit_2'), 'en', 'France', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_6' AND screen_location = 'refinance_credit_2'), 'en', 'United Kingdom', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_7' AND screen_location = 'refinance_credit_2'), 'en', 'Canada', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_8' AND screen_location = 'refinance_credit_2'), 'en', 'Ukraine', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_9' AND screen_location = 'refinance_credit_2'), 'en', 'Other', false, 'approved', NOW()),

-- Hebrew
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_1' AND screen_location = 'refinance_credit_2'), 'he', 'ישראל', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_2' AND screen_location = 'refinance_credit_2'), 'he', 'ארצות הברית', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_3' AND screen_location = 'refinance_credit_2'), 'he', 'רוסיה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_4' AND screen_location = 'refinance_credit_2'), 'he', 'גרמניה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_5' AND screen_location = 'refinance_credit_2'), 'he', 'צרפת', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_6' AND screen_location = 'refinance_credit_2'), 'he', 'בריטניה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_7' AND screen_location = 'refinance_credit_2'), 'he', 'קנדה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_8' AND screen_location = 'refinance_credit_2'), 'he', 'אוקראינה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_9' AND screen_location = 'refinance_credit_2'), 'he', 'אחר', false, 'approved', NOW()),

-- Russian
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_1' AND screen_location = 'refinance_credit_2'), 'ru', 'Израиль', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_2' AND screen_location = 'refinance_credit_2'), 'ru', 'Соединенные Штаты', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_3' AND screen_location = 'refinance_credit_2'), 'ru', 'Россия', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_4' AND screen_location = 'refinance_credit_2'), 'ru', 'Германия', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_5' AND screen_location = 'refinance_credit_2'), 'ru', 'Франция', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_6' AND screen_location = 'refinance_credit_2'), 'ru', 'Великобритания', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_7' AND screen_location = 'refinance_credit_2'), 'ru', 'Канада', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_8' AND screen_location = 'refinance_credit_2'), 'ru', 'Украина', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_citizenship_option_9' AND screen_location = 'refinance_credit_2'), 'ru', 'Другое', false, 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Add partner option translations
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- English
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_add_partner_option_1' AND screen_location = 'refinance_credit_2'), 'en', 'As primary borrower', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_add_partner_option_2' AND screen_location = 'refinance_credit_2'), 'en', 'As secondary borrower', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_add_partner_option_3' AND screen_location = 'refinance_credit_2'), 'en', 'No', false, 'approved', NOW()),

-- Hebrew
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_add_partner_option_1' AND screen_location = 'refinance_credit_2'), 'he', 'כלווה ראשי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_add_partner_option_2' AND screen_location = 'refinance_credit_2'), 'he', 'כלווה משני', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_add_partner_option_3' AND screen_location = 'refinance_credit_2'), 'he', 'לא', false, 'approved', NOW()),

-- Russian
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_add_partner_option_1' AND screen_location = 'refinance_credit_2'), 'ru', 'Как основной заемщик', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_add_partner_option_2' AND screen_location = 'refinance_credit_2'), 'ru', 'Как второстепенный заемщик', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_add_partner_option_3' AND screen_location = 'refinance_credit_2'), 'ru', 'Нет', false, 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Mark the migration as completed
COMMENT ON TABLE content_items IS 'Refinance Credit Step 2 migration completed - all personal details fields and dropdown options added';