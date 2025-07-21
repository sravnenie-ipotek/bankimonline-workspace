-- Migration: Add Bank Offers translations to content management system
-- Following @DEVHelp/DevRules/translationRules for database-driven content

-- Insert content items for bank offers
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, is_active) VALUES
('bank_offers_credit_register', 'text', 'bank_offers', 'calculate_credit_4', 'info_title', 'Credit application registration button text', true),
('mortgage_register', 'text', 'bank_offers', 'calculate_mortgage_4', 'info_title', 'Mortgage application registration button text', true),
('no_bank_offers_available', 'text', 'bank_offers', 'bank_offers', 'heading', 'No bank offers message title', true),
('no_offers_message', 'text', 'bank_offers', 'bank_offers', 'message', 'No bank offers explanation message', true),
('bank_name', 'text', 'bank_offers', 'bank_offers', 'label', 'Generic bank name fallback', true),
('credit_prime_percent', 'text', 'bank_offers', 'bank_offers', 'program_title', 'Prime rate credit program title', true),
('mortgage_prime_percent', 'text', 'bank_offers', 'bank_offers', 'program_title', 'Prime rate mortgage program title', true),
('credit_fix_percent', 'text', 'bank_offers', 'bank_offers', 'program_title', 'Fixed rate credit program title', true),
('mortgage_fix_percent', 'text', 'bank_offers', 'bank_offers', 'program_title', 'Fixed rate mortgage program title', true),
('credit_float_percent', 'text', 'bank_offers', 'bank_offers', 'program_title', 'Variable rate credit program title', true),
('mortgage_float_percent', 'text', 'bank_offers', 'bank_offers', 'program_title', 'Variable rate mortgage program title', true),
('prime_description', 'text', 'bank_offers', 'bank_offers', 'program_description', 'Prime rate program description', true),
('fixed_inflation_description', 'text', 'bank_offers', 'bank_offers', 'program_description', 'Fixed inflation rate program description', true),
('variable_inflation_description', 'text', 'bank_offers', 'bank_offers', 'program_description', 'Variable inflation rate program description', true),
('up_to_33_percent', 'text', 'bank_offers', 'bank_offers', 'condition', 'Up to 33% financing condition', true),
('up_to_70_percent', 'text', 'bank_offers', 'bank_offers', 'condition', 'Up to 70% financing condition', true),
('up_to_75_percent', 'text', 'bank_offers', 'bank_offers', 'condition', 'Up to 75% financing condition', true),
('4_to_30_years', 'text', 'bank_offers', 'bank_offers', 'period', '4-30 years period condition', true),
('5_to_30_years', 'text', 'bank_offers', 'bank_offers', 'period', '5-30 years period condition', true),
('4_to_25_years', 'text', 'bank_offers', 'bank_offers', 'period', '4-25 years period condition', true),
('prime_rate_structure', 'text', 'bank_offers', 'bank_offers', 'bid_condition', 'Prime rate structure description', true),
('fixed_rate_structure', 'text', 'bank_offers', 'bank_offers', 'bid_condition', 'Fixed rate structure description', true),
('variable_rate_structure', 'text', 'bank_offers', 'bank_offers', 'bid_condition', 'Variable rate structure description', true)
ON CONFLICT (content_key) DO NOTHING;

