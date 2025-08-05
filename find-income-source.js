const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function findIncomeSource() {
  try {
    console.log('🔍 SEARCHING FOR "Основной источник дохода" (Main source of income)\n');
    
    // Search in content_translations for Russian text
    const russianSearch = await pool.query(`
      SELECT 
        ct.content_value,
        ct.language_code,
        ci.screen_location,
        ci.content_key,
        ci.component_type
      FROM content_translations ct
      JOIN content_items ci ON ci.id = ct.content_item_id
      WHERE ct.content_value LIKE '%Основной источник дохода%'
         OR ct.content_value LIKE '%источник дохода%'
         OR ci.content_key LIKE '%income_source%'
         OR ci.content_key LIKE '%main_source%'
      ORDER BY ci.screen_location, ct.language_code
    `);
    
    if (russianSearch.rows.length > 0) {
      console.log('✅ FOUND INCOME SOURCE CONTENT:');
      console.log('================================\n');
      russianSearch.rows.forEach(row => {
        console.log(`Screen: ${row.screen_location}`);
        console.log(`Key: ${row.content_key}`);
        console.log(`Type: ${row.component_type}`);
        console.log(`Language: ${row.language_code}`);
        console.log(`Value: "${row.content_value}"\n`);
      });
    } else {
      console.log('❌ NOT FOUND in database\n');
    }
    
    // Search for dropdown-action-1 pattern
    console.log('🔍 SEARCHING FOR "dropdown-action-1" PATTERN:\n');
    
    const dropdownSearch = await pool.query(`
      SELECT 
        ci.screen_location,
        ci.content_key,
        ci.component_type,
        ct.language_code,
        ct.content_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key LIKE '%dropdown%'
         OR ci.category = 'dropdown'
         OR (ci.component_type = 'option' AND ci.content_key LIKE '%action%')
      LIMIT 10
    `);
    
    if (dropdownSearch.rows.length > 0) {
      console.log('Found dropdown patterns:');
      dropdownSearch.rows.forEach(row => {
        console.log(`  ${row.screen_location} > ${row.content_key}: "${row.content_value}" (${row.language_code})`);
      });
    }
    
    // Check translation files for this content
    console.log('\n\n📋 CHECKING TRANSLATION FILES:\n');
    console.log('This content might still be in the JSON translation files');
    console.log('and not yet migrated to the database.');
    
    // Search for income-related content in any screen
    console.log('\n🔍 SEARCHING FOR ANY INCOME-RELATED CONTENT:\n');
    
    const incomeSearch = await pool.query(`
      SELECT DISTINCT
        ci.screen_location,
        ci.content_key,
        ci.component_type,
        ct_en.content_value as english_value,
        ct_ru.content_value as russian_value
      FROM content_items ci
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      WHERE ci.content_key LIKE '%income%'
         OR ct_en.content_value LIKE '%income%'
         OR ct_ru.content_value LIKE '%доход%'
      ORDER BY ci.screen_location, ci.content_key
      LIMIT 20
    `);
    
    if (incomeSearch.rows.length > 0) {
      console.log('✅ FOUND INCOME-RELATED CONTENT:');
      console.log('=================================\n');
      incomeSearch.rows.forEach(row => {
        console.log(`${row.screen_location} > ${row.content_key} (${row.component_type}):`);
        if (row.english_value) console.log(`  EN: "${row.english_value}"`);
        if (row.russian_value) console.log(`  RU: "${row.russian_value}"`);
        console.log();
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

findIncomeSource();
