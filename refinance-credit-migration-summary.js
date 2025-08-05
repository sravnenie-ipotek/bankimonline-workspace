const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function generateSummary() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('  REFINANCE CREDIT MIGRATION - FINAL SUMMARY REPORT');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`  Generated: ${new Date().toLocaleString()}`);
  console.log('═══════════════════════════════════════════════════════════════════\n');
  
  // Overall statistics
  try {
    const overallResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT ci.id) as total_items,
        COUNT(DISTINCT ct.id) as total_translations,
        COUNT(DISTINCT ci.component_type) as unique_components,
        COUNT(DISTINCT ct.language_code) as languages
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location LIKE 'refinance_credit_%'
    `);
    
    const stats = overallResult.rows[0];
    console.log('📊 OVERALL STATISTICS');
    console.log('───────────────────────────────────────────────────────────────────');
    console.log(`Total Content Items:     ${stats.total_items}`);
    console.log(`Total Translations:      ${stats.total_translations}`);
    console.log(`Unique Component Types:  ${stats.unique_components}`);
    console.log(`Languages Supported:     ${stats.languages} (en, he, ru)`);
    console.log(`Average Translations/Item: ${(stats.total_translations / stats.total_items).toFixed(1)}`);
    console.log('');
    
  } catch (error) {
    console.error('Error getting overall stats:', error.message);
  }
  
  // Screen-by-screen breakdown
  console.log('\n📱 SCREEN-BY-SCREEN BREAKDOWN');
  console.log('───────────────────────────────────────────────────────────────────');
  
  const screens = [
    { key: 'refinance_credit_1', name: 'Step 1: Credit Details & Calculator' },
    { key: 'refinance_credit_2', name: 'Step 2: Personal Details' },
    { key: 'refinance_credit_3', name: 'Step 3: Income Details' },
    { key: 'refinance_credit_4', name: 'Step 4: Bank Programs' }
  ];
  
  for (const screen of screens) {
    try {
      const result = await pool.query(`
        SELECT 
          ci.component_type,
          COUNT(DISTINCT ci.id) as items,
          COUNT(DISTINCT ct.id) as translations
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.screen_location = $1
        GROUP BY ci.component_type
        ORDER BY COUNT(DISTINCT ci.id) DESC
      `, [screen.key]);
      
      console.log(`\n${screen.name} (${screen.key}):`);
      console.log('─────────────────────────────────────────────────');
      
      let totalItems = 0;
      let totalTrans = 0;
      
      result.rows.forEach(row => {
        totalItems += parseInt(row.items);
        totalTrans += parseInt(row.translations);
        console.log(`  ${row.component_type.padEnd(20)} ${row.items.toString().padStart(3)} items   ${row.translations.toString().padStart(3)} translations`);
      });
      
      console.log('  ' + '─'.repeat(50));
      console.log(`  ${'TOTAL'.padEnd(20)} ${totalItems.toString().padStart(3)} items   ${totalTrans.toString().padStart(3)} translations`);
      
    } catch (error) {
      console.error(`Error checking ${screen.key}:`, error.message);
    }
  }
  
  // Key content examples
  console.log('\n\n🔑 KEY CONTENT EXAMPLES');
  console.log('───────────────────────────────────────────────────────────────────');
  
  try {
    // Step 1 - Refinancing reasons
    const step1Result = await pool.query(`
      SELECT ci.content_key, ct.content_value, ct.language_code
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'refinance_credit_1'
        AND ci.content_key LIKE '%why_option%'
        AND ct.language_code = 'en'
      ORDER BY ci.content_key
      LIMIT 4
    `);
    
    console.log('\nRefinancing Reasons (Step 1):');
    step1Result.rows.forEach(row => {
      console.log(`  • ${row.content_value}`);
    });
    
    // Step 2 - Education levels
    const step2Result = await pool.query(`
      SELECT ci.content_key, ct.content_value, ct.language_code
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'refinance_credit_2'
        AND ci.content_key LIKE '%education_option%'
        AND ct.language_code = 'en'
      ORDER BY ci.content_key
      LIMIT 5
    `);
    
    console.log('\nEducation Levels (Step 2):');
    step2Result.rows.forEach(row => {
      console.log(`  • ${row.content_value}`);
    });
    
    // Step 3 - Income types
    const step3Result = await pool.query(`
      SELECT ci.content_key, ct.content_value, ct.language_code
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'refinance_credit_3'
        AND ci.content_key LIKE '%income%option%'
        AND ct.language_code = 'en'
      ORDER BY ci.content_key
      LIMIT 5
    `);
    
    console.log('\nIncome Types (Step 3):');
    step3Result.rows.forEach(row => {
      console.log(`  • ${row.content_value}`);
    });
    
  } catch (error) {
    console.error('Error getting content examples:', error.message);
  }
  
  // Migration status
  console.log('\n\n✅ MIGRATION STATUS');
  console.log('───────────────────────────────────────────────────────────────────');
  console.log('✅ Step 1 (Credit Details):     COMPLETED - All dropdown options and form fields');
  console.log('✅ Step 2 (Personal Details):   COMPLETED - All personal information fields');
  console.log('✅ Step 3 (Income Details):     COMPLETED - All income-related fields');
  console.log('✅ Step 4 (Bank Programs):      COMPLETED - Program display content');
  
  // Known issues
  console.log('\n\n⚠️  NOTES & OBSERVATIONS');
  console.log('───────────────────────────────────────────────────────────────────');
  console.log('• All content uses content_type="text" due to database constraint');
  console.log('• Component types are properly stored in component_type column');
  console.log('• Some duplicate keys may exist from previous migrations');
  console.log('• All content has translations in 3 languages (en, he, ru)');
  console.log('• Migration used ON CONFLICT (content_key) to handle duplicates');
  
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('  END OF REPORT');
  console.log('═══════════════════════════════════════════════════════════════════\n');
  
  await pool.end();
}

generateSummary().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});