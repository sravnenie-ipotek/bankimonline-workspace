const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL
});

async function checkAllAdditionalIncomeDropdowns() {
  try {
    // Find all additional income related dropdowns and options
    const result = await pool.query(`
      SELECT ci.*, ct.content_value, ct.language_code 
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key LIKE '%additional_income%'
      AND ci.is_active = true
      ORDER BY ci.screen_location, ci.component_type, ci.content_key, ct.language_code
    `);
    
    console.log('All Additional Income Related Items:');
    console.log('====================================');
    
    // Group by screen_location and component_type
    const grouped = {};
    result.rows.forEach(row => {
      const screen = row.screen_location || 'no_screen';
      if (!grouped[screen]) {
        grouped[screen] = {};
      }
      
      const type = row.component_type;
      if (!grouped[screen][type]) {
        grouped[screen][type] = [];
      }
      
      let item = grouped[screen][type].find(i => i.id === row.id);
      if (!item) {
        item = {
          id: row.id,
          content_key: row.content_key,
          translations: {}
        };
        grouped[screen][type].push(item);
      }
      
      if (row.language_code) {
        item.translations[row.language_code] = row.content_value;
      }
    });
    
    // Display results
    Object.entries(grouped).forEach(([screen, types]) => {
      console.log(`\n📍 Screen: ${screen}`);
      console.log('-------------------------');
      
      Object.entries(types).forEach(([type, items]) => {
        console.log(`  ${type.toUpperCase()}:`);
        items.forEach(item => {
          console.log(`    ${item.content_key} (ID: ${item.id})`);
          if (item.translations.en) {
            console.log(`      EN: ${item.translations.en}`);
          }
          if (item.translations.he) {
            console.log(`      HE: ${item.translations.he}`);
          }
        });
      });
    });
    
    // Specifically check for "no additional income" options
    console.log('\n\n🔍 "No Additional Income" Options Found:');
    console.log('=========================================');
    
    const noIncomeOptions = result.rows.filter(row => 
      row.content_key.includes('no_additional_income') ||
      row.content_key.includes('none') ||
      (row.content_value && (
        row.content_value.toLowerCase().includes('no additional') ||
        row.content_value.includes('אין הכנסות') ||
        row.content_value.includes('לא')
      ))
    );
    
    const uniqueNoIncomeOptions = {};
    noIncomeOptions.forEach(row => {
      if (!uniqueNoIncomeOptions[row.id]) {
        uniqueNoIncomeOptions[row.id] = {
          id: row.id,
          content_key: row.content_key,
          screen_location: row.screen_location,
          component_type: row.component_type,
          translations: {}
        };
      }
      if (row.language_code) {
        uniqueNoIncomeOptions[row.id].translations[row.language_code] = row.content_value;
      }
    });
    
    Object.values(uniqueNoIncomeOptions).forEach(option => {
      console.log(`\n${option.content_key} (ID: ${option.id})`);
      console.log(`  Screen: ${option.screen_location}`);
      console.log(`  Type: ${option.component_type}`);
      console.log('  Translations:');
      Object.entries(option.translations).forEach(([lang, value]) => {
        console.log(`    ${lang}: ${value}`);
      });
    });
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await pool.end();
  }
}

checkAllAdditionalIncomeDropdowns();