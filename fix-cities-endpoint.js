#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function fixCitiesEndpoint() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('🔧 Fixing cities endpoint by adding cities to dropdowns...');
        
        // Get all cities from the cities table
        const citiesResult = await client.query(`
            SELECT id, key as value, name_he as name 
            FROM cities 
            ORDER BY name_he
        `);
        
        console.log(`📊 Found ${citiesResult.rowCount} cities to add`);
        
        // Add cities as dropdown options to mortgage_step1
        for (let i = 0; i < citiesResult.rows.length; i++) {
            const city = citiesResult.rows[i];
            const optionNumber = i + 1;
            
            // Insert city as dropdown option
            await client.query(`
                INSERT INTO content_items (screen_location, content_key, component_type, created_at, updated_at)
                VALUES ($1, $2, $3, NOW(), NOW())
                ON CONFLICT (screen_location, content_key) DO NOTHING
            `, [
                'mortgage_step1',
                `mortgage_step1_city_option_${optionNumber}`,
                'dropdown_option'
            ]);
            
            // Insert Hebrew translation
            await client.query(`
                INSERT INTO content_translations (content_item_id, language_code, translation_value, created_at, updated_at)
                SELECT ci.id, 'he', $1, NOW(), NOW()
                FROM content_items ci
                WHERE ci.screen_location = 'mortgage_step1' 
                AND ci.content_key = $2
                ON CONFLICT (content_item_id, language_code) DO UPDATE SET
                translation_value = EXCLUDED.translation_value,
                updated_at = NOW()
            `, [city.name, `mortgage_step1_city_option_${optionNumber}`]);
            
            // Insert English translation
            await client.query(`
                INSERT INTO content_translations (content_item_id, language_code, translation_value, created_at, updated_at)
                SELECT ci.id, 'en', $1, NOW(), NOW()
                FROM content_items ci
                WHERE ci.screen_location = 'mortgage_step1' 
                AND ci.content_key = $2
                ON CONFLICT (content_item_id, language_code) DO UPDATE SET
                translation_value = EXCLUDED.translation_value,
                updated_at = NOW()
            `, [city.value, `mortgage_step1_city_option_${optionNumber}`]);
        }
        
        // Add city dropdown title and placeholder
        await client.query(`
            INSERT INTO content_items (screen_location, content_key, component_type, created_at, updated_at)
            VALUES 
            ('mortgage_step1', 'mortgage_step1_city', 'dropdown_title', NOW(), NOW()),
            ('mortgage_step1', 'mortgage_step1_city_ph', 'dropdown_placeholder', NOW(), NOW())
            ON CONFLICT (screen_location, content_key) DO NOTHING
        `);
        
        // Add Hebrew translations for title and placeholder
        await client.query(`
            INSERT INTO content_translations (content_item_id, language_code, translation_value, created_at, updated_at)
            SELECT ci.id, 'he', $1, NOW(), NOW()
            FROM content_items ci
            WHERE ci.screen_location = 'mortgage_step1' AND ci.content_key = $2
            ON CONFLICT (content_item_id, language_code) DO UPDATE SET
            translation_value = EXCLUDED.translation_value,
            updated_at = NOW()
        `, ['עיר בא נמצא הנכס??', 'mortgage_step1_city']);
        
        await client.query(`
            INSERT INTO content_translations (content_item_id, language_code, translation_value, created_at, updated_at)
            SELECT ci.id, 'he', $1, NOW(), NOW()
            FROM content_items ci
            WHERE ci.screen_location = 'mortgage_step1' AND ci.content_key = $2
            ON CONFLICT (content_item_id, language_code) DO UPDATE SET
            translation_value = EXCLUDED.translation_value,
            updated_at = NOW()
        `, ['בחר עיר', 'mortgage_step1_city_ph']);
        
        await client.query('COMMIT');
        console.log('✅ Cities added to mortgage_step1 dropdowns successfully!');
        
        // Verify the fix
        const verifyResult = await client.query(`
            SELECT ci.content_key, ct.translation_value
            FROM content_items ci
            LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
            WHERE ci.screen_location = 'mortgage_step1' 
            AND ci.content_key LIKE 'mortgage_step1_city%'
            ORDER BY ci.content_key
        `);
        
        console.log(`📊 Verification: Found ${verifyResult.rowCount} city-related items`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error fixing cities endpoint:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

fixCitiesEndpoint().catch(console.error); 