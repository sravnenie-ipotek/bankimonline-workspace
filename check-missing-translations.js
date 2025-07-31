const pg = require('pg');
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:DbERdyUMwXKSvjQArxCjzCbxKJCRBgQT@autorack.proxy.rlwy.net:26213/railway',
  ssl: { rejectUnauthorized: false }
});

async function checkMissingTranslations() {
  try {
    // First check if we're looking at the right structure
    const structureQuery = `
      SELECT 
        screen_location,
        language_code,
        COUNT(*) as count
      FROM content_items
      WHERE screen_location IN (
        'cooperation', 'mortgage_step3', 'mortgage_step4',
        'refinance_step1', 'refinance_step2', 'refinance_step3', 'refinance_step4'
      )
      AND component_type IN ('dropdown', 'option', 'placeholder', 'label')
      GROUP BY screen_location, language_code
      ORDER BY screen_location, language_code
    `;
    
    const structureResult = await pool.query(structureQuery);
    
    console.log('\nContent Structure by Screen and Language:');
    console.log('=========================================');
    
    const screenData = {};
    structureResult.rows.forEach(row => {
      if (!screenData[row.screen_location]) {
        screenData[row.screen_location] = {};
      }
      screenData[row.screen_location][row.language_code] = parseInt(row.count);
    });
    
    Object.entries(screenData).forEach(([screen, langs]) => {
      console.log(`\n${screen}:`);
      console.log(`  EN: ${langs.en || 0}`);
      console.log(`  HE: ${langs.he || 0}`);
      console.log(`  RU: ${langs.ru || 0}`);
      
      const enCount = langs.en || 0;
      const heCount = langs.he || 0;
      const ruCount = langs.ru || 0;
      
      if (heCount < enCount) {
        console.log(`  ⚠️  Missing ${enCount - heCount} Hebrew translations`);
      }
      if (ruCount < enCount) {
        console.log(`  ⚠️  Missing ${enCount - ruCount} Russian translations`);
      }
    });
    
    // Now get specific items that need translation
    const missingQuery = `
      SELECT DISTINCT
        en.screen_location,
        en.content_key,
        en.component_type,
        en.value as en_value,
        he.value as he_value,
        ru.value as ru_value
      FROM content_items en
      LEFT JOIN content_items he ON en.content_key = he.content_key 
        AND he.language_code = 'he' AND he.screen_location = en.screen_location
      LEFT JOIN content_items ru ON en.content_key = ru.content_key 
        AND ru.language_code = 'ru' AND ru.screen_location = en.screen_location
      WHERE en.screen_location IN (
        'cooperation', 'mortgage_step3', 'mortgage_step4',
        'refinance_step1', 'refinance_step2', 'refinance_step3', 'refinance_step4'
      )
      AND en.component_type IN ('dropdown', 'option', 'placeholder', 'label')
      AND en.language_code = 'en'
      AND (he.value IS NULL OR ru.value IS NULL)
      ORDER BY en.screen_location, en.content_key
      LIMIT 20
    `;
    
    const missingResult = await pool.query(missingQuery);
    
    console.log('\n\nFirst 20 Items Needing Translation:');
    console.log('====================================');
    
    missingResult.rows.forEach(row => {
      const needs = [];
      if (!row.he_value) needs.push('HE');
      if (!row.ru_value) needs.push('RU');
      
      console.log(`\n${row.screen_location} - ${row.content_key} (${row.component_type}):`);
      console.log(`  EN: "${row.en_value}"`);
      console.log(`  Needs: ${needs.join(', ')}`);
    });
    
    console.log(`\n\nTotal items shown: ${missingResult.rows.length} of possibly more...`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkMissingTranslations();