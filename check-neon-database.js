const { Pool } = require('pg');

// Connect to NEON database (where the API is actually querying)
const neonPool = new Pool({
    connectionString: process.env.NEON_CONTENT_URL || 'postgresql://neondb_owner:npg_jbzp4wqldAu7@ep-wild-feather-ad1lx42k.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkNeonDatabase() {
    try {
        console.log('🔍 Checking NEON database (the actual content database)...\n');
        
        // Check if dropdown_configs table exists
        const tableResult = await neonPool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'dropdown_configs'
            )
        `);
        
        console.log('dropdown_configs table exists:', tableResult.rows[0].exists);
        
        if (tableResult.rows[0].exists) {
            // Count dropdowns
            const countResult = await neonPool.query(`
                SELECT 
                    screen_location,
                    COUNT(*) as count
                FROM dropdown_configs
                WHERE is_active = true
                GROUP BY screen_location
                ORDER BY screen_location
            `);
            
            console.log('\n📊 Dropdowns in NEON database:');
            countResult.rows.forEach(row => {
                console.log(`- ${row.screen_location}: ${row.count} dropdowns`);
            });
            
            // Check education dropdown specifically
            const eduResult = await neonPool.query(`
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
                console.log('\n📚 Education dropdown in NEON:');
                console.log('Key:', edu.dropdown_key);
                console.log('Has options:', edu.dropdown_data?.options?.length > 0);
                if (edu.dropdown_data?.options) {
                    console.log('Options count:', edu.dropdown_data.options.length);
                }
            } else {
                console.log('\n❌ No education dropdown found in NEON database');
            }
            
            // Count total for mortgage_step2
            const mortgageResult = await neonPool.query(`
                SELECT COUNT(*) as count
                FROM dropdown_configs
                WHERE screen_location = 'mortgage_step2' 
                    AND is_active = true
            `);
            
            console.log(`\n📈 Total dropdowns for mortgage_step2 in NEON: ${mortgageResult.rows[0].count}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await neonPool.end();
    }
}

checkNeonDatabase();