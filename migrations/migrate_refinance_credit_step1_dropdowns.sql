-- Migration: Refinance Credit Step 1 - Dropdown Options
-- Date: 2025-01-22
-- Purpose: Add dropdown options for credit refinancing step 1 form

-- =====================================================
-- REFINANCE CREDIT STEP 1 - WHY REFINANCING OPTIONS
-- =====================================================

-- Add content items for why refinancing dropdown options
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
-- Why refinancing options
('calculate_credit_why_option_1', 'dropdown_option', 'refinance_reason', 'refinance_credit_1', 'option', 'Improve interest rate', true, 'calculate_credit_why_option_1', NOW()),
('calculate_credit_why_option_2', 'dropdown_option', 'refinance_reason', 'refinance_credit_1', 'option', 'Reduce credit amount', true, 'calculate_credit_why_option_2', NOW()),
('calculate_credit_why_option_3', 'dropdown_option', 'refinance_reason', 'refinance_credit_1', 'option', 'Increase term to reduce payment', true, 'calculate_credit_why_option_3', NOW()),
('calculate_credit_why_option_4', 'dropdown_option', 'refinance_reason', 'refinance_credit_1', 'option', 'Increase payment to reduce term', true, 'calculate_credit_why_option_4', NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Add translations for why refinancing options
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- English translations
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_why_option_1' AND screen_location = 'refinance_credit_1'), 'en', 'Improve interest rate', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_why_option_2' AND screen_location = 'refinance_credit_1'), 'en', 'Reduce credit amount', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_why_option_3' AND screen_location = 'refinance_credit_1'), 'en', 'Increase term to reduce payment', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_why_option_4' AND screen_location = 'refinance_credit_1'), 'en', 'Increase payment to reduce term', false, 'approved', NOW()),

-- Hebrew translations
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_why_option_1' AND screen_location = 'refinance_credit_1'), 'he', 'שיפור הריבית', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_why_option_2' AND screen_location = 'refinance_credit_1'), 'he', 'הפחתת סכום האשראי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_why_option_3' AND screen_location = 'refinance_credit_1'), 'he', 'הגדלת התקופה כדי להפחית את התשלום', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_why_option_4' AND screen_location = 'refinance_credit_1'), 'he', 'הגדלת התשלום כדי לקצר את התקופה', false, 'approved', NOW()),

-- Russian translations
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_why_option_1' AND screen_location = 'refinance_credit_1'), 'ru', 'Улучшить процентную ставку', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_why_option_2' AND screen_location = 'refinance_credit_1'), 'ru', 'Уменьшить сумму кредита', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_why_option_3' AND screen_location = 'refinance_credit_1'), 'ru', 'Увеличить срок для уменьшения платежа', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_why_option_4' AND screen_location = 'refinance_credit_1'), 'ru', 'Увеличить платеж для сокращения срока', false, 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- =====================================================
-- REFINANCE CREDIT STEP 1 - BANK OPTIONS
-- =====================================================

-- Add content items for bank dropdown options
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
-- Bank options
('bank_hapoalim', 'dropdown_option', 'bank', 'refinance_credit_1', 'option', 'Bank Hapoalim', true, 'bank_hapoalim', NOW()),
('bank_leumi', 'dropdown_option', 'bank', 'refinance_credit_1', 'option', 'Bank Leumi', true, 'bank_leumi', NOW()),
('bank_discount', 'dropdown_option', 'bank', 'refinance_credit_1', 'option', 'Discount Bank', true, 'bank_discount', NOW()),
('bank_massad', 'dropdown_option', 'bank', 'refinance_credit_1', 'option', 'Massad Bank', true, 'bank_massad', NOW()),
('bank_israel', 'dropdown_option', 'bank', 'refinance_credit_1', 'option', 'Bank of Israel', true, 'bank_israel', NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Add translations for bank options
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- English translations
((SELECT id FROM content_items WHERE content_key = 'bank_hapoalim' AND screen_location = 'refinance_credit_1'), 'en', 'Bank Hapoalim', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_leumi' AND screen_location = 'refinance_credit_1'), 'en', 'Bank Leumi', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_discount' AND screen_location = 'refinance_credit_1'), 'en', 'Discount Bank', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_massad' AND screen_location = 'refinance_credit_1'), 'en', 'Massad Bank', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_israel' AND screen_location = 'refinance_credit_1'), 'en', 'Bank of Israel', false, 'approved', NOW()),

