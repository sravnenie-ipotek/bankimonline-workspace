const { Pool } = require('pg');
require('dotenv').config();

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkContentTypes() {
    try {
        console.log('Checking content_type constraint and existing values...\n');
        
        // Check the constraint definition
        const constraintResult = await contentPool.query(`
            SELECT conname, pg_get_constraintdef(oid) as definition
            FROM pg_constraint
            WHERE conname = 'content_items_content_type_check'
        `);
        
        if (constraintResult.rows.length > 0) {
            console.log('Constraint definition:');
            console.log(constraintResult.rows[0].definition);
        }
        
        // Check existing content_types
        const typesResult = await contentPool.query(`
            SELECT DISTINCT content_type, COUNT(*) as count
            FROM content_items
            GROUP BY content_type
            ORDER BY content_type
        `);
        
        console.log('\nExisting content_types in use:');
        typesResult.rows.forEach(row => {
            console.log(`  - ${row.content_type}: ${row.count} items`);
        });
        
        // Check a sample of dropdown items
        const dropdownResult = await contentPool.query(`
            SELECT content_key, content_type, component_type
            FROM content_items
            WHERE content_key LIKE '%option%'
            LIMIT 5
        `);
        
        console.log('\nSample of option items:');
        dropdownResult.rows.forEach(row => {
            console.log(`  ${row.content_key}: type=${row.content_type}, component=${row.component_type}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await contentPool.end();
    }
}

checkContentTypes();