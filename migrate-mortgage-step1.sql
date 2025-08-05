-- ================================================================
-- MORTGAGE STEP 1 CONTENT MIGRATION
-- Following @translationRules conventions exactly
-- ================================================================

BEGIN;

-- Clean up any existing mortgage_calculation content first
DELETE FROM content_translations 
WHERE content_item_id IN (
  SELECT id FROM content_items 
  WHERE screen_location = 'mortgage_calculation'
);

DELETE FROM content_items 
WHERE screen_location = 'mortgage_calculation';

-- Insert content items for mortgage_calculation following translationRules patterns
-- Progress Steps
INSERT INTO content_items (content_key, component_type, category, screen_location, is_active) VALUES
('mortgage_mobile_step_1', 'text', 'progress', 'mortgage_calculation', true),
('mortgage_mobile_step_2', 'text', 'progress', 'mortgage_calculation', true),
('mortgage_mobile_step_3', 'text', 'progress', 'mortgage_calculation', true), 
('mortgage_mobile_step_4', 'text', 'progress', 'mortgage_calculation', true),

-- Video Header Content
('mortgage_video_title', 'title', 'header', 'mortgage_calculation', true),
('mortgage_show_offers', 'button', 'navigation', 'mortgage_calculation', true),

-- Form Fields for Step 1
('mortgage_price_of_estate', 'field_label', 'form_field', 'mortgage_calculation', true),
('mortgage_city_where_you_buy', 'field_label', 'form_field', 'mortgage_calculation', true),
('mortgage_when_do_you_need_money', 'field_label', 'form_field', 'mortgage_calculation', true),
('mortgage_initial_fee', 'field_label', 'form_field', 'mortgage_calculation', true),
('mortgage_property_type', 'field_label', 'form_field', 'mortgage_calculation', true),
('mortgage_will_be_your_first', 'field_label', 'form_field', 'mortgage_calculation', true),
('mortgage_property_ownership', 'field_label', 'form_field', 'mortgage_calculation', true),

-- Dropdown Options for Property Type (sequential numbering as per rules)
('mortgage_property_type_option_1', 'option', 'dropdown', 'mortgage_calculation', true),
('mortgage_property_type_option_2', 'option', 'dropdown', 'mortgage_calculation', true),
('mortgage_property_type_option_3', 'option', 'dropdown', 'mortgage_calculation', true),

-- First Property Options
('mortgage_first_property_option_1', 'option', 'dropdown', 'mortgage_calculation', true),
('mortgage_first_property_option_2', 'option', 'dropdown', 'mortgage_calculation', true),

-- Property Ownership Options
('mortgage_ownership_option_1', 'option', 'dropdown', 'mortgage_calculation', true),
('mortgage_ownership_option_2', 'option', 'dropdown', 'mortgage_calculation', true),
('mortgage_ownership_option_3', 'option', 'dropdown', 'mortgage_calculation', true),

-- Credit Parameters
('mortgage_desired_period', 'field_label', 'form_field', 'mortgage_calculation', true),
('mortgage_monthly_payment', 'field_label', 'form_field', 'mortgage_calculation', true),
('mortgage_period_years', 'text', 'form_field', 'mortgage_calculation', true);

-- Insert translations for all three languages (EN/HE/RU as per @translationRules)
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 
  CASE ci.content_key
    -- Progress Steps
    WHEN 'mortgage_mobile_step_1' THEN 'Calculator'
    WHEN 'mortgage_mobile_step_2' THEN 'Personal details'
    WHEN 'mortgage_mobile_step_3' THEN 'Income'
    WHEN 'mortgage_mobile_step_4' THEN 'Programs'
    
    -- Video Header Content
    WHEN 'mortgage_video_title' THEN 'Mortgage Calculator'
    WHEN 'mortgage_show_offers' THEN 'Show offers'
    
    -- Form Fields
    WHEN 'mortgage_price_of_estate' THEN 'Property value'
    WHEN 'mortgage_city_where_you_buy' THEN 'City where you buy'
    WHEN 'mortgage_when_do_you_need_money' THEN 'When do you need the money?'
    WHEN 'mortgage_initial_fee' THEN 'Down payment'
    WHEN 'mortgage_property_type' THEN 'Property type'
    WHEN 'mortgage_will_be_your_first' THEN 'Is this your first property?'
    WHEN 'mortgage_property_ownership' THEN 'Property ownership status'
    
    -- Property Type Options
    WHEN 'mortgage_property_type_option_1' THEN 'Apartment'
    WHEN 'mortgage_property_type_option_2' THEN 'House'
    WHEN 'mortgage_property_type_option_3' THEN 'Commercial'
    
    -- First Property Options
    WHEN 'mortgage_first_property_option_1' THEN 'Yes, first property'
    WHEN 'mortgage_first_property_option_2' THEN 'No, additional property'
    
    -- Property Ownership Options
    WHEN 'mortgage_ownership_option_1' THEN 'I don''t own property'
    WHEN 'mortgage_ownership_option_2' THEN 'I own a property'
    WHEN 'mortgage_ownership_option_3' THEN 'I''m selling a property'
    
    -- Credit Parameters
    WHEN 'mortgage_desired_period' THEN 'Desired mortgage period'
    WHEN 'mortgage_monthly_payment' THEN 'Monthly payment'
    WHEN 'mortgage_period_years' THEN 'years'
  END, 'approved'
