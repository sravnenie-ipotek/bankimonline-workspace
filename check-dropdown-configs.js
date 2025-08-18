const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkDropdownConfigs() {
    try {
        console.log('🔍 Checking dropdown_configs table...\n');
        
        // Check if table exists
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'dropdown_configs'
            )
        `);
        
        if (!tableCheck.rows[0].exists) {
            console.log('❌ dropdown_configs table does not exist!');
            process.exit(1);
        }
        
        // Count total rows
        const countResult = await pool.query('SELECT COUNT(*) FROM dropdown_configs');
        console.log(`📊 Total rows in dropdown_configs: ${countResult.rows[0].count}\n`);
        
        // Check sample data
        const sampleResult = await pool.query(`
            SELECT 
                id,
                dropdown_key,
                screen_location,
                field_name,
                dropdown_data,
                is_active
            FROM dropdown_configs
            WHERE screen_location = 'mortgage_step1'
            LIMIT 5
        `);
        
        console.log('📋 Sample data for mortgage_step1:');
        if (sampleResult.rows.length === 0) {
            console.log('❌ No data found for mortgage_step1!');
        } else {
            sampleResult.rows.forEach(row => {
                console.log(`\n🔹 Dropdown: ${row.dropdown_key}`);
                console.log(`   Screen: ${row.screen_location}`);
                console.log(`   Field: ${row.field_name}`);
                console.log(`   Active: ${row.is_active}`);
                console.log(`   Data: ${JSON.stringify(row.dropdown_data, null, 2)}`);
            });
        }
        
        // Check all unique screen locations
        const screensResult = await pool.query(`
            SELECT DISTINCT screen_location, COUNT(*) as dropdown_count
            FROM dropdown_configs
            GROUP BY screen_location
            ORDER BY screen_location
        `);
        
        console.log('\n📍 Screen locations in database:');
        screensResult.rows.forEach(row => {
            console.log(`   ${row.screen_location}: ${row.dropdown_count} dropdowns`);
        });
        
        // Check for empty dropdown_data
        const emptyDataResult = await pool.query(`
            SELECT COUNT(*) as empty_count
            FROM dropdown_configs
            WHERE dropdown_data IS NULL 
               OR dropdown_data = '{}'::jsonb
               OR jsonb_typeof(dropdown_data) = 'null'
        `);
        
        console.log(`\n⚠️ Dropdowns with empty/null data: ${emptyDataResult.rows[0].empty_count}`);
        
    } catch (error) {
        console.error('❌ Error checking dropdown_configs:', error);
    } finally {
        await pool.end();
    }
}

checkDropdownConfigs();