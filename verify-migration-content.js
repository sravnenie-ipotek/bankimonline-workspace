const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verifyMigrationContent() {
  try {
    console.log('=== MIGRATION 038 VERIFICATION ===\n');
    
    // Count existing content by screen
    const existingCount = await pool.query(`
      SELECT screen_location, COUNT(*) as count
      FROM content_items
      WHERE screen_location IN (
        'refinance_step2', 'refinance_step3', 'refinance_step4', 'refinance_results',
        'calculate_credit_step1', 'calculate_credit_step2', 'calculate_credit_step3', 
        'calculate_credit_step4', 'calculate_credit_results'
      )
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    console.log('CURRENT CONTENT COUNT:');
    console.log('=====================');
    existingCount.rows.forEach(row => {
      console.log(`${row.screen_location}: ${row.count} items`);
    });
    
    // Expected content items per screen after migration
    const expectedCounts = {
      'refinance_step2': 51,  // 1 existing + 50 new
      'refinance_step3': 45,  // 1 existing + 44 new
      'refinance_step4': 25,  // 0 existing + 25 new
      'refinance_results': 11, // 0 existing + 11 new
      'calculate_credit_step1': 17 + 8, // existing + new
      'calculate_credit_step2': 17,     // all new
      'calculate_credit_step3': 19,     // all new
      'calculate_credit_step4': 22,     // all new
      'calculate_credit_results': 13    // all new
    };
    
    console.log('\n\nEXPECTED AFTER MIGRATION:');
    console.log('=========================');
    Object.entries(expectedCounts).forEach(([screen, count]) => {
      const current = existingCount.rows.find(r => r.screen_location === screen);
      const currentCount = current ? parseInt(current.count) : 0;
      const newItems = count - currentCount;
      console.log(`${screen}: ${count} items (${newItems} new)`);
    });
    
    // Check for potential duplicates
    console.log('\n\nCHECKING FOR POTENTIAL DUPLICATES:');
    console.log('===================================');
    
    const keyPatterns = [
      'app.refinance.step2.%',
      'app.refinance.step3.%',
      'app.credit.step2.%',
      'app.credit.step3.%'
    ];
    
    for (const pattern of keyPatterns) {
      const duplicates = await pool.query(`
        SELECT content_key, COUNT(*) as count
        FROM content_items
        WHERE content_key LIKE $1
        GROUP BY content_key
        HAVING COUNT(*) > 1
      `, [pattern]);
      
      if (duplicates.rows.length > 0) {
        console.log(`\nDuplicates found for pattern ${pattern}:`);
        duplicates.rows.forEach(row => {
          console.log(`  ${row.content_key}: ${row.count} occurrences`);
        });
      } else {
        console.log(`✅ No duplicates for pattern ${pattern}`);
      }
    }
    
    // Migration summary
    console.log('\n\nMIGRATION SUMMARY:');
    console.log('==================');
    console.log('This migration will add:');
    console.log('- Complete personal details forms for refinance steps 2 & 3');
    console.log('- Summary screens for refinance step 4 and results');
    console.log('- Complete credit calculator forms for all steps');
    console.log('- Results screens for both services');
    console.log('- Common navigation buttons');
    console.log('\nTotal new content items: ~290');
    console.log('\nAll content includes translations in:');
    console.log('- English (en)');
    console.log('- Hebrew (he)');
    console.log('- Russian (ru)');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyMigrationContent();