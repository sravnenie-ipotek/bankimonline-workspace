const { Pool } = require('pg');

// Configure PostgreSQL connection for content database
const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
    ssl: false
});

async function fixTranslationStatus() {
    try {
        console.log('🔧 Updating translation status from draft to approved...');
        
        const result = await contentPool.query(`
            UPDATE content_translations 
            SET status = 'approved' 
            WHERE status = 'draft'
            RETURNING id, content_item_id, language_code, status
        `);
        
        console.log(`✅ Updated ${result.rowCount} translation records to approved status`);
        
        if (result.rows.length > 0) {
            console.log('Updated translations:');
            result.rows.forEach(row => {
                console.log(`  - Translation ID ${row.id}: content_item_id=${row.content_item_id}, language=${row.language_code}, status=${row.status}`);
            });
        }
        
        // Test if content is now available
        const testResult = await contentPool.query(`
            SELECT 
                ci.content_key,
                ct.language_code,
                ct.content_value,
                ct.status
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.screen_location = 'mortgage_calculation' 
                AND ct.status = 'approved'
            ORDER BY ci.content_key, ct.language_code
        `);
        
        console.log(`\n📊 Found ${testResult.rowCount} approved mortgage_calculation translations:`);
        testResult.rows.forEach(row => {
            console.log(`  - ${row.content_key} (${row.language_code}): "${row.content_value}"`);
        });
        
    } catch (error) {
        console.error('❌ Failed to update translation status:', error.message);
    } finally {
        await contentPool.end();
    }
}

fixTranslationStatus();