-- Migration: Refinance Credit Step 3 - Complete Income Details
-- Date: 2025-01-26
-- Purpose: Add all content for refinance credit step 3 form (income details)

-- =====================================================
-- REFINANCE CREDIT STEP 3 - PAGE TITLE AND CAPTIONS
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
('calculate_mortgage_step3_title', 'title', 'page', 'refinance_credit_3', 'text', 'Income Details', true, 'calculate_mortgage_step3_title', NOW())
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
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_step3_title' AND screen_location = 'refinance_credit_3'), 'en', 'Income Details', true, 'approved', NOW()),
-- Hebrew
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_step3_title' AND screen_location = 'refinance_credit_3'), 'he', 'פרטי הכנסה', false, 'approved', NOW()),
-- Russian
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_step3_title' AND screen_location = 'refinance_credit_3'), 'ru', 'Детали дохода', false, 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- =====================================================
-- MAIN INCOME SOURCE SECTION
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
-- Main source of income
('calculate_mortgage_main_source', 'label', 'form_field', 'refinance_credit_3', 'text', 'Main income source', true, 'calculate_mortgage_main_source', NOW()),
('calculate_mortgage_main_source_ph', 'placeholder', 'form_field', 'refinance_credit_3', 'text', 'Select main income source', true, 'calculate_mortgage_main_source_ph', NOW()),

-- Income source fields
('calculate_mortgage_monthly_income', 'label', 'form_field', 'refinance_credit_3', 'text', 'Monthly net income', true, 'calculate_mortgage_monthly_income', NOW()),
('calculate_mortgage_monthly_income_ph', 'placeholder', 'form_field', 'refinance_credit_3', 'text', 'Enter monthly net income', true, 'calculate_mortgage_monthly_income_ph', NOW()),
('calculate_mortgage_monthly_income_hint', 'hint', 'form_field', 'refinance_credit_3', 'text', 'Amount shown after tax deduction as confirmed by accountant', true, 'calculate_mortgage_monthly_income_hint', NOW()),
('calculate_mortgage_monthly_income_year_hint', 'hint', 'form_field', 'refinance_credit_3', 'text', 'Enter gross annual income', true, 'calculate_mortgage_monthly_income_year_hint', NOW()),

-- Company and profession fields
('calculate_mortgage_company', 'label', 'form_field', 'refinance_credit_3', 'text', 'Company', true, 'calculate_mortgage_company', NOW()),
('calculate_mortgage_company_ph', 'placeholder', 'form_field', 'refinance_credit_3', 'text', 'Enter company name', true, 'calculate_mortgage_company_ph', NOW()),
('calculate_mortgage_profession', 'label', 'form_field', 'refinance_credit_3', 'text', 'Position', true, 'calculate_mortgage_profession', NOW()),
('calculate_mortgage_profession_ph', 'placeholder', 'form_field', 'refinance_credit_3', 'text', 'Your current position at workplace', true, 'calculate_mortgage_profession_ph', NOW()),
('calculate_mortgage_sfere', 'label', 'form_field', 'refinance_credit_3', 'text', 'Professional field of activity', true, 'calculate_mortgage_sfere', NOW()),
('calculate_mortgage_sfere_ph', 'placeholder', 'form_field', 'refinance_credit_3', 'text', 'Enter professional field', true, 'calculate_mortgage_sfere_ph', NOW()),

-- Start date
('calculate_mortgage_start_date', 'label', 'form_field', 'refinance_credit_3', 'text', 'Work start date', true, 'calculate_mortgage_start_date', NOW()),
('calculate_mortgage_start_date_ph', 'placeholder', 'form_field', 'refinance_credit_3', 'text', 'Select date', true, 'calculate_mortgage_start_date_ph', NOW()),

-- Income fields for self-employed
('calculate_mortgage_amount_income_current_year', 'label', 'form_field', 'refinance_credit_3', 'text', 'Annual income current year', true, 'calculate_mortgage_amount_income_current_year', NOW()),
('calculate_mortgage_amount_income_current_year_ph', 'placeholder', 'form_field', 'refinance_credit_3', 'text', 'Enter annual income', true, 'calculate_mortgage_amount_income_current_year_ph', NOW()),

-- No income date
('calculate_mortgage_no_income', 'label', 'form_field', 'refinance_credit_3', 'text', 'Date stopped working', true, 'calculate_mortgage_no_income', NOW()),
('calculate_mortgage_no_income_ph', 'placeholder', 'form_field', 'refinance_credit_3', 'text', 'Select date', true, 'calculate_mortgage_no_income_ph', NOW()),

-- Additional source of income modal
('source_of_income', 'label', 'section', 'refinance_credit_3', 'text', 'Income source', true, 'source_of_income', NOW()),
('add_place_to_work', 'button', 'action', 'refinance_credit_3', 'text', 'Add workplace', true, 'add_place_to_work', NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- =====================================================
-- MAIN INCOME SOURCE OPTIONS
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
('calculate_mortgage_main_source_option_1', 'dropdown_option', 'income_source', 'refinance_credit_3', 'option', 'Employee', true, 'calculate_mortgage_main_source_option_1', NOW()),
('calculate_mortgage_main_source_option_2', 'dropdown_option', 'income_source', 'refinance_credit_3', 'option', 'Self-employed', true, 'calculate_mortgage_main_source_option_2', NOW()),
('calculate_mortgage_main_source_option_3', 'dropdown_option', 'income_source', 'refinance_credit_3', 'option', 'Pensioner', true, 'calculate_mortgage_main_source_option_3', NOW()),
('calculate_mortgage_main_source_option_4', 'dropdown_option', 'income_source', 'refinance_credit_3', 'option', 'Student', true, 'calculate_mortgage_main_source_option_4', NOW()),
('calculate_mortgage_main_source_option_5', 'dropdown_option', 'income_source', 'refinance_credit_3', 'option', 'Unpaid leave', true, 'calculate_mortgage_main_source_option_5', NOW()),
('calculate_mortgage_main_source_option_6', 'dropdown_option', 'income_source', 'refinance_credit_3', 'option', 'Unemployed', true, 'calculate_mortgage_main_source_option_6', NOW()),
('calculate_mortgage_main_source_option_7', 'dropdown_option', 'income_source', 'refinance_credit_3', 'option', 'Other', true, 'calculate_mortgage_main_source_option_7', NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- =====================================================
-- ADDITIONAL INCOME SECTION
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
-- Additional income fields
('calculate_mortgage_has_additional', 'label', 'form_field', 'refinance_credit_3', 'text', 'Do you have additional income?', true, 'calculate_mortgage_has_additional', NOW()),
('calculate_mortgage_has_additional_ph', 'placeholder', 'form_field', 'refinance_credit_3', 'text', 'Select additional income type', true, 'calculate_mortgage_has_additional_ph', NOW()),
('calculate_mortgage_additional_amount', 'label', 'form_field', 'refinance_credit_3', 'text', 'Additional income amount', true, 'calculate_mortgage_additional_amount', NOW()),
('calculate_mortgage_additional_amount_ph', 'placeholder', 'form_field', 'refinance_credit_3', 'text', 'Enter amount', true, 'calculate_mortgage_additional_amount_ph', NOW()),

-- Additional income modal
('additional_source_of_income', 'label', 'section', 'refinance_credit_3', 'text', 'Additional income source', true, 'additional_source_of_income', NOW()),
('add_additional_source_of_income', 'button', 'action', 'refinance_credit_3', 'text', 'Add additional income source', true, 'add_additional_source_of_income', NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- =====================================================
-- ADDITIONAL INCOME OPTIONS
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
('calculate_mortgage_has_additional_option_1', 'dropdown_option', 'additional_income', 'refinance_credit_3', 'option', 'None', true, 'calculate_mortgage_has_additional_option_1', NOW()),
('calculate_mortgage_has_additional_option_2', 'dropdown_option', 'additional_income', 'refinance_credit_3', 'option', 'Additional Salary', true, 'calculate_mortgage_has_additional_option_2', NOW()),
('calculate_mortgage_has_additional_option_3', 'dropdown_option', 'additional_income', 'refinance_credit_3', 'option', 'Additional Work', true, 'calculate_mortgage_has_additional_option_3', NOW()),
('calculate_mortgage_has_additional_option_4', 'dropdown_option', 'additional_income', 'refinance_credit_3', 'option', 'Property Rental', true, 'calculate_mortgage_has_additional_option_4', NOW()),
('calculate_mortgage_has_additional_option_5', 'dropdown_option', 'additional_income', 'refinance_credit_3', 'option', 'Investments', true, 'calculate_mortgage_has_additional_option_5', NOW()),
('calculate_mortgage_has_additional_option_6', 'dropdown_option', 'additional_income', 'refinance_credit_3', 'option', 'Pension', true, 'calculate_mortgage_has_additional_option_6', NOW()),
('calculate_mortgage_has_additional_option_7', 'dropdown_option', 'additional_income', 'refinance_credit_3', 'option', 'Other', true, 'calculate_mortgage_has_additional_option_7', NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- =====================================================
-- OBLIGATIONS SECTION
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
-- Obligations fields
('calculate_mortgage_debt_types', 'label', 'form_field', 'refinance_credit_3', 'text', 'Do you have bank debts or existing financial obligations?', true, 'calculate_mortgage_debt_types', NOW()),
('calculate_mortgage_debt_types_ph', 'placeholder', 'form_field', 'refinance_credit_3', 'text', 'Select obligation type', true, 'calculate_mortgage_debt_types_ph', NOW()),
('calculate_mortgage_bank', 'label', 'form_field', 'refinance_credit_3', 'text', 'Lending bank', true, 'calculate_mortgage_bank', NOW()),
('calculate_mortgage_bank_ph', 'placeholder', 'form_field', 'refinance_credit_3', 'text', 'Select bank', true, 'calculate_mortgage_bank_ph', NOW()),
('calculate_mortgage_monthly_payment_for_another_bank', 'label', 'form_field', 'refinance_credit_3', 'text', 'Monthly payment amount', true, 'calculate_mortgage_monthly_payment_for_another_bank', NOW()),
('calculate_mortgage_monthly_payment_for_another_bank_ph', 'placeholder', 'form_field', 'refinance_credit_3', 'text', 'Enter monthly payment', true, 'calculate_mortgage_monthly_payment_for_another_bank_ph', NOW()),
('calculate_mortgage_end_date', 'label', 'form_field', 'refinance_credit_3', 'text', 'Obligation end date', true, 'calculate_mortgage_end_date', NOW()),
('calculate_mortgage_end_date_ph', 'placeholder', 'form_field', 'refinance_credit_3', 'text', 'Select date', true, 'calculate_mortgage_end_date_ph', NOW()),

-- Obligation modal
('obligation', 'label', 'section', 'refinance_credit_3', 'text', 'Obligation', true, 'obligation', NOW()),
('add_obligation', 'button', 'action', 'refinance_credit_3', 'text', 'Add obligation', true, 'add_obligation', NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- =====================================================
-- OBLIGATION TYPE OPTIONS
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
('calculate_mortgage_debt_types_option_1', 'dropdown_option', 'obligation_type', 'refinance_credit_3', 'option', 'No obligations', true, 'calculate_mortgage_debt_types_option_1', NOW()),
('calculate_mortgage_debt_types_option_2', 'dropdown_option', 'obligation_type', 'refinance_credit_3', 'option', 'Bank loan', true, 'calculate_mortgage_debt_types_option_2', NOW()),
('calculate_mortgage_debt_types_option_3', 'dropdown_option', 'obligation_type', 'refinance_credit_3', 'option', 'Consumer credit', true, 'calculate_mortgage_debt_types_option_3', NOW()),
('calculate_mortgage_debt_types_option_4', 'dropdown_option', 'obligation_type', 'refinance_credit_3', 'option', 'Credit card debt', true, 'calculate_mortgage_debt_types_option_4', NOW()),
('calculate_mortgage_debt_types_option_5', 'dropdown_option', 'obligation_type', 'refinance_credit_3', 'option', 'Other', true, 'calculate_mortgage_debt_types_option_5', NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- =====================================================
-- BORROWER SECTION
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
('borrower', 'label', 'section', 'refinance_credit_3', 'text', 'Borrower', true, 'borrower', NOW()),
('add_borrower', 'button', 'action', 'refinance_credit_3', 'text', 'Add borrower', true, 'add_borrower', NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- =====================================================
-- BANK OPTIONS (FOR OBLIGATIONS)
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
-- Bank options (reusing from step 1 but with different screen location)
('bank_hapoalim', 'dropdown_option', 'bank', 'refinance_credit_3', 'option', 'Bank Hapoalim', true, 'bank_hapoalim', NOW()),
('bank_leumi', 'dropdown_option', 'bank', 'refinance_credit_3', 'option', 'Bank Leumi', true, 'bank_leumi', NOW()),
('bank_discount', 'dropdown_option', 'bank', 'refinance_credit_3', 'option', 'Discount Bank', true, 'bank_discount', NOW()),
('bank_massad', 'dropdown_option', 'bank', 'refinance_credit_3', 'option', 'Massad Bank', true, 'bank_massad', NOW()),
('bank_israel', 'dropdown_option', 'bank', 'refinance_credit_3', 'option', 'Bank of Israel', true, 'bank_israel', NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- =====================================================
-- ADD ALL TRANSLATIONS
-- =====================================================

-- Main income source field translations
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- Main source translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source' AND screen_location = 'refinance_credit_3'), 'en', 'Main income source', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source' AND screen_location = 'refinance_credit_3'), 'he', 'מקור הכנסה עיקרי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source' AND screen_location = 'refinance_credit_3'), 'ru', 'Основной источник дохода', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_ph' AND screen_location = 'refinance_credit_3'), 'en', 'Select main income source', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_ph' AND screen_location = 'refinance_credit_3'), 'he', 'בחר מקור הכנסה עיקרי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_ph' AND screen_location = 'refinance_credit_3'), 'ru', 'Выберите основной источник дохода', false, 'approved', NOW()),

-- Monthly income translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_monthly_income' AND screen_location = 'refinance_credit_3'), 'en', 'Monthly net income', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_monthly_income' AND screen_location = 'refinance_credit_3'), 'he', 'הכנסה חודשית נטו', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_monthly_income' AND screen_location = 'refinance_credit_3'), 'ru', 'Ежемесячный чистый доход', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_monthly_income_ph' AND screen_location = 'refinance_credit_3'), 'en', 'Enter monthly net income', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_monthly_income_ph' AND screen_location = 'refinance_credit_3'), 'he', 'הזן הכנסה חודשית נטו', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_monthly_income_ph' AND screen_location = 'refinance_credit_3'), 'ru', 'Введите ежемесячный чистый доход', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_monthly_income_hint' AND screen_location = 'refinance_credit_3'), 'en', 'Amount shown after tax deduction as confirmed by accountant', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_monthly_income_hint' AND screen_location = 'refinance_credit_3'), 'he', 'סכום המוצג לאחר ניכוי מס כפי שאושר על ידי רואה חשבון', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_monthly_income_hint' AND screen_location = 'refinance_credit_3'), 'ru', 'Сумма после вычета налогов, подтвержденная бухгалтером', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_monthly_income_year_hint' AND screen_location = 'refinance_credit_3'), 'en', 'Enter gross annual income', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_monthly_income_year_hint' AND screen_location = 'refinance_credit_3'), 'he', 'הזן הכנסה שנתית ברוטו', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_monthly_income_year_hint' AND screen_location = 'refinance_credit_3'), 'ru', 'Введите валовой годовой доход', false, 'approved', NOW()),

-- Company and profession translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_company' AND screen_location = 'refinance_credit_3'), 'en', 'Company', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_company' AND screen_location = 'refinance_credit_3'), 'he', 'חברה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_company' AND screen_location = 'refinance_credit_3'), 'ru', 'Компания', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_company_ph' AND screen_location = 'refinance_credit_3'), 'en', 'Enter company name', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_company_ph' AND screen_location = 'refinance_credit_3'), 'he', 'הזן שם חברה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_company_ph' AND screen_location = 'refinance_credit_3'), 'ru', 'Введите название компании', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_profession' AND screen_location = 'refinance_credit_3'), 'en', 'Position', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_profession' AND screen_location = 'refinance_credit_3'), 'he', 'תפקיד', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_profession' AND screen_location = 'refinance_credit_3'), 'ru', 'Должность', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_profession_ph' AND screen_location = 'refinance_credit_3'), 'en', 'Your current position at workplace', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_profession_ph' AND screen_location = 'refinance_credit_3'), 'he', 'התפקיד הנוכחי שלך במקום העבודה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_profession_ph' AND screen_location = 'refinance_credit_3'), 'ru', 'Ваша текущая должность на рабочем месте', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_sfere' AND screen_location = 'refinance_credit_3'), 'en', 'Professional field of activity', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_sfere' AND screen_location = 'refinance_credit_3'), 'he', 'תחום פעילות מקצועי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_sfere' AND screen_location = 'refinance_credit_3'), 'ru', 'Профессиональная сфера деятельности', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_sfere_ph' AND screen_location = 'refinance_credit_3'), 'en', 'Enter professional field', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_sfere_ph' AND screen_location = 'refinance_credit_3'), 'he', 'הזן תחום מקצועי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_sfere_ph' AND screen_location = 'refinance_credit_3'), 'ru', 'Введите профессиональную сферу', false, 'approved', NOW()),

-- Start date translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_start_date' AND screen_location = 'refinance_credit_3'), 'en', 'Work start date', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_start_date' AND screen_location = 'refinance_credit_3'), 'he', 'תאריך תחילת עבודה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_start_date' AND screen_location = 'refinance_credit_3'), 'ru', 'Дата начала работы', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_start_date_ph' AND screen_location = 'refinance_credit_3'), 'en', 'Select date', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_start_date_ph' AND screen_location = 'refinance_credit_3'), 'he', 'בחר תאריך', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_start_date_ph' AND screen_location = 'refinance_credit_3'), 'ru', 'Выберите дату', false, 'approved', NOW()),

-- Annual income translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_amount_income_current_year' AND screen_location = 'refinance_credit_3'), 'en', 'Annual income current year', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_amount_income_current_year' AND screen_location = 'refinance_credit_3'), 'he', 'הכנסה שנתית לשנה הנוכחית', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_amount_income_current_year' AND screen_location = 'refinance_credit_3'), 'ru', 'Годовой доход за текущий год', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_amount_income_current_year_ph' AND screen_location = 'refinance_credit_3'), 'en', 'Enter annual income', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_amount_income_current_year_ph' AND screen_location = 'refinance_credit_3'), 'he', 'הזן הכנסה שנתית', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_amount_income_current_year_ph' AND screen_location = 'refinance_credit_3'), 'ru', 'Введите годовой доход', false, 'approved', NOW()),

