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
        
        // Check for content related tables
        console.log('\nChecking for citizenship content...');
        
        // Try content_items table
        try {
            const contentItemsResult = await contentPool.query(`
                SELECT ci.*, ct.*
                FROM content_items ci
                LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
                WHERE ci.key LIKE '%citizenship%'
                LIMIT 5
            `);
            console.log('\n✅ Found citizenship in content_items table:', contentItemsResult.rows.length, 'rows');
        } catch (e) {
            console.log('❌ content_items table not found or no citizenship content');
        }
        
        // Try banking_content table (from previous scripts)
        try {
            const bankingContentResult = await contentPool.query(`
                SELECT *
                FROM banking_content
                WHERE content_key LIKE '%citizenship%'
                LIMIT 5
            `);
            console.log('✅ Found citizenship in banking_content table:', bankingContentResult.rows.length, 'rows');
        } catch (e) {
            console.log('❌ banking_content table not found or no citizenship content');
        }
        
    } catch (error) {
        console.error('Error checking tables:', error);
    } finally {
        await contentPool.end();
    }
}

checkTables();