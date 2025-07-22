-- Migration: Complete Missing Steps Content
-- Date: 2025-01-22
-- Purpose: Add database content for all missing steps in refinance mortgage, calculate credit, and refinance credit

-- =====================================================
-- REFINANCE MORTGAGE STEP 2
-- =====================================================
-- Copy all mortgage_step2 content to refinance_step2 screen location
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
)
SELECT 
    content_key,
    content_type,
    category,
    'refinance_step2' as screen_location,
    component_type,
    description,
    is_active,
    legacy_translation_key,
    NOW() as created_at
FROM content_items 
WHERE screen_location = 'mortgage_step2'
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Copy all translations for refinance_step2
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
)
SELECT 
    ci_new.id as content_item_id,
    ct.language_code,
    ct.content_value,
    ct.is_default,
    ct.status,
    NOW() as created_at
FROM content_items ci_old
JOIN content_translations ct ON ci_old.id = ct.content_item_id
JOIN content_items ci_new ON ci_old.content_key = ci_new.content_key
WHERE ci_old.screen_location = 'mortgage_step2' 
  AND ci_new.screen_location = 'refinance_step2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- =====================================================
-- REFINANCE MORTGAGE STEP 3
-- =====================================================
-- Copy all mortgage_step3 content to refinance_step3 screen location
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
)
SELECT 
    content_key,
    content_type,
    category,
    'refinance_step3' as screen_location,
    component_type,
    description,
    is_active,
    legacy_translation_key,
    NOW() as created_at
FROM content_items 
WHERE screen_location = 'mortgage_step3'
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Copy all translations for refinance_step3
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
)
SELECT 
    ci_new.id as content_item_id,
    ct.language_code,
    ct.content_value,
    ct.is_default,
    ct.status,
    NOW() as created_at
FROM content_items ci_old
JOIN content_translations ct ON ci_old.id = ct.content_item_id
JOIN content_items ci_new ON ci_old.content_key = ci_new.content_key
WHERE ci_old.screen_location = 'mortgage_step3' 
  AND ci_new.screen_location = 'refinance_step3'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- =====================================================
-- CALCULATE CREDIT STEP 3
-- =====================================================
-- Copy all mortgage_step3 content to calculate_credit_3 screen location
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
)
SELECT 
    content_key,
    content_type,
    category,
    'calculate_credit_3' as screen_location,
    component_type,
    description,
    is_active,
    legacy_translation_key,
    NOW() as created_at
FROM content_items 
WHERE screen_location = 'mortgage_step3'
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Copy all translations for calculate_credit_3
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
)
SELECT 
    ci_new.id as content_item_id,
    ct.language_code,
    ct.content_value,
    ct.is_default,
    ct.status,
    NOW() as created_at
FROM content_items ci_old
JOIN content_translations ct ON ci_old.id = ct.content_item_id
JOIN content_items ci_new ON ci_old.content_key = ci_new.content_key
WHERE ci_old.screen_location = 'mortgage_step3' 
  AND ci_new.screen_location = 'calculate_credit_3'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- =====================================================
