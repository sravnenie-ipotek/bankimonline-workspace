-- Additional migration script for content keys that were in translation files but not in components
-- This supplements the main migration script

BEGIN;

-- COOPERATION PAGE - Additional content
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
-- About Section
('cooperation', 'cooperation_about_title', 'heading', 'about', true, NOW(), NOW()),
('cooperation', 'cooperation_about_description_1', 'text', 'about', true, NOW(), NOW()),
('cooperation', 'cooperation_about_description_2', 'text', 'about', true, NOW(), NOW()),
('cooperation', 'cooperation_about_description_3', 'text', 'about', true, NOW(), NOW()),
-- Earning Section
('cooperation', 'cooperation_earning_title', 'heading', 'earning', true, NOW(), NOW()),
('cooperation', 'cooperation_earning_commission_title', 'heading', 'earning', true, NOW(), NOW()),
('cooperation', 'cooperation_earning_commission_desc', 'text', 'earning', true, NOW(), NOW()),
('cooperation', 'cooperation_earning_bonus_title', 'heading', 'earning', true, NOW(), NOW()),
('cooperation', 'cooperation_earning_bonus_desc', 'text', 'earning', true, NOW(), NOW()),
('cooperation', 'cooperation_earning_targets_title', 'heading', 'earning', true, NOW(), NOW()),
('cooperation', 'cooperation_earning_targets_desc', 'text', 'earning', true, NOW(), NOW()),
-- Steps Section
('cooperation', 'cooperation_steps_title', 'heading', 'steps', true, NOW(), NOW()),
('cooperation', 'cooperation_step1_title', 'option', 'steps', true, NOW(), NOW()),
('cooperation', 'cooperation_step1_desc', 'option', 'steps', true, NOW(), NOW()),
('cooperation', 'cooperation_step2_title', 'option', 'steps', true, NOW(), NOW()),
('cooperation', 'cooperation_step2_desc', 'option', 'steps', true, NOW(), NOW()),
('cooperation', 'cooperation_step3_title', 'option', 'steps', true, NOW(), NOW()),
('cooperation', 'cooperation_step3_desc', 'option', 'steps', true, NOW(), NOW()),
('cooperation', 'cooperation_step4_title', 'option', 'steps', true, NOW(), NOW()),
('cooperation', 'cooperation_step4_desc', 'option', 'steps', true, NOW(), NOW()),
('cooperation', 'cooperation_step5_title', 'option', 'steps', true, NOW(), NOW()),
('cooperation', 'cooperation_step5_desc', 'option', 'steps', true, NOW(), NOW()),
-- Other content
('cooperation', 'cooperation_partners_title', 'heading', 'partners', true, NOW(), NOW()),
('cooperation', 'cooperation_cta_description', 'text', 'cta', true, NOW(), NOW()),
('cooperation', 'cooperation_email', 'text', 'contact', true, NOW(), NOW()),
('cooperation', 'cooperation_phone', 'text', 'contact', true, NOW(), NOW()),
('cooperation', 'cooperation_partner_login', 'button', 'auth', true, NOW(), NOW()),
('cooperation', 'cooperation_register', 'button', 'auth', true, NOW(), NOW());

-- Insert translations for cooperation additional content
INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        -- About Section
        WHEN ci.content_key = 'cooperation_about_title' AND lang.code = 'en' THEN 'About us'
        WHEN ci.content_key = 'cooperation_about_title' AND lang.code = 'he' THEN 'אודותינו'
        WHEN ci.content_key = 'cooperation_about_title' AND lang.code = 'ru' THEN 'О нас'
        WHEN ci.content_key = 'cooperation_about_description_1' AND lang.code = 'en' THEN 'Bankimonline is the leading platform for comparing mortgages and financial products in Israel.'
        WHEN ci.content_key = 'cooperation_about_description_1' AND lang.code = 'he' THEN 'בנקימאונליין היא הפלטפורמה המובילה להשוואת משכנתאות ומוצרים פיננסיים בישראל.'
        WHEN ci.content_key = 'cooperation_about_description_1' AND lang.code = 'ru' THEN 'Bankimonline - ведущая платформа для сравнения ипотек и финансовых продуктов в Израиле.'
        WHEN ci.content_key = 'cooperation_about_description_2' AND lang.code = 'en' THEN 'We help clients find the best mortgage for them, saving time and money.'
        WHEN ci.content_key = 'cooperation_about_description_2' AND lang.code = 'he' THEN 'אנחנו עוזרים ללקוחות למצוא את המשכנתא הטובה ביותר עבורם, וחוסכים זמן וכסף.'
        WHEN ci.content_key = 'cooperation_about_description_2' AND lang.code = 'ru' THEN 'Мы помогаем клиентам найти лучшую ипотеку для них, экономя время и деньги.'
        WHEN ci.content_key = 'cooperation_about_description_3' AND lang.code = 'en' THEN 'Join our partner network and be part of the financial revolution in Israel.'
        WHEN ci.content_key = 'cooperation_about_description_3' AND lang.code = 'he' THEN 'הצטרפו לרשת השותפים שלנו והיו חלק מהמהפכה הפיננסית בישראל.'
        WHEN ci.content_key = 'cooperation_about_description_3' AND lang.code = 'ru' THEN 'Присоединяйтесь к нашей партнерской сети и станьте частью финансовой революции в Израиле.'
        -- Earning Section
        WHEN ci.content_key = 'cooperation_earning_title' AND lang.code = 'en' THEN 'How will you earn?'
        WHEN ci.content_key = 'cooperation_earning_title' AND lang.code = 'he' THEN 'איך תרוויחו?'
        WHEN ci.content_key = 'cooperation_earning_title' AND lang.code = 'ru' THEN 'Как вы будете зарабатывать?'
        WHEN ci.content_key = 'cooperation_earning_commission_title' AND lang.code = 'en' THEN 'Attractive commissions'
        WHEN ci.content_key = 'cooperation_earning_commission_title' AND lang.code = 'he' THEN 'עמלות אטרקטיביות'
        WHEN ci.content_key = 'cooperation_earning_commission_title' AND lang.code = 'ru' THEN 'Привлекательные комиссии'
        WHEN ci.content_key = 'cooperation_earning_commission_desc' AND lang.code = 'en' THEN 'Receive commission for every client who makes a transaction through you. Commission rates vary by transaction type and volume.'
        WHEN ci.content_key = 'cooperation_earning_commission_desc' AND lang.code = 'he' THEN 'קבלו עמלה על כל לקוח שמבצע עסקה דרככם. שיעורי העמלה משתנים לפי סוג העסקה והיקפה.'
        WHEN ci.content_key = 'cooperation_earning_commission_desc' AND lang.code = 'ru' THEN 'Получайте комиссию за каждого клиента, который совершает сделку через вас. Размеры комиссии варьируются в зависимости от типа и объема сделки.'
        WHEN ci.content_key = 'cooperation_earning_bonus_title' AND lang.code = 'en' THEN 'Special bonuses'
        WHEN ci.content_key = 'cooperation_earning_bonus_title' AND lang.code = 'he' THEN 'בונוסים מיוחדים'
        WHEN ci.content_key = 'cooperation_earning_bonus_title' AND lang.code = 'ru' THEN 'Специальные бонусы'
        WHEN ci.content_key = 'cooperation_earning_bonus_desc' AND lang.code = 'en' THEN 'Earn additional bonuses for achieving monthly and quarterly goals.'
        WHEN ci.content_key = 'cooperation_earning_bonus_desc' AND lang.code = 'he' THEN 'הרוויחו בונוסים נוספים על השגת יעדים חודשיים ורבעוניים.'
        WHEN ci.content_key = 'cooperation_earning_bonus_desc' AND lang.code = 'ru' THEN 'Зарабатывайте дополнительные бонусы за достижение месячных и квартальных целей.'
        WHEN ci.content_key = 'cooperation_earning_targets_title' AND lang.code = 'en' THEN 'Achievable goals'
        WHEN ci.content_key = 'cooperation_earning_targets_title' AND lang.code = 'he' THEN 'יעדים ברי השגה'
        WHEN ci.content_key = 'cooperation_earning_targets_title' AND lang.code = 'ru' THEN 'Достижимые цели'
        WHEN ci.content_key = 'cooperation_earning_targets_desc' AND lang.code = 'en' THEN 'Set personal goals and receive full support to achieve them from our professional team.'
        WHEN ci.content_key = 'cooperation_earning_targets_desc' AND lang.code = 'he' THEN 'הציבו יעדים אישיים וקבלו תמיכה מלאה להשגתם מהצוות המקצועי שלנו.'
        WHEN ci.content_key = 'cooperation_earning_targets_desc' AND lang.code = 'ru' THEN 'Ставьте личные цели и получайте полную поддержку для их достижения от нашей профессиональной команды.'
        -- Steps Section
        WHEN ci.content_key = 'cooperation_steps_title' AND lang.code = 'en' THEN '5 simple steps to partnership'
        WHEN ci.content_key = 'cooperation_steps_title' AND lang.code = 'he' THEN '5 צעדים פשוטים לשותפות'
        WHEN ci.content_key = 'cooperation_steps_title' AND lang.code = 'ru' THEN '5 простых шагов к партнерству'
        WHEN ci.content_key = 'cooperation_step1_title' AND lang.code = 'en' THEN 'Fill out the form'
        WHEN ci.content_key = 'cooperation_step1_title' AND lang.code = 'he' THEN 'מלאו את הטופס'
        WHEN ci.content_key = 'cooperation_step1_title' AND lang.code = 'ru' THEN 'Заполните форму'
        WHEN ci.content_key = 'cooperation_step1_desc' AND lang.code = 'en' THEN 'Submit an application for the partner program through our website'
        WHEN ci.content_key = 'cooperation_step1_desc' AND lang.code = 'he' THEN 'הגישו בקשה לתוכנית השותפים דרך האתר שלנו'
        WHEN ci.content_key = 'cooperation_step1_desc' AND lang.code = 'ru' THEN 'Подайте заявку на партнерскую программу через наш сайт'
        WHEN ci.content_key = 'cooperation_step2_title' AND lang.code = 'en' THEN 'Representative will contact'
        WHEN ci.content_key = 'cooperation_step2_title' AND lang.code = 'he' THEN 'נציג יצור קשר'
        WHEN ci.content_key = 'cooperation_step2_title' AND lang.code = 'ru' THEN 'Представитель свяжется'
        WHEN ci.content_key = 'cooperation_step2_desc' AND lang.code = 'en' THEN 'A representative from our team will contact you to schedule a meeting'
        WHEN ci.content_key = 'cooperation_step2_desc' AND lang.code = 'he' THEN 'נציג מהצוות שלנו יצור איתכם קשר לתיאום פגישה'
        WHEN ci.content_key = 'cooperation_step2_desc' AND lang.code = 'ru' THEN 'Представитель нашей команды свяжется с вами для назначения встречи'
        WHEN ci.content_key = 'cooperation_step3_title' AND lang.code = 'en' THEN 'Sign agreement'
        WHEN ci.content_key = 'cooperation_step3_title' AND lang.code = 'he' THEN 'חתימה על הסכם'
        WHEN ci.content_key = 'cooperation_step3_title' AND lang.code = 'ru' THEN 'Подписание договора'
        WHEN ci.content_key = 'cooperation_step3_desc' AND lang.code = 'en' THEN 'We''ll sign a partnership agreement defining terms and commissions'
        WHEN ci.content_key = 'cooperation_step3_desc' AND lang.code = 'he' THEN 'נחתום על הסכם שותפות המגדיר תנאים ועמלות'
        WHEN ci.content_key = 'cooperation_step3_desc' AND lang.code = 'ru' THEN 'Мы подпишем партнерское соглашение, определяющее условия и комиссии'
        WHEN ci.content_key = 'cooperation_step4_title' AND lang.code = 'en' THEN 'Start referring clients'
        WHEN ci.content_key = 'cooperation_step4_title' AND lang.code = 'he' THEN 'התחילו להפנות לקוחות'
        WHEN ci.content_key = 'cooperation_step4_title' AND lang.code = 'ru' THEN 'Начните направлять клиентов'
        WHEN ci.content_key = 'cooperation_step4_desc' AND lang.code = 'en' THEN 'You''ll receive tools and support for efficient client referrals'
        WHEN ci.content_key = 'cooperation_step4_desc' AND lang.code = 'he' THEN 'תקבלו כלים ותמיכה להפניית לקוחות יעילה'
        WHEN ci.content_key = 'cooperation_step4_desc' AND lang.code = 'ru' THEN 'Вы получите инструменты и поддержку для эффективного направления клиентов'
        WHEN ci.content_key = 'cooperation_step5_title' AND lang.code = 'en' THEN 'Receive payments'
        WHEN ci.content_key = 'cooperation_step5_title' AND lang.code = 'he' THEN 'קבלת תשלומים'
        WHEN ci.content_key = 'cooperation_step5_title' AND lang.code = 'ru' THEN 'Получение платежей'
        WHEN ci.content_key = 'cooperation_step5_desc' AND lang.code = 'en' THEN 'You''ll receive monthly payments for clients you referred'
        WHEN ci.content_key = 'cooperation_step5_desc' AND lang.code = 'he' THEN 'תקבלו תשלומים חודשיים עבור לקוחות שהפניתם'
        WHEN ci.content_key = 'cooperation_step5_desc' AND lang.code = 'ru' THEN 'Вы будете получать ежемесячные платежи за клиентов, которых вы направили'
        -- Other content
        WHEN ci.content_key = 'cooperation_partners_title' AND lang.code = 'en' THEN 'Our banking partners'
        WHEN ci.content_key = 'cooperation_partners_title' AND lang.code = 'he' THEN 'השותפים הבנקאיים שלנו'
        WHEN ci.content_key = 'cooperation_partners_title' AND lang.code = 'ru' THEN 'Наши банковские партнеры'
        WHEN ci.content_key = 'cooperation_cta_description' AND lang.code = 'en' THEN 'Join our partner program today and start earning'
        WHEN ci.content_key = 'cooperation_cta_description' AND lang.code = 'he' THEN 'הצטרפו לתוכנית השותפים שלנו היום והתחילו להרוויח'
        WHEN ci.content_key = 'cooperation_cta_description' AND lang.code = 'ru' THEN 'Присоединяйтесь к нашей партнерской программе сегодня и начните зарабатывать'
        WHEN ci.content_key = 'cooperation_email' AND lang.code = 'en' THEN 'cooperation@bankimonline.com'
        WHEN ci.content_key = 'cooperation_email' AND lang.code = 'he' THEN 'cooperation@bankimonline.com'
        WHEN ci.content_key = 'cooperation_email' AND lang.code = 'ru' THEN 'cooperation@bankimonline.com'
        WHEN ci.content_key = 'cooperation_phone' AND lang.code = 'en' THEN '03-5371622'
        WHEN ci.content_key = 'cooperation_phone' AND lang.code = 'he' THEN '03-5371622'
        WHEN ci.content_key = 'cooperation_phone' AND lang.code = 'ru' THEN '03-5371622'
        WHEN ci.content_key = 'cooperation_partner_login' AND lang.code = 'en' THEN 'Partner login'
        WHEN ci.content_key = 'cooperation_partner_login' AND lang.code = 'he' THEN 'כניסת שותפים'
        WHEN ci.content_key = 'cooperation_partner_login' AND lang.code = 'ru' THEN 'Вход для партнеров'
        WHEN ci.content_key = 'cooperation_register' AND lang.code = 'en' THEN 'Register for partner program'
        WHEN ci.content_key = 'cooperation_register' AND lang.code = 'he' THEN 'הרשמה לתוכנית שותפים'
        WHEN ci.content_key = 'cooperation_register' AND lang.code = 'ru' THEN 'Регистрация в партнерской программе'
    END,
    'approved',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'cooperation' 
    AND ci.content_key IN ('cooperation_about_title', 'cooperation_about_description_1', 'cooperation_about_description_2',
        'cooperation_about_description_3', 'cooperation_earning_title', 'cooperation_earning_commission_title',
        'cooperation_earning_commission_desc', 'cooperation_earning_bonus_title', 'cooperation_earning_bonus_desc',
        'cooperation_earning_targets_title', 'cooperation_earning_targets_desc', 'cooperation_steps_title',
        'cooperation_step1_title', 'cooperation_step1_desc', 'cooperation_step2_title', 'cooperation_step2_desc',
        'cooperation_step3_title', 'cooperation_step3_desc', 'cooperation_step4_title', 'cooperation_step4_desc',
        'cooperation_step5_title', 'cooperation_step5_desc', 'cooperation_partners_title', 'cooperation_cta_description',
        'cooperation_email', 'cooperation_phone', 'cooperation_partner_login', 'cooperation_register');