-- No income date translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_no_income' AND screen_location = 'refinance_credit_3'), 'en', 'Date stopped working', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_no_income' AND screen_location = 'refinance_credit_3'), 'he', 'תאריך הפסקת עבודה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_no_income' AND screen_location = 'refinance_credit_3'), 'ru', 'Дата прекращения работы', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_no_income_ph' AND screen_location = 'refinance_credit_3'), 'en', 'Select date', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_no_income_ph' AND screen_location = 'refinance_credit_3'), 'he', 'בחר תאריך', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_no_income_ph' AND screen_location = 'refinance_credit_3'), 'ru', 'Выберите дату', false, 'approved', NOW()),

-- Source of income modal translations
((SELECT id FROM content_items WHERE content_key = 'source_of_income' AND screen_location = 'refinance_credit_3'), 'en', 'Income source', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'source_of_income' AND screen_location = 'refinance_credit_3'), 'he', 'מקור הכנסה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'source_of_income' AND screen_location = 'refinance_credit_3'), 'ru', 'Источник дохода', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'add_place_to_work' AND screen_location = 'refinance_credit_3'), 'en', 'Add workplace', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'add_place_to_work' AND screen_location = 'refinance_credit_3'), 'he', 'הוסף מקום עבודה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'add_place_to_work' AND screen_location = 'refinance_credit_3'), 'ru', 'Добавить место работы', false, 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Main income source option translations
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- English
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_1' AND screen_location = 'refinance_credit_3'), 'en', 'Employee', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_2' AND screen_location = 'refinance_credit_3'), 'en', 'Self-employed', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_3' AND screen_location = 'refinance_credit_3'), 'en', 'Pensioner', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_4' AND screen_location = 'refinance_credit_3'), 'en', 'Student', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_5' AND screen_location = 'refinance_credit_3'), 'en', 'Unpaid leave', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_6' AND screen_location = 'refinance_credit_3'), 'en', 'Unemployed', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_7' AND screen_location = 'refinance_credit_3'), 'en', 'Other', false, 'approved', NOW()),

