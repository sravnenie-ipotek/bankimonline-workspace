const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkForDuplicates() {
  try {
    console.log('🔍 CHECKING FOR POTENTIAL DUPLICATES IN DATABASE\n');
    
    // Check for duplicate content_keys within same screen
    const duplicates = await pool.query(`
      SELECT 
        screen_location,
        content_key,
        COUNT(*) as duplicate_count
      FROM content_items
      WHERE is_active = true
      GROUP BY screen_location, content_key
      HAVING COUNT(*) > 1
      ORDER BY duplicate_count DESC, screen_location, content_key
    `);
    
    if (duplicates.rows.length > 0) {
      console.log('⚠️  FOUND DUPLICATES:');
      console.log('====================');
      duplicates.rows.forEach(row => {
        console.log(`Screen: ${row.screen_location}`);
        console.log(`Key: ${row.content_key}`);
        console.log(`Count: ${row.duplicate_count} duplicates\n`);
      });
    } else {
      console.log('✅ No duplicates found in content_items table\n');
    }
    
    // Check screens that might cause conflicts if migrated
    const riskyScreens = [
      'contacts',  // Partially migrated
      'about',     // Partially migrated
      'vacancies',
      'privacy_policy',
      'terms',
      'refund',
      'personal_cabinet',
      'bank_employee_registration',
      'bank_worker',
      'admin',
      'broker_questionnaire'
    ];
    
    console.log('📋 CHECKING RISKY SCREENS FOR EXISTING CONTENT:');
    console.log('================================================\n');
    
    for (const screen of riskyScreens) {
      const result = await pool.query(`
        SELECT COUNT(*) as count
        FROM content_items
        WHERE screen_location = $1 AND is_active = true
      `, [screen]);
      
      const count = result.rows[0].count;
      if (count > 0) {
        console.log(`⚠️  ${screen}: Already has ${count} items - BE CAREFUL when migrating!`);
      } else {
        console.log(`✅ ${screen}: No existing content - safe to migrate`);
      }
    }
    
    // Check for content keys that might exist in multiple screens
    console.log('\n\n📋 CONTENT KEYS USED IN MULTIPLE SCREENS:');
    console.log('==========================================\n');
    
    const multiScreenKeys = await pool.query(`
      SELECT 
        content_key,
        COUNT(DISTINCT screen_location) as screen_count,
        string_agg(DISTINCT screen_location, ', ') as screens
      FROM content_items
      WHERE is_active = true
      GROUP BY content_key
      HAVING COUNT(DISTINCT screen_location) > 1
      ORDER BY screen_count DESC, content_key
    `);
    
    if (multiScreenKeys.rows.length > 0) {
      multiScreenKeys.rows.forEach(row => {
        console.log(`Key: ${row.content_key}`);
        console.log(`Used in ${row.screen_count} screens: ${row.screens}\n`);
      });
    } else {
      console.log('✅ No content keys are shared across multiple screens\n');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

// Helper function to suggest safe migration approach
function suggestMigrationApproach() {
  console.log('\n\n📝 MIGRATION RECOMMENDATIONS:');
  console.log('==============================\n');
  console.log('1. For screens with existing content (contacts, about):');
  console.log('   - Review existing content_keys before migration');
  console.log('   - Use INSERT ... ON CONFLICT DO NOTHING to avoid duplicates');
  console.log('   - Consider using different content_keys if needed\n');
  
  console.log('2. For new screens (privacy_policy, terms, refund):');
  console.log('   - Safe to migrate directly');
  console.log('   - Use consistent naming: screen_location matches component name\n');
  
  console.log('3. Always test with:');
  console.log('   - SELECT * FROM content_items WHERE screen_location = \'TARGET\';');
  console.log('   - Before running INSERT statements\n');
}

checkForDuplicates().then(() => {
  suggestMigrationApproach();
});