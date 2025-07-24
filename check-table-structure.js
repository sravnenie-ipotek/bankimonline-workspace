const { Pool } = require('pg');
require('dotenv').config();

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkStructure() {
    try {
        console.log('Checking table structure...\n');
        
        // Check content_items columns
        const itemsColumns = await contentPool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'content_items'
            ORDER BY ordinal_position
        `);
        
        console.log('content_items columns:');
        itemsColumns.rows.forEach(row => {
            console.log(`  - ${row.column_name} (${row.data_type})`);
        });
        
        // Check content_translations columns
        const translationsColumns = await contentPool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'content_translations'
            ORDER BY ordinal_position
        `);
        
        console.log('\ncontent_translations columns:');
        translationsColumns.rows.forEach(row => {
            console.log(`  - ${row.column_name} (${row.data_type})`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await contentPool.end();
    }
}

checkStructure();