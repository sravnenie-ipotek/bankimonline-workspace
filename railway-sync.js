const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

// Railway connection configurations with different strategies
const RAILWAY_CONFIGS = [
    {
        name: 'Direct Connection',
        main: process.env.DATABASE_URL,
        content: process.env.CONTENT_DATABASE_URL,
        options: { ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 30000 }
    },
    {
        name: 'Public Endpoints',
        main: 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
        content: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
        options: { ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 30000 }
    },
    {
        name: 'No SSL',
        main: process.env.DATABASE_URL,
        content: process.env.CONTENT_DATABASE_URL,
        options: { ssl: false, connectionTimeoutMillis: 30000 }
    }
];

// Local database configuration
const LOCAL_CONFIG = {
    core: {
        host: 'localhost',
        port: 5432,
        database: 'bankim_core',
        user: 'michaelmishayev'
    },
    content: {
        host: 'localhost',
        port: 5432,
        database: 'bankim_content',
        user: 'michaelmishayev'
    }
};

async function testConnection(connectionString, options, dbName) {
    const client = new Client({
        connectionString,
        ...options
    });
    
    try {
        console.log(`  Attempting to connect to ${dbName}...`);
        await client.connect();
        
        const result = await client.query('SELECT NOW() as time, current_database() as db');
        console.log(`  ✅ Connected! Database: ${result.rows[0].db}`);
        
        return client;
    } catch (error) {
        console.log(`  ❌ Failed: ${error.message}`);
        await client.end().catch(() => {});
        return null;
    }
}

async function syncContentDatabase(railwayClient, localClient) {
    console.log('\n📦 Syncing Content Database...\n');
    
    try {
        // Get content items from Railway
        console.log('  Fetching content_items from Railway...');
        const contentItems = await railwayClient.query(`
            SELECT * FROM content_items 
            ORDER BY id
        `);
        console.log(`  Found ${contentItems.rows.length} content items`);
        
        // Get translations from Railway
        console.log('  Fetching content_translations from Railway...');
        const translations = await railwayClient.query(`
            SELECT * FROM content_translations 
            ORDER BY id
        `);
        console.log(`  Found ${translations.rows.length} translations`);
        
        // Sync to local database
        console.log('\n  Syncing to local database...');
        
        // Start transaction
        await localClient.query('BEGIN');
        
        // Clear existing data to avoid conflicts
        console.log('  Clearing existing data...');
        await localClient.query('TRUNCATE content_items CASCADE');
        
        // Reset sequence
        await localClient.query('ALTER SEQUENCE content_items_id_seq RESTART WITH 1');
        
        // Insert content items
        for (const item of contentItems.rows) {
            await localClient.query(`
                INSERT INTO content_items (
                    content_key, screen_location, component_type, 
                    category, status, created_at, updated_at, 
                    app_context_id, is_active, page_number
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, [
                item.content_key, item.screen_location, 
                item.component_type, item.category, item.status || 'active',
                item.created_at, item.updated_at, 
                parseInt(item.app_context_id) || 1,
                item.is_active !== false, 
                item.page_number ? parseInt(item.page_number) : null
            ]);
        }
        
        console.log(`  ✅ Synced ${contentItems.rows.length} content items`);
        
        // Create mapping of old IDs to new IDs
        const idMapping = {};
        const localItems = await localClient.query(`
            SELECT id, content_key, screen_location 
            FROM content_items 
            ORDER BY id
        `);
        
        for (const localItem of localItems.rows) {
            // Find corresponding Railway item
            const railwayItem = contentItems.rows.find(ri => 
                ri.content_key === localItem.content_key && 
                ri.screen_location === localItem.screen_location
            );
            if (railwayItem) {
                idMapping[railwayItem.id] = localItem.id;
            }
        }
        
        // Insert translations with mapped IDs
        let translationCount = 0;
        for (const trans of translations.rows) {
            const newContentItemId = idMapping[trans.content_item_id];
            if (newContentItemId) {
                await localClient.query(`
                    INSERT INTO content_translations (
                        content_item_id, language_code, 
                        content_value, status, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (content_item_id, language_code)
                    DO UPDATE SET
                        content_value = EXCLUDED.content_value,
                        status = EXCLUDED.status,
                        updated_at = EXCLUDED.updated_at
                `, [
                    newContentItemId, trans.language_code,
                    trans.content_value, trans.status, trans.created_at, trans.updated_at
                ]);
                translationCount++;
            }
        }
        
        console.log(`  ✅ Synced ${translationCount} translations`);
        
        // Commit transaction
        await localClient.query('COMMIT');
        console.log('\n  ✅ Content database sync complete!');
        
        // Verify
        const verifyCount = await localClient.query(`
            SELECT 
                (SELECT COUNT(*) FROM content_items) as items,
                (SELECT COUNT(*) FROM content_translations) as translations
        `);
        console.log(`\n  📊 Local database now has:`);
        console.log(`     - ${verifyCount.rows[0].items} content items`);
        console.log(`     - ${verifyCount.rows[0].translations} translations`);
        
    } catch (error) {
        await localClient.query('ROLLBACK');
        console.error('  ❌ Sync failed:', error.message);
        throw error;
    }
}

async function main() {
    console.log('🚀 Railway to Local Database Sync\n');
    console.log('=' .repeat(60));
    
    let railwayContentClient = null;
    let localContentClient = null;
    
    // Try different connection strategies for Railway
    console.log('\n🔍 Testing Railway connections...\n');
    
    for (const config of RAILWAY_CONFIGS) {
        console.log(`Strategy: ${config.name}`);
        
        if (!railwayContentClient && config.content) {
            railwayContentClient = await testConnection(
                config.content, 
                config.options, 
                'Railway Content DB'
            );
        }
        
        if (railwayContentClient) {
            console.log('\n✅ Railway connection successful!');
            break;
        }
    }
    
    if (!railwayContentClient) {
        console.log('\n❌ Could not connect to Railway databases');
        console.log('\nPossible solutions:');
        console.log('1. Check if Railway project is active');
        console.log('2. Try using Railway CLI: railway connect postgres');
        console.log('3. Use VPN or different network');
        console.log('4. Download backup from Railway dashboard');
        return;
    }
    
    // Connect to local database
    console.log('\n🔍 Connecting to local database...\n');
    
    localContentClient = new Client(LOCAL_CONFIG.content);
    await localContentClient.connect();
    console.log('✅ Connected to local content database');
    
    // Perform sync
    await syncContentDatabase(railwayContentClient, localContentClient);
    
    // Cleanup
    await railwayContentClient.end();
    await localContentClient.end();
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ Sync process complete!');
    console.log('\nNext steps:');
    console.log('1. Restart your server: npm run dev');
    console.log('2. Clear browser cache');
    console.log('3. Test the application');
}

// Run the sync
main().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
});