-- Add English translations (default language)
INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status) 
SELECT ci.id, 'en', 
  CASE ci.content_key
    WHEN 'bank_offers_credit_register' THEN 'Credit application registration'
    WHEN 'mortgage_register' THEN 'Mortgage application registration'
    WHEN 'no_bank_offers_available' THEN 'No Bank Offers Available'
    WHEN 'no_offers_message' THEN 'No bank offers match your profile. Try adjusting your parameters.'
    WHEN 'bank_name' THEN 'Bank'
    WHEN 'credit_prime_percent' THEN 'Prime Rate Credit'
    WHEN 'mortgage_prime_percent' THEN 'Prime Rate Mortgage'
    WHEN 'credit_fix_percent' THEN 'Fixed Rate Credit'
    WHEN 'mortgage_fix_percent' THEN 'Fixed Rate Mortgage'
    WHEN 'credit_float_percent' THEN 'Variable Rate Credit'
    WHEN 'mortgage_float_percent' THEN 'Variable Rate Mortgage'
    WHEN 'prime_description' THEN 'Prime rate linked program'
    WHEN 'fixed_inflation_description' THEN 'Fixed rate with inflation adjustment'
    WHEN 'variable_inflation_description' THEN 'Variable rate with inflation adjustment'
    WHEN 'up_to_33_percent' THEN 'Up to 33%'
    WHEN 'up_to_70_percent' THEN 'Up to 70%'
    WHEN 'up_to_75_percent' THEN 'Up to 75%'
    WHEN '4_to_30_years' THEN '4-30 years'
    WHEN '5_to_30_years' THEN '5-30 years'
    WHEN '4_to_25_years' THEN '4-25 years'
    WHEN 'prime_rate_structure' THEN 'Variable + Fixed components'
    WHEN 'fixed_rate_structure' THEN 'Fixed rate structure'
    WHEN 'variable_rate_structure' THEN 'Variable rate structure'
  END,
  true, 'approved'
FROM content_items ci 
WHERE ci.content_key IN (
  'bank_offers_credit_register', 'mortgage_register', 'no_bank_offers_available', 'no_offers_message', 'bank_name',
  'credit_prime_percent', 'mortgage_prime_percent', 'credit_fix_percent', 'mortgage_fix_percent', 
  'credit_float_percent', 'mortgage_float_percent', 'prime_description', 'fixed_inflation_description', 
  'variable_inflation_description', 'up_to_33_percent', 'up_to_70_percent', 'up_to_75_percent',
  '4_to_30_years', '5_to_30_years', '4_to_25_years', 'prime_rate_structure', 'fixed_rate_structure', 'variable_rate_structure'
)
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Add Hebrew translations
INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status) 
SELECT ci.id, 'he', 
  CASE ci.content_key
    WHEN 'bank_offers_credit_register' THEN 'רישום בקשת אשראי'
    WHEN 'mortgage_register' THEN 'רישום בקשת משכנתא'
    WHEN 'no_bank_offers_available' THEN 'לא נמצאו הצעות בנק'
    WHEN 'no_offers_message' THEN 'לא נמצאו הצעות בנק המתאימות לפרופיל שלך. נסה לעדכן את הפרמטרים.'
    WHEN 'bank_name' THEN 'בנק'
    WHEN 'credit_prime_percent' THEN 'אשראי ריבית פריים'
    WHEN 'mortgage_prime_percent' THEN 'משכנתא ריבית פריים'
    WHEN 'credit_fix_percent' THEN 'אשראי ריבית קבועה'
    WHEN 'mortgage_fix_percent' THEN 'משכנתא ריבית קבועה'
    WHEN 'credit_float_percent' THEN 'אשראי ריבית משתנה'
    WHEN 'mortgage_float_percent' THEN 'משכנתא ריבית משתנה'
    WHEN 'prime_description' THEN 'תוכנית צמודה לריבית הפריים'
    WHEN 'fixed_inflation_description' THEN 'ריבית קבועה צמודה למדד'
    WHEN 'variable_inflation_description' THEN 'ריבית משתנה צמודה למדד'
    WHEN 'up_to_33_percent' THEN 'עד 33%'
    WHEN 'up_to_70_percent' THEN 'עד 70%'
    WHEN 'up_to_75_percent' THEN 'עד 75%'
    WHEN '4_to_30_years' THEN '4-30 שנים'
    WHEN '5_to_30_years' THEN '5-30 שנים'
    WHEN '4_to_25_years' THEN '4-25 שנים'
    WHEN 'prime_rate_structure' THEN 'רכיבים משתנים וקבועים'
    WHEN 'fixed_rate_structure' THEN 'מבנה ריבית קבועה'
    WHEN 'variable_rate_structure' THEN 'מבנה ריבית משתנה'
  END,
  false, 'approved'
