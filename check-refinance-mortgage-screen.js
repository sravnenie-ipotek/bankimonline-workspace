const { Pool } = require('pg');
require('dotenv').config();

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkRefinanceMortgageScreens() {
    try {
        console.log('Checking screen_location values for refinance mortgage content...\n');
        
        // First, check what screen_location values exist for refinance mortgage content
        const screenResult = await contentPool.query(`
            SELECT DISTINCT 
                ci.screen_location,
                ci.category,
                COUNT(*) as content_count
            FROM content_items ci
            WHERE ci.content_key LIKE '%refinance%mortgage%'
               OR ci.content_key LIKE '%refinance_mortgage%'
               OR ci.screen_location LIKE '%refinance%'
            GROUP BY ci.screen_location, ci.category
            ORDER BY content_count DESC
        `);
        
        console.log('Screen locations with refinance mortgage content:');
        console.log('=================================================');
        screenResult.rows.forEach(row => {
            console.log(`Screen: ${row.screen_location} | Category: ${row.category} | Count: ${row.content_count}`);
        });
        
        // Check specific refinance mortgage steps
        console.log('\n\nChecking refinance mortgage step screens:');
        console.log('=========================================');
        
        const stepScreens = [
            'refinance_mortgage_step1',
            'refinance_mortgage_step2',
            'refinance_mortgage_step3',
            'refinance_step1',
            'refinance_step2',
            'refinance_step3',
            'mortgage_refinancing',
            'refinance_mortgage'
        ];
        
        for (const screen of stepScreens) {
            const result = await contentPool.query(`
                SELECT COUNT(*) as count
                FROM content_items
                WHERE screen_location = $1
            `, [screen]);
            
            if (result.rows[0].count > 0) {
                console.log(`✅ ${screen}: ${result.rows[0].count} items`);
            } else {
                console.log(`❌ ${screen}: NOT FOUND`);
            }
        }
        
        // Show sample refinance mortgage content
        console.log('\n\nSample refinance mortgage content:');
        console.log('==================================');
        
        const sampleResult = await contentPool.query(`
            SELECT 
                ci.content_key,
                ci.screen_location,
                ci.category,
                ct.language_code,
                ct.content_value
            FROM content_items ci
            LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE (ci.content_key LIKE '%refinance%mortgage%' 
                   OR ci.content_key LIKE '%refinance_mortgage%')
                AND ct.language_code = 'en'
            ORDER BY ci.screen_location, ci.content_key
            LIMIT 10
        `);
        
        sampleResult.rows.forEach(row => {
            console.log(`${row.content_key} | Screen: ${row.screen_location} | Value: ${row.content_value}`);
        });
        
        // Get the correct query for refinance mortgage pages
        console.log('\n\n✅ CORRECT QUERY for refinance mortgage pages:');
        console.log('==============================================');
        console.log(`
SELECT 
  ci.id,
  ci.content_key,
  ci.component_type,
  ci.category,
  ci.screen_location,
  ci.description,
  ci.is_active,
  ct_ru.content_value AS title_ru,
  ct_he.content_value AS title_he,
  ct_en.content_value AS title_en,
  ci.updated_at
FROM content_items ci
LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'  
LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
WHERE ci.is_active = TRUE
  AND ci.screen_location IN ('refinance_step1', 'refinance_step2', 'refinance_step3')  -- ✅ CORRECT!
  AND (ct_ru.content_value IS NOT NULL OR ct_he.content_value IS NOT NULL OR ct_en.content_value IS NOT NULL)
  AND ci.component_type != 'option'
  AND ci.content_key NOT LIKE '%_option_%'
  AND ci.content_key NOT LIKE '%_ph'
ORDER BY ci.screen_location, ci.content_key;
        `);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await contentPool.end();
    }
}

checkRefinanceMortgageScreens();