-- Hebrew translations
((SELECT id FROM content_items WHERE content_key = 'bank_hapoalim' AND screen_location = 'refinance_credit_1'), 'he', 'בנק הפועלים', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_leumi' AND screen_location = 'refinance_credit_1'), 'he', 'בנק לאומי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_discount' AND screen_location = 'refinance_credit_1'), 'he', 'בנק דיסקונט', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_massad' AND screen_location = 'refinance_credit_1'), 'he', 'בנק מסד', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_israel' AND screen_location = 'refinance_credit_1'), 'he', 'בנק ישראל', false, 'approved', NOW()),

-- Russian translations
((SELECT id FROM content_items WHERE content_key = 'bank_hapoalim' AND screen_location = 'refinance_credit_1'), 'ru', 'Банк Апоалим', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_leumi' AND screen_location = 'refinance_credit_1'), 'ru', 'Банк Леуми', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_discount' AND screen_location = 'refinance_credit_1'), 'ru', 'Дисконт Банк', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_massad' AND screen_location = 'refinance_credit_1'), 'ru', 'Банк Масад', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_israel' AND screen_location = 'refinance_credit_1'), 'ru', 'Банк Израиля', false, 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- =====================================================
-- REFINANCE CREDIT STEP 1 - FIELD LABELS AND PLACEHOLDERS
-- =====================================================

-- Add field labels and placeholders for the form
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
-- Field labels
('mortgage_credit_why', 'label', 'form_field', 'refinance_credit_1', 'text', 'Goal of credit refinancing', true, 'mortgage_credit_why', NOW()),
('credit_refinance_why_ph', 'placeholder', 'form_field', 'refinance_credit_1', 'text', 'Select goal', true, 'credit_refinance_why_ph', NOW()),
('bank_apply_credit', 'label', 'form_field', 'refinance_credit_1', 'text', 'Bank', true, 'bank_apply_credit', NOW()),
('amount_credit_title', 'label', 'form_field', 'refinance_credit_1', 'text', 'Credit amount', true, 'amount_credit_title', NOW()),
('calculate_mortgage_initial_payment', 'label', 'form_field', 'refinance_credit_1', 'text', 'Monthly payment', true, 'calculate_mortgage_initial_payment', NOW()),
('refinance_credit_start_date', 'label', 'form_field', 'refinance_credit_1', 'text', 'Start date', true, 'refinance_credit_start_date', NOW()),
('refinance_credit_end_date', 'label', 'form_field', 'refinance_credit_1', 'text', 'End date', true, 'refinance_credit_end_date', NOW()),
('early_repayment', 'label', 'form_field', 'refinance_credit_1', 'text', 'Early repayment amount', true, 'early_repayment', NOW()),
('desired_monthly_payment', 'label', 'form_field', 'refinance_credit_1', 'text', 'Desired monthly payment', true, 'desired_monthly_payment', NOW()),
('credit_loan_period', 'label', 'form_field', 'refinance_credit_1', 'text', 'Desired loan period', true, 'credit_loan_period', NOW()),
('list_credits_title', 'label', 'section', 'refinance_credit_1', 'text', 'List of existing credits', true, 'list_credits_title', NOW()),
('add_credit', 'button', 'action', 'refinance_credit_1', 'text', 'Add credit', true, 'add_credit', NOW()),
('credit_refinance_title', 'title', 'page', 'refinance_credit_1', 'text', 'Credit Refinancing', true, 'credit_refinance_title', NOW()),
('calculate_mortgage_first_ph', 'placeholder', 'form_field', 'refinance_credit_1', 'text', 'Select property status', true, 'calculate_mortgage_first_ph', NOW()),
('date_ph', 'placeholder', 'form_field', 'refinance_credit_1', 'text', 'Select date', true, 'date_ph', NOW()),
('remove_credit', 'label', 'dialog', 'refinance_credit_1', 'text', 'Delete loan details?', true, 'remove_credit', NOW()),
('remove_credit_subtitle', 'label', 'dialog', 'refinance_credit_1', 'text', 'By clicking confirm, all details of this loan will be deleted', true, 'remove_credit_subtitle', NOW()),
('delete', 'button', 'action', 'refinance_credit_1', 'text', 'Delete', true, 'delete', NOW()),
('calculate_mortgage_period_units_min', 'label', 'unit', 'refinance_credit_1', 'text', 'years', true, 'calculate_mortgage_period_units_min', NOW()),
('calculate_mortgage_period_units_max', 'label', 'unit', 'refinance_credit_1', 'text', 'years', true, 'calculate_mortgage_period_units_max', NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Add translations for field labels and placeholders
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- English translations
((SELECT id FROM content_items WHERE content_key = 'mortgage_credit_why' AND screen_location = 'refinance_credit_1'), 'en', 'Goal of credit refinancing', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'credit_refinance_why_ph' AND screen_location = 'refinance_credit_1'), 'en', 'Select goal', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_apply_credit' AND screen_location = 'refinance_credit_1'), 'en', 'Bank', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'amount_credit_title' AND screen_location = 'refinance_credit_1'), 'en', 'Credit amount', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_initial_payment' AND screen_location = 'refinance_credit_1'), 'en', 'Monthly payment', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_start_date' AND screen_location = 'refinance_credit_1'), 'en', 'Start date', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_end_date' AND screen_location = 'refinance_credit_1'), 'en', 'End date', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'early_repayment' AND screen_location = 'refinance_credit_1'), 'en', 'Early repayment amount', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'desired_monthly_payment' AND screen_location = 'refinance_credit_1'), 'en', 'Desired monthly payment', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'credit_loan_period' AND screen_location = 'refinance_credit_1'), 'en', 'Desired loan period', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'list_credits_title' AND screen_location = 'refinance_credit_1'), 'en', 'List of existing credits', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'add_credit' AND screen_location = 'refinance_credit_1'), 'en', 'Add credit', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'credit_refinance_title' AND screen_location = 'refinance_credit_1'), 'en', 'Credit Refinancing', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_first_ph' AND screen_location = 'refinance_credit_1'), 'en', 'Select property status', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'date_ph' AND screen_location = 'refinance_credit_1'), 'en', 'Select date', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'remove_credit' AND screen_location = 'refinance_credit_1'), 'en', 'Delete loan details?', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'remove_credit_subtitle' AND screen_location = 'refinance_credit_1'), 'en', 'By clicking confirm, all details of this loan will be deleted', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'delete' AND screen_location = 'refinance_credit_1'), 'en', 'Delete', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_period_units_min' AND screen_location = 'refinance_credit_1'), 'en', 'years', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_period_units_max' AND screen_location = 'refinance_credit_1'), 'en', 'years', true, 'approved', NOW()),

-- Hebrew translations  
((SELECT id FROM content_items WHERE content_key = 'mortgage_credit_why' AND screen_location = 'refinance_credit_1'), 'he', 'מטרת מחזור האשראי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'credit_refinance_why_ph' AND screen_location = 'refinance_credit_1'), 'he', 'בחר מטרה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_apply_credit' AND screen_location = 'refinance_credit_1'), 'he', 'בנק מלווה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'amount_credit_title' AND screen_location = 'refinance_credit_1'), 'he', 'סכום אשראי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_initial_payment' AND screen_location = 'refinance_credit_1'), 'he', 'תשלום חודשי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_start_date' AND screen_location = 'refinance_credit_1'), 'he', 'תאריך התחלה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_end_date' AND screen_location = 'refinance_credit_1'), 'he', 'תאריך סיום', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'early_repayment' AND screen_location = 'refinance_credit_1'), 'he', 'סכום לפירעון מוקדם', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'desired_monthly_payment' AND screen_location = 'refinance_credit_1'), 'he', 'תשלום חודשי רצוי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'credit_loan_period' AND screen_location = 'refinance_credit_1'), 'he', 'תקופת הלוואה רצויה', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'list_credits_title' AND screen_location = 'refinance_credit_1'), 'he', 'רשימת אשראים קיימים', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'add_credit' AND screen_location = 'refinance_credit_1'), 'he', 'הוסף אשראי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'credit_refinance_title' AND screen_location = 'refinance_credit_1'), 'he', 'מיחזור אשראי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_first_ph' AND screen_location = 'refinance_credit_1'), 'he', 'בחר סטטוס הנכס', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'date_ph' AND screen_location = 'refinance_credit_1'), 'he', 'בחר תאריך', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'remove_credit' AND screen_location = 'refinance_credit_1'), 'he', 'למחוק פרטי הלוואה?', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'remove_credit_subtitle' AND screen_location = 'refinance_credit_1'), 'he', 'בלחיצה על אישור כל פרטי הלוואה זו ימחקו', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'delete' AND screen_location = 'refinance_credit_1'), 'he', 'מחק', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_period_units_min' AND screen_location = 'refinance_credit_1'), 'he', 'שנים', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_period_units_max' AND screen_location = 'refinance_credit_1'), 'he', 'שנים', false, 'approved', NOW()),

-- Russian translations
((SELECT id FROM content_items WHERE content_key = 'mortgage_credit_why' AND screen_location = 'refinance_credit_1'), 'ru', 'Цель рефинансирования кредита', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'credit_refinance_why_ph' AND screen_location = 'refinance_credit_1'), 'ru', 'Выберите цель', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'bank_apply_credit' AND screen_location = 'refinance_credit_1'), 'ru', 'Банк', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'amount_credit_title' AND screen_location = 'refinance_credit_1'), 'ru', 'Сумма кредита', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_initial_payment' AND screen_location = 'refinance_credit_1'), 'ru', 'Ежемесячный платеж', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_start_date' AND screen_location = 'refinance_credit_1'), 'ru', 'Дата начала', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_end_date' AND screen_location = 'refinance_credit_1'), 'ru', 'Дата окончания', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'early_repayment' AND screen_location = 'refinance_credit_1'), 'ru', 'Сумма досрочного погашения', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'desired_monthly_payment' AND screen_location = 'refinance_credit_1'), 'ru', 'Желаемый ежемесячный платеж', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'credit_loan_period' AND screen_location = 'refinance_credit_1'), 'ru', 'Желаемый срок кредита', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'list_credits_title' AND screen_location = 'refinance_credit_1'), 'ru', 'Список существующих кредитов', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'add_credit' AND screen_location = 'refinance_credit_1'), 'ru', 'Добавить кредит', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'credit_refinance_title' AND screen_location = 'refinance_credit_1'), 'ru', 'Рефинансирование кредита', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_first_ph' AND screen_location = 'refinance_credit_1'), 'ru', 'Выберите статус недвижимости', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'date_ph' AND screen_location = 'refinance_credit_1'), 'ru', 'Выберите дату', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'remove_credit' AND screen_location = 'refinance_credit_1'), 'ru', 'Удалить данные кредита?', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'remove_credit_subtitle' AND screen_location = 'refinance_credit_1'), 'ru', 'При нажатии на подтверждение все данные этого кредита будут удалены', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'delete' AND screen_location = 'refinance_credit_1'), 'ru', 'Удалить', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_period_units_min' AND screen_location = 'refinance_credit_1'), 'ru', 'лет', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_period_units_max' AND screen_location = 'refinance_credit_1'), 'ru', 'лет', false, 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Mark the migration as completed
COMMENT ON TABLE content_items IS 'Refinance Credit Step 1 dropdown migration completed - all dropdown options and field labels added';