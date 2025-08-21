const { createPool } = require('./server/config/database-core');
const fs = require('fs');
const path = require('path');

async function applyPropertyOwnershipMigration() {
    const mainPool = createPool('main');
    const contentPool = createPool('content');
    
    try {
        console.log('🔄 Applying property ownership migrations...');
        
        // Check if main migration is needed
        const mainTableCheck = await mainPool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'property_ownership_rules'
            ) as table_exists
        `);
        
        if (!mainTableCheck.rows[0].table_exists) {
            console.log('📋 Applying main database migration (property_ownership_rules)...');
            const mainMigrationPath = path.join(__dirname, 'server/migrationDB/bankim_core_create_property_ownership_rules_20250821_142930.sql');
            const mainMigrationSQL = fs.readFileSync(mainMigrationPath, 'utf8');
            await mainPool.query(mainMigrationSQL);
            console.log('✅ Main database migration applied successfully');
        } else {
            console.log('✅ Main database table already exists');
        }
        
        // Check if content migration is needed
        const contentCheck = await contentPool.query(`
            SELECT COUNT(*) as count 
            FROM content_items 
            WHERE content_key LIKE 'property_ownership_%'
        `);
        
        if (parseInt(contentCheck.rows[0].count) === 0) {
            console.log('📋 Applying content database migration (property ownership translations)...');
            const contentMigrationPath = path.join(__dirname, 'server/migrationDB/bankim_content_create_property_ownership_translations_fixed_20250821_142934.sql');
            const contentMigrationSQL = fs.readFileSync(contentMigrationPath, 'utf8');
            await contentPool.query(contentMigrationSQL);
            console.log('✅ Content database migration applied successfully');
        } else {
            console.log('✅ Content database translations already exist');
        }
        
        // Verify the migrations
        const rulesCount = await mainPool.query('SELECT COUNT(*) as count FROM property_ownership_rules WHERE is_active = true');
        const translationsCount = await contentPool.query(`
            SELECT COUNT(*) as count 
            FROM content_translations ct
            JOIN content_items ci ON ct.content_item_id = ci.id
            WHERE ci.content_key LIKE 'property_ownership_%'
        `);
        
        console.log(`✅ Migration complete:`);
        console.log(`   - Property ownership rules: ${rulesCount.rows[0].count} active records`);
        console.log(`   - Property ownership translations: ${translationsCount.rows[0].count} translations`);
        
        if (parseInt(rulesCount.rows[0].count) > 0 && parseInt(translationsCount.rows[0].count) > 0) {
            console.log('🎉 Property ownership system is now properly configured!');
        } else {
            console.log('⚠️  Migration completed but some data may be missing');
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    } finally {
        await mainPool.end();
        await contentPool.end();
    }
}

applyPropertyOwnershipMigration();
