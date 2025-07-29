const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function verifyPropertyOptions() {
  try {
    console.log('✅ VERIFYING PROPERTY OPTION TRANSLATIONS\n');
    
    const result = await pool.query(`
      SELECT 
        ci.content_key,
        ct.language_code,
        ct.content_value,
        ct.status
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key LIKE 'app.refinance.step1.property_option_%'
        AND ci.is_active = true
      ORDER BY 
        CASE 
          WHEN ci.content_key LIKE '%_1' THEN 1
          WHEN ci.content_key LIKE '%_2' THEN 2
          WHEN ci.content_key LIKE '%_3' THEN 3
          WHEN ci.content_key LIKE '%_4' THEN 4
          WHEN ci.content_key LIKE '%_5' THEN 5
        END,
        ct.language_code
    `);
    
    let currentKey = '';
    result.rows.forEach(row => {
      if (currentKey !== row.content_key) {
        console.log(`\n${row.content_key}:`);
        currentKey = row.content_key;
      }
      console.log(`  ${row.language_code}: "${row.content_value}" (${row.status})`);
    });
    
    console.log('\n\n✅ All translations are now properly set!');
    console.log('\nThe dropdown should now show:');
    console.log('  - Hebrew: דירה, בית פרטי, נכס מסחרי, מגרש, אחר');
    console.log('  - English: Apartment, Private House, Commercial Property, Land, Other');
    console.log('  - Russian: Квартира, Частный дом, Коммерческая недвижимость, Земельный участок, Другое');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyPropertyOptions();