const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkExistingContent() {
  try {
    // Check refinance_step2 and refinance_step3 content
    console.log('=== CHECKING EXISTING REFINANCE CONTENT ===\n');
    
    const refinanceContent = await pool.query(`
      SELECT ci.screen_location, ci.content_key, ci.component_type, ci.category,
             ct_en.content_value as en,
             ct_he.content_value as he,
             ct_ru.content_value as ru
      FROM content_items ci
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      WHERE ci.screen_location IN ('refinance_step2', 'refinance_step3')
      ORDER BY ci.screen_location, ci.content_key
    `);
    
    refinanceContent.rows.forEach(row => {
      console.log(`${row.screen_location} - ${row.content_key}:`);
      console.log(`  Type: ${row.component_type}, Category: ${row.category}`);
      console.log(`  EN: ${row.en || 'MISSING'}`);
      console.log(`  HE: ${row.he || 'MISSING'}`);
      console.log(`  RU: ${row.ru || 'MISSING'}`);
      console.log('');
    });
    
    // Check if these are just headers
    console.log('\n=== CHECKING CALCULATE_CREDIT EXISTING CONTENT ===\n');
    
    const creditContent = await pool.query(`
      SELECT ci.screen_location, ci.content_key, ci.component_type, ci.category,
             ct_en.content_value as en
      FROM content_items ci
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      WHERE ci.screen_location LIKE 'calculate_credit_%'
      ORDER BY ci.screen_location, ci.content_key
      LIMIT 10
    `);
    
    creditContent.rows.forEach(row => {
      console.log(`${row.screen_location} - ${row.content_key} (${row.component_type}): ${row.en || 'MISSING'}`);
    });
    
    // Check for any shared content
    console.log('\n=== CHECKING FOR SHARED CONTENT PATTERNS ===\n');
    
    const sharedContent = await pool.query(`
      SELECT content_key, COUNT(DISTINCT screen_location) as screen_count,
             array_agg(DISTINCT screen_location) as screens
      FROM content_items
      WHERE screen_location LIKE 'mortgage_%' 
         OR screen_location LIKE 'refinance_%'
         OR screen_location LIKE 'calculate_credit_%'
      GROUP BY content_key
      HAVING COUNT(DISTINCT screen_location) > 1
      ORDER BY screen_count DESC
      LIMIT 5
    `);
    
    if (sharedContent.rows.length > 0) {
      console.log('Found shared content keys:');
      sharedContent.rows.forEach(row => {
        console.log(`${row.content_key} - used in ${row.screen_count} screens:`, row.screens);
      });
    } else {
      console.log('No shared content keys found - each screen has unique keys');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkExistingContent();