const { Client } = require('pg');
require('dotenv').config();

async function checkMissingTranslations() {
    const contentClient = new Client({
        connectionString: process.env.CONTENT_DATABASE_URL
    });

    console.log('🔍 Checking for Missing Translations Visible in Screenshot\n');
    console.log('=' .repeat(60));

    try {
        await contentClient.connect();
        
        // Keys visible in the screenshot
        const visibleKeys = [
            'app.refinance.step1.title',
            'app.refinance.step1.property_value_label', 
            'app.refinance.step1.balance_label'
        ];
        
        console.log('\n📋 Checking database for keys visible in screenshot:\n');
        
        for (const key of visibleKeys) {
            // Check if content item exists
            const itemResult = await contentClient.query(`
                SELECT id, content_key, screen_location, is_active
                FROM content_items
                WHERE content_key = $1
            `, [key]);
            
            if (itemResult.rows.length > 0) {
                const item = itemResult.rows[0];
                console.log(`✅ Key exists: ${key}`);
                console.log(`   - ID: ${item.id}`);
                console.log(`   - Screen: ${item.screen_location}`);
                console.log(`   - Active: ${item.is_active}`);
                
                // Check translations
                const transResult = await contentClient.query(`
                    SELECT language_code, content_value
                    FROM content_translations
                    WHERE content_item_id = $1
                    ORDER BY language_code
                `, [item.id]);
                
                if (transResult.rows.length > 0) {
                    console.log('   Translations:');
                    transResult.rows.forEach(trans => {
                        console.log(`     - ${trans.language_code}: "${trans.content_value}"`);
                    });
                } else {
                    console.log('   ❌ NO TRANSLATIONS FOUND!');
                }
            } else {
                console.log(`❌ KEY NOT IN DATABASE: ${key}`);
                console.log('   This is why it shows untranslated on the page!');
            }
            console.log();
        }
        
        // Check what content IS available for refinance_step1
        console.log('\n📋 All content keys for refinance_step1:\n');
        
        const allContent = await contentClient.query(`
            SELECT ci.content_key, ct.content_value
            FROM content_items ci
            LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.screen_location = 'refinance_step1'
                AND ct.language_code = 'he'
                AND ci.content_key LIKE '%title%' OR ci.content_key LIKE '%label%'
            ORDER BY ci.content_key
            LIMIT 20
        `);
        
        allContent.rows.forEach(row => {
            console.log(`  - ${row.content_key}: "${row.content_value || 'NO TRANSLATION'}"`);
        });
        
        // Generate fix SQL
        console.log('\n📋 Fix SQL for missing keys:\n');
        console.log('```sql');
        console.log('-- Add missing content items');
        console.log(`INSERT INTO content_items (content_key, screen_location, component_type, category, is_active) VALUES`);
        
        const missingKeys = [];
        for (const key of visibleKeys) {
            const result = await contentClient.query(
                'SELECT id FROM content_items WHERE content_key = $1',
                [key]
            );
            if (result.rows.length === 0) {
                missingKeys.push(key);
                console.log(`('${key}', 'refinance_step1', 'label', 'form', true),`);
            }
        }
        
        if (missingKeys.length > 0) {
            console.log('ON CONFLICT (content_key) DO NOTHING;\n');
            
            console.log('-- Add Hebrew translations');
            console.log(`INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES`);
            
            // Translation mapping
            const translations = {
                'app.refinance.step1.title': 'מחזור משכנתא',
                'app.refinance.step1.property_value_label': 'שווי נכס',
                'app.refinance.step1.balance_label': 'יתרת משכנתא נוכחית'
            };
            
            missingKeys.forEach(key => {
                const hebrewText = translations[key] || 'תרגום חסר';
                console.log(`((SELECT id FROM content_items WHERE content_key = '${key}'), 'he', '${hebrewText}', 'approved'),`);
            });
            
            console.log('ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;');
        }
        console.log('```');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await contentClient.end();
    }
}

checkMissingTranslations();