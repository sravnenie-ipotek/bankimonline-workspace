const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixAndExecuteMigrations() {
  console.log('🔧 Fixing and executing refinance credit migrations...\n');
  
  const migrations = [
    {
      file: 'migrate_refinance_credit_step1_dropdowns.sql',
      fixes: [
        // Fix ON CONFLICT to use only content_key
        { find: /ON CONFLICT \(content_key, screen_location\)/g, replace: 'ON CONFLICT (content_key)' }
      ]
    },
    {
      file: 'migrate_refinance_credit_step2_complete.sql',
      fixes: [
        // Fix single quote escaping
        { find: /Bachelor\\'s degree/g, replace: "Bachelor''s degree" },
        { find: /Master\\'s degree/g, replace: "Master''s degree" },
        // Fix ON CONFLICT
        { find: /ON CONFLICT \(content_key, screen_location\)/g, replace: 'ON CONFLICT (content_key)' }
      ]
    },
    {
      file: 'migrate_refinance_credit_step3_complete.sql',
      fixes: [
        // Fix ON CONFLICT
        { find: /ON CONFLICT \(content_key, screen_location\)/g, replace: 'ON CONFLICT (content_key)' }
      ]
    },
    {
      file: 'migrate_refinance_credit_step4_complete.sql',
      fixes: [
        // Fix ON CONFLICT
        { find: /ON CONFLICT \(content_key, screen_location\)/g, replace: 'ON CONFLICT (content_key)' }
      ]
    }
  ];
  
  const results = [];
  
  for (const migration of migrations) {
    console.log(`\n=== Processing: ${migration.file} ===`);
    
    try {
      // Read the original file
      const filePath = path.join(__dirname, 'migrations', migration.file);
      let sql = await fs.readFile(filePath, 'utf8');
      
      // Apply fixes
      console.log('Applying fixes...');
      for (const fix of migration.fixes) {
        const matches = sql.match(fix.find);
        if (matches) {
          console.log(`  - Found ${matches.length} occurrences of: ${fix.find}`);
          sql = sql.replace(fix.find, fix.replace);
        }
      }
      
      // Execute the fixed SQL
      console.log('Executing fixed migration...');
      await pool.query(sql);
      console.log(`✅ Successfully executed: ${migration.file}`);
      results.push({ file: migration.file, success: true });
      
    } catch (error) {
      console.error(`❌ Failed to execute ${migration.file}:`, error.message);
      results.push({ file: migration.file, success: false, error: error.message });
    }
  }
  
  console.log('\n\n========================================');
  console.log('📊 MIGRATION SUMMARY');
  console.log('========================================\n');
  
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.file}`);
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  // Verify content for each screen
  console.log('\n\n========================================');
  console.log('📊 CONTENT VERIFICATION');
  console.log('========================================\n');
  
  const screens = ['refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4'];
  
  for (const screen of screens) {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_items,
          COUNT(DISTINCT content_type) as content_types,
          COUNT(DISTINCT ct.language_code) as languages
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.screen_location = $1
      `, [screen]);
      
      const row = result.rows[0];
      console.log(`${screen}:`);
      console.log(`  Total items: ${row.total_items}`);
      console.log(`  Content types: ${row.content_types}`);
      console.log(`  Languages: ${row.languages}`);
      
      // Get content type breakdown
      const typeResult = await pool.query(`
        SELECT content_type, COUNT(*) as count
        FROM content_items
        WHERE screen_location = $1
        GROUP BY content_type
        ORDER BY count DESC
      `, [screen]);
      
      console.log('  Content by type:');
      typeResult.rows.forEach(typeRow => {
        console.log(`    - ${typeRow.content_type}: ${typeRow.count}`);
      });
      console.log('');
      
    } catch (error) {
      console.error(`Error checking ${screen}:`, error.message);
    }
  }
  
  await pool.end();
  console.log('\n✅ Migration process completed!');
}

fixAndExecuteMigrations().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});