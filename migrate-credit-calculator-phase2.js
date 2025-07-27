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

async function migrateCreditCalculatorPhase2() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('🚀 MIGRATING CREDIT CALCULATOR - PHASE 2 (REMAINING KEYS)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Check existing content_keys to prevent duplicates
        const existingKeysResult = await client.query(
            `SELECT content_key FROM content_items WHERE content_key LIKE 'calculate_credit%'`
        );
        const existingKeys = new Set(existingKeysResult.rows.map(row => row.content_key));

        console.log(`📋 Found ${existingKeys.size} existing credit calculator keys in database`);

        // Phase 2: Additional keys that were missing from Phase 1
        const phase2KeysToMigrate = [
            // Core Navigation
            {
                content_key: 'calculate_credit',
                component_type: 'text',
                category: 'navigation',
                screen_location: 'credit_step1',
                en: 'Calculate Credit',
                he: 'חישוב אשראי',
                ru: 'Расчет кредита'
            },
            // Filter Options (Step 4 Results)
            {
                content_key: 'calculate_credit_filter_1',
                component_type: 'option',
                category: 'filters',
                screen_location: 'credit_step4',
                en: 'Best Rate',
                he: 'הריבית הטובה ביותר',
                ru: 'Лучшая ставка'
            },
            {
                content_key: 'calculate_credit_filter_2',
                component_type: 'option',
                category: 'filters',
                screen_location: 'credit_step4',
                en: 'Lowest Monthly Payment',
                he: 'התשלום החודשי הנמוך ביותר',
                ru: 'Самый низкий ежемесячный платеж'
            },
            {
                content_key: 'calculate_credit_filter_3',
                component_type: 'option',
                category: 'filters',
                screen_location: 'credit_step4',
                en: 'Fastest Approval',
                he: 'האישור המהיר ביותר',
                ru: 'Самое быстрое одобрение'
            },
            {
                content_key: 'calculate_credit_filter_4',
                component_type: 'option',
                category: 'filters',
                screen_location: 'credit_step4',
                en: 'My Bank',
                he: 'הבנק שלי',
                ru: 'Мой банк'
            },
            // Additional Results Page Content
            {
                content_key: 'calculate_credit_parameters_cost',
                component_type: 'text',
                category: 'results',
                screen_location: 'credit_step4',
                en: 'Property Value',
                he: 'שווי הנכס',
                ru: 'Стоимость недвижимости'
            },
            {
                content_key: 'calculate_credit_profile_title',
                component_type: 'title',
                category: 'results',
                screen_location: 'credit_step4',
                en: 'Your Profile',
                he: 'הפרופיל שלך',
                ru: 'Ваш профиль'
            },
            // Decision Helper Options (Why refinance - Step 1)
            {
                content_key: 'calculate_credit_why_option_1',
                component_type: 'option',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Improve interest rate',
                he: 'שיפור הריבית',
                ru: 'Улучшить процентную ставку'
            },
            {
                content_key: 'calculate_credit_why_option_2',
                component_type: 'option',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Reduce credit amount',
                he: 'הקטנת סכום האשראי',
                ru: 'Уменьшить сумму кредита'
            },
            {
                content_key: 'calculate_credit_why_option_3',
                component_type: 'option',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Increase term to reduce payment',
                he: 'הארכת התקופה להקטנת התשלום',
                ru: 'Увеличить срок для снижения платежа'
            },
            {
                content_key: 'calculate_credit_why_option_4',
                component_type: 'option',
                category: 'loan_parameters',
                screen_location: 'credit_step1',
                en: 'Increase payment to reduce term',
                he: 'הגדלת התשלום להקטנת התקופה',
                ru: 'Увеличить платеж для сокращения срока'
            }
        ];

        console.log(`\n📋 PHASE 2 MIGRATION PLAN: ${phase2KeysToMigrate.length} keys to migrate`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        let insertedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const keyData of phase2KeysToMigrate) {
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

            for (const keyData of phase2KeysToMigrate) {
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

        // Final verification and summary
        const finalCountResult = await client.query(
            `SELECT COUNT(*) as total FROM content_items WHERE content_key LIKE 'calculate_credit%'`
        );
        const totalCreditKeys = finalCountResult.rows[0].total;

        console.log('\n🎉 PHASE 2 MIGRATION SUMMARY:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Successfully migrated: ${insertedCount} keys`);
        console.log(`⚠️  Skipped (already exist): ${skippedCount} keys`);
        console.log(`❌ Errors: ${errorCount} keys`);
        console.log(`📊 Total processed in Phase 2: ${phase2KeysToMigrate.length} keys`);
        console.log(`🗄️  Total credit keys in database: ${totalCreditKeys}`);

        console.log('\n🎯 COMBINED PHASES RESULTS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Phase 1: 33 keys migrated (Core functionality)');
        console.log(`Phase 2: ${insertedCount} keys migrated (Additional content)`);
        console.log(`📈 TOTAL MIGRATED: ${33 + insertedCount} / 44 target keys`);

        if (insertedCount > 0) {
            console.log('\n🔄 NEXT STEPS:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('1. Update Credit Calculator frontend components');
            console.log('2. Test API endpoints for all steps');
            console.log('3. Verify all languages and filters work');
            console.log('4. Complete frontend integration');
        }

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Phase 2 migration failed:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

migrateCreditCalculatorPhase2(); 