-- CALCULATE CREDIT STEP 4
-- =====================================================
-- Create unique content for calculate_credit_4
INSERT INTO content_items (content_key, component_type, category, screen_location, is_active, created_at) VALUES
('calculate_credit_final', 'text', 'title', 'calculate_credit_4', TRUE, NOW()),
('calculate_credit_warning', 'text', 'warning', 'calculate_credit_4', TRUE, NOW()),
('calculate_credit_parameters', 'text', 'section_title', 'calculate_credit_4', TRUE, NOW()),
('calculate_credit_profile_title', 'text', 'section_title', 'calculate_credit_4', TRUE, NOW()),
('calculate_credit_filter_title', 'text', 'section_title', 'calculate_credit_4', TRUE, NOW()),
('calculate_credit_parameters_amount', 'text', 'label', 'calculate_credit_4', TRUE, NOW()),
('calculate_credit_parameters_period', 'text', 'label', 'calculate_credit_4', TRUE, NOW()),
('calculate_credit_parameters_months', 'text', 'label', 'calculate_credit_4', TRUE, NOW()),
('calculate_credit_filter_1', 'text', 'filter_option', 'calculate_credit_4', TRUE, NOW()),
('calculate_credit_filter_2', 'text', 'filter_option', 'calculate_credit_4', TRUE, NOW()),
('calculate_credit_filter_3', 'text', 'filter_option', 'calculate_credit_4', TRUE, NOW()),
('calculate_credit_filter_4', 'text', 'filter_option', 'calculate_credit_4', TRUE, NOW()),
('credit_total', 'text', 'label', 'calculate_credit_4', TRUE, NOW()),
('credit_total_return', 'text', 'label', 'calculate_credit_4', TRUE, NOW()),
('credit_monthly', 'text', 'label', 'calculate_credit_4', TRUE, NOW()),
('credit_select_bank', 'button', 'action', 'calculate_credit_4', TRUE, NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Add translations for calculate_credit_4
INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at) VALUES
-- English
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_final' AND screen_location = 'calculate_credit_4'), 'en', 'Credit Calculation Results', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_warning' AND screen_location = 'calculate_credit_4'), 'en', 'The displayed offers are preliminary and subject to final bank approval. Actual terms may vary based on your complete financial profile.', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_parameters' AND screen_location = 'calculate_credit_4'), 'en', 'Your Credit Parameters', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_profile_title' AND screen_location = 'calculate_credit_4'), 'en', 'Your Profile', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_filter_title' AND screen_location = 'calculate_credit_4'), 'en', 'Filter Banks', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_parameters_amount' AND screen_location = 'calculate_credit_4'), 'en', 'Loan Amount', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_parameters_period' AND screen_location = 'calculate_credit_4'), 'en', 'Loan Period', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_parameters_months' AND screen_location = 'calculate_credit_4'), 'en', 'months', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_filter_1' AND screen_location = 'calculate_credit_4'), 'en', 'Best Rate', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_filter_2' AND screen_location = 'calculate_credit_4'), 'en', 'Lowest Monthly Payment', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_filter_3' AND screen_location = 'calculate_credit_4'), 'en', 'Fastest Approval', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_filter_4' AND screen_location = 'calculate_credit_4'), 'en', 'My Bank', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'credit_total' AND screen_location = 'calculate_credit_4'), 'en', 'Total Loan Amount', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'credit_total_return' AND screen_location = 'calculate_credit_4'), 'en', 'Total to Repay', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'credit_monthly' AND screen_location = 'calculate_credit_4'), 'en', 'Monthly Payment', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'credit_select_bank' AND screen_location = 'calculate_credit_4'), 'en', 'Select This Bank', 'approved', NOW()),

-- Hebrew
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_final' AND screen_location = 'calculate_credit_4'), 'he', 'תוצאות חישוב אשראי', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_warning' AND screen_location = 'calculate_credit_4'), 'he', 'ההצעות המוצגות הינן ראשוניות וכפופות לאישור סופי של הבנק. התנאים בפועל עשויים להשתנות בהתאם לפרופיל הפיננסי המלא שלך.', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_parameters' AND screen_location = 'calculate_credit_4'), 'he', 'פרמטרי האשראי שלך', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_profile_title' AND screen_location = 'calculate_credit_4'), 'he', 'הפרופיל שלך', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_filter_title' AND screen_location = 'calculate_credit_4'), 'he', 'סנן בנקים', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_parameters_amount' AND screen_location = 'calculate_credit_4'), 'he', 'סכום ההלוואה', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_parameters_period' AND screen_location = 'calculate_credit_4'), 'he', 'תקופת ההלוואה', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_parameters_months' AND screen_location = 'calculate_credit_4'), 'he', 'חודשים', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_filter_1' AND screen_location = 'calculate_credit_4'), 'he', 'הריבית הטובה ביותר', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_filter_2' AND screen_location = 'calculate_credit_4'), 'he', 'ההחזר החודשי הנמוך ביותר', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_filter_3' AND screen_location = 'calculate_credit_4'), 'he', 'האישור המהיר ביותר', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_filter_4' AND screen_location = 'calculate_credit_4'), 'he', 'הבנק שלי', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'credit_total' AND screen_location = 'calculate_credit_4'), 'he', 'סכום ההלוואה הכולל', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'credit_total_return' AND screen_location = 'calculate_credit_4'), 'he', 'סה"כ להחזר', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'credit_monthly' AND screen_location = 'calculate_credit_4'), 'he', 'החזר חודשי', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'credit_select_bank' AND screen_location = 'calculate_credit_4'), 'he', 'בחר בנק זה', 'approved', NOW()),

