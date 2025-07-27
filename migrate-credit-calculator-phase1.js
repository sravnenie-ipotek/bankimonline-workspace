const fs = require('fs');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 
                     process.env.DATABASE_PUBLIC_URL || 
                     process.env.DATABASE_URL || 
                     'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
    ssl: { rejectUnauthorized: false }
});

async function migrateCreditCalculatorPhase1() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('🚀 MIGRATING CREDIT CALCULATOR - PHASE 1 (44 KEYS)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Load translation files
        const enTranslations = JSON.parse(fs.readFileSync('locales/en/translation.json', 'utf8'));
        const heTranslations = JSON.parse(fs.readFileSync('locales/he/translation.json', 'utf8'));
        const ruTranslations = JSON.parse(fs.readFileSync('locales/ru/translation.json', 'utf8'));

        // First, check existing content_keys to prevent duplicates
        const existingKeysResult = await client.query(
            `SELECT content_key FROM content_items WHERE content_key LIKE 'calculate_credit%'`
        );
        const existingKeys = new Set(existingKeysResult.rows.map(row => row.content_key));

        console.log(`📋 Found ${existingKeys.size} existing credit calculator keys in database`);

        // Define keys to migrate - Step 1 (Calculator) - CRITICAL MISSING KEYS
        const step1KeysToMigrate = [
            // Core Step 1 Content - Following screen_location: credit_step1
            {
                content_key: 'calculate_credit_amount',
                component_type: 'field_label',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Desired credit amount',
                he: 'סכום האשראי הרצויה',
                ru: 'Желаемая сумма кредита'
            },
            {
                content_key: 'calculate_credit_amount_ph',
                component_type: 'placeholder',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Enter credit amount',
                he: 'הזן סכום האשראי',
                ru: 'Введите сумму кредита'
            },
            {
                content_key: 'calculate_credit_target',
                component_type: 'field_label',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Credit purpose',
                he: 'מטרת האשראי',
                ru: 'Цель кредита'
            },
            {
                content_key: 'calculate_credit_target_ph',
                component_type: 'placeholder',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Select credit purpose',
                he: 'בחר מטרת אשראי',
                ru: 'Выберите цель кредита'
            },
            {
                content_key: 'calculate_credit_target_option_1',
                component_type: 'option',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Vehicle purchase',
                he: 'רכישת רכב',
                ru: 'Покупка автомобиля'
            },
            {
                content_key: 'calculate_credit_target_option_2',
                component_type: 'option',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Home renovation',
                he: 'שיפוץ בית',
                ru: 'Ремонт дома'
            },
            {
                content_key: 'calculate_credit_target_option_3',
                component_type: 'option',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Wedding and events',
                he: 'חתונה ואירועים',
                ru: 'Свадьба и мероприятия'
            },
            {
                content_key: 'calculate_credit_target_option_4',
                component_type: 'option',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Business investment',
                he: 'השקעה עסקית',
                ru: 'Бизнес-инвестиции'
            },
            {
                content_key: 'calculate_credit_target_option_5',
                component_type: 'option',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Improve future credit eligibility',
                he: 'שיפור זכאות אשראי עתידית',
                ru: 'Улучшение кредитной истории'
            },
            {
                content_key: 'calculate_credit_target_option_6',
                component_type: 'option',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Other',
                he: 'אחר',
                ru: 'Другое'
            },
            {
                content_key: 'calculate_credit_prolong',
                component_type: 'field_label',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Desired repayment period',
                he: 'תקופת פירעון רצויה',
                ru: 'Желаемый период погашения'
            },
            {
                content_key: 'calculate_credit_prolong_ph',
                component_type: 'placeholder',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Select repayment period',
                he: 'בחר תקופת פירעון',
                ru: 'Выберите период погашения'
            },
            {
                content_key: 'calculate_credit_prolong_option_1',
                component_type: 'option',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Up to one year',
                he: 'עד שנה אחת',
                ru: 'До одного года'
            },
            {
                content_key: 'calculate_credit_prolong_option_2',
                component_type: 'option',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Up to two years',
                he: 'עד שנתיים',
                ru: 'До двух лет'
            },
            {
                content_key: 'calculate_credit_prolong_option_3',
                component_type: 'option',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Up to 3 years',
                he: 'עד 3 שנים',
                ru: 'До 3 лет'
            },
            {
                content_key: 'calculate_credit_prolong_option_4',
                component_type: 'option',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Up to 5 years',
                he: 'עד 5 שנים',
                ru: 'До 5 лет'
            },
            {
                content_key: 'calculate_credit_prolong_option_5',
                component_type: 'option',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Over 5 years',
                he: 'מעל 5 שנים',
                ru: 'Свыше 5 лет'
            },
            {
                content_key: 'calculate_credit_prolong_option_6',
                component_type: 'option',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Over 7 years',
                he: 'מעל 7 שנים',
                ru: 'Свыше 7 лет'
            },
            {
                content_key: 'calculate_credit_prolong_option_7',
                component_type: 'option',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Over 10 years',
                he: 'מעל 10 שנים',
                ru: 'Свыше 10 лет'
            }
        ];

        // UI and Progress Keys - Core Navigation
        const uiKeysToMigrate = [
            {
                content_key: 'calculate_credit_banner_title',
                component_type: 'title',
                category: 'navigation',
                screen_location: 'credit_step1',
                en: 'Credit calculator',
                he: 'מחשבון אשראי',
                ru: 'Кредитный калькулятор'
            },
            {
                content_key: 'calculate_credit_banner_subtitle',
                component_type: 'subtitle',
                category: 'navigation',
                screen_location: 'credit_step1',
                en: 'Get the best credit offers for you',
                he: 'קבל את הצעות האשראי הטובות ביותר עבורך',
                ru: 'Получите лучшие кредитные предложения для вас'
            },
            {
                content_key: 'calculate_credit_progress_step_1',
                component_type: 'text',
                category: 'navigation',
                screen_location: 'credit_step1',
                en: 'Credit details',
                he: 'פרטי האשראי',
                ru: 'Детали кредита'
            },
            {
                content_key: 'calculate_credit_progress_step_2',
                component_type: 'text',
                category: 'navigation',
                screen_location: 'credit_step1',
                en: 'Personal details',
                he: 'פרטים אישיים',
                ru: 'Личные данные'
            },
            {
                content_key: 'calculate_credit_progress_step_3',
                component_type: 'text',
                category: 'navigation',
                screen_location: 'credit_step1',
                en: 'Income details',
                he: 'פרטי הכנסה',
                ru: 'Детали дохода'
            },
            {
                content_key: 'calculate_credit_progress_step_4',
                component_type: 'text',
                category: 'navigation',
                screen_location: 'credit_step1',
                en: 'Summary and results',
                he: 'סיכום ותוצאות',
                ru: 'Сводка и результаты'
            }
        ];

        // Results Page Keys - Missing from DB
        const resultsKeysToMigrate = [
            {
                content_key: 'calculate_credit_final',
                component_type: 'title',
                category: 'results',
                screen_location: 'credit_step4',
                en: 'Credit Calculation Results',
                he: 'תוצאות חישוב האשראי',
                ru: 'Результаты расчета кредита'
            },
            {
                content_key: 'calculate_credit_warning',
                component_type: 'text',
                category: 'results',
                screen_location: 'credit_step4',
                en: 'The displayed offers are preliminary and subject to final bank approval. Actual terms may vary based on your complete financial profile.',
                he: 'ההצעות המוצגות הן ראשוניות וכפופות לאישור סופי של הבנק. התנאים בפועל עשויים להשתנות בהתבסס על הפרופיל הפיננסי המלא שלך.',
                ru: 'Отображаемые предложения являются предварительными и подлежат окончательному одобрению банка. Фактические условия могут отличаться в зависимости от вашего полного финансового профиля.'
            },
            {
                content_key: 'calculate_credit_parameters',
                component_type: 'text',
                category: 'results',
                screen_location: 'credit_step4',
                en: 'Your Credit Parameters',
                he: 'פרמטרי האשראי שלך',
                ru: 'Параметры вашего кредита'
            },
            {
                content_key: 'calculate_credit_parameters_amount',
                component_type: 'text',
                category: 'results',
                screen_location: 'credit_step4',
                en: 'Loan Amount',
                he: 'סכום ההלוואה',
                ru: 'Сумма займа'
            },
            {
                content_key: 'calculate_credit_parameters_period',
                component_type: 'text',
                category: 'results',
                screen_location: 'credit_step4',
                en: 'Credit Term',
                he: 'תקופת האשראי',
                ru: 'Срок кредита'
            },
            {
                content_key: 'calculate_credit_parameters_months',
                component_type: 'text',
                category: 'results',
                screen_location: 'credit_step4',
                en: 'months',
                he: 'חודשים',
                ru: 'месяцев'
            },
            {
                content_key: 'calculate_credit_total_interest',
                component_type: 'text',
                category: 'results',
                screen_location: 'credit_step4',
                en: 'Total expected interest',
                he: 'סך הריבית הצפויה',
                ru: 'Общие ожидаемые проценты'
            },
            {
                content_key: 'calculate_credit_total_payment',
                component_type: 'text',
                category: 'results',
                screen_location: 'credit_step4',
                en: 'Total payment amount',
                he: 'סכום התשלום הכולל',
                ru: 'Общая сумма платежа'
            }
        ];

        // Combine all keys to migrate
        const allKeysToMigrate = [...step1KeysToMigrate, ...uiKeysToMigrate, ...resultsKeysToMigrate];

        console.log(`\n📋 MIGRATION PLAN: ${allKeysToMigrate.length} keys to migrate`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        let insertedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const keyData of allKeysToMigrate) {
            try {
                // Check if key already exists
                if (existingKeys.has(keyData.content_key)) {
                    console.log(`⚠️  SKIPPED: ${keyData.content_key} (already exists)`);
                    skippedCount++;
                    continue;
                }

                // Insert content_item
                const insertItemQuery = `
                    INSERT INTO content_items (
                        content_key, component_type, category, screen_location, is_active, created_at
                    ) VALUES ($1, $2, $3, $4, true, NOW())
                    RETURNING id;
                `;

                const itemResult = await client.query(insertItemQuery, [
                    keyData.content_key,
                    keyData.component_type,
                    keyData.category,
                    keyData.screen_location
                ]);

                const contentItemId = itemResult.rows[0].id;

                // Insert translations for all languages
                const insertTranslationQuery = `
                    INSERT INTO content_translations (
                        content_item_id, language_code, content_value, status, created_at
                    ) VALUES ($1, $2, $3, 'approved', NOW());
                `;

                await client.query(insertTranslationQuery, [contentItemId, 'en', keyData.en]);
                await client.query(insertTranslationQuery, [contentItemId, 'he', keyData.he]);
                await client.query(insertTranslationQuery, [contentItemId, 'ru', keyData.ru]);

                console.log(`✅ MIGRATED: ${keyData.content_key} → ${keyData.screen_location}`);
                insertedCount++;

            } catch (error) {
                console.log(`❌ ERROR: ${keyData.content_key} - ${error.message}`);
                errorCount++;
            }
        }

        await client.query('COMMIT');

        // Update translation.json files with __MIGRATED_ prefix
        console.log('\n🏷️  MARKING MIGRATED KEYS IN TRANSLATION FILES...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const languages = ['en', 'he', 'ru'];
        for (const lang of languages) {
            const filePath = `locales/${lang}/translation.json`;
            const translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            let markedCount = 0;

            for (const keyData of allKeysToMigrate) {
                if (translations[keyData.content_key] && !translations[`__MIGRATED_${keyData.content_key}`]) {
                    translations[`__MIGRATED_${keyData.content_key}`] = translations[keyData.content_key];
                    markedCount++;
                }
            }

            if (markedCount > 0) {
                fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8');
                console.log(`✅ MARKED: ${markedCount} keys in ${lang}/translation.json`);
            }
        }

        // Final summary
        console.log('\n🎉 MIGRATION SUMMARY:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Successfully migrated: ${insertedCount} keys`);
        console.log(`⚠️  Skipped (already exist): ${skippedCount} keys`);
        console.log(`❌ Errors: ${errorCount} keys`);
        console.log(`📊 Total processed: ${allKeysToMigrate.length} keys`);

        if (insertedCount > 0) {
            console.log('\n🔄 NEXT STEPS:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('1. Update Credit Calculator components to use useContentApi()');
            console.log('2. Test API endpoints: /api/content/credit_step1/en');
            console.log('3. Verify all languages display correctly');
            console.log('4. Test frontend components with database content');
        }

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

migrateCreditCalculatorPhase1(); 