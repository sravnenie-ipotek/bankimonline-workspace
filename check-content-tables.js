const { Pool } = require('pg');
require('dotenv').config();

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkTables() {
    try {
        console.log('Checking tables in content database...\n');
        
        const tablesResult = await contentPool.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename
        `);
        
        console.log('Available tables:');
        tablesResult.rows.forEach(row => {
            console.log(`  - ${row.tablename}`);
        });
        
    } catch (error) {
        console.error('Error checking tables:', error);
    } finally {
        await contentPool.end();
    }
}

checkTables();
EOF < /dev/null