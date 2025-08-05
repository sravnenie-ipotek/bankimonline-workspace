const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verifyMissingContent() {
  try {
    console.log('🔍 VERIFYING MISSING CONTENT FOR STEPS\n');
    console.log('=====================================\n');
    
    // Define all the screen locations we need
    const requiredScreens = [
      // Refinance Mortgage
      { screen: 'refinance_step2', service: 'Refinance Mortgage Step 2' },
      { screen: 'refinance_step3', service: 'Refinance Mortgage Step 3' },
      { screen: 'refinance_step4', service: 'Refinance Mortgage Step 4' },
      
      // Calculate Credit
      { screen: 'calculate_credit_2', service: 'Calculate Credit Step 2' },
      { screen: 'calculate_credit_3', service: 'Calculate Credit Step 3' },
      { screen: 'calculate_credit_4', service: 'Calculate Credit Step 4' },
      
      // Refinance Credit
      { screen: 'refinance_credit_step2', service: 'Refinance Credit Step 2' },
      { screen: 'refinance_credit_step3', service: 'Refinance Credit Step 3' },
      { screen: 'refinance_credit_step4', service: 'Refinance Credit Step 4' }
    ];
    
    console.log('📋 CHECKING SCREEN LOCATIONS:\n');
    
    for (const { screen, service } of requiredScreens) {
      const result = await pool.query(`
        SELECT COUNT(*) as count
        FROM content_items
        WHERE screen_location = $1
      `, [screen]);
      
      const count = result.rows[0].count;
      const status = count > 0 ? '✅' : '❌';
      console.log(`${status} ${service} (${screen}): ${count} items`);
    }
    
    // Check what mortgage steps exist (as reference)
    console.log('\n📋 REFERENCE - MORTGAGE STEPS:\n');
    
    const mortgageScreens = [
      'mortgage_step1',
      'mortgage_step2', 
      'mortgage_step3',
      'mortgage_step4'
    ];
    
    for (const screen of mortgageScreens) {
      const result = await pool.query(`
        SELECT COUNT(*) as count
        FROM content_items
        WHERE screen_location = $1
      `, [screen]);
      
      const count = result.rows[0].count;
      console.log(`✅ ${screen}: ${count} items`);
    }
    
    // Check for specific content keys in step 4 screens
    console.log('\n📋 CHECKING STEP 4 UNIQUE CONTENT:\n');
    
    const step4Screens = [
      'calculate_credit_4',
      'refinance_credit_step4',
      'refinance_step4'
    ];
    
    for (const screen of step4Screens) {
      const result = await pool.query(`
        SELECT content_key
        FROM content_items
        WHERE screen_location = $1
          AND content_key LIKE '%final%'
           OR content_key LIKE '%warning%'
        LIMIT 5
      `, [screen]);
      
      if (result.rows.length > 0) {
        console.log(`✅ ${screen} has unique content:`);
        result.rows.forEach(row => {
          console.log(`   - ${row.content_key}`);
        });
      } else {
        console.log(`❌ ${screen} missing unique content`);
      }
    }
    
    // Check which components are looking for content
    console.log('\n💡 COMPONENTS USING useContentApi:\n');
    
    const contentApiScreens = await pool.query(`
      SELECT DISTINCT screen_location, COUNT(*) as items
      FROM content_items
      WHERE screen_location LIKE '%step%'
         OR screen_location LIKE '%credit%'
         OR screen_location LIKE '%refinance%'
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    console.log('Existing screen locations with content:');
    contentApiScreens.rows.forEach(row => {
      console.log(`  - ${row.screen_location}: ${row.items} items`);
    });
    
    // Summary
    console.log('\n📊 SUMMARY:\n');
    console.log('To complete the migration:');
    console.log('1. Run the migration script: migrate_missing_steps_content.sql');
    console.log('2. This will copy content from mortgage steps to the appropriate screens');
    console.log('3. Step 4 screens will get unique content for their specific services');
    console.log('4. Components should automatically start using the database content');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyMissingContent();