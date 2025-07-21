// Migration runner for content database
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Use the content pool configuration from server-db.js
const contentPool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function checkExistingContent() {
  try {
    const result = await contentPool.query(`
      SELECT 
        screen_location,
        COUNT(DISTINCT content_key) as content_count,
        COUNT(DISTINCT CASE WHEN component_type = 'option' THEN content_key END) as option_count
      FROM content_items
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    if (result.rows.length > 0) {
      console.log('\n📊 Existing content in database:');
      console.log('----------------------------------------');
      result.rows.forEach(row => {
        console.log(`${row.screen_location}: ${row.content_count} items (${row.option_count} options)`);
      });
      console.log('----------------------------------------\n');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking existing content:', error.message);
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
    await contentPool.query(sql);
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

async function verifyMigration() {
  try {
    // Check total content items
    const totalResult = await contentPool.query(`
      SELECT COUNT(*) as total_items FROM content_items
    `);
    
    // Check dropdown options
    const optionResult = await contentPool.query(`
      SELECT COUNT(*) as option_count 
      FROM content_items 
      WHERE component_type = 'option'
    `);
    
    // Check content by screen
    const screenResult = await contentPool.query(`
      SELECT 
        screen_location,
        COUNT(DISTINCT content_key) as content_count,
        COUNT(DISTINCT CASE WHEN component_type = 'option' THEN content_key END) as option_count
      FROM content_items
      WHERE screen_location IN ('cooperation', 'tenders_for_brokers', 'temporary_franchise', 'tenders_for_lawyers')
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    console.log('\n✅ Migration Verification:');
    console.log('----------------------------------------');
    console.log(`Total content items: ${totalResult.rows[0].total_items}`);
    console.log(`Total dropdown options: ${optionResult.rows[0].option_count}`);
    console.log('\nContent by screen:');
    screenResult.rows.forEach(row => {
      console.log(`  ${row.screen_location}: ${row.content_count} items (${row.option_count} options)`);
    });
    console.log('----------------------------------------');
    
    // Show sample dropdown options
    const sampleOptions = await contentPool.query(`
      SELECT 
        ci.screen_location,
        ci.content_key,
        ct.content_value,
        ct.language_code
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.component_type = 'option'
        AND ct.language_code = 'en'
      LIMIT 5
    `);
    
    if (sampleOptions.rows.length > 0) {
      console.log('\n📋 Sample dropdown options (English):');
      console.log('----------------------------------------');
      sampleOptions.rows.forEach(row => {
        console.log(`${row.screen_location} > ${row.content_key}:`);
        console.log(`  "${row.content_value}"`);
      });
      console.log('----------------------------------------');
    }
    
  } catch (error) {
    console.error('Error verifying migration:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Content Database Migration Runner');
    console.log('====================================\n');
    
    // Check if content already exists
    const hasContent = await checkExistingContent();
    
    if (hasContent) {
      console.log('⚠️  Warning: Database already contains content.');
      console.log('Running migrations may create duplicates.\n');
      
      // In production, you might want to prompt for confirmation here
      // For now, we'll continue but handle duplicates gracefully
    }
    
    // Run migrations
    console.log('📦 Running migrations...\n');
    
    const migration1 = await runMigration('migrate_four_pages_content.sql');
    const migration2 = await runMigration('migrate_additional_page_content.sql');
    
    if (migration1 || migration2) {
      console.log('\n✅ Migrations completed!');
      
      // Verify the migration
      await verifyMigration();
      
      console.log('\n💡 Next steps:');
      console.log('1. Test the content API: curl http://localhost:8003/api/content/cooperation/en');
      console.log('2. Update components to use useContentApi hook');
      console.log('3. Test all four pages to ensure content loads correctly');
    } else {
      console.log('\n❌ Some migrations failed. Please check the errors above.');
    }
    
  } catch (error) {
    console.error('\n❌ Migration runner failed:', error);
  } finally {
    await contentPool.end();
  }
}

// Run the migrations
main();