FROM content_items ci 
WHERE ci.content_key IN (
  'bank_offers_credit_register', 'mortgage_register', 'no_bank_offers_available', 'no_offers_message', 'bank_name',
  'credit_prime_percent', 'mortgage_prime_percent', 'credit_fix_percent', 'mortgage_fix_percent', 
  'credit_float_percent', 'mortgage_float_percent', 'prime_description', 'fixed_inflation_description', 
  'variable_inflation_description', 'up_to_33_percent', 'up_to_70_percent', 'up_to_75_percent',
  '4_to_30_years', '5_to_30_years', '4_to_25_years', 'prime_rate_structure', 'fixed_rate_structure', 'variable_rate_structure'
)
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Add Russian translations
INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status) 
SELECT ci.id, 'ru', 
  CASE ci.content_key
    WHEN 'bank_offers_credit_register' THEN 'Регистрация заявки на кредит'
    WHEN 'mortgage_register' THEN 'Регистрация заявки на ипотеку'
    WHEN 'no_bank_offers_available' THEN 'Предложения банков не найдены'
    WHEN 'no_offers_message' THEN 'Не найдены предложения банков, соответствующие вашему профилю. Попробуйте изменить параметры.'
    WHEN 'bank_name' THEN 'Банк'
    WHEN 'credit_prime_percent' THEN 'Кредит по ставке прайм'
    WHEN 'mortgage_prime_percent' THEN 'Ипотека по ставке прайм'
    WHEN 'credit_fix_percent' THEN 'Кредит по фиксированной ставке'
    WHEN 'mortgage_fix_percent' THEN 'Ипотека по фиксированной ставке'
    WHEN 'credit_float_percent' THEN 'Кредит по переменной ставке'
    WHEN 'mortgage_float_percent' THEN 'Ипотека по переменной ставке'
    WHEN 'prime_description' THEN 'Программа, привязанная к ставке прайм'
    WHEN 'fixed_inflation_description' THEN 'Фиксированная ставка с поправкой на инфляцию'
    WHEN 'variable_inflation_description' THEN 'Переменная ставка с поправкой на инфляцию'
    WHEN 'up_to_33_percent' THEN 'До 33%'
    WHEN 'up_to_70_percent' THEN 'До 70%'
    WHEN 'up_to_75_percent' THEN 'До 75%'
    WHEN '4_to_30_years' THEN '4-30 лет'
    WHEN '5_to_30_years' THEN '5-30 лет'
    WHEN '4_to_25_years' THEN '4-25 лет'
    WHEN 'prime_rate_structure' THEN 'Переменные + фиксированные компоненты'
    WHEN 'fixed_rate_structure' THEN 'Структура фиксированной ставки'
    WHEN 'variable_rate_structure' THEN 'Структура переменной ставки'
  END,
  false, 'approved'
FROM content_items ci 
WHERE ci.content_key IN (
  'bank_offers_credit_register', 'mortgage_register', 'no_bank_offers_available', 'no_offers_message', 'bank_name',
  'credit_prime_percent', 'mortgage_prime_percent', 'credit_fix_percent', 'mortgage_fix_percent', 
  'credit_float_percent', 'mortgage_float_percent', 'prime_description', 'fixed_inflation_description', 
  'variable_inflation_description', 'up_to_33_percent', 'up_to_70_percent', 'up_to_75_percent',
  '4_to_30_years', '5_to_30_years', '4_to_25_years', 'prime_rate_structure', 'fixed_rate_structure', 'variable_rate_structure'
)
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Verify the migration
SELECT ci.content_key, ct.language_code, ct.content_value, ct.status
FROM content_items ci 
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.content_key = 'bank_offers_credit_register'
ORDER BY ct.language_code;