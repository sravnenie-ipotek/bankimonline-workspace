const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
    const contentClient = new Client({
        connectionString: process.env.CONTENT_DATABASE_URL
    });

    try {
        console.log('🔄 Connecting to content database...');
        await contentClient.connect();
        
        console.log('✅ Connected successfully');
        console.log('🔄 Running migration...');
        
        const migrationSql = fs.readFileSync(
            path.join(__dirname, 'server/migrations/202501_fix_content_translation_schema.sql'),
            'utf8'
        );
        
        await contentClient.query(migrationSql);
        console.log('✅ Migration completed successfully');
        
        // Verify the schema
        const schemaCheck = await contentClient.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'content_translations'
            ORDER BY ordinal_position
        `);
        
        console.log('\n📊 Content_translations table schema:');
        schemaCheck.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });
        
        // Check content count
        const countCheck = await contentClient.query(`
            SELECT COUNT(*) as total FROM content_items
        `);
        console.log(`\n📊 Total content items: ${countCheck.rows[0].total}`);
        
        const translationCount = await contentClient.query(`
            SELECT COUNT(*) as total FROM content_translations
        `);
        console.log(`📊 Total translations: ${translationCount.rows[0].total}`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await contentClient.end();
    }
}

runMigration();