FROM content_items ci
WHERE ci.screen_location = 'mortgage_calculation';

-- Hebrew translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 
  CASE ci.content_key
    -- Progress Steps
    WHEN 'mortgage_mobile_step_1' THEN 'מחשבון'
    WHEN 'mortgage_mobile_step_2' THEN 'פרטים אישיים'
    WHEN 'mortgage_mobile_step_3' THEN 'הכנסות'
    WHEN 'mortgage_mobile_step_4' THEN 'תוכניות'
    
    -- Video Header Content
    WHEN 'mortgage_video_title' THEN 'מחשבון משכנתא'
    WHEN 'mortgage_show_offers' THEN 'הצג הצעות'
    
    -- Form Fields
    WHEN 'mortgage_price_of_estate' THEN 'שווי הנכס'
    WHEN 'mortgage_city_where_you_buy' THEN 'עיר בה אתה קונה'
    WHEN 'mortgage_when_do_you_need_money' THEN 'מתי אתה זקוק לכסף?'
    WHEN 'mortgage_initial_fee' THEN 'מקדמה'
    WHEN 'mortgage_property_type' THEN 'סוג הנכס'
    WHEN 'mortgage_will_be_your_first' THEN 'האם זה הנכס הראשון שלך?'
    WHEN 'mortgage_property_ownership' THEN 'סטטוס בעלות על נכס'
    
    -- Property Type Options
    WHEN 'mortgage_property_type_option_1' THEN 'דירה'
    WHEN 'mortgage_property_type_option_2' THEN 'בית'
    WHEN 'mortgage_property_type_option_3' THEN 'מסחרי'
    
    -- First Property Options
    WHEN 'mortgage_first_property_option_1' THEN 'כן, נכס ראשון'
    WHEN 'mortgage_first_property_option_2' THEN 'לא, נכס נוסף'
    
    -- Property Ownership Options
    WHEN 'mortgage_ownership_option_1' THEN 'אני לא מחזיק בנכס'
    WHEN 'mortgage_ownership_option_2' THEN 'אני מחזיק בנכס'
    WHEN 'mortgage_ownership_option_3' THEN 'אני מוכר נכס'
    
    -- Credit Parameters
    WHEN 'mortgage_desired_period' THEN 'תקופת משכנתא רצויה'
    WHEN 'mortgage_monthly_payment' THEN 'תשלום חודשי'
    WHEN 'mortgage_period_years' THEN 'שנים'
  END, 'approved'
FROM content_items ci
WHERE ci.screen_location = 'mortgage_calculation';

-- Russian translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 
  CASE ci.content_key
    -- Progress Steps
    WHEN 'mortgage_mobile_step_1' THEN 'Калькулятор'
    WHEN 'mortgage_mobile_step_2' THEN 'Личные данные'
    WHEN 'mortgage_mobile_step_3' THEN 'Доходы'
    WHEN 'mortgage_mobile_step_4' THEN 'Программы'
    
    -- Video Header Content
    WHEN 'mortgage_video_title' THEN 'Калькулятор ипотеки'
    WHEN 'mortgage_show_offers' THEN 'Показать предложения'
    
    -- Form Fields
    WHEN 'mortgage_price_of_estate' THEN 'Стоимость недвижимости'
    WHEN 'mortgage_city_where_you_buy' THEN 'Город покупки'
    WHEN 'mortgage_when_do_you_need_money' THEN 'Когда вам нужны деньги?'
    WHEN 'mortgage_initial_fee' THEN 'Первоначальный взнос'
    WHEN 'mortgage_property_type' THEN 'Тип недвижимости'
    WHEN 'mortgage_will_be_your_first' THEN 'Это ваша первая недвижимость?'
    WHEN 'mortgage_property_ownership' THEN 'Статус владения недвижимостью'
    
    -- Property Type Options
    WHEN 'mortgage_property_type_option_1' THEN 'Квартира'
    WHEN 'mortgage_property_type_option_2' THEN 'Дом'
    WHEN 'mortgage_property_type_option_3' THEN 'Коммерческая'
    
    -- First Property Options
    WHEN 'mortgage_first_property_option_1' THEN 'Да, первая недвижимость'
    WHEN 'mortgage_first_property_option_2' THEN 'Нет, дополнительная недвижимость'
    
    -- Property Ownership Options
    WHEN 'mortgage_ownership_option_1' THEN 'У меня нет недвижимости'
    WHEN 'mortgage_ownership_option_2' THEN 'У меня есть недвижимость'
    WHEN 'mortgage_ownership_option_3' THEN 'Я продаю недвижимость'
    
    -- Credit Parameters
    WHEN 'mortgage_desired_period' THEN 'Желаемый срок ипотеки'
    WHEN 'mortgage_monthly_payment' THEN 'Ежемесячный платеж'
    WHEN 'mortgage_period_years' THEN 'лет'
  END, 'approved'
FROM content_items ci
WHERE ci.screen_location = 'mortgage_calculation';

COMMIT;

-- Verification query (run after migration)
SELECT 
  'mortgage_calculation' as screen_location,
  COUNT(*) as total_items,
  COUNT(*) * 3 as expected_translations,
  (SELECT COUNT(*) FROM content_translations ct 
   JOIN content_items ci ON ct.content_item_id = ci.id 
   WHERE ci.screen_location = 'mortgage_calculation') as actual_translations
FROM content_items 
WHERE screen_location = 'mortgage_calculation' AND is_active = true; 