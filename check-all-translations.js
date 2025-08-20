const { Pool } = require('pg');
require('dotenv').config();

// Main database connection
const mainPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Content database connection (if different)
const contentPool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTranslations() {
  try {
    console.log('\n🔍 CHECKING DATABASE FOR MISSING TRANSLATIONS\n');
    console.log('=' .repeat(60));
    
    // Keys from refinance mortgage screenshot
    const refinanceKeys = [
      'app.refinance.step1.title',
      'app.refinance.step1.property_value_label',
      'app.refinance.step1.balance_label', 
      'app.refinance.step1.why_label',
      'app.refinance.step1.registered_label',
      'app.refinance.step1.current_bank_label',
      'app.refinance.step1.property_type_label',
      'app.refinance.step1.start_date_label'
    ];

    // Keys from mortgage calculator (from console logs)
    const mortgageKeys = [
      'mortgage_step1.header.title',
      'mortgage_step1.field.property_price',
      'mortgage_step1.field.search_ph',
      'mortgage_step1.field.nothing_found',
      'mortgage_step1.field.initial_fee',
      'mortgage_step1.field.initial_payment_tooltip',
      'calculate_mortgage_first',
      'calculate_mortgage_first_option_1',
      'calculate_mortgage_first_option_2',
      'calculate_mortgage_property_ownership',
      'calculate_mortgage_property_ownership_option_1',
      'calculate_mortgage_property_ownership_option_2',
      'calculate_mortgage_property_ownership_option_3'
    ];

    console.log('📊 CHECKING MAIN DATABASE (maglev)...\n');
    
    // Check content_items table structure
    const tableCheck = await mainPool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'content_items'
      ORDER BY ordinal_position
      LIMIT 10
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ content_items table exists with columns:');
      tableCheck.rows.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('❌ content_items table not found in main database');
    }

    // Check for refinance translations
    console.log('\n🔍 REFINANCE MORTGAGE TRANSLATIONS:');
    for (const key of refinanceKeys) {
      const result = await mainPool.query(
        `SELECT ci.content_key, ct.language_code, ct.content_value
         FROM content_items ci
         LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
         WHERE ci.content_key = $1`,
        [key]
      );
      
      if (result.rows.length === 0) {
        console.log(`   ❌ ${key} - NOT FOUND`);
      } else {
        console.log(`   ✅ ${key} - Found ${result.rows.length} translations`);
      }
    }

    // Check for mortgage calculator translations
    console.log('\n🔍 MORTGAGE CALCULATOR TRANSLATIONS:');
    for (const key of mortgageKeys) {
      const result = await mainPool.query(
        `SELECT ci.content_key, ct.language_code, ct.content_value
         FROM content_items ci
         LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
         WHERE ci.content_key = $1`,
        [key]
      );
      
      if (result.rows.length === 0) {
        console.log(`   ❌ ${key} - NOT FOUND`);
      } else {
        const langs = result.rows.map(r => r.language_code).filter(Boolean).join(', ');
        console.log(`   ✅ ${key} - Found: ${langs || 'no translations'}`);
      }
    }

    // Check dropdown_configs table
    console.log('\n🔍 DROPDOWN CONFIGURATIONS:');
    const dropdownCheck = await mainPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'dropdown_configs'
    `);
    
    if (dropdownCheck.rows.length > 0) {
      // Check table structure
      const dropdownCols = await mainPool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'dropdown_configs'
        ORDER BY ordinal_position
      `);
      
      console.log('✅ dropdown_configs table exists with columns:');
      dropdownCols.rows.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})`);
      });
      
      // Check for specific dropdowns
      const dropdownData = await mainPool.query(`
        SELECT field_name, screen_location 
        FROM dropdown_configs 
        WHERE screen_location LIKE '%mortgage%' OR screen_location LIKE '%refinance%'
        LIMIT 10
      `);
      
      if (dropdownData.rows.length > 0) {
        console.log('\n📋 Found dropdown configs:');
        dropdownData.rows.forEach(row => {
          console.log(`   - ${row.screen_location}/${row.field_name}`);
        });
      } else {
        console.log('❌ No dropdown configs found for mortgage/refinance');
      }
    } else {
      console.log('❌ dropdown_configs table does not exist');
    }

    // Check if using content database
    if (process.env.CONTENT_DATABASE_URL && process.env.CONTENT_DATABASE_URL !== process.env.DATABASE_URL) {
      console.log('\n📊 CHECKING CONTENT DATABASE (shortline)...\n');
      
      // Check content database
      const contentTableCheck = await contentPool.query(`
        SELECT COUNT(*) as count 
        FROM content_items 
        WHERE content_key LIKE 'app.refinance%' 
           OR content_key LIKE 'mortgage_step1%'
           OR content_key LIKE 'calculate_mortgage%'
      `);
      
      console.log(`Found ${contentTableCheck.rows[0].count} relevant items in content database`);
    }

    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 SUMMARY:');
    console.log('- Refinance mortgage translations are MISSING');
    console.log('- Mortgage calculator translations need to be checked');
    console.log('- Dropdown API is returning 500 error');
    console.log('- Database migrations need to be applied');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Connection string used:', process.env.DATABASE_URL ? 'Yes' : 'No');
  } finally {
    await mainPool.end();
    await contentPool.end();
  }
}

checkTranslations();