-- Russian
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_final' AND screen_location = 'calculate_credit_4'), 'ru', 'Результаты расчета кредита', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_warning' AND screen_location = 'calculate_credit_4'), 'ru', 'Показанные предложения являются предварительными и подлежат окончательному утверждению банком. Фактические условия могут отличаться в зависимости от вашего полного финансового профиля.', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_parameters' AND screen_location = 'calculate_credit_4'), 'ru', 'Параметры вашего кредита', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_profile_title' AND screen_location = 'calculate_credit_4'), 'ru', 'Ваш профиль', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_filter_title' AND screen_location = 'calculate_credit_4'), 'ru', 'Фильтр банков', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_parameters_amount' AND screen_location = 'calculate_credit_4'), 'ru', 'Сумма кредита', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_parameters_period' AND screen_location = 'calculate_credit_4'), 'ru', 'Срок кредита', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_parameters_months' AND screen_location = 'calculate_credit_4'), 'ru', 'месяцев', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_filter_1' AND screen_location = 'calculate_credit_4'), 'ru', 'Лучшая ставка', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_filter_2' AND screen_location = 'calculate_credit_4'), 'ru', 'Минимальный платеж', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_filter_3' AND screen_location = 'calculate_credit_4'), 'ru', 'Быстрое одобрение', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_filter_4' AND screen_location = 'calculate_credit_4'), 'ru', 'Мой банк', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'credit_total' AND screen_location = 'calculate_credit_4'), 'ru', 'Общая сумма кредита', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'credit_total_return' AND screen_location = 'calculate_credit_4'), 'ru', 'Всего к возврату', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'credit_monthly' AND screen_location = 'calculate_credit_4'), 'ru', 'Ежемесячный платеж', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'credit_select_bank' AND screen_location = 'calculate_credit_4'), 'ru', 'Выбрать этот банк', 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- =====================================================
-- REFINANCE CREDIT STEP 2
-- =====================================================
-- Copy all mortgage_step2 content to refinance_credit_step2 screen location
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
)
SELECT 
    content_key,
    content_type,
    category,
    'refinance_credit_step2' as screen_location,
    component_type,
    description,
    is_active,
    legacy_translation_key,
    NOW() as created_at
FROM content_items 
WHERE screen_location = 'mortgage_step2'
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Copy all translations for refinance_credit_step2
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
)
SELECT 
    ci_new.id as content_item_id,
    ct.language_code,
    ct.content_value,
    ct.is_default,
    ct.status,
    NOW() as created_at
FROM content_items ci_old
JOIN content_translations ct ON ci_old.id = ct.content_item_id
JOIN content_items ci_new ON ci_old.content_key = ci_new.content_key
WHERE ci_old.screen_location = 'mortgage_step2' 
  AND ci_new.screen_location = 'refinance_credit_step2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- =====================================================
-- REFINANCE CREDIT STEP 3
-- =====================================================
-- Copy all mortgage_step3 content to refinance_credit_step3 screen location
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
)
SELECT 
    content_key,
    content_type,
    category,
    'refinance_credit_step3' as screen_location,
    component_type,
    description,
    is_active,
    legacy_translation_key,
    NOW() as created_at
