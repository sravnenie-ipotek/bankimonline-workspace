const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkJsonbData() {
    try {
        console.log('🔍 Checking JSONB data structure in database...\n');
        
        // Get a sample dropdown
        const result = await pool.query(`
            SELECT 
                dropdown_key,
                field_name,
                dropdown_data
            FROM dropdown_configs
            WHERE screen_location = 'mortgage_step2' 
                AND field_name = 'education'
            LIMIT 1
        `);
        
        if (result.rows.length > 0) {
            const row = result.rows[0];
            console.log('📋 Sample dropdown data for education field:');
            console.log('Key:', row.dropdown_key);
            console.log('Field:', row.field_name);
            console.log('Data:', JSON.stringify(row.dropdown_data, null, 2));
            
            // Check if options exist
            if (row.dropdown_data && row.dropdown_data.options) {
                console.log('\n✅ Options found:', row.dropdown_data.options.length, 'items');
                console.log('First option:', JSON.stringify(row.dropdown_data.options[0], null, 2));
            } else {
                console.log('\n❌ No options found in dropdown_data!');
            }
        } else {
            console.log('❌ No education dropdown found for mortgage_step2');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

checkJsonbData();