-- TENDERS FOR BROKERS - Additional content
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('tenders_for_brokers', 'tenders_hero_title', 'heading', 'hero', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_hero_subtitle', 'text', 'hero', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_market_b1', 'text', 'marketplace', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_market_b2', 'text', 'marketplace', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_clients_text', 'text', 'clients', true, NOW(), NOW()),
-- Simple step keys
('tenders_for_brokers', 'tenders_step1', 'option', 'steps', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_step2', 'option', 'steps', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_step3', 'option', 'steps', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_step4', 'option', 'steps', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_step5', 'option', 'steps', true, NOW(), NOW()),
-- Alternative metrics keys
('tenders_for_brokers', 'tenders_metrics_investment_title', 'text', 'metrics', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_metrics_investment_value', 'text', 'metrics', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_metrics_income_title', 'text', 'metrics', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_metrics_income_value', 'text', 'metrics', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_metrics_payback_title', 'text', 'metrics', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_metrics_payback_value', 'text', 'metrics', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'tenders_hero_title' AND lang.code = 'en' THEN 'Franchise for Brokers'
        WHEN ci.content_key = 'tenders_hero_title' AND lang.code = 'he' THEN 'זיכיון למתווכים'
        WHEN ci.content_key = 'tenders_hero_title' AND lang.code = 'ru' THEN 'Франшиза для брокеров'
        WHEN ci.content_key = 'tenders_hero_subtitle' AND lang.code = 'en' THEN 'Open your own profitable mortgage brokerage with Bankimonline support'
        WHEN ci.content_key = 'tenders_hero_subtitle' AND lang.code = 'he' THEN 'פתחו משרד תיווך משכנתאות רווחי משלכם עם תמיכת בנקימאונליין'
        WHEN ci.content_key = 'tenders_hero_subtitle' AND lang.code = 'ru' THEN 'Откройте собственное прибыльное ипотечное агентство с поддержкой Bankimonline'
        WHEN ci.content_key = 'tenders_market_b1' AND lang.code = 'en' THEN 'Mortgage calculation'
        WHEN ci.content_key = 'tenders_market_b1' AND lang.code = 'he' THEN 'חישוב משכנתא'
        WHEN ci.content_key = 'tenders_market_b1' AND lang.code = 'ru' THEN 'Расчет ипотеки'
        WHEN ci.content_key = 'tenders_market_b2' AND lang.code = 'en' THEN 'Loan refinancing'
        WHEN ci.content_key = 'tenders_market_b2' AND lang.code = 'he' THEN 'מיחזור הלוואות'
        WHEN ci.content_key = 'tenders_market_b2' AND lang.code = 'ru' THEN 'Рефинансирование кредитов'
        WHEN ci.content_key = 'tenders_clients_text' AND lang.code = 'en' THEN 'We bring clients – you get commissions on mortgage deals'
        WHEN ci.content_key = 'tenders_clients_text' AND lang.code = 'he' THEN 'אנחנו מביאים לקוחות – אתם מקבלים עמלות על עסקאות משכנתא'
        WHEN ci.content_key = 'tenders_clients_text' AND lang.code = 'ru' THEN 'Мы приводим клиентов – вы получаете комиссии за ипотечные сделки'
        -- Simple steps
        WHEN ci.content_key = 'tenders_step1' AND lang.code = 'en' THEN 'Fill out the form on the website'
        WHEN ci.content_key = 'tenders_step1' AND lang.code = 'he' THEN 'מלאו את הטופס באתר'
        WHEN ci.content_key = 'tenders_step1' AND lang.code = 'ru' THEN 'Заполните форму на сайте'
        WHEN ci.content_key = 'tenders_step2' AND lang.code = 'en' THEN 'Our representative will contact you'
        WHEN ci.content_key = 'tenders_step2' AND lang.code = 'he' THEN 'הנציג שלנו ייצור איתכם קשר'
        WHEN ci.content_key = 'tenders_step2' AND lang.code = 'ru' THEN 'Наш представитель свяжется с вами'
        WHEN ci.content_key = 'tenders_step3' AND lang.code = 'en' THEN 'Sign an agency agreement'
        WHEN ci.content_key = 'tenders_step3' AND lang.code = 'he' THEN 'חתמו על הסכם סוכנות'
        WHEN ci.content_key = 'tenders_step3' AND lang.code = 'ru' THEN 'Подпишите агентский договор'
        WHEN ci.content_key = 'tenders_step4' AND lang.code = 'en' THEN 'We equip and train your office'
        WHEN ci.content_key = 'tenders_step4' AND lang.code = 'he' THEN 'אנחנו מצייד ומכשירים את המשרד שלכם'
        WHEN ci.content_key = 'tenders_step4' AND lang.code = 'ru' THEN 'Мы оборудуем и обучаем ваш офис'
        WHEN ci.content_key = 'tenders_step5' AND lang.code = 'en' THEN 'Start earning stable income'
        WHEN ci.content_key = 'tenders_step5' AND lang.code = 'he' THEN 'התחילו להרוויח הכנסה יציבה'
        WHEN ci.content_key = 'tenders_step5' AND lang.code = 'ru' THEN 'Начните зарабатывать стабильный доход'
        -- Alternative metrics
        WHEN ci.content_key = 'tenders_metrics_investment_title' AND lang.code = 'en' THEN 'Investment'
        WHEN ci.content_key = 'tenders_metrics_investment_title' AND lang.code = 'he' THEN 'השקעה'
        WHEN ci.content_key = 'tenders_metrics_investment_title' AND lang.code = 'ru' THEN 'Инвестиции'
        WHEN ci.content_key = 'tenders_metrics_investment_value' AND lang.code = 'en' THEN '₪ 90,000'
        WHEN ci.content_key = 'tenders_metrics_investment_value' AND lang.code = 'he' THEN '₪ 90,000'
        WHEN ci.content_key = 'tenders_metrics_investment_value' AND lang.code = 'ru' THEN '₪ 90,000'
        WHEN ci.content_key = 'tenders_metrics_income_title' AND lang.code = 'en' THEN 'Annual income'
        WHEN ci.content_key = 'tenders_metrics_income_title' AND lang.code = 'he' THEN 'הכנסה שנתית'
        WHEN ci.content_key = 'tenders_metrics_income_title' AND lang.code = 'ru' THEN 'Годовой доход'
        WHEN ci.content_key = 'tenders_metrics_income_value' AND lang.code = 'en' THEN 'Up to ₪ 300,000'
        WHEN ci.content_key = 'tenders_metrics_income_value' AND lang.code = 'he' THEN 'עד ₪ 300,000'
        WHEN ci.content_key = 'tenders_metrics_income_value' AND lang.code = 'ru' THEN 'До ₪ 300,000'
        WHEN ci.content_key = 'tenders_metrics_payback_title' AND lang.code = 'en' THEN 'Payback'
        WHEN ci.content_key = 'tenders_metrics_payback_title' AND lang.code = 'he' THEN 'החזר השקעה'
        WHEN ci.content_key = 'tenders_metrics_payback_title' AND lang.code = 'ru' THEN 'Окупаемость'
        WHEN ci.content_key = 'tenders_metrics_payback_value' AND lang.code = 'en' THEN '12 months'
        WHEN ci.content_key = 'tenders_metrics_payback_value' AND lang.code = 'he' THEN '12 חודשים'
        WHEN ci.content_key = 'tenders_metrics_payback_value' AND lang.code = 'ru' THEN '12 месяцев'
    END,
    'approved',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'tenders_for_brokers' 
    AND ci.content_key IN ('tenders_hero_title', 'tenders_hero_subtitle', 'tenders_market_b1', 'tenders_market_b2',
        'tenders_clients_text', 'tenders_step1', 'tenders_step2', 'tenders_step3', 'tenders_step4', 'tenders_step5',
        'tenders_metrics_investment_title', 'tenders_metrics_investment_value', 'tenders_metrics_income_title',
        'tenders_metrics_income_value', 'tenders_metrics_payback_title', 'tenders_metrics_payback_value');

-- LAWYERS PAGE - Additional content
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
-- Benefit descriptions
('tenders_for_lawyers', 'lawyers_benefit_leads_desc', 'text', 'hero', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_benefit_partnership_desc', 'text', 'hero', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_benefit_expansion_desc', 'text', 'hero', true, NOW(), NOW()),
-- Earning section
('tenders_for_lawyers', 'lawyers_earning_title', 'heading', 'earnings', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_earning_card_title', 'heading', 'earnings', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_earning_card_description', 'text', 'earnings', true, NOW(), NOW()),
-- CTA section
('tenders_for_lawyers', 'lawyers_cta_title', 'heading', 'cta', true, NOW(), NOW()),
-- Alternative steps
('tenders_for_lawyers', 'lawyers_steps_title', 'heading', 'steps', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_step_1_title', 'option', 'steps', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_step_1_desc', 'option', 'steps', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_step_2_title', 'option', 'steps', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_step_2_desc', 'option', 'steps', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_step_3_title', 'option', 'steps', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_step_3_desc', 'option', 'steps', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_step_4_title', 'option', 'steps', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_step_4_desc', 'option', 'steps', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_step_5_title', 'option', 'steps', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_step_5_desc', 'option', 'steps', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_apply_button', 'button', 'steps', true, NOW(), NOW()),
-- Advantages section
('tenders_for_lawyers', 'lawyers_advantages_title', 'heading', 'advantages', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_advantage_digital_title', 'heading', 'advantages', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_advantage_digital_platform', 'text', 'advantages', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_advantage_digital_marketing', 'text', 'advantages', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_advantage_digital_crm', 'text', 'advantages', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_advantage_platform_access', 'text', 'advantages', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_advantage_client_management', 'text', 'advantages', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_get_consultation_button', 'button', 'advantages', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_collaboration_cta_button', 'button', 'collaboration', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        -- Benefit descriptions
        WHEN ci.content_key = 'lawyers_benefit_leads_desc' AND lang.code = 'en' THEN 'Pre-qualified clients with substantiated legal requirements'
        WHEN ci.content_key = 'lawyers_benefit_leads_desc' AND lang.code = 'he' THEN 'לקוחות מוכנים עם דרישות משפטיות מבוססות'
        WHEN ci.content_key = 'lawyers_benefit_leads_desc' AND lang.code = 'ru' THEN 'Предварительно квалифицированные клиенты с обоснованными юридическими требованиями'
        WHEN ci.content_key = 'lawyers_benefit_partnership_desc' AND lang.code = 'en' THEN 'Stable cooperation framework with mutually beneficial terms'
        WHEN ci.content_key = 'lawyers_benefit_partnership_desc' AND lang.code = 'he' THEN 'מסגרת שיתוף פעולה יציבה עם תנאים משתלמים הדדית'
        WHEN ci.content_key = 'lawyers_benefit_partnership_desc' AND lang.code = 'ru' THEN 'Стабильная структура сотрудничества с взаимовыгодными условиями'
        WHEN ci.content_key = 'lawyers_benefit_expansion_desc' AND lang.code = 'en' THEN 'Access to new clients through our professional platform'
        WHEN ci.content_key = 'lawyers_benefit_expansion_desc' AND lang.code = 'he' THEN 'גישה ללקוחות חדשים דרך הפלטפורמה המקצועית שלנו'
        WHEN ci.content_key = 'lawyers_benefit_expansion_desc' AND lang.code = 'ru' THEN 'Доступ к новым клиентам через нашу профессиональную платформу'
        -- Earning section
        WHEN ci.content_key = 'lawyers_earning_title' AND lang.code = 'en' THEN 'How Will You Earn?'
        WHEN ci.content_key = 'lawyers_earning_title' AND lang.code = 'he' THEN 'איך תרוויחו?'
        WHEN ci.content_key = 'lawyers_earning_title' AND lang.code = 'ru' THEN 'Как вы будете зарабатывать?'
        WHEN ci.content_key = 'lawyers_earning_card_title' AND lang.code = 'en' THEN 'Exclusive clients, earn without risks: Our partnership - your success!'
        WHEN ci.content_key = 'lawyers_earning_card_title' AND lang.code = 'he' THEN 'לקוחות בלעדיים, הרוויחו ללא סיכונים: השותפות שלנו - ההצלחה שלכם!'
        WHEN ci.content_key = 'lawyers_earning_card_title' AND lang.code = 'ru' THEN 'Эксклюзивные клиенты, зарабатывайте без рисков: Наше партнерство - ваш успех!'
        WHEN ci.content_key = 'lawyers_earning_card_description' AND lang.code = 'en' THEN 'Be confident in your success with TechRealt! We provide exclusive clients so you can focus on your professional work. At the end of the month, we invoice you based on the number of successful cases. Minimum risks - maximum earning opportunities.'
        WHEN ci.content_key = 'lawyers_earning_card_description' AND lang.code = 'he' THEN 'היו בטוחים בהצלחה שלכם עם טקריאלט! אנו מספקים לקוחות בלעדיים כדי שתוכלו להתמקד בעבודה המקצועית שלכם. בסוף החודש, אנו מחייבים אתכם על סמך מספר המקרים המוצלחים. סיכונים מינימליים - הזדמנויות רווח מקסימליות.'
        WHEN ci.content_key = 'lawyers_earning_card_description' AND lang.code = 'ru' THEN 'Будьте уверены в своем успехе с TechRealt! Мы предоставляем эксклюзивных клиентов, чтобы вы могли сосредоточиться на профессиональной работе. В конце месяца мы выставляем вам счет на основе количества успешных дел. Минимальные риски - максимальные возможности заработка.'
        -- CTA section
        WHEN ci.content_key = 'lawyers_cta_title' AND lang.code = 'en' THEN 'Become Our Partner and Earn Together with Us'
        WHEN ci.content_key = 'lawyers_cta_title' AND lang.code = 'he' THEN 'הפכו לשותפים שלנו והרוויחו יחד איתנו'
        WHEN ci.content_key = 'lawyers_cta_title' AND lang.code = 'ru' THEN 'Станьте нашим партнером и зарабатывайте вместе с нами'
        -- Alternative steps
        WHEN ci.content_key = 'lawyers_steps_title' AND lang.code = 'en' THEN 'How It Works'
        WHEN ci.content_key = 'lawyers_steps_title' AND lang.code = 'he' THEN 'איך זה עובד'
        WHEN ci.content_key = 'lawyers_steps_title' AND lang.code = 'ru' THEN 'Как это работает'
        WHEN ci.content_key = 'lawyers_step_1_title' AND lang.code = 'en' THEN 'Fill Out Form on Our Website'
        WHEN ci.content_key = 'lawyers_step_1_title' AND lang.code = 'he' THEN 'מלאו טופס באתר שלנו'
        WHEN ci.content_key = 'lawyers_step_1_title' AND lang.code = 'ru' THEN 'Заполните форму на нашем сайте'
        WHEN ci.content_key = 'lawyers_step_1_desc' AND lang.code = 'en' THEN 'Simply fill out a short form on our website to join our referral program'
        WHEN ci.content_key = 'lawyers_step_1_desc' AND lang.code = 'he' THEN 'פשוט מלאו טופס קצר באתר שלנו כדי להצטרף לתוכנית ההפניות שלנו'
        WHEN ci.content_key = 'lawyers_step_1_desc' AND lang.code = 'ru' THEN 'Просто заполните короткую форму на нашем сайте, чтобы присоединиться к нашей реферальной программе'
        WHEN ci.content_key = 'lawyers_step_2_title' AND lang.code = 'en' THEN 'Our Representative Will Contact You'
        WHEN ci.content_key = 'lawyers_step_2_title' AND lang.code = 'he' THEN 'הנציג שלנו ייצור איתכם קשר'
        WHEN ci.content_key = 'lawyers_step_2_title' AND lang.code = 'ru' THEN 'Наш представитель свяжется с вами'
        WHEN ci.content_key = 'lawyers_step_2_desc' AND lang.code = 'en' THEN 'After filling out the form, our representative will contact you to discuss details and answer your questions. We will review your application and make a decision about cooperation.'
        WHEN ci.content_key = 'lawyers_step_2_desc' AND lang.code = 'he' THEN 'לאחר מילוי הטופס, הנציג שלנו ייצור איתכם קשר כדי לדון בפרטים ולענות על שאלותיכם. נבדוק את הבקשה שלכם ונקבל החלטה לגבי שיתוף הפעולה.'
        WHEN ci.content_key = 'lawyers_step_2_desc' AND lang.code = 'ru' THEN 'После заполнения формы наш представитель свяжется с вами для обсуждения деталей и ответа на ваши вопросы. Мы рассмотрим вашу заявку и примем решение о сотрудничестве.'
        WHEN ci.content_key = 'lawyers_step_3_title' AND lang.code = 'en' THEN 'We Sign Agency Agreement for Services'
        WHEN ci.content_key = 'lawyers_step_3_title' AND lang.code = 'he' THEN 'אנחנו חותמים על הסכם סוכנות לשירותים'
        WHEN ci.content_key = 'lawyers_step_3_title' AND lang.code = 'ru' THEN 'Мы подписываем агентский договор на услуги'
        WHEN ci.content_key = 'lawyers_step_3_desc' AND lang.code = 'en' THEN 'We sign an agency agreement for services provision on terms favorable to you.'
        WHEN ci.content_key = 'lawyers_step_3_desc' AND lang.code = 'he' THEN 'אנו חותמים על הסכם סוכנות למתן שירותים בתנאים נוחים לכם.'
        WHEN ci.content_key = 'lawyers_step_3_desc' AND lang.code = 'ru' THEN 'Мы подписываем агентский договор на оказание услуг на выгодных для вас условиях.'
        WHEN ci.content_key = 'lawyers_step_4_title' AND lang.code = 'en' THEN 'We Transfer Our Clients Who Need Legal Help'
        WHEN ci.content_key = 'lawyers_step_4_title' AND lang.code = 'he' THEN 'אנו מעבירים את הלקוחות שלנו הזקוקים לעזרה משפטית'
        WHEN ci.content_key = 'lawyers_step_4_title' AND lang.code = 'ru' THEN 'Мы передаем наших клиентов, нуждающихся в юридической помощи'
        WHEN ci.content_key = 'lawyers_step_4_desc' AND lang.code = 'en' THEN 'In case of winning the tender, we will transfer clients who need legal help to you. We provide access to upload complete information about you and your activities on the business card website'
        WHEN ci.content_key = 'lawyers_step_4_desc' AND lang.code = 'he' THEN 'במקרה של זכייה במכרז, נעביר אליכם לקוחות הזקוקים לעזרה משפטית. אנו מספקים גישה להעלאת מידע מלא עליכם ועל פעילותכם באתר כרטיס הביקור'
        WHEN ci.content_key = 'lawyers_step_4_desc' AND lang.code = 'ru' THEN 'В случае выигрыша тендера мы передадим вам клиентов, нуждающихся в юридической помощи. Мы предоставляем доступ для загрузки полной информации о вас и вашей деятельности на сайте визитной карточки'
        WHEN ci.content_key = 'lawyers_step_5_title' AND lang.code = 'en' THEN 'Monthly Payment for Our Services'
        WHEN ci.content_key = 'lawyers_step_5_title' AND lang.code = 'he' THEN 'תשלום חודשי עבור השירותים שלנו'
        WHEN ci.content_key = 'lawyers_step_5_title' AND lang.code = 'ru' THEN 'Ежемесячная оплата за наши услуги'
        WHEN ci.content_key = 'lawyers_step_5_desc' AND lang.code = 'en' THEN E'You receive:\n\nExclusive clients\nAccess to Digital platform and 24/7 support\nSavings on advertising costs\n\nWe bill based on work volume and number of clients provided to you on individual terms'
        WHEN ci.content_key = 'lawyers_step_5_desc' AND lang.code = 'he' THEN E'אתם מקבלים:\n\nלקוחות בלעדיים\nגישה לפלטפורמה דיגיטלית ותמיכה 24/7\nחיסכון בעלויות פרסום\n\nאנו מחייבים על סמך היקף העבודה ומספר הלקוחות המסופקים לכם בתנאים אישיים'
        WHEN ci.content_key = 'lawyers_step_5_desc' AND lang.code = 'ru' THEN E'Вы получаете:\n\nЭксклюзивных клиентов\nДоступ к цифровой платформе и поддержку 24/7\nЭкономию на рекламных расходах\n\nМы выставляем счета на основе объема работы и количества предоставленных вам клиентов на индивидуальных условиях'
        WHEN ci.content_key = 'lawyers_apply_button' AND lang.code = 'en' THEN 'Submit Application'
        WHEN ci.content_key = 'lawyers_apply_button' AND lang.code = 'he' THEN 'הגישו בקשה'
        WHEN ci.content_key = 'lawyers_apply_button' AND lang.code = 'ru' THEN 'Подать заявку'
        -- Advantages section
        WHEN ci.content_key = 'lawyers_advantages_title' AND lang.code = 'en' THEN 'Advantages of Cooperation with Us'
        WHEN ci.content_key = 'lawyers_advantages_title' AND lang.code = 'he' THEN 'יתרונות שיתוף הפעולה איתנו'
        WHEN ci.content_key = 'lawyers_advantages_title' AND lang.code = 'ru' THEN 'Преимущества сотрудничества с нами'
        WHEN ci.content_key = 'lawyers_advantage_digital_title' AND lang.code = 'en' THEN 'Digital Services for Successful Business Development'
        WHEN ci.content_key = 'lawyers_advantage_digital_title' AND lang.code = 'he' THEN 'שירותים דיגיטליים לפיתוח עסקי מוצלח'
        WHEN ci.content_key = 'lawyers_advantage_digital_title' AND lang.code = 'ru' THEN 'Цифровые услуги для успешного развития бизнеса'
        WHEN ci.content_key = 'lawyers_advantage_digital_platform' AND lang.code = 'en' THEN 'Access to Digital platform and 24/7 support'
        WHEN ci.content_key = 'lawyers_advantage_digital_platform' AND lang.code = 'he' THEN 'גישה לפלטפורמה דיגיטלית ותמיכה 24/7'
        WHEN ci.content_key = 'lawyers_advantage_digital_platform' AND lang.code = 'ru' THEN 'Доступ к цифровой платформе и поддержка 24/7'
        WHEN ci.content_key = 'lawyers_advantage_digital_marketing' AND lang.code = 'en' THEN 'We cover marketing expenses'
        WHEN ci.content_key = 'lawyers_advantage_digital_marketing' AND lang.code = 'he' THEN 'אנו מכסים הוצאות שיווק'
        WHEN ci.content_key = 'lawyers_advantage_digital_marketing' AND lang.code = 'ru' THEN 'Мы покрываем маркетинговые расходы'
        WHEN ci.content_key = 'lawyers_advantage_digital_crm' AND lang.code = 'en' THEN 'Digital client management through CRM system'
        WHEN ci.content_key = 'lawyers_advantage_digital_crm' AND lang.code = 'he' THEN 'ניהול לקוחות דיגיטלי דרך מערכת CRM'
        WHEN ci.content_key = 'lawyers_advantage_digital_crm' AND lang.code = 'ru' THEN 'Цифровое управление клиентами через CRM-систему'
        WHEN ci.content_key = 'lawyers_advantage_platform_access' AND lang.code = 'en' THEN 'Platform Access and Support'
        WHEN ci.content_key = 'lawyers_advantage_platform_access' AND lang.code = 'he' THEN 'גישה לפלטפורמה ותמיכה'
        WHEN ci.content_key = 'lawyers_advantage_platform_access' AND lang.code = 'ru' THEN 'Доступ к платформе и поддержка'
        WHEN ci.content_key = 'lawyers_advantage_client_management' AND lang.code = 'en' THEN 'Digital Client Management through CRM System'
        WHEN ci.content_key = 'lawyers_advantage_client_management' AND lang.code = 'he' THEN 'ניהול לקוחות דיגיטלי דרך מערכת CRM'
        WHEN ci.content_key = 'lawyers_advantage_client_management' AND lang.code = 'ru' THEN 'Цифровое управление клиентами через CRM-систему'
        WHEN ci.content_key = 'lawyers_get_consultation_button' AND lang.code = 'en' THEN 'Get Consultation'
        WHEN ci.content_key = 'lawyers_get_consultation_button' AND lang.code = 'he' THEN 'קבלו ייעוץ'
        WHEN ci.content_key = 'lawyers_get_consultation_button' AND lang.code = 'ru' THEN 'Получить консультацию'
        WHEN ci.content_key = 'lawyers_collaboration_cta_button' AND lang.code = 'en' THEN 'Begin Partnership'
        WHEN ci.content_key = 'lawyers_collaboration_cta_button' AND lang.code = 'he' THEN 'התחילו שותפות'
        WHEN ci.content_key = 'lawyers_collaboration_cta_button' AND lang.code = 'ru' THEN 'Начать партнерство'
    END,
    'approved',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'tenders_for_lawyers' 
    AND ci.content_key IN ('lawyers_benefit_leads_desc', 'lawyers_benefit_partnership_desc', 'lawyers_benefit_expansion_desc',
        'lawyers_earning_title', 'lawyers_earning_card_title', 'lawyers_earning_card_description', 'lawyers_cta_title',
        'lawyers_steps_title', 'lawyers_step_1_title', 'lawyers_step_1_desc', 'lawyers_step_2_title', 'lawyers_step_2_desc',
        'lawyers_step_3_title', 'lawyers_step_3_desc', 'lawyers_step_4_title', 'lawyers_step_4_desc',
        'lawyers_step_5_title', 'lawyers_step_5_desc', 'lawyers_apply_button', 'lawyers_advantages_title',
        'lawyers_advantage_digital_title', 'lawyers_advantage_digital_platform', 'lawyers_advantage_digital_marketing',
        'lawyers_advantage_digital_crm', 'lawyers_advantage_platform_access', 'lawyers_advantage_client_management',
        'lawyers_get_consultation_button', 'lawyers_collaboration_cta_button');

COMMIT;

-- Verification
SELECT 
    screen_location,
    COUNT(DISTINCT content_key) as additional_content_items,
    COUNT(DISTINCT ct.language_code) as languages,
    COUNT(*) as total_additional_translations
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.created_at >= NOW() - INTERVAL '1 minute'
GROUP BY screen_location
ORDER BY screen_location;