-- Hebrew
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_1' AND screen_location = 'refinance_credit_3'), 'he', 'שכיר', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_2' AND screen_location = 'refinance_credit_3'), 'he', 'עצמאי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_3' AND screen_location = 'refinance_credit_3'), 'he', 'פנסיונר', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_4' AND screen_location = 'refinance_credit_3'), 'he', 'סטודנט', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_5' AND screen_location = 'refinance_credit_3'), 'he', 'חופשה ללא תשלום', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_6' AND screen_location = 'refinance_credit_3'), 'he', 'לא עובד', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_7' AND screen_location = 'refinance_credit_3'), 'he', 'אחר', false, 'approved', NOW()),

-- Russian
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_1' AND screen_location = 'refinance_credit_3'), 'ru', 'Наемный работник', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_2' AND screen_location = 'refinance_credit_3'), 'ru', 'Самозанятый', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_3' AND screen_location = 'refinance_credit_3'), 'ru', 'Пенсионер', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_4' AND screen_location = 'refinance_credit_3'), 'ru', 'Студент', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_5' AND screen_location = 'refinance_credit_3'), 'ru', 'Неоплачиваемый отпуск', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_6' AND screen_location = 'refinance_credit_3'), 'ru', 'Безработный', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_7' AND screen_location = 'refinance_credit_3'), 'ru', 'Другое', false, 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Additional income field translations
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- Additional income translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional' AND screen_location = 'refinance_credit_3'), 'en', 'Do you have additional income?', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional' AND screen_location = 'refinance_credit_3'), 'he', 'האם יש לך הכנסה נוספת?', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional' AND screen_location = 'refinance_credit_3'), 'ru', 'Есть ли у вас дополнительный доход?', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_ph' AND screen_location = 'refinance_credit_3'), 'en', 'Select additional income type', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_ph' AND screen_location = 'refinance_credit_3'), 'he', 'בחר סוג הכנסה נוספת', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_ph' AND screen_location = 'refinance_credit_3'), 'ru', 'Выберите тип дополнительного дохода', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_additional_amount' AND screen_location = 'refinance_credit_3'), 'en', 'Additional income amount', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_additional_amount' AND screen_location = 'refinance_credit_3'), 'he', 'סכום הכנסה נוספת', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_additional_amount' AND screen_location = 'refinance_credit_3'), 'ru', 'Сумма дополнительного дохода', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_additional_amount_ph' AND screen_location = 'refinance_credit_3'), 'en', 'Enter amount', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_additional_amount_ph' AND screen_location = 'refinance_credit_3'), 'he', 'הזן סכום', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_additional_amount_ph' AND screen_location = 'refinance_credit_3'), 'ru', 'Введите сумму', false, 'approved', NOW()),

-- Additional income modal translations
((SELECT id FROM content_items WHERE content_key = 'additional_source_of_income' AND screen_location = 'refinance_credit_3'), 'en', 'Additional income source', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'additional_source_of_income' AND screen_location = 'refinance_credit_3'), 'he', 'מקור הכנסה נוסף', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'additional_source_of_income' AND screen_location = 'refinance_credit_3'), 'ru', 'Дополнительный источник дохода', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'add_additional_source_of_income' AND screen_location = 'refinance_credit_3'), 'en', 'Add additional income source', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'add_additional_source_of_income' AND screen_location = 'refinance_credit_3'), 'he', 'הוסף מקור הכנסה נוסף', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'add_additional_source_of_income' AND screen_location = 'refinance_credit_3'), 'ru', 'Добавить дополнительный источник дохода', false, 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Additional income option translations
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- English
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_1' AND screen_location = 'refinance_credit_3'), 'en', 'None', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_2' AND screen_location = 'refinance_credit_3'), 'en', 'Additional Salary', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_3' AND screen_location = 'refinance_credit_3'), 'en', 'Additional Work', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_4' AND screen_location = 'refinance_credit_3'), 'en', 'Property Rental', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_5' AND screen_location = 'refinance_credit_3'), 'en', 'Investments', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_6' AND screen_location = 'refinance_credit_3'), 'en', 'Pension', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_7' AND screen_location = 'refinance_credit_3'), 'en', 'Other', false, 'approved', NOW()),

-- Hebrew
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_1' AND screen_location = 'refinance_credit_3'), 'he', 'אין', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_2' AND screen_location = 'refinance_credit_3'), 'he', 'משכורת נוספת', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_3' AND screen_location = 'refinance_credit_3'), 'he', 'עבודה נוספת', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_4' AND screen_location = 'refinance_credit_3'), 'he', 'השכרת נכס', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_5' AND screen_location = 'refinance_credit_3'), 'he', 'השקעות', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_6' AND screen_location = 'refinance_credit_3'), 'he', 'פנסיה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_7' AND screen_location = 'refinance_credit_3'), 'he', 'אחר', false, 'approved', NOW()),

-- Russian
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_1' AND screen_location = 'refinance_credit_3'), 'ru', 'Нет', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_2' AND screen_location = 'refinance_credit_3'), 'ru', 'Дополнительная зарплата', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_3' AND screen_location = 'refinance_credit_3'), 'ru', 'Дополнительная работа', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_4' AND screen_location = 'refinance_credit_3'), 'ru', 'Аренда недвижимости', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_5' AND screen_location = 'refinance_credit_3'), 'ru', 'Инвестиции', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_6' AND screen_location = 'refinance_credit_3'), 'ru', 'Пенсия', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_7' AND screen_location = 'refinance_credit_3'), 'ru', 'Другое', false, 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Obligations field translations
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- Obligations translations
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_debt_types' AND screen_location = 'refinance_credit_3'), 'en', 'Do you have bank debts or existing financial obligations?', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_debt_types' AND screen_location = 'refinance_credit_3'), 'he', 'האם יש לך חובות בנקאיים או התחייבויות פיננסיות קיימות?', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_debt_types' AND screen_location = 'refinance_credit_3'), 'ru', 'Есть ли у вас банковские долги или существующие финансовые обязательства?', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_ph' AND screen_location = 'refinance_credit_3'), 'en', 'Select obligation type', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_ph' AND screen_location = 'refinance_credit_3'), 'he', 'בחר סוג התחייבות', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_ph' AND screen_location = 'refinance_credit_3'), 'ru', 'Выберите тип обязательства', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_bank' AND screen_location = 'refinance_credit_3'), 'en', 'Lending bank', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_bank' AND screen_location = 'refinance_credit_3'), 'he', 'בנק מלווה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_bank' AND screen_location = 'refinance_credit_3'), 'ru', 'Кредитующий банк', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_bank_ph' AND screen_location = 'refinance_credit_3'), 'en', 'Select bank', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_bank_ph' AND screen_location = 'refinance_credit_3'), 'he', 'בחר בנק', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_bank_ph' AND screen_location = 'refinance_credit_3'), 'ru', 'Выберите банк', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_monthly_payment_for_another_bank' AND screen_location = 'refinance_credit_3'), 'en', 'Monthly payment amount', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_monthly_payment_for_another_bank' AND screen_location = 'refinance_credit_3'), 'he', 'סכום תשלום חודשי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_monthly_payment_for_another_bank' AND screen_location = 'refinance_credit_3'), 'ru', 'Сумма ежемесячного платежа', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_monthly_payment_for_another_bank_ph' AND screen_location = 'refinance_credit_3'), 'en', 'Enter monthly payment', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_monthly_payment_for_another_bank_ph' AND screen_location = 'refinance_credit_3'), 'he', 'הזן תשלום חודשי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_monthly_payment_for_another_bank_ph' AND screen_location = 'refinance_credit_3'), 'ru', 'Введите ежемесячный платеж', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_end_date' AND screen_location = 'refinance_credit_3'), 'en', 'Obligation end date', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_end_date' AND screen_location = 'refinance_credit_3'), 'he', 'תאריך סיום התחייבות', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_end_date' AND screen_location = 'refinance_credit_3'), 'ru', 'Дата окончания обязательства', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_end_date_ph' AND screen_location = 'refinance_credit_3'), 'en', 'Select date', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_end_date_ph' AND screen_location = 'refinance_credit_3'), 'he', 'בחר תאריך', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_end_date_ph' AND screen_location = 'refinance_credit_3'), 'ru', 'Выберите дату', false, 'approved', NOW()),

