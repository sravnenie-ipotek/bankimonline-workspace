-- Migration: Credit Calculator Step 4 Content
-- Creates content_items and translations for /services/calculate-credit/4
-- Based on mortgage step 4 structure for consistency

-- Insert content items for credit step 4
INSERT INTO content_items (
    key, 
    component_type, 
    category, 
    screen_location, 
    status,
    created_at,
    updated_at
) VALUES 
-- Main title
('calculate_credit_step4_title', 'title', 'navigation', 'calculate_credit_4', 'active', NOW(), NOW()),

-- Results section
('calculate_credit_results_title', 'title', 'results', 'calculate_credit_4', 'active', NOW(), NOW()),
('calculate_credit_results_subtitle', 'text', 'results', 'calculate_credit_4', 'active', NOW(), NOW()),

-- Filter options
('calculate_credit_filter_title', 'title', 'filters', 'calculate_credit_4', 'active', NOW(), NOW()),
('calculate_credit_filter_option_1', 'option', 'filters', 'calculate_credit_4', 'active', NOW(), NOW()),
('calculate_credit_filter_option_2', 'option', 'filters', 'calculate_credit_4', 'active', NOW(), NOW()),
('calculate_credit_filter_option_3', 'option', 'filters', 'calculate_credit_4', 'active', NOW(), NOW()),
('calculate_credit_filter_option_4', 'option', 'filters', 'calculate_credit_4', 'active', NOW(), NOW()),

-- Bank offer card fields
('calculate_credit_bank_name', 'field_label', 'bank_offers', 'calculate_credit_4', 'active', NOW(), NOW()),
('calculate_credit_interest_rate', 'field_label', 'bank_offers', 'calculate_credit_4', 'active', NOW(), NOW()),
('calculate_credit_monthly_payment', 'field_label', 'bank_offers', 'calculate_credit_4', 'active', NOW(), NOW()),
('calculate_credit_total_cost', 'field_label', 'bank_offers', 'calculate_credit_4', 'active', NOW(), NOW()),
('calculate_credit_loan_term', 'field_label', 'bank_offers', 'calculate_credit_4', 'active', NOW(), NOW()),
('calculate_credit_processing_fee', 'field_label', 'bank_offers', 'calculate_credit_4', 'active', NOW(), NOW()),

-- Action buttons
('calculate_credit_apply_button', 'button', 'bank_offers', 'calculate_credit_4', 'active', NOW(), NOW()),
('calculate_credit_details_button', 'button', 'bank_offers', 'calculate_credit_4', 'active', NOW(), NOW()),
('calculate_credit_compare_button', 'button', 'bank_offers', 'calculate_credit_4', 'active', NOW(), NOW()),

-- Warning messages
('calculate_credit_warning_income', 'text', 'warnings', 'calculate_credit_4', 'active', NOW(), NOW()),
('calculate_credit_warning_debt_ratio', 'text', 'warnings', 'calculate_credit_4', 'active', NOW(), NOW()),
('calculate_credit_warning_credit_history', 'text', 'warnings', 'calculate_credit_4', 'active', NOW(), NOW()),

-- Information texts
('calculate_credit_info_calculation_basis', 'text', 'information', 'calculate_credit_4', 'active', NOW(), NOW()),
('calculate_credit_info_rates_subject_change', 'text', 'information', 'calculate_credit_4', 'active', NOW(), NOW()),
('calculate_credit_info_approval_requirements', 'text', 'information', 'calculate_credit_4', 'active', NOW(), NOW()),

-- No results message
('calculate_credit_no_results_title', 'title', 'no_results', 'calculate_credit_4', 'active', NOW(), NOW()),
('calculate_credit_no_results_message', 'text', 'no_results', 'calculate_credit_4', 'active', NOW(), NOW()),
('calculate_credit_no_results_suggestions', 'text', 'no_results', 'calculate_credit_4', 'active', NOW(), NOW()),

