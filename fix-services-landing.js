const { Client } = require('pg');
require('dotenv').config();

async function fixServicesLanding() {
    const client = new Client({
        connectionString: process.env.CONTENT_DATABASE_URL
    });

    try {
        await client.connect();
        console.log('🔄 Fixing services_landing content...');
        
        // Update existing items to have services_landing screen location
        const updateResult = await client.query(`
            UPDATE content_items 
            SET screen_location = 'services_landing'
            WHERE content_key IN (
                'calculate_mortgage',
                'refinance_mortgage', 
                'calculate_credit',
                'refinance_credit'
            ) AND screen_location = 'home_page'
            RETURNING id, content_key
        `);
        
        if (updateResult.rows.length > 0) {
            console.log(`✅ Updated ${updateResult.rows.length} items to services_landing`);
        }
        
        // Alternatively, duplicate the items for services_landing
        const insertResult = await client.query(`
            INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
            SELECT content_key, 'services_landing', component_type, category, is_active
            FROM content_items
            WHERE content_key IN (
                'calculate_mortgage',
                'refinance_mortgage',
                'calculate_credit', 
                'refinance_credit'
            ) AND screen_location = 'home_page'
            ON CONFLICT (content_key, screen_location) DO NOTHING
            RETURNING id
        `);
        
        if (insertResult.rows.length > 0) {
            console.log(`✅ Created ${insertResult.rows.length} new items for services_landing`);
            
            // Copy translations for new items
            await client.query(`
                INSERT INTO content_translations (content_item_id, language_code, content_value, status)
                SELECT ci2.id, ct.language_code, ct.content_value, ct.status
                FROM content_items ci1
                JOIN content_translations ct ON ci1.id = ct.content_item_id
                JOIN content_items ci2 ON ci1.content_key = ci2.content_key
                WHERE ci1.screen_location = 'home_page'
                AND ci2.screen_location = 'services_landing'
                AND ci1.content_key IN (
                    'calculate_mortgage',
                    'refinance_mortgage',
                    'calculate_credit',
                    'refinance_credit'
                )
                ON CONFLICT (content_item_id, language_code) DO NOTHING
            `);
            console.log('✅ Copied translations for services_landing');
        }
        
        console.log('✅ Services landing fix completed');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

fixServicesLanding();