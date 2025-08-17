const { Pool } = require('pg');

const neonPool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_jbzp4wqldAu7@ep-wild-feather-ad1lx42k.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

async function checkStructure() {
    try {
        // Check if table exists
        const tableCheck = await neonPool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'dropdown_configs'
            ORDER BY ordinal_position
        `);
        
        if (tableCheck.rows.length > 0) {
            console.log('Existing dropdown_configs columns:');
            tableCheck.rows.forEach(col => {
                console.log(`  - ${col.column_name}: ${col.data_type}`);
            });
            
            // Drop and recreate
            console.log('\nDropping old table...');
            await neonPool.query('DROP TABLE IF EXISTS dropdown_configs CASCADE');
            console.log('Table dropped.');
        } else {
            console.log('Table does not exist yet.');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await neonPool.end();
    }
}

checkStructure();