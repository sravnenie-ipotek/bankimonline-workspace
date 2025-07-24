const { Pool } = require('pg');
require('dotenv').config();

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkMenuCategory() {
    try {
        console.log('Checking menu items category in database...\n');
        
        // The menu items from the screenshot
        const menuItems = [
            'חברה', // Company
            'תשירותים שלנו', // Our services
            'אודות', // About
            'זכיון זמני למתווכים', // Temporary franchise for brokers
            'משרות', // Careers
            'צור קשר', // Contact us
            'עסקים', // Business
            'מוסדות פיננסיים שותפים', // Partner financial institutions
            'תכנית שותפים', // Partners program
            'זיכיון למתווכים', // Franchise for brokers
            'זיכיון למתווכי נדל"ן', // Franchise for real estate brokers
            'תכנית שותפים לעורכי דין' // Partners program for lawyers
        ];
        
        // Check for menu-related content in the database
        const menuResult = await contentPool.query(`
            SELECT DISTINCT 
                ci.category,
                ci.screen_location,
                COUNT(*) as item_count
            FROM content_items ci
            WHERE ci.content_key LIKE '%menu%' 
               OR ci.screen_location LIKE '%menu%'
               OR ci.category LIKE '%menu%'
               OR ci.category = 'navigation'
               OR ci.category = 'header'
            GROUP BY ci.category, ci.screen_location
            ORDER BY item_count DESC
        `);
        
        console.log('Menu-related categories found:');
        console.log('================================');
        menuResult.rows.forEach(row => {
            console.log(`Category: ${row.category}, Screen: ${row.screen_location}, Count: ${row.item_count}`);
        });
        
        // Check specific menu items
        console.log('\n\nChecking specific menu items:');
        console.log('================================');
        
        const specificResult = await contentPool.query(`
            SELECT 
                ci.content_key,
                ci.category,
                ci.screen_location,
                ct.language_code,
                ct.content_value
            FROM content_items ci
            LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ct.content_value IN ('Company', 'חברה', 'Компания')
               OR ct.content_value IN ('About', 'אודות', 'О нас')
               OR ct.content_value IN ('Contact us', 'צור קשר', 'Связаться с нами')
               OR ct.content_value IN ('Our services', 'תשירותים שלנו', 'Наши услуги')
               OR ct.content_value IN ('Business', 'עסקים', 'Бизнес')
               OR ct.content_value IN ('Careers', 'משרות', 'Карьера')
            ORDER BY ci.content_key, ct.language_code
        `);
        
        if (specificResult.rows.length > 0) {
            const groupedItems = {};
            specificResult.rows.forEach(row => {
                if (!groupedItems[row.content_key]) {
                    groupedItems[row.content_key] = {
                        key: row.content_key,
                        category: row.category,
                        screen_location: row.screen_location,
                        translations: {}
                    };
                }
                if (row.language_code) {
                    groupedItems[row.content_key].translations[row.language_code] = row.content_value;
                }
            });
            
            Object.values(groupedItems).forEach(item => {
                console.log(`\nKey: ${item.key}`);
                console.log(`Category: ${item.category}`);
                console.log(`Screen: ${item.screen_location}`);
                console.log('Values:', item.translations);
            });
        } else {
            console.log('No specific menu items found in content_items table');
        }
        
        // Check for navigation category
        console.log('\n\nChecking navigation category items:');
        console.log('====================================');
        
        const navResult = await contentPool.query(`
            SELECT 
                ci.content_key,
                ci.category,
                ci.screen_location,
                ct.content_value,
                ct.language_code
            FROM content_items ci
            LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.category = 'navigation'
               OR ci.category = 'header'
               OR ci.category = 'menu'
            ORDER BY ci.category, ci.content_key
            LIMIT 20
        `);
        
        if (navResult.rows.length > 0) {
            console.log(`Found ${navResult.rows.length} navigation/menu items`);
            navResult.rows.forEach(row => {
                console.log(`${row.category} | ${row.content_key} | ${row.language_code}: ${row.content_value}`);
            });
        }
        
    } catch (error) {
        console.error('Error checking menu category:', error);
    } finally {
        await contentPool.end();
    }
}

checkMenuCategory();