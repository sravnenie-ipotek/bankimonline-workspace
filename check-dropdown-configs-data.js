const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkDropdownData() {
    try {
        console.log('🔍 Checking dropdown_configs data...\n');
        
        // Check education dropdown
        const eduResult = await pool.query(`
            SELECT 
                dropdown_key,
                field_name,
                dropdown_data
            FROM dropdown_configs
            WHERE screen_location = 'mortgage_step2' 
                AND field_name = 'education'
        `);
        
        if (eduResult.rows.length > 0) {
            const edu = eduResult.rows[0];
            console.log('📚 Education dropdown:');
            console.log('Key:', edu.dropdown_key);
            console.log('Field:', edu.field_name);
            console.log('Has dropdown_data:', edu.dropdown_data !== null);
            if (edu.dropdown_data) {
                console.log('Has options:', Array.isArray(edu.dropdown_data.options));
                console.log('Options count:', edu.dropdown_data.options?.length || 0);
                if (edu.dropdown_data.options?.length > 0) {
                    console.log('First option:', JSON.stringify(edu.dropdown_data.options[0], null, 2));
                }
            }
        } else {
            console.log('❌ No education dropdown found');
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Check family_status dropdown
        const familyResult = await pool.query(`
            SELECT 
                dropdown_key,
                field_name,
                dropdown_data
            FROM dropdown_configs
            WHERE screen_location = 'mortgage_step2' 
                AND field_name = 'family_status'
        `);
        
        if (familyResult.rows.length > 0) {
            const family = familyResult.rows[0];
            console.log('👨‍👩‍👧‍👦 Family status dropdown:');
            console.log('Key:', family.dropdown_key);
            console.log('Field:', family.field_name);
            console.log('Has dropdown_data:', family.dropdown_data !== null);
            if (family.dropdown_data) {
                console.log('Has options:', Array.isArray(family.dropdown_data.options));
                console.log('Options count:', family.dropdown_data.options?.length || 0);
                if (family.dropdown_data.options?.length > 0) {
                    console.log('First option:', JSON.stringify(family.dropdown_data.options[0], null, 2));
                }
            }
        } else {
            console.log('❌ No family_status dropdown found');
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Check overall stats
        const statsResult = await pool.query(`
            SELECT 
                screen_location,
                COUNT(*) as total_dropdowns,
                COUNT(CASE WHEN dropdown_data IS NOT NULL THEN 1 END) as with_data,
                COUNT(CASE WHEN dropdown_data IS NULL THEN 1 END) as without_data,
                COUNT(CASE WHEN jsonb_array_length(dropdown_data->'options') > 0 THEN 1 END) as with_options
            FROM dropdown_configs
            WHERE screen_location LIKE 'mortgage%'
            GROUP BY screen_location
            ORDER BY screen_location
        `);
        
        console.log('📊 Dropdown Statistics by Screen:');
        statsResult.rows.forEach(row => {
            console.log(`\n${row.screen_location}:`);
            console.log(`  Total dropdowns: ${row.total_dropdowns}`);
            console.log(`  With data: ${row.with_data}`);
            console.log(`  Without data: ${row.without_data}`);
            console.log(`  With options: ${row.with_options}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

checkDropdownData();