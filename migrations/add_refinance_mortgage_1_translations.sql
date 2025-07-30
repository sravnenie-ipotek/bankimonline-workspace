-- ================================================================
-- ADD TRANSLATIONS FOR REFINANCE MORTGAGE 1 DROPDOWNS
-- ================================================================
-- This script adds translations for all the new dropdown content in refinance_mortgage_1
-- FOLLOWS: @dropDownsInDBLogic standards - all translations set to 'approved'
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: Add English Translations
-- ================================================================

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 
  CASE 
    WHEN ci.content_key LIKE '%registered%' THEN 'Is the mortgage registered in Tabu?'
    WHEN ci.content_key LIKE '%registered_option_1%' THEN 'Yes'
    WHEN ci.content_key LIKE '%registered_option_2%' THEN 'No'
    WHEN ci.content_key LIKE '%why%' AND ci.component_type = 'dropdown' THEN 'Purpose of Mortgage Refinance'
    WHEN ci.content_key LIKE '%why_option_1%' THEN 'Lower Interest Rate'
    WHEN ci.content_key LIKE '%why_option_2%' THEN 'Extend Loan Term'
    WHEN ci.content_key LIKE '%why_option_3%' THEN 'Change Bank'
    WHEN ci.content_key LIKE '%why_option_4%' THEN 'Increase Loan Amount'
    WHEN ci.content_key LIKE '%why_option_5%' THEN 'Other'
    WHEN ci.content_key LIKE '%property_type%' AND ci.component_type = 'dropdown' THEN 'Property Type'
    WHEN ci.content_key LIKE '%property_type_option_1%' THEN 'Apartment'
    WHEN ci.content_key LIKE '%property_type_option_2%' THEN 'House'
    WHEN ci.content_key LIKE '%property_type_option_3%' THEN 'Commercial'
    WHEN ci.content_key LIKE '%_ph%' THEN 'Select from list'
    WHEN ci.content_key LIKE '%_label%' THEN 
      CASE 
        WHEN ci.content_key LIKE '%registered%' THEN 'Is the mortgage registered in Tabu?'
        WHEN ci.content_key LIKE '%why%' THEN 'Purpose of Mortgage Refinance'
        WHEN ci.content_key LIKE '%property_type%' THEN 'Property Type'
        ELSE 'Label'
      END
    ELSE 'Content'
  END, 'approved'
FROM content_items ci
WHERE ci.screen_location = 'refinance_mortgage_1'
AND ci.content_key LIKE 'refinance_mortgage_1_%'
AND NOT EXISTS (
  SELECT 1 FROM content_translations ct 
  WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

-- ================================================================
-- STEP 2: Add Hebrew Translations
-- ================================================================

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 
  CASE 
    WHEN ci.content_key LIKE '%registered%' THEN 'האם המשכנתא רשומה בטאבו?'
    WHEN ci.content_key LIKE '%registered_option_1%' THEN 'כן'
    WHEN ci.content_key LIKE '%registered_option_2%' THEN 'לא'
    WHEN ci.content_key LIKE '%why%' AND ci.component_type = 'dropdown' THEN 'מטרת מחזור המשכנתא'
    WHEN ci.content_key LIKE '%why_option_1%' THEN 'הורדת ריבית'
    WHEN ci.content_key LIKE '%why_option_2%' THEN 'הארכת תקופת ההלוואה'
    WHEN ci.content_key LIKE '%why_option_3%' THEN 'החלפת בנק'
    WHEN ci.content_key LIKE '%why_option_4%' THEN 'הגדלת סכום ההלוואה'
    WHEN ci.content_key LIKE '%why_option_5%' THEN 'אחר'
    WHEN ci.content_key LIKE '%property_type%' AND ci.component_type = 'dropdown' THEN 'סוג הנכס'
    WHEN ci.content_key LIKE '%property_type_option_1%' THEN 'דירה'
    WHEN ci.content_key LIKE '%property_type_option_2%' THEN 'בית'
    WHEN ci.content_key LIKE '%property_type_option_3%' THEN 'מסחרי'
    WHEN ci.content_key LIKE '%_ph%' THEN 'בחר מהרשימה'
    WHEN ci.content_key LIKE '%_label%' THEN 
      CASE 
        WHEN ci.content_key LIKE '%registered%' THEN 'האם המשכנתא רשומה בטאבו?'
        WHEN ci.content_key LIKE '%why%' THEN 'מטרת מחזור המשכנתא'
        WHEN ci.content_key LIKE '%property_type%' THEN 'סוג הנכס'
        ELSE 'תווית'
      END
    ELSE 'תוכן'
  END, 'approved'
FROM content_items ci
WHERE ci.screen_location = 'refinance_mortgage_1'
AND ci.content_key LIKE 'refinance_mortgage_1_%'
AND NOT EXISTS (
  SELECT 1 FROM content_translations ct 
  WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

-- ================================================================
-- STEP 3: Add Russian Translations
-- ================================================================

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 
  CASE 
    WHEN ci.content_key LIKE '%registered%' THEN 'Зарегистрирована ли ипотека в Табу?'
    WHEN ci.content_key LIKE '%registered_option_1%' THEN 'Да'
    WHEN ci.content_key LIKE '%registered_option_2%' THEN 'Нет'
    WHEN ci.content_key LIKE '%why%' AND ci.component_type = 'dropdown' THEN 'Цель рефинансирования ипотеки'
    WHEN ci.content_key LIKE '%why_option_1%' THEN 'Снижение процентной ставки'
    WHEN ci.content_key LIKE '%why_option_2%' THEN 'Увеличение срока кредита'
    WHEN ci.content_key LIKE '%why_option_3%' THEN 'Смена банка'
    WHEN ci.content_key LIKE '%why_option_4%' THEN 'Увеличение суммы кредита'
    WHEN ci.content_key LIKE '%why_option_5%' THEN 'Другое'
    WHEN ci.content_key LIKE '%property_type%' AND ci.component_type = 'dropdown' THEN 'Тип недвижимости'
    WHEN ci.content_key LIKE '%property_type_option_1%' THEN 'Квартира'
    WHEN ci.content_key LIKE '%property_type_option_2%' THEN 'Дом'
    WHEN ci.content_key LIKE '%property_type_option_3%' THEN 'Коммерческая'
    WHEN ci.content_key LIKE '%_ph%' THEN 'Выберите из списка'
    WHEN ci.content_key LIKE '%_label%' THEN 
      CASE 
        WHEN ci.content_key LIKE '%registered%' THEN 'Зарегистрирована ли ипотека в Табу?'
        WHEN ci.content_key LIKE '%why%' THEN 'Цель рефинансирования ипотеки'
        WHEN ci.content_key LIKE '%property_type%' THEN 'Тип недвижимости'
        ELSE 'Метка'
      END
    ELSE 'Содержание'
  END, 'approved'
FROM content_items ci
WHERE ci.screen_location = 'refinance_mortgage_1'
AND ci.content_key LIKE 'refinance_mortgage_1_%'
AND NOT EXISTS (
  SELECT 1 FROM content_translations ct 
  WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

COMMIT;
