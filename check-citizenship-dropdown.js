const { Pool } = require('pg');
require('dotenv').config();

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkCitizenshipDropdown() {
    try {
        console.log('Checking for citizenship dropdown in database...\n');
        
        // Check for citizenship dropdown header
        const headerResult = await contentPool.query(`
            SELECT 
                ci.id,
                ci.content_key as key,
                ci.category,
                ci.screen_location,
                ct.language_code,
                ct.content_value as value
            FROM content_items ci
            LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.content_key LIKE '%citizenship%'
            ORDER BY ci.content_key, ct.language_code
        `);
        
        if (headerResult.rows.length > 0) {
            console.log('✅ Found citizenship dropdown headers:');
            console.log('=====================================');
            
            const groupedByKey = {};
            headerResult.rows.forEach(row => {
                if (!groupedByKey[row.key]) {
                    groupedByKey[row.key] = {
                        id: row.id,
                        key: row.key,
                        category: row.category,
                        screen_location: row.screen_location,
                        translations: {}
                    };
                }
                if (row.language_code) {
                    groupedByKey[row.key].translations[row.language_code] = row.value;
                }
            });
            
            Object.values(groupedByKey).forEach(item => {
                console.log(`\nKey: ${item.key}`);
                console.log(`Category: ${item.category}`);
                console.log(`Screen: ${item.screen_location}`);
                console.log('Translations:');
                console.log(`  EN: ${item.translations.en || 'N/A'}`);
                console.log(`  HE: ${item.translations.he || 'N/A'}`);
                console.log(`  RU: ${item.translations.ru || 'N/A'}`);
            });
        }
        
        // Check for citizenship options
        console.log('\n\n✅ Found citizenship dropdown options:');
        console.log('======================================');
        
        const optionsResult = await contentPool.query(`
            SELECT 
                ci.id,
                ci.content_key as key,
                ci.category,
                ci.screen_location,
                ct.language_code,
                ct.content_value as value
            FROM content_items ci
            LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.content_key LIKE '%citizenship%option%'
            ORDER BY ci.content_key, ct.language_code
        `);
        
        if (optionsResult.rows.length > 0) {
            const groupedOptions = {};
            optionsResult.rows.forEach(row => {
                if (!groupedOptions[row.key]) {
                    groupedOptions[row.key] = {
                        id: row.id,
                        key: row.key,
                        category: row.category,
                        screen_location: row.screen_location,
                        translations: {}
                    };
                }
                if (row.language_code) {
                    groupedOptions[row.key].translations[row.language_code] = row.value;
                }
            });
            
            Object.values(groupedOptions).forEach(item => {
                console.log(`\nOption Key: ${item.key}`);
                console.log('Translations:');
                console.log(`  EN: ${item.translations.en || 'N/A'}`);
                console.log(`  HE: ${item.translations.he || 'N/A'}`);
                console.log(`  RU: ${item.translations.ru || 'N/A'}`);
            });
            
            console.log('\n\nSummary:');
            console.log(`Total citizenship options found: ${Object.keys(groupedOptions).length}`);
            
            // Check if the specific options from screenshot are present
            const expectedOptions = ['ישראל', 'ארצות הברית', 'רוסיה', 'גרמניה', 'צרפת'];
            const foundHebrewOptions = Object.values(groupedOptions)
                .map(opt => opt.translations.he)
                .filter(Boolean);
            
            console.log('\nChecking for options from screenshot:');
            expectedOptions.forEach(option => {
                const found = foundHebrewOptions.includes(option);
                console.log(`  ${option}: ${found ? '✅ Found' : '❌ Not found'}`);
            });
        } else {
            console.log('❌ No citizenship options found in database');
        }
        
    } catch (error) {
        console.error('Error checking citizenship dropdown:', error);
    } finally {
        await contentPool.end();
    }
}

checkCitizenshipDropdown();