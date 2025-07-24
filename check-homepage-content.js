#\!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

// Content database connection
const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function checkHomepageContent() {
    try {
        console.log('=== HOMEPAGE CONTENT ANALYSIS ===\n');

        // 1. Check for home page content items
        console.log('1. Content items for home page:');
        const homeItems = await contentPool.query(`
            SELECT ci.id, ci.content_key, ci.screen_location, ci.component_type, ci.category
            FROM content_items ci
            WHERE ci.screen_location = 'home_page' 
               OR ci.screen_location = 'home'
               OR ci.content_key LIKE 'app.home.%'
            ORDER BY ci.content_key
            LIMIT 20
        `);
        
        if (homeItems.rows.length > 0) {
            console.log(`Found ${homeItems.rows.length} home page items:`);
            console.table(homeItems.rows);
        } else {
            console.log('❌ No home page content items found');
        }

        // 2. Check translations for specific home page keys
        console.log('\n2. Checking for specific home page translations:');
        const specificKeys = [
            'app.home.header.title_compare',
            'app.home.text.compare_in_5minutes',
            'app.home.button.show_offers',
            'title_compare',
            'compare_in_5minutes',
            'show_offers'
        ];
        
        const translations = await contentPool.query(`
            SELECT ci.content_key, ct.language_code, ct.content_value, ct.status
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.content_key = ANY($1)
            ORDER BY ci.content_key, ct.language_code
        `, [specificKeys]);
        
        if (translations.rows.length > 0) {
            console.log(`Found ${translations.rows.length} translations:`);
            console.table(translations.rows);
        } else {
            console.log('❌ No translations found for specific keys');
        }

        // 3. Check all unique screen locations
        console.log('\n3. All unique screen locations in database:');
        const screens = await contentPool.query(`
            SELECT DISTINCT screen_location, COUNT(*) as item_count
            FROM content_items
            WHERE screen_location IS NOT NULL
            GROUP BY screen_location
            ORDER BY item_count DESC
            LIMIT 20
        `);
        
        console.table(screens.rows);

        // 4. Sample of content items with translations
        console.log('\n4. Sample of content with translations:');
        const sample = await contentPool.query(`
            SELECT 
                ci.content_key,
                ci.screen_location,
                ct.language_code,
                SUBSTRING(ct.content_value, 1, 50) as content_preview,
                ct.status
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ct.status = 'approved'
            ORDER BY ci.created_at DESC
            LIMIT 10
        `);
        
        console.table(sample.rows);

    } catch (error) {
        console.error('Error checking homepage content:', error);
    } finally {
        await contentPool.end();
    }
}

checkHomepageContent();
