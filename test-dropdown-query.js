const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function testQuery() {
    try {
        console.log('🔍 Testing JSONB dropdown query...\n');
        
        // Run the exact query from handleJsonbDropdowns
        const screen = 'mortgage_step2';
        const result = await pool.query(`
            SELECT 
                dropdown_key,
                field_name,
                dropdown_data
            FROM dropdown_configs
            WHERE screen_location = $1 
                AND is_active = true
            ORDER BY dropdown_key
        `, [screen]);
        
        console.log(`📊 Query returned ${result.rows.length} dropdowns for ${screen}`);
        console.log('\n📋 Dropdowns found:');
        result.rows.forEach((row, idx) => {
            const hasOptions = row.dropdown_data?.options?.length > 0;
            console.log(`${idx + 1}. ${row.dropdown_key} (${row.field_name}) - Options: ${hasOptions ? row.dropdown_data.options.length : 0}`);
        });
        
        // Check without screen filter
        const allResult = await pool.query(`
            SELECT 
                screen_location,
                COUNT(*) as count
            FROM dropdown_configs
            WHERE is_active = true
            GROUP BY screen_location
            ORDER BY screen_location
        `);
        
        console.log('\n📊 All dropdowns by screen:');
        allResult.rows.forEach(row => {
            console.log(`- ${row.screen_location}: ${row.count} dropdowns`);
        });
        
        // Check for duplicates or other issues
        const duplicateResult = await pool.query(`
            SELECT 
                dropdown_key,
                COUNT(*) as count
            FROM dropdown_configs
            WHERE is_active = true
            GROUP BY dropdown_key
            HAVING COUNT(*) > 1
        `);
        
        if (duplicateResult.rows.length > 0) {
            console.log('\n⚠️ Duplicate dropdown keys found:');
            duplicateResult.rows.forEach(row => {
                console.log(`- ${row.dropdown_key}: ${row.count} occurrences`);
            });
        } else {
            console.log('\n✅ No duplicate dropdown keys');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

testQuery();