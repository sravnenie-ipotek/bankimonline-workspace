const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function executeMigration(filename) {
  console.log(`\n=== Executing migration: ${filename} ===`);
  
  try {
    const filePath = path.join(__dirname, 'migrations', filename);
    const sql = await fs.readFile(filePath, 'utf8');
    
    await pool.query(sql);
    console.log(`✅ Successfully executed: ${filename}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to execute ${filename}:`, error.message);
    return false;
  }
}

async function verifyScreenContent(screenLocation) {
  console.log(`\n📊 Verifying content for screen: ${screenLocation}`);
  
  try {
    // Count total content items
    const itemsResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM content_items 
      WHERE screen_location = $1
    `, [screenLocation]);
    
    // Count by content type
    const typeResult = await pool.query(`
      SELECT content_type, COUNT(*) as count 
      FROM content_items 
      WHERE screen_location = $1
      GROUP BY content_type
      ORDER BY content_type
    `, [screenLocation]);
    
    // Count translations
    const translationsResult = await pool.query(`
      SELECT ci.content_type, ct.language_code, COUNT(*) as count
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = $1
      GROUP BY ci.content_type, ct.language_code
      ORDER BY ci.content_type, ct.language_code
    `, [screenLocation]);
    
    console.log(`Total content items: ${itemsResult.rows[0].count}`);
    console.log('\nContent by type:');
    typeResult.rows.forEach(row => {
      console.log(`  ${row.content_type}: ${row.count}`);
    });
    
    console.log('\nTranslations by type and language:');
    let currentType = '';
    translationsResult.rows.forEach(row => {
      if (row.content_type !== currentType) {
        currentType = row.content_type;
        console.log(`  ${currentType}:`);
      }
      console.log(`    ${row.language_code}: ${row.count}`);
    });
    
    return itemsResult.rows[0].count;
  } catch (error) {
    console.error(`❌ Failed to verify content for ${screenLocation}:`, error.message);
    return 0;
  }
}

async function getSampleContent(screenLocation, limit = 5) {
  console.log(`\n📝 Sample content for ${screenLocation}:`);
  
  try {
    const result = await pool.query(`
      SELECT ci.content_key, ci.content_type, ci.component_type,
             ct_en.content_value as en_value,
             ct_he.content_value as he_value,
             ct_ru.content_value as ru_value
      FROM content_items ci
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      WHERE ci.screen_location = $1
      ORDER BY ci.content_type, ci.content_key
      LIMIT $2
    `, [screenLocation, limit]);
    
    result.rows.forEach(row => {
      console.log(`\n  Key: ${row.content_key} (${row.content_type}/${row.component_type})`);
      console.log(`    EN: ${row.en_value || 'N/A'}`);
      console.log(`    HE: ${row.he_value || 'N/A'}`);
      console.log(`    RU: ${row.ru_value || 'N/A'}`);
    });
  } catch (error) {
    console.error(`❌ Failed to get sample content:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting Refinance Credit migration execution...\n');
  
  const migrations = [
    'migrate_refinance_credit_step1_dropdowns.sql',
    'migrate_refinance_credit_step2_complete.sql',
    'migrate_refinance_credit_step3_complete.sql',
    'migrate_refinance_credit_step4_complete.sql'
  ];
  
  const results = [];
  
  // Execute each migration
  for (const migration of migrations) {
    const success = await executeMigration(migration);
    results.push({ migration, success });
  }
  
  console.log('\n\n========================================');
  console.log('📊 MIGRATION SUMMARY');
  console.log('========================================\n');
  
  // Show execution results
  console.log('Execution Results:');
  results.forEach(({ migration, success }) => {
    console.log(`  ${success ? '✅' : '❌'} ${migration}`);
  });
  
  // Verify content for each step
  console.log('\n\n========================================');
  console.log('📊 CONTENT VERIFICATION');
  console.log('========================================');
  
  const screens = [
    'refinance_credit_1',
    'refinance_credit_2',
    'refinance_credit_3',
    'refinance_credit_4'
  ];
  
  const contentCounts = {};
  
  for (const screen of screens) {
    const count = await verifyScreenContent(screen);
    contentCounts[screen] = count;
  }
  
  // Get sample content for each screen
  console.log('\n\n========================================');
  console.log('📝 SAMPLE CONTENT BY SCREEN');
  console.log('========================================');
  
  for (const screen of screens) {
    await getSampleContent(screen, 3);
  }
  
  // Final summary
  console.log('\n\n========================================');
  console.log('🎯 FINAL SUMMARY');
  console.log('========================================\n');
  
  console.log('Total content items created by screen:');
  Object.entries(contentCounts).forEach(([screen, count]) => {
    console.log(`  ${screen}: ${count} items`);
  });
  
  const totalItems = Object.values(contentCounts).reduce((sum, count) => sum + count, 0);
  console.log(`\nTotal content items across all screens: ${totalItems}`);
  
  // Close connection
  await pool.end();
  console.log('\n✅ Migration execution completed!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});