-- Obligation modal translations
((SELECT id FROM content_items WHERE content_key = 'obligation' AND screen_location = 'refinance_credit_3'), 'en', 'Obligation', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'obligation' AND screen_location = 'refinance_credit_3'), 'he', 'התחייבות', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'obligation' AND screen_location = 'refinance_credit_3'), 'ru', 'Обязательство', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'add_obligation' AND screen_location = 'refinance_credit_3'), 'en', 'Add obligation', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'add_obligation' AND screen_location = 'refinance_credit_3'), 'he', 'הוסף התחייבות', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'add_obligation' AND screen_location = 'refinance_credit_3'), 'ru', 'Добавить обязательство', false, 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Obligation type option translations
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- English
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_1' AND screen_location = 'refinance_credit_3'), 'en', 'No obligations', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_2' AND screen_location = 'refinance_credit_3'), 'en', 'Bank loan', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_3' AND screen_location = 'refinance_credit_3'), 'en', 'Consumer credit', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_4' AND screen_location = 'refinance_credit_3'), 'en', 'Credit card debt', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_5' AND screen_location = 'refinance_credit_3'), 'en', 'Other', false, 'approved', NOW()),

-- Hebrew
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_1' AND screen_location = 'refinance_credit_3'), 'he', 'אין התחייבויות', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_2' AND screen_location = 'refinance_credit_3'), 'he', 'הלוואה בנקאית', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_3' AND screen_location = 'refinance_credit_3'), 'he', 'אשראי צרכני', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_4' AND screen_location = 'refinance_credit_3'), 'he', 'חוב כרטיס אשראי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_5' AND screen_location = 'refinance_credit_3'), 'he', 'אחר', false, 'approved', NOW()),

-- Russian
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_1' AND screen_location = 'refinance_credit_3'), 'ru', 'Нет обязательств', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_2' AND screen_location = 'refinance_credit_3'), 'ru', 'Банковский кредит', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_3' AND screen_location = 'refinance_credit_3'), 'ru', 'Потребительский кредит', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_4' AND screen_location = 'refinance_credit_3'), 'ru', 'Долг по кредитной карте', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_5' AND screen_location = 'refinance_credit_3'), 'ru', 'Другое', false, 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Borrower section translations
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
((SELECT id FROM content_items WHERE content_key = 'borrower' AND screen_location = 'refinance_credit_3'), 'en', 'Borrower', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'borrower' AND screen_location = 'refinance_credit_3'), 'he', 'לווה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'borrower' AND screen_location = 'refinance_credit_3'), 'ru', 'Заемщик', false, 'approved', NOW()),

((SELECT id FROM content_items WHERE content_key = 'add_borrower' AND screen_location = 'refinance_credit_3'), 'en', 'Add borrower', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'add_borrower' AND screen_location = 'refinance_credit_3'), 'he', 'הוסף לווה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'add_borrower' AND screen_location = 'refinance_credit_3'), 'ru', 'Добавить заемщика', false, 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Bank option translations (for obligations)
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- English
((SELECT id FROM content_items WHERE content_key = 'bank_hapoalim' AND screen_location = 'refinance_credit_3'), 'en', 'Bank Hapoalim', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_leumi' AND screen_location = 'refinance_credit_3'), 'en', 'Bank Leumi', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_discount' AND screen_location = 'refinance_credit_3'), 'en', 'Discount Bank', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_massad' AND screen_location = 'refinance_credit_3'), 'en', 'Massad Bank', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_israel' AND screen_location = 'refinance_credit_3'), 'en', 'Bank of Israel', false, 'approved', NOW()),

-- Hebrew
((SELECT id FROM content_items WHERE content_key = 'bank_hapoalim' AND screen_location = 'refinance_credit_3'), 'he', 'בנק הפועלים', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_leumi' AND screen_location = 'refinance_credit_3'), 'he', 'בנק לאומי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_discount' AND screen_location = 'refinance_credit_3'), 'he', 'בנק דיסקונט', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_massad' AND screen_location = 'refinance_credit_3'), 'he', 'בנק מסד', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_israel' AND screen_location = 'refinance_credit_3'), 'he', 'בנק ישראל', false, 'approved', NOW()),

-- Russian
((SELECT id FROM content_items WHERE content_key = 'bank_hapoalim' AND screen_location = 'refinance_credit_3'), 'ru', 'Банк Апоалим', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_leumi' AND screen_location = 'refinance_credit_3'), 'ru', 'Банк Леуми', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_discount' AND screen_location = 'refinance_credit_3'), 'ru', 'Дисконт Банк', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_massad' AND screen_location = 'refinance_credit_3'), 'ru', 'Банк Масад', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_israel' AND screen_location = 'refinance_credit_3'), 'ru', 'Банк Израиля', false, 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Mark the migration as completed
COMMENT ON TABLE content_items IS 'Refinance Credit Step 3 migration completed - all income details fields and dropdown options added';