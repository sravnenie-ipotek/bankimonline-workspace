const { Pool } = require('pg');
require('dotenv').config();

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkCitizenshipOptions() {
    try {
        console.log('Checking citizenship options directly...\n');
        
        // Check what was actually added
        const result = await contentPool.query(`
            SELECT 
                ci.id,
                ci.content_key,
                ci.category,
                ci.screen_location,
                ct.language_code,
                ct.content_value
            FROM content_items ci
            LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.content_key LIKE 'calculate_mortgage_citizenship_option_%'
            ORDER BY ci.content_key, ct.language_code
        `);
        
        console.log(`Found ${result.rows.length} entries for citizenship options\n`);
        
        if (result.rows.length === 0) {
            console.log('❌ No citizenship options found! They were not added to the database.');
            console.log('\nThe dropdown shown in the screenshot with options like:');
            console.log('- ישראל (Israel)');
            console.log('- ארצות הברית (United States)');
            console.log('- רוסיה (Russia)');
            console.log('- גרמניה (Germany)');
            console.log('- צרפת (France)');
            console.log('\nThese options are NOT in the database yet!');
        } else {
            // Group by key
            const groupedByKey = {};
            result.rows.forEach(row => {
                if (!groupedByKey[row.content_key]) {
                    groupedByKey[row.content_key] = {
                        key: row.content_key,
                        translations: {}
                    };
                }
                if (row.language_code) {
                    groupedByKey[row.content_key].translations[row.language_code] = row.content_value;
                }
            });
            
            console.log('✅ Found citizenship options:');
            Object.values(groupedByKey).forEach(item => {
                console.log(`\n${item.key}:`);
                console.log(`  EN: ${item.translations.en || 'N/A'}`);
                console.log(`  HE: ${item.translations.he || 'N/A'}`);
                console.log(`  RU: ${item.translations.ru || 'N/A'}`);
            });
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await contentPool.end();
    }
}

checkCitizenshipOptions();