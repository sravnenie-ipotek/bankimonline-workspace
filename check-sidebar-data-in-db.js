const { Pool } = require('pg');
require('dotenv').config();

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkSidebarData() {
    try {
        console.log('Checking if sidebar menu data exists in database...\n');
        
        // Check for specific sidebar keys used in the code
        const sidebarKeys = [
            'sidebar_company_1',
            'sidebar_company_2', 
            'sidebar_company_3',
            'sidebar_company_4',
            'sidebar_company_5',
            'sidebar_company_6',
            'sidebar_business_1',
            'sidebar_business_2',
            'sidebar_business_3',
            'sidebar_business_4'
        ];
        
        console.log('Checking for sidebar keys used in the application:');
        console.log('=================================================\n');
        
        for (const key of sidebarKeys) {
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
                WHERE ci.content_key = $1
                ORDER BY ct.language_code
            `, [key]);
            
            if (result.rows.length > 0) {
                console.log(`✅ ${key} - EXISTS in database`);
                const translations = {};
                result.rows.forEach(row => {
                    if (row.language_code) {
                        translations[row.language_code] = row.content_value;
                    }
                });
                console.log(`   Category: ${result.rows[0].category}`);
                console.log(`   Screen: ${result.rows[0].screen_location}`);
                console.log(`   Translations:`, translations);
            } else {
                console.log(`❌ ${key} - NOT in database`);
            }
            console.log('');
        }
        
        // Also check what sidebar content actually exists
        console.log('\n\nAll sidebar-related content in database:');
        console.log('=========================================\n');
        
        const allSidebarResult = await contentPool.query(`
            SELECT DISTINCT
                ci.content_key,
                ci.category,
                ci.screen_location,
                COUNT(ct.id) as translation_count
            FROM content_items ci
            LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.content_key LIKE 'sidebar%'
               OR ci.screen_location = 'sidebar'
               OR (ci.category = 'navigation' AND ci.screen_location = 'sidebar')
            GROUP BY ci.content_key, ci.category, ci.screen_location
            ORDER BY ci.content_key
        `);
        
        if (allSidebarResult.rows.length > 0) {
            console.log(`Found ${allSidebarResult.rows.length} sidebar-related items:\n`);
            allSidebarResult.rows.forEach(row => {
                console.log(`${row.content_key} | Category: ${row.category} | Screen: ${row.screen_location} | Translations: ${row.translation_count}`);
            });
        } else {
            console.log('No sidebar content found in database');
        }
        
    } catch (error) {
        console.error('Error checking sidebar data:', error);
    } finally {
        await contentPool.end();
    }
}

checkSidebarData();