FROM content_items 
WHERE screen_location = 'mortgage_step3'
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Copy all translations for refinance_credit_step3
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
)
SELECT 
    ci_new.id as content_item_id,
    ct.language_code,
    ct.content_value,
    ct.is_default,
    ct.status,
    NOW() as created_at
FROM content_items ci_old
JOIN content_translations ct ON ci_old.id = ct.content_item_id
JOIN content_items ci_new ON ci_old.content_key = ci_new.content_key
WHERE ci_old.screen_location = 'mortgage_step3' 
  AND ci_new.screen_location = 'refinance_credit_step3'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- =====================================================
-- REFINANCE CREDIT STEP 4
-- =====================================================
-- Create unique content for refinance_credit_step4
INSERT INTO content_items (content_key, component_type, category, screen_location, is_active, created_at) VALUES
('refinance_credit_final', 'text', 'title', 'refinance_credit_step4', TRUE, NOW()),
('refinance_credit_warning', 'text', 'warning', 'refinance_credit_step4', TRUE, NOW()),
('refinance_credit_parameters', 'text', 'section_title', 'refinance_credit_step4', TRUE, NOW()),
('refinance_credit_profile_title', 'text', 'section_title', 'refinance_credit_step4', TRUE, NOW()),
('refinance_credit_filter_title', 'text', 'section_title', 'refinance_credit_step4', TRUE, NOW()),
('refinance_credit_parameters_amount', 'text', 'label', 'refinance_credit_step4', TRUE, NOW()),
('refinance_credit_parameters_period', 'text', 'label', 'refinance_credit_step4', TRUE, NOW()),
('refinance_credit_parameters_months', 'text', 'label', 'refinance_credit_step4', TRUE, NOW()),
('refinance_credit_filter_1', 'text', 'filter_option', 'refinance_credit_step4', TRUE, NOW()),
('refinance_credit_filter_2', 'text', 'filter_option', 'refinance_credit_step4', TRUE, NOW()),
('refinance_credit_filter_3', 'text', 'filter_option', 'refinance_credit_step4', TRUE, NOW()),
('refinance_credit_filter_4', 'text', 'filter_option', 'refinance_credit_step4', TRUE, NOW()),
('refinance_credit_total', 'text', 'label', 'refinance_credit_step4', TRUE, NOW()),
('refinance_credit_total_return', 'text', 'label', 'refinance_credit_step4', TRUE, NOW()),
('refinance_credit_monthly', 'text', 'label', 'refinance_credit_step4', TRUE, NOW()),
('refinance_credit_select_bank', 'button', 'action', 'refinance_credit_step4', TRUE, NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Add translations for refinance_credit_step4
INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at) VALUES
-- English
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_final' AND screen_location = 'refinance_credit_step4'), 'en', 'Credit Refinancing Results', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_warning' AND screen_location = 'refinance_credit_step4'), 'en', 'These refinancing offers are preliminary. Final terms depend on your current credit status and bank approval. You may save on interest or monthly payments.', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_parameters' AND screen_location = 'refinance_credit_step4'), 'en', 'Your Refinancing Parameters', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_profile_title' AND screen_location = 'refinance_credit_step4'), 'en', 'Your Profile', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_filter_title' AND screen_location = 'refinance_credit_step4'), 'en', 'Filter Banks', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_parameters_amount' AND screen_location = 'refinance_credit_step4'), 'en', 'Refinancing Amount', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_parameters_period' AND screen_location = 'refinance_credit_step4'), 'en', 'New Loan Period', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_parameters_months' AND screen_location = 'refinance_credit_step4'), 'en', 'months', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_filter_1' AND screen_location = 'refinance_credit_step4'), 'en', 'Maximum Savings', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_filter_2' AND screen_location = 'refinance_credit_step4'), 'en', 'Lower Monthly Payment', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_filter_3' AND screen_location = 'refinance_credit_step4'), 'en', 'Quick Processing', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_filter_4' AND screen_location = 'refinance_credit_step4'), 'en', 'My Current Bank', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_total' AND screen_location = 'refinance_credit_step4'), 'en', 'Total Refinancing Amount', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_total_return' AND screen_location = 'refinance_credit_step4'), 'en', 'New Total to Repay', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_monthly' AND screen_location = 'refinance_credit_step4'), 'en', 'New Monthly Payment', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_select_bank' AND screen_location = 'refinance_credit_step4'), 'en', 'Select for Refinancing', 'approved', NOW()),