-- Navigation buttons
('calculate_credit_step4_back_button', 'button', 'navigation', 'calculate_credit_4', 'active', NOW(), NOW()),
('calculate_credit_step4_restart_button', 'button', 'navigation', 'calculate_credit_4', 'active', NOW(), NOW())

ON CONFLICT (key, screen_location) DO NOTHING;

-- Insert translations for all content items
-- English translations
INSERT INTO content_translations (content_item_id, language_code, value, status, created_at, updated_at)
SELECT 
    ci.id,
    'en',
    CASE ci.key
        -- Main title
        WHEN 'calculate_credit_step4_title' THEN 'Credit Offers & Results'
        
        -- Results section
        WHEN 'calculate_credit_results_title' THEN 'Available Credit Offers'
        WHEN 'calculate_credit_results_subtitle' THEN 'Based on your financial profile, here are the best credit options available to you'
        
        -- Filter options
        WHEN 'calculate_credit_filter_title' THEN 'Filter Results'
        WHEN 'calculate_credit_filter_option_1' THEN 'Show All Offers'
        WHEN 'calculate_credit_filter_option_2' THEN 'Best Interest Rate'
        WHEN 'calculate_credit_filter_option_3' THEN 'Lowest Monthly Payment'
        WHEN 'calculate_credit_filter_option_4' THEN 'Shortest Repayment Period'
        
        -- Bank offer card fields
        WHEN 'calculate_credit_bank_name' THEN 'Bank'
        WHEN 'calculate_credit_interest_rate' THEN 'Interest Rate'
        WHEN 'calculate_credit_monthly_payment' THEN 'Monthly Payment'
        WHEN 'calculate_credit_total_cost' THEN 'Total Cost'
        WHEN 'calculate_credit_loan_term' THEN 'Loan Term'
        WHEN 'calculate_credit_processing_fee' THEN 'Processing Fee'
        
        -- Action buttons
        WHEN 'calculate_credit_apply_button' THEN 'Apply Now'
        WHEN 'calculate_credit_details_button' THEN 'View Details'
        WHEN 'calculate_credit_compare_button' THEN 'Compare Offers'
        
        -- Warning messages
        WHEN 'calculate_credit_warning_income' THEN 'Your monthly income may be insufficient for some credit offers. Consider increasing your income or reducing the loan amount.'
        WHEN 'calculate_credit_warning_debt_ratio' THEN 'Your debt-to-income ratio is high. This may affect your eligibility for certain credit offers.'
        WHEN 'calculate_credit_warning_credit_history' THEN 'Limited credit history may affect available offers. Building credit history can improve future options.'
        
        -- Information texts
        WHEN 'calculate_credit_info_calculation_basis' THEN 'Calculations are based on the information you provided and current market rates.'
        WHEN 'calculate_credit_info_rates_subject_change' THEN 'Interest rates are subject to change and final approval by the lending institution.'
        WHEN 'calculate_credit_info_approval_requirements' THEN 'Final approval depends on credit check, income verification, and bank-specific criteria.'
        
        -- No results message
        WHEN 'calculate_credit_no_results_title' THEN 'No Credit Offers Available'
        WHEN 'calculate_credit_no_results_message' THEN 'Unfortunately, we could not find suitable credit offers based on your current financial profile.'
        WHEN 'calculate_credit_no_results_suggestions' THEN 'Consider improving your credit score, increasing your income, or reducing existing debt before reapplying.'
        
        -- Navigation buttons
        WHEN 'calculate_credit_step4_back_button' THEN 'Back'
        WHEN 'calculate_credit_step4_restart_button' THEN 'Start New Calculation'
        
        ELSE ci.key
    END,
    'approved',
    NOW(),
    NOW()
FROM content_items ci
WHERE ci.screen_location = 'calculate_credit_4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Hebrew translations
INSERT INTO content_translations (content_item_id, language_code, value, status, created_at, updated_at)
SELECT 
    ci.id,
    'he',
    CASE ci.key
        -- Main title
        WHEN 'calculate_credit_step4_title' THEN 'הצעות אשראי ותוצאות'
        
        -- Results section
        WHEN 'calculate_credit_results_title' THEN 'הצעות אשראי זמינות'
        WHEN 'calculate_credit_results_subtitle' THEN 'בהתבסס על הפרופיל הפיננסי שלך, אלו הן אפשרויות האשראי הטובות ביותר הזמינות לך'
        
        -- Filter options
        WHEN 'calculate_credit_filter_title' THEN 'סינון תוצאות'
        WHEN 'calculate_credit_filter_option_1' THEN 'הצג את כל ההצעות'
        WHEN 'calculate_credit_filter_option_2' THEN 'הריבית הטובה ביותר'
        WHEN 'calculate_credit_filter_option_3' THEN 'התשלום החודשי הנמוך ביותר'
        WHEN 'calculate_credit_filter_option_4' THEN 'תקופת ההחזר הקצרה ביותר'
        
        -- Bank offer card fields
        WHEN 'calculate_credit_bank_name' THEN 'בנק'
        WHEN 'calculate_credit_interest_rate' THEN 'ריבית'
        WHEN 'calculate_credit_monthly_payment' THEN 'תשלום חודשי'
        WHEN 'calculate_credit_total_cost' THEN 'עלות כוללת'
        WHEN 'calculate_credit_loan_term' THEN 'תקופת ההלוואה'
        WHEN 'calculate_credit_processing_fee' THEN 'עמלת עיבוד'
        
        -- Action buttons
        WHEN 'calculate_credit_apply_button' THEN 'הגש בקשה עכשיו'
        WHEN 'calculate_credit_details_button' THEN 'צפה בפרטים'
        WHEN 'calculate_credit_compare_button' THEN 'השווה הצעות'
        
        -- Warning messages
        WHEN 'calculate_credit_warning_income' THEN 'ההכנסה החודשית שלך עשויה להיות לא מספקת עבור חלק מהצעות האשראי. שקול להגדיל את ההכנסה או לצמצם את סכום ההלוואה.'
        WHEN 'calculate_credit_warning_debt_ratio' THEN 'יחס החוב להכנסה שלך גבוה. זה עלול להשפיע על הזכאות שלך להצעות אשראי מסוימות.'
        WHEN 'calculate_credit_warning_credit_history' THEN 'היסטוריית אשראי מוגבלת עשויה להשפיע על ההצעות הזמינות. בניית היסטוריית אשראי יכולה לשפר אפשרויות עתידיות.'
        
        -- Information texts
        WHEN 'calculate_credit_info_calculation_basis' THEN 'החישובים מבוססים על המידע שסיפקת ועל שערי השוק הנוכחיים.'
        WHEN 'calculate_credit_info_rates_subject_change' THEN 'שיעורי הריבית עשויים להשתנות וכפופים לאישור סופי מהמוסד המלווה.'
        WHEN 'calculate_credit_info_approval_requirements' THEN 'האישור הסופי תלוי בבדיקת אשראי, אימות הכנסה וקריטריונים ספציפיים לבנק.'
        
        -- No results message
        WHEN 'calculate_credit_no_results_title' THEN 'אין הצעות אשראי זמינות'
        WHEN 'calculate_credit_no_results_message' THEN 'למרבה הצער, לא הצלחנו למצוא הצעות אשראי מתאימות בהתבסס על הפרופיל הפיננסי הנוכחי שלך.'
        WHEN 'calculate_credit_no_results_suggestions' THEN 'שקול לשפר את ציון האשראי שלך, להגדיל את ההכנסה או לצמצם חובות קיימים לפני הגשת בקשה מחדש.'
        
        -- Navigation buttons
        WHEN 'calculate_credit_step4_back_button' THEN 'חזרה'
        WHEN 'calculate_credit_step4_restart_button' THEN 'התחל חישוב חדש'
        
        ELSE ci.key
    END,
    'approved',
    NOW(),
    NOW()
FROM content_items ci
WHERE ci.screen_location = 'calculate_credit_4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Russian translations
INSERT INTO content_translations (content_item_id, language_code, value, status, created_at, updated_at)
SELECT 
    ci.id,
    'ru',
    CASE ci.key
        -- Main title
        WHEN 'calculate_credit_step4_title' THEN 'Кредитные предложения и результаты'
        
        -- Results section
        WHEN 'calculate_credit_results_title' THEN 'Доступные кредитные предложения'
        WHEN 'calculate_credit_results_subtitle' THEN 'На основе вашего финансового профиля, вот лучшие кредитные варианты, доступные вам'
        
        -- Filter options
        WHEN 'calculate_credit_filter_title' THEN 'Фильтр результатов'
        WHEN 'calculate_credit_filter_option_1' THEN 'Показать все предложения'
        WHEN 'calculate_credit_filter_option_2' THEN 'Лучшая процентная ставка'
        WHEN 'calculate_credit_filter_option_3' THEN 'Наименьший ежемесячный платеж'
        WHEN 'calculate_credit_filter_option_4' THEN 'Кратчайший период погашения'
        
        -- Bank offer card fields
        WHEN 'calculate_credit_bank_name' THEN 'Банк'
        WHEN 'calculate_credit_interest_rate' THEN 'Процентная ставка'
        WHEN 'calculate_credit_monthly_payment' THEN 'Ежемесячный платеж'
        WHEN 'calculate_credit_total_cost' THEN 'Общая стоимость'
        WHEN 'calculate_credit_loan_term' THEN 'Срок кредита'
        WHEN 'calculate_credit_processing_fee' THEN 'Комиссия за обработку'
        
        -- Action buttons
        WHEN 'calculate_credit_apply_button' THEN 'Подать заявку сейчас'
        WHEN 'calculate_credit_details_button' THEN 'Посмотреть детали'
        WHEN 'calculate_credit_compare_button' THEN 'Сравнить предложения'
        
        -- Warning messages
        WHEN 'calculate_credit_warning_income' THEN 'Ваш ежемесячный доход может быть недостаточным для некоторых кредитных предложений. Рассмотрите возможность увеличения дохода или уменьшения суммы кредита.'
        WHEN 'calculate_credit_warning_debt_ratio' THEN 'Ваше отношение долга к доходу высокое. Это может повлиять на вашу правомочность для определенных кредитных предложений.'
        WHEN 'calculate_credit_warning_credit_history' THEN 'Ограниченная кредитная история может повлиять на доступные предложения. Создание кредитной истории может улучшить будущие возможности.'
        
        -- Information texts
        WHEN 'calculate_credit_info_calculation_basis' THEN 'Расчеты основаны на предоставленной вами информации и текущих рыночных ставках.'
        WHEN 'calculate_credit_info_rates_subject_change' THEN 'Процентные ставки могут изменяться и подлежат окончательному одобрению кредитным учреждением.'
        WHEN 'calculate_credit_info_approval_requirements' THEN 'Окончательное одобрение зависит от проверки кредитоспособности, подтверждения дохода и специфических критериев банка.'
        
        -- No results message
        WHEN 'calculate_credit_no_results_title' THEN 'Нет доступных кредитных предложений'
        WHEN 'calculate_credit_no_results_message' THEN 'К сожалению, мы не смогли найти подходящие кредитные предложения на основе вашего текущего финансового профиля.'
        WHEN 'calculate_credit_no_results_suggestions' THEN 'Рассмотрите возможность улучшения вашего кредитного рейтинга, увеличения дохода или уменьшения существующих долгов перед повторной подачей заявки.'
        
        -- Navigation buttons
        WHEN 'calculate_credit_step4_back_button' THEN 'Назад'
        WHEN 'calculate_credit_step4_restart_button' THEN 'Начать новый расчет'
        
        ELSE ci.key
    END,
    'approved',
    NOW(),
    NOW()
FROM content_items ci
WHERE ci.screen_location = 'calculate_credit_4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;