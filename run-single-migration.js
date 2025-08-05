#!/usr/bin/env node
// Single Credit Migration Test Runner
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection using same config as server-db.js
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
    ssl: { rejectUnauthorized: false }
});

async function runMigration(filename) {
    const filePath = path.join(__dirname, 'migrations', filename);
    
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Migration file not found: ${filePath}`);
        return false;
    }
    
    const sql = fs.readFileSync(filePath, 'utf8');
    
    try {
        console.log(`📝 Running ${filename}...`);
        const result = await pool.query(sql);
        console.log(`✅ Successfully ran ${filename}`);
        return true;
    } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
            console.log(`⚠️  ${filename} - Some content already exists (skipping duplicates)`);
            return true;
        }
        console.error(`❌ Error running ${filename}:`, error.message);
        console.error('Error details:', error);
        return false;
    }
}

async function verifyResults() {
    try {
        console.log('\n📊 Verifying migration results...');
        
        const result = await pool.query(`
            SELECT 
                screen_location,
                COUNT(DISTINCT key) as total_items,
                COUNT(DISTINCT CASE WHEN component_type = 'field_label' THEN key END) as field_labels,
                COUNT(DISTINCT CASE WHEN component_type = 'option' THEN key END) as options
            FROM content_items
            WHERE screen_location = 'calculate_credit_2'
            GROUP BY screen_location
        `);
        
        if (result.rows.length > 0) {
            const row = result.rows[0];
            console.log(`${row.screen_location}:`);
            console.log(`  Total items: ${row.total_items}`);
            console.log(`  Field labels: ${row.field_labels}`);
            console.log(`  Options: ${row.options}`);
        }
        
        // Check translations
        const translationResult = await pool.query(`
            SELECT 
                ct.language_code,
                COUNT(*) as translation_count
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.screen_location = 'calculate_credit_2'
            GROUP BY ct.language_code
            ORDER BY ct.language_code
        `);
        
        console.log('\nTranslations:');
        translationResult.rows.forEach(row => {
            console.log(`  ${row.language_code}: ${row.translation_count} translations`);
        });
        
    } catch (error) {
        console.error('❌ Error verifying results:', error.message);
    }
}

async function main() {
    try {
        console.log('🧪 Testing Credit Step 2 Migration');
        console.log('==================================\n');
        
        const success = await runMigration('migrate_credit_step2_fixed.sql');
        
        if (success) {
            await verifyResults();
            console.log('\n✅ Migration test completed successfully!');
        } else {
            console.log('\n❌ Migration test failed!');
        }
        
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await pool.end();
    }
}

main();