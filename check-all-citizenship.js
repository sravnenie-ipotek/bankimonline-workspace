const { Pool } = require('pg');
require('dotenv').config();

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkAllCitizenship() {
    try {
        console.log('Checking ALL citizenship-related content in database...\n');
        
        // Check for ANY citizenship content
        const result = await contentPool.query(`
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
        
        console.log(`Found ${result.rows.length} citizenship-related entries\n`);
        
        // Group by key
        const groupedByKey = {};
        result.rows.forEach(row => {
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
        
        // Display all keys
        Object.values(groupedByKey).forEach(item => {
            console.log(`\nKey: ${item.key}`);
            console.log(`Category: ${item.category}`);
            console.log(`Screen: ${item.screen_location}`);
            console.log('Translations:');
            console.log(`  EN: ${item.translations.en || 'N/A'}`);
            console.log(`  HE: ${item.translations.he || 'N/A'}`);
            console.log(`  RU: ${item.translations.ru || 'N/A'}`);
        });
        
        // Look for options with different patterns
        console.log('\n\nChecking for options with pattern calculate_mortgage_citizenship...');
        const optionsResult = await contentPool.query(`
            SELECT 
                ci.content_key,
                ct.language_code,
                ct.content_value
            FROM content_items ci
            LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.content_key LIKE 'calculate_mortgage_citizenship%option%'
            ORDER BY ci.content_key, ct.language_code
        `);
        
        if (optionsResult.rows.length > 0) {
            console.log(`\nFound ${optionsResult.rows.length} option entries`);
            optionsResult.rows.forEach(row => {
                console.log(`${row.content_key} [${row.language_code}]: ${row.content_value}`);
            });
        } else {
            console.log('No options found with calculate_mortgage_citizenship pattern');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await contentPool.end();
    }
}

checkAllCitizenship();