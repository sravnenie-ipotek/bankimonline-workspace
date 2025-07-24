#!/usr/bin/env node
// Credit Calculator Migration Runner
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection using same config as contentPool in server-db.js
const pool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
    ssl: { rejectUnauthorized: false }
});

// Migration files to run in order (contentpool versions)
const migrationFiles = [
    'migrate_credit_step2_contentpool.sql'
    // TODO: Create step 3 and 4 contentpool versions
];

async function testConnection() {
    try {
        const result = await pool.query('SELECT NOW() as time, current_database() as db');
        console.log('✅ Database connected successfully!');
        console.log(`   Database: ${result.rows[0].db}`);
        console.log(`   Time: ${result.rows[0].time}`);
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

async function checkContentTables() {
    try {
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('content_items', 'content_translations')
            ORDER BY table_name
        `);
        
        const tables = result.rows.map(row => row.table_name);
        
        if (tables.length < 2) {
            console.error('❌ Required content tables not found. Expected: content_items, content_translations');
            console.log('   Found tables:', tables);
            return false;
        }
        
        console.log('✅ Content tables found:', tables);
        return true;
    } catch (error) {
        console.error('❌ Error checking content tables:', error.message);
        return false;
    }
}

async function runMigration(filename) {
    const filePath = path.join(__dirname, 'migrations', filename);
    
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Migration file not found: ${filePath}`);
        return false;
    }
    
    const sql = fs.readFileSync(filePath, 'utf8');
    
    try {
        console.log(`📝 Running ${filename}...`);
        await pool.query(sql);
        console.log(`✅ Successfully ran ${filename}`);
        return true;
    } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
            console.log(`⚠️  ${filename} - Some content already exists (skipping duplicates)`);
            return true;
        }
        console.error(`❌ Error running ${filename}:`, error.message);
        return false;
    }
}

async function verifyMigrations() {
    try {
        console.log('\n📊 Verifying credit migration results...');
        
        // Check content by step (contentpool structure)
        const result = await pool.query(`
            SELECT 
                screen_location,
                COUNT(DISTINCT content_key) as total_items,
                COUNT(DISTINCT CASE WHEN component_type = 'field_label' THEN content_key END) as field_labels,
                COUNT(DISTINCT CASE WHEN component_type = 'option' THEN content_key END) as options,
                COUNT(DISTINCT CASE WHEN component_type = 'placeholder' THEN content_key END) as placeholders
            FROM content_items
            WHERE screen_location IN ('calculate_credit_2', 'calculate_credit_3', 'calculate_credit_4')
            GROUP BY screen_location
            ORDER BY screen_location
        `);
        
        console.log('----------------------------------------');
        result.rows.forEach(row => {
            console.log(`${row.screen_location}:`);
            console.log(`  Total items: ${row.total_items}`);
            console.log(`  Field labels: ${row.field_labels}`);
            console.log(`  Options: ${row.options}`);
            console.log(`  Placeholders: ${row.placeholders}`);
            console.log('');
        });
        
        // Check translations exist for all languages
        const translationResult = await pool.query(`
            SELECT 
                ci.screen_location,
                ct.language_code,
                COUNT(*) as translation_count
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.screen_location IN ('calculate_credit_2', 'calculate_credit_3', 'calculate_credit_4')
            GROUP BY ci.screen_location, ct.language_code
            ORDER BY ci.screen_location, ct.language_code
        `);
        
        console.log('📋 Translation coverage:');
        console.log('----------------------------------------');
        translationResult.rows.forEach(row => {
            console.log(`${row.screen_location} (${row.language_code}): ${row.translation_count} translations`);
        });
        
        // Sample content check (contentpool structure)
        const sampleResult = await pool.query(`
            SELECT 
                ci.screen_location,
                ci.content_key,
                ci.component_type,
                ct.content_value,
                ct.language_code
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.screen_location = 'calculate_credit_2'
            AND ci.component_type = 'field_label'
            AND ct.language_code = 'en'
            LIMIT 3
        `);
        
        if (sampleResult.rows.length > 0) {
            console.log('\n📄 Sample content (Step 2, English):');
            console.log('----------------------------------------');
            sampleResult.rows.forEach(row => {
                console.log(`${row.content_key}: "${row.content_value}"`);
            });
        }
        
        console.log('----------------------------------------\n');
        
    } catch (error) {
        console.error('❌ Error verifying migrations:', error.message);
    }
}

async function main() {
    console.log('🚀 Credit Calculator Migration Runner');
    console.log('====================================\n');
    
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
        process.exit(1);
    }
    
    // Check content tables exist
    const tablesExist = await checkContentTables();
    if (!tablesExist) {
        console.log('\n💡 You may need to run the content management system setup first:');
        console.log('   node run-migrations.js');
        process.exit(1);
    }
    
    console.log('\n📦 Running credit migration files in order...\n');
    
    let successCount = 0;
    
    // Run each migration file
    for (const filename of migrationFiles) {
        const success = await runMigration(filename);
        if (success) {
            successCount++;
        }
    }
    
    if (successCount === migrationFiles.length) {
        console.log('\n✅ All credit migrations completed successfully!');
        
        // Verify the results
        await verifyMigrations();
        
        console.log('💡 Next steps:');
        console.log('1. Test the API endpoints:');
        console.log('   curl http://localhost:8003/api/content/calculate_credit_2/en');
        console.log('   curl http://localhost:8003/api/content/calculate_credit_3/en');  
        console.log('   curl http://localhost:8003/api/content/calculate_credit_4/en');
        console.log('2. Update credit calculator components to use useContentApi hook');
        console.log('3. Test the credit calculator forms to ensure content loads correctly');
        
    } else {
        console.log(`\n⚠️  ${successCount}/${migrationFiles.length} migrations completed successfully.`);
        console.log('Please check the errors above and retry failed migrations.');
    }
    
    await pool.end();
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
    process.exit(1);
});

// Run the migrations
main().catch(error => {
    console.error('Migration runner failed:', error);
    process.exit(1);
});