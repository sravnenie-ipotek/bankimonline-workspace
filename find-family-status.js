const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function findFamilyStatus() {
    try {
        console.log('🔍 Searching for family_status data...\n');
        
        // Check content_translations
        const ctResult = await pool.query(`
            SELECT COUNT(*) as count 
            FROM content_translations 
            WHERE content_key LIKE '%family_status%'
        `);
        console.log('content_translations table:', ctResult.rows[0].count, 'matches');
        
        // Check locales
        const locResult = await pool.query(`
            SELECT COUNT(*) as count 
            FROM locales 
            WHERE msg_key LIKE '%family_status%'
        `);
        console.log('locales table:', locResult.rows[0].count, 'matches');
        
        // Check content_items
        const ciResult = await pool.query(`
            SELECT COUNT(*) as count 
            FROM content_items 
            WHERE content_key LIKE '%family_status%'
        `);
        console.log('content_items table:', ciResult.rows[0].count, 'matches');
        
        // Check dropdown_configs
        const dcResult = await pool.query(`
            SELECT COUNT(*) as count 
            FROM dropdown_configs 
            WHERE dropdown_key LIKE '%family_status%' 
               OR field_name = 'family_status'
        `);
        console.log('dropdown_configs table:', dcResult.rows[0].count, 'matches');
        
        // Get sample locales data for family_status
        const sampleResult = await pool.query(`
            SELECT msg_key, ru_text, he_text, en_text 
            FROM locales 
            WHERE msg_key LIKE '%family_status%' 
            LIMIT 5
        `);
        
        if (sampleResult.rows.length > 0) {
            console.log('\n📋 Sample family_status entries from locales:');
            sampleResult.rows.forEach(row => {
                console.log(`- ${row.msg_key}: ${row.he_text || row.en_text}`);
            });
        }
        
        // Check what screen family_status is for
        const screenResult = await pool.query(`
            SELECT DISTINCT content_key, screen_location 
            FROM content_items 
            WHERE content_key LIKE '%family_status%'
        `);
        
        if (screenResult.rows.length > 0) {
            console.log('\n📍 Family status screen locations:');
            screenResult.rows.forEach(row => {
                console.log(`- ${row.content_key}: ${row.screen_location}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

findFamilyStatus();