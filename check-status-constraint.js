const { Pool } = require('pg');
require('dotenv').config();

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkStatusConstraint() {
    try {
        console.log('Checking status constraint and existing values...\n');
        
        // Check the constraint definition
        const constraintResult = await contentPool.query(`
            SELECT conname, pg_get_constraintdef(oid) as definition
            FROM pg_constraint
            WHERE conname = 'content_translations_status_check'
        `);
        
        if (constraintResult.rows.length > 0) {
            console.log('Status constraint definition:');
            console.log(constraintResult.rows[0].definition);
        }
        
        // Check existing status values
        const statusResult = await contentPool.query(`
            SELECT DISTINCT status, COUNT(*) as count
            FROM content_translations
            WHERE status IS NOT NULL
            GROUP BY status
            ORDER BY status
        `);
        
        console.log('\nExisting status values in use:');
        statusResult.rows.forEach(row => {
            console.log(`  - ${row.status}: ${row.count} items`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await contentPool.end();
    }
}

checkStatusConstraint();
EOF < /dev/null