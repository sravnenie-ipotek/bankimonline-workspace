const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL
});

async function checkMortgageStep3AdditionalIncome() {
  try {
    // First, find the main dropdown container
    const dropdownResult = await pool.query(`
      SELECT ci.*, ct.content_value, ct.language_code 
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key = 'additional_income'
      AND ci.screen_location = 'mortgage_step3'
      AND ci.component_type = 'dropdown'
      AND ci.is_active = true
    `);
    
    console.log('Main dropdown container:', dropdownResult.rows);
    
    // Now find all options for this dropdown
    const optionsResult = await pool.query(`
      SELECT ci.*, ct.content_value, ct.language_code 
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key LIKE 'additional_income_option_%'
      AND ci.screen_location = 'mortgage_step3'
      AND ci.component_type = 'option'
      AND ci.is_active = true
      ORDER BY ci.content_key, ct.language_code
    `);
    
    console.log('\nAdditional Income Options for mortgage_step3:');
    console.log('=============================================');
    
    const groupedOptions = {};
    optionsResult.rows.forEach(row => {
      if (!groupedOptions[row.content_key]) {
        groupedOptions[row.content_key] = {
          id: row.id,
          content_key: row.content_key,
          translations: {}
        };
      }
      if (row.language_code) {
        groupedOptions[row.content_key].translations[row.language_code] = row.content_value;
      }
    });
    
    Object.values(groupedOptions).forEach(option => {
      console.log(`\nOption: ${option.content_key} (ID: ${option.id})`);
      console.log('Translations:');
      Object.entries(option.translations).forEach(([lang, value]) => {
        console.log(`  ${lang}: ${value}`);
      });
    });
    
    // Check if "no additional income" option exists
    const noIncomeOption = Object.values(groupedOptions).find(opt => 
      opt.content_key.includes('no_additional_income') || 
      opt.content_key.includes('option_1') ||
      (opt.translations.en && opt.translations.en.toLowerCase().includes('no')) ||
      (opt.translations.he && opt.translations.he.includes('אין'))
    );
    
    if (noIncomeOption) {
      console.log('\n✅ Found "No additional income" option:', noIncomeOption.content_key);
    } else {
      console.log('\n❌ No "No additional income" option found!');
    }
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await pool.end();
  }
}

checkMortgageStep3AdditionalIncome();