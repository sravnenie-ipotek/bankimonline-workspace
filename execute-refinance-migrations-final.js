const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function executeFinalMigrations() {
  console.log('🚀 Executing refinance credit migrations with proper fixes...\n');
  
  const migrations = [
    {
      file: 'migrate_refinance_credit_step1_dropdowns.sql',
      fixes: [
        // Fix ON CONFLICT to use only content_key
        { find: /ON CONFLICT \(content_key, screen_location\)/g, replace: 'ON CONFLICT (content_key)' },
        // Fix content_type values - change dropdown_option, label, etc. to 'text'
        { find: /'dropdown_option'/g, replace: "'text'" },
        { find: /'label'/g, replace: "'text'" },
        { find: /'placeholder'/g, replace: "'text'" },
        { find: /'button'/g, replace: "'text'" },
        { find: /'title'/g, replace: "'text'" },
        { find: /'dialog'/g, replace: "'text'" },
        { find: /'unit'/g, replace: "'text'" }
      ]
    },
    {
      file: 'migrate_refinance_credit_step2_complete.sql',
      fixes: [
        // Fix single quote escaping
        { find: /Bachelor\\'s degree/g, replace: "Bachelor''s degree" },
        { find: /Master\\'s degree/g, replace: "Master''s degree" },
        // Fix ON CONFLICT
        { find: /ON CONFLICT \(content_key, screen_location\)/g, replace: 'ON CONFLICT (content_key)' },
        // Fix content_type values
        { find: /'dropdown_option'/g, replace: "'text'" },
        { find: /'label'/g, replace: "'text'" },
        { find: /'placeholder'/g, replace: "'text'" },
        { find: /'title'/g, replace: "'text'" },
        { find: /'option'/g, replace: "'text'" }
      ]
    },
    {
      file: 'migrate_refinance_credit_step3_complete.sql',
      fixes: [
        // Fix ON CONFLICT
        { find: /ON CONFLICT \(content_key, screen_location\)/g, replace: 'ON CONFLICT (content_key)' },
        // Fix content_type values
        { find: /'dropdown_option'/g, replace: "'text'" },
        { find: /'label'/g, replace: "'text'" },
        { find: /'placeholder'/g, replace: "'text'" },
        { find: /'title'/g, replace: "'text'" },
        { find: /'validation_message'/g, replace: "'text'" },
        { find: /'helper_text'/g, replace: "'text'" },
        { find: /'tooltip'/g, replace: "'text'" }
      ]
    },
    {
      file: 'migrate_refinance_credit_step4_complete.sql',
      fixes: [
        // Fix ON CONFLICT
        { find: /ON CONFLICT \(content_key, screen_location\)/g, replace: 'ON CONFLICT (content_key)' },
        // Fix content_type values
        { find: /'title'/g, replace: "'text'" },
        { find: /'label'/g, replace: "'text'" }
      ]
    }
  ];
  
  const results = [];
  let totalItemsBefore = 0;
  let totalItemsAfter = 0;
  
  // Get initial count
  try {
    const countResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM content_items 
      WHERE screen_location LIKE 'refinance_credit_%'
    `);
    totalItemsBefore = parseInt(countResult.rows[0].count);
    console.log(`Initial content items: ${totalItemsBefore}\n`);
  } catch (error) {
    console.error('Error getting initial count:', error.message);
  }
  
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
          console.log(`  - Replacing ${matches.length} occurrences of: ${fix.find.toString()}`);
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
  
  // Get final count
  try {
    const countResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM content_items 
      WHERE screen_location LIKE 'refinance_credit_%'
    `);
    totalItemsAfter = parseInt(countResult.rows[0].count);
  } catch (error) {
    console.error('Error getting final count:', error.message);
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
  
  console.log(`\nTotal items created: ${totalItemsAfter - totalItemsBefore}`);
  console.log(`Items before: ${totalItemsBefore}`);
  console.log(`Items after: ${totalItemsAfter}`);
  
  // Detailed verification
  console.log('\n\n========================================');
  console.log('📊 DETAILED CONTENT VERIFICATION');
  console.log('========================================\n');
  
  const screens = ['refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4'];
  
  for (const screen of screens) {
    try {
      // Get counts by component type
      const result = await pool.query(`
        SELECT 
          component_type,
          COUNT(*) as count,
          COUNT(DISTINCT ct.language_code) as languages
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.screen_location = $1
        GROUP BY component_type
        ORDER BY component_type
      `, [screen]);
      
      console.log(`${screen}:`);
      let totalForScreen = 0;
      result.rows.forEach(row => {
        console.log(`  ${row.component_type || 'NULL'}: ${row.count} items (${row.languages} languages)`);
        totalForScreen += parseInt(row.count);
      });
      console.log(`  Total: ${totalForScreen} items\n`);
      
    } catch (error) {
      console.error(`Error checking ${screen}:`, error.message);
    }
  }
  
  // Sample content check
  console.log('\n========================================');
  console.log('📝 SAMPLE CONTENT VERIFICATION');
  console.log('========================================\n');
  
  try {
    const sampleResult = await pool.query(`
      SELECT 
        ci.screen_location,
        ci.content_key,
        ci.component_type,
        ct_en.content_value as en_value
      FROM content_items ci
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      WHERE ci.screen_location LIKE 'refinance_credit_%'
        AND ci.component_type IN ('dropdown_option', 'option')
      ORDER BY ci.screen_location, ci.content_key
      LIMIT 10
    `);
    
    console.log('Sample dropdown options:');
    sampleResult.rows.forEach(row => {
      console.log(`  ${row.screen_location} - ${row.content_key}: ${row.en_value}`);
    });
  } catch (error) {
    console.error('Error getting sample content:', error.message);
  }
  
  await pool.end();
  console.log('\n✅ Migration process completed!');
}

executeFinalMigrations().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});