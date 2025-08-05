const { Pool } = require('pg');
require('dotenv').config();

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkMortgageStep4Screen() {
    try {
        console.log('Checking screen_location for mortgage calculation step 4...\n');
        
        // Check mortgage step screens
        console.log('Checking mortgage step screens:');
        console.log('===============================');
        
        const mortgageSteps = [
            'mortgage_step1',
            'mortgage_step2',
            'mortgage_step3',
            'mortgage_step4',
            'mortgage_calculation_step1',
            'mortgage_calculation_step2',
            'mortgage_calculation_step3',
            'mortgage_calculation_step4',
            'calculate_mortgage_step1',
            'calculate_mortgage_step2',
            'calculate_mortgage_step3',
            'calculate_mortgage_step4'
        ];
        
        for (const screen of mortgageSteps) {
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
        
        // Check what content exists for step 4
        console.log('\n\nSearching for any step 4 related content:');
        console.log('=========================================');
        
        const step4Result = await contentPool.query(`
            SELECT DISTINCT
                ci.screen_location,
                ci.category,
                COUNT(*) as count
            FROM content_items ci
            WHERE ci.content_key LIKE '%step%4%'
               OR ci.content_key LIKE '%step4%'
               OR ci.screen_location LIKE '%step%4%'
               OR ci.screen_location LIKE '%step4%'
            GROUP BY ci.screen_location, ci.category
            ORDER BY count DESC
        `);
        
        if (step4Result.rows.length > 0) {
            console.log('Found step 4 content in these screens:');
            step4Result.rows.forEach(row => {
                console.log(`Screen: ${row.screen_location} | Category: ${row.category} | Count: ${row.count}`);
            });
        }
        
        // Show sample step 4 content
        console.log('\n\nSample step 4 content:');
        console.log('======================');
        
        const sampleResult = await contentPool.query(`
            SELECT 
                ci.content_key,
                ci.screen_location,
                ci.category,
                ct.content_value
            FROM content_items ci
            LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE (ci.content_key LIKE '%step%4%' OR ci.content_key LIKE '%step4%')
                AND ct.language_code = 'en'
            LIMIT 10
        `);
        
        sampleResult.rows.forEach(row => {
            console.log(`${row.content_key} | Screen: ${row.screen_location} | Value: ${row.content_value}`);
        });
        
        // Check all mortgage screens
        console.log('\n\nAll mortgage calculation screens in database:');
        console.log('============================================');
        
        const allMortgageScreens = await contentPool.query(`
            SELECT DISTINCT screen_location, COUNT(*) as count
            FROM content_items
            WHERE screen_location LIKE '%mortgage%'
               OR content_key LIKE '%mortgage%'
            GROUP BY screen_location
            ORDER BY screen_location
        `);
        
        allMortgageScreens.rows.forEach(row => {
            console.log(`${row.screen_location}: ${row.count} items`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await contentPool.end();
    }
}

checkMortgageStep4Screen();