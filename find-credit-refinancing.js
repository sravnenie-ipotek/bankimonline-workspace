#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

// Content database connection
const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function findCreditRefinancing() {
    try {
        console.log('=== SEARCHING FOR CREDIT REFINANCING CONTENT ===\n');

        // 1. Find all unique screen locations
        console.log('1. All unique screen locations in the database:');
        const allScreens = await contentPool.query(`
            SELECT DISTINCT screen_location, category, COUNT(*) as item_count
            FROM content_items
            WHERE screen_location IS NOT NULL
            GROUP BY screen_location, category
            ORDER BY screen_location
        `);
        
        console.log('Total unique screen locations:', allScreens.rows.length);
        console.log('\nScreen locations containing "credit" or "refinanc":');
        const relevantScreens = allScreens.rows.filter(row => 
            row.screen_location.toLowerCase().includes('credit') || 
            row.screen_location.toLowerCase().includes('refinanc')
        );
        console.table(relevantScreens);

        // 2. Check exact screen location patterns
        console.log('\n2. Checking specific credit refinancing patterns:');
        const patterns = [
            'refinance_credit',
            'credit_refinance',
            'refinancing_credit',
            'credit_refinancing',
            'refinance-credit',
            'credit-refinance'
        ];
        
        for (const pattern of patterns) {
            const result = await contentPool.query(
                'SELECT COUNT(*) as count FROM content_items WHERE screen_location = $1',
                [pattern]
            );
            console.log(`${pattern}: ${result.rows[0].count} items`);
        }

        // 3. Find credit category items
        console.log('\n3. All items in credit category:');
        const creditItems = await contentPool.query(`
            SELECT screen_location, content_type, COUNT(*) as count
            FROM content_items
            WHERE category = 'credit'
            GROUP BY screen_location, content_type
            ORDER BY screen_location, content_type
        `);
        console.table(creditItems.rows);

        // 4. Look for the specific count mentioned in report
        console.log('\n4. Looking for screens with exactly 4 items (as reported):');
        const fourItems = await contentPool.query(`
            SELECT screen_location, category, COUNT(*) as item_count,
                   COUNT(CASE WHEN content_type = 'dropdown' THEN 1 END) as dropdown_count
            FROM content_items
            GROUP BY screen_location, category
            HAVING COUNT(*) = 4
            ORDER BY screen_location
        `);
        console.table(fourItems.rows);

        // 5. Check if credit refinancing might be part of another screen
        console.log('\n5. Checking if credit refinancing is part of general credit screen:');
        const creditScreenContent = await contentPool.query(`
            SELECT id, content_key, screen_location, category, content_type
            FROM content_items
            WHERE screen_location = 'credit'
               OR (category = 'credit' AND content_key LIKE '%refinanc%')
            ORDER BY content_key
            LIMIT 20
        `);
        
        if (creditScreenContent.rows.length > 0) {
            console.log('Credit screen content:');
            console.table(creditScreenContent.rows);
        }

        // 6. Summary report
        console.log('\n=== SUMMARY ===');
        const summary = await contentPool.query(`
            SELECT 
                CASE 
                    WHEN category = 'general' OR screen_location LIKE '%general%' THEN 'General Pages'
                    WHEN category = 'mortgage' AND screen_location NOT LIKE '%refinanc%' THEN 'Mortgage'
                    WHEN screen_location LIKE '%mortgage%refinanc%' OR (category = 'mortgage' AND screen_location LIKE '%refinanc%') THEN 'Mortgage Refinancing'
                    WHEN category = 'credit' AND screen_location NOT LIKE '%refinanc%' THEN 'Credit'
                    WHEN screen_location LIKE '%credit%refinanc%' OR (category = 'credit' AND screen_location LIKE '%refinanc%') THEN 'Credit Refinancing'
                    ELSE 'Other (' || COALESCE(category, 'no category') || ')'
                END as section,
                COUNT(*) as total_items,
                COUNT(CASE WHEN content_type = 'dropdown' THEN 1 END) as dropdown_count
            FROM content_items
            GROUP BY section
            ORDER BY section
        `);
        
        console.log('\nContent distribution by section:');
        console.table(summary.rows);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await contentPool.end();
    }
}

findCreditRefinancing();