-- Hebrew
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_final' AND screen_location = 'refinance_credit_step4'), 'he', 'תוצאות מיחזור אשראי', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_warning' AND screen_location = 'refinance_credit_step4'), 'he', 'הצעות המיחזור הללו הינן ראשוניות. התנאים הסופיים תלויים במצב האשראי הנוכחי שלך ובאישור הבנק. ייתכן שתחסוך בריבית או בתשלומים החודשיים.', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_parameters' AND screen_location = 'refinance_credit_step4'), 'he', 'פרמטרי המיחזור שלך', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_profile_title' AND screen_location = 'refinance_credit_step4'), 'he', 'הפרופיל שלך', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_filter_title' AND screen_location = 'refinance_credit_step4'), 'he', 'סנן בנקים', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_parameters_amount' AND screen_location = 'refinance_credit_step4'), 'he', 'סכום למיחזור', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_parameters_period' AND screen_location = 'refinance_credit_step4'), 'he', 'תקופת הלוואה חדשה', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_parameters_months' AND screen_location = 'refinance_credit_step4'), 'he', 'חודשים', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_filter_1' AND screen_location = 'refinance_credit_step4'), 'he', 'חיסכון מקסימלי', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_filter_2' AND screen_location = 'refinance_credit_step4'), 'he', 'החזר חודשי נמוך יותר', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_filter_3' AND screen_location = 'refinance_credit_step4'), 'he', 'טיפול מהיר', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_filter_4' AND screen_location = 'refinance_credit_step4'), 'he', 'הבנק הנוכחי שלי', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_total' AND screen_location = 'refinance_credit_step4'), 'he', 'סכום כולל למיחזור', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_total_return' AND screen_location = 'refinance_credit_step4'), 'he', 'סה"כ חדש להחזר', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_monthly' AND screen_location = 'refinance_credit_step4'), 'he', 'החזר חודשי חדש', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_select_bank' AND screen_location = 'refinance_credit_step4'), 'he', 'בחר למיחזור', 'approved', NOW()),

-- Russian
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_final' AND screen_location = 'refinance_credit_step4'), 'ru', 'Результаты рефинансирования кредита', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_warning' AND screen_location = 'refinance_credit_step4'), 'ru', 'Эти предложения по рефинансированию являются предварительными. Окончательные условия зависят от вашего текущего кредитного статуса и одобрения банка. Вы можете сэкономить на процентах или ежемесячных платежах.', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_parameters' AND screen_location = 'refinance_credit_step4'), 'ru', 'Параметры рефинансирования', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_profile_title' AND screen_location = 'refinance_credit_step4'), 'ru', 'Ваш профиль', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_filter_title' AND screen_location = 'refinance_credit_step4'), 'ru', 'Фильтр банков', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_parameters_amount' AND screen_location = 'refinance_credit_step4'), 'ru', 'Сумма рефинансирования', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_parameters_period' AND screen_location = 'refinance_credit_step4'), 'ru', 'Новый срок кредита', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_parameters_months' AND screen_location = 'refinance_credit_step4'), 'ru', 'месяцев', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_filter_1' AND screen_location = 'refinance_credit_step4'), 'ru', 'Максимальная экономия', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_filter_2' AND screen_location = 'refinance_credit_step4'), 'ru', 'Меньший платеж', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_filter_3' AND screen_location = 'refinance_credit_step4'), 'ru', 'Быстрая обработка', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_filter_4' AND screen_location = 'refinance_credit_step4'), 'ru', 'Мой текущий банк', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_total' AND screen_location = 'refinance_credit_step4'), 'ru', 'Общая сумма рефинансирования', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_total_return' AND screen_location = 'refinance_credit_step4'), 'ru', 'Новая сумма к возврату', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_monthly' AND screen_location = 'refinance_credit_step4'), 'ru', 'Новый ежемесячный платеж', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_select_bank' AND screen_location = 'refinance_credit_step4'), 'ru', 'Выбрать для рефинансирования', 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- =====================================================
-- REFINANCE MORTGAGE STEP 4
-- =====================================================
-- Copy mortgage_step4 content to refinance_step4 (reusing most content)
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
)
SELECT 
    content_key,
    content_type,
    category,
    'refinance_step4' as screen_location,
    component_type,
    description,
    is_active,
    legacy_translation_key,
    NOW() as created_at
FROM content_items 
WHERE screen_location = 'mortgage_step4'
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Copy all translations for refinance_step4
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
)
SELECT 
    ci_new.id as content_item_id,
    ct.language_code,
    ct.content_value,
    ct.is_default,
    ct.status,
    NOW() as created_at
FROM content_items ci_old
JOIN content_translations ct ON ci_old.id = ct.content_item_id
JOIN content_items ci_new ON ci_old.content_key = ci_new.content_key
WHERE ci_old.screen_location = 'mortgage_step4' 
  AND ci_new.screen_location = 'refinance_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Update the specific refinance mortgage step 4 title and warning
UPDATE content_translations 
SET content_value = 'Mortgage Refinancing Results'
WHERE content_item_id = (
    SELECT id FROM content_items 
    WHERE content_key = 'calculate_mortgage_final' 
    AND screen_location = 'refinance_step4'
) AND language_code = 'en';

UPDATE content_translations 
SET content_value = 'תוצאות מיחזור משכנתא'
WHERE content_item_id = (
    SELECT id FROM content_items 
    WHERE content_key = 'calculate_mortgage_final' 
    AND screen_location = 'refinance_step4'
) AND language_code = 'he';

UPDATE content_translations 
SET content_value = 'Результаты рефинансирования ипотеки'
WHERE content_item_id = (
    SELECT id FROM content_items 
    WHERE content_key = 'calculate_mortgage_final' 
    AND screen_location = 'refinance_step4'
) AND language_code = 'ru';

-- Update refinance mortgage warning
UPDATE content_translations 
SET content_value = 'These refinancing offers can help reduce your mortgage payments or interest rate. Final approval depends on your current mortgage status and property value.'
WHERE content_item_id = (
    SELECT id FROM content_items 
    WHERE content_key = 'calculate_mortgage_warning' 
    AND screen_location = 'refinance_step4'
) AND language_code = 'en';

UPDATE content_translations 
SET content_value = 'הצעות מיחזור אלו יכולות לסייע בהפחתת תשלומי המשכנתא או הריבית. האישור הסופי תלוי במצב המשכנתא הנוכחי ובשווי הנכס.'
WHERE content_item_id = (
    SELECT id FROM content_items 
    WHERE content_key = 'calculate_mortgage_warning' 
    AND screen_location = 'refinance_step4'
) AND language_code = 'he';

UPDATE content_translations 
SET content_value = 'Эти предложения по рефинансированию могут помочь снизить ипотечные платежи или процентную ставку. Окончательное одобрение зависит от текущего состояния ипотеки и стоимости недвижимости.'
WHERE content_item_id = (
    SELECT id FROM content_items 
    WHERE content_key = 'calculate_mortgage_warning' 
    AND screen_location = 'refinance_step4'
) AND language_code = 'ru';

-- Mark the migration as completed
COMMENT ON TABLE content_items IS 'Missing steps content migration completed - all refinance and credit steps now have database content';