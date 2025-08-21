const { Client } = require('pg');
require('dotenv').config();

async function fixRefinanceStep1Translations() {
    // Use local content database
    const contentClient = new Client({
        host: 'localhost',
        port: 5432,
        database: 'bankim_content',
        user: 'michaelmishayev',
        password: ''
    });

    console.log('🔧 Fixing Missing Refinance Step 1 Translations\n');
    console.log('=' .repeat(60));

    try {
        await contentClient.connect();
        console.log('✅ Connected to content database\n');

        // Missing content items identified from screenshot
        const contentItems = [
            {
                key: 'app.refinance.step1.title',
                screen: 'refinance_step1',
                type: 'label',
                category: 'form',
                translations: {
                    en: 'Mortgage Refinance',
                    he: 'מחזור משכנתא',
                    ru: 'Рефинансирование ипотеки'
                }
            },
            {
                key: 'app.refinance.step1.property_value_label',
                screen: 'refinance_step1',
                type: 'label',
                category: 'form',
                translations: {
                    en: 'Property Value',
                    he: 'שווי נכס',
                    ru: 'Стоимость недвижимости'
                }
            },
            {
                key: 'app.refinance.step1.balance_label',
                screen: 'refinance_step1',
                type: 'label',
                category: 'form',
                translations: {
                    en: 'Current Mortgage Balance',
                    he: 'יתרת משכנתא נוכחית',
                    ru: 'Текущий остаток по ипотеке'
                }
            }
        ];

        console.log('📝 Adding missing content items...\n');

        for (const item of contentItems) {
            // Insert content item (or get existing)
            const insertItemResult = await contentClient.query(`
                INSERT INTO content_items (
                    content_key, 
                    screen_location, 
                    component_type, 
                    category, 
                    is_active
                ) VALUES ($1, $2, $3, $4, true)
                ON CONFLICT (content_key, screen_location) 
                DO UPDATE SET 
                    component_type = EXCLUDED.component_type,
                    category = EXCLUDED.category,
                    is_active = true,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING id, content_key
            `, [item.key, item.screen, item.type, item.category]);

            const contentItemId = insertItemResult.rows[0].id;
            console.log(`✅ Added/Updated content item: ${item.key} (ID: ${contentItemId})`);

            // Add translations for all languages
            for (const [lang, value] of Object.entries(item.translations)) {
                await contentClient.query(`
                    INSERT INTO content_translations (
                        content_item_id,
                        language_code,
                        content_value,
                        status
                    ) VALUES ($1, $2, $3, 'approved')
                    ON CONFLICT (content_item_id, language_code)
                    DO UPDATE SET 
                        content_value = EXCLUDED.content_value,
                        status = 'approved',
                        updated_at = CURRENT_TIMESTAMP
                `, [contentItemId, lang, value]);
                
                console.log(`  ✅ ${lang}: "${value}"`);
            }
            console.log();
        }

        // Verify the fixes
        console.log('📋 Verifying all refinance_step1 translations:\n');
        
        const verifyResult = await contentClient.query(`
            SELECT 
                ci.content_key,
                ct.language_code,
                ct.content_value
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.screen_location = 'refinance_step1'
                AND ci.content_key IN (
                    'app.refinance.step1.title',
                    'app.refinance.step1.property_value_label',
                    'app.refinance.step1.balance_label'
                )
            ORDER BY ci.content_key, ct.language_code
        `);

        console.log('✅ Verification Results:');
        let currentKey = '';
        verifyResult.rows.forEach(row => {
            if (row.content_key !== currentKey) {
                currentKey = row.content_key;
                console.log(`\n${currentKey}:`);
            }
            console.log(`  ${row.language_code}: "${row.content_value}"`);
        });

        console.log('\n' + '=' .repeat(60));
        console.log('✅ SUCCESS: All missing translations have been added!');
        console.log('\n📌 Next Steps:');
        console.log('1. Clear the server cache (restart server or wait 5 minutes)');
        console.log('2. Refresh the page at http://localhost:5173/services/refinance-mortgage/1');
        console.log('3. Switch to Hebrew to verify translations are showing');
        console.log('4. Run E2E tests to confirm all issues are resolved');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\nFull error:', error);
    } finally {
        await contentClient.end();
    }
}

// Run the fix
fixRefinanceStep1Translations();