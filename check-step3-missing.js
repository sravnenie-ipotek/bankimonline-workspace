const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.CONTENT_DATABASE_URL });

async function checkStep3Missing() {
  try {
    // Check what's in calculate_credit_3 sub-sections
    const step3Content = await pool.query(`
      SELECT screen_location, content_key, component_type
      FROM content_items 
      WHERE screen_location LIKE 'calculate_credit_3%'
      ORDER BY screen_location, content_key
    `);
    
    console.log('📋 Current Step 3 Content in Database:');
    console.log('======================================');
    
    let currentScreen = '';
    step3Content.rows.forEach(row => {
      if (row.screen_location !== currentScreen) {
        console.log(`\n🔸 ${row.screen_location}:`);
        currentScreen = row.screen_location;
      }
      console.log(`  - ${row.content_key} [${row.component_type}]`);
    });
    
    // List of keys we expect in Step 3 based on our migration
    const expectedStep3Keys = [
      'calculate_credit_step3_title',
      'add_place_to_work',
      'add_additional_source_of_income',
      'add_obligation',
      'add_borrower',
      'source_of_income',
      'additional_source_of_income',
      'obligation',
      'borrower'
    ];
    
    // Check which keys exist anywhere in step 3
    const existingKeys = await pool.query(`
      SELECT DISTINCT content_key
      FROM content_items 
      WHERE screen_location LIKE 'calculate_credit_3%'
      AND content_key = ANY($1)
    `, [expectedStep3Keys]);
    
    const existingKeysList = existingKeys.rows.map(r => r.content_key);
    const missingKeys = expectedStep3Keys.filter(key => !existingKeysList.includes(key));
    
    console.log('\n\n🔍 Step 3 Migration Analysis:');
    console.log('=============================');
    console.log('\n✅ Keys already in database:', existingKeysList.length ? existingKeysList.join(', ') : 'None');
    console.log('\n❌ Missing keys:', missingKeys.length ? missingKeys.join(', ') : 'None');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

checkStep3Missing();