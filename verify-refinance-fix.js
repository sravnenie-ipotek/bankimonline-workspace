require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function verifyFix() {
  try {
    console.log('🔍 Verifying refinance credit translations fix...\n');

    // Run the exact query from the screenshot
    const query = await pool.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.is_active,
        ci.page_number,
        ci.updated_at,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en,
        ROW_NUMBER() OVER (ORDER BY ci.content_key) as action_number
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru' 
        AND (ct_ru.status = 'approved' OR ct_ru.status IS NULL)
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he' 
        AND (ct_he.status = 'approved' OR ct_he.status IS NULL)
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en' 
        AND (ct_en.status = 'approved' OR ct_en.status IS NULL)
      WHERE ci.screen_location = 'refinance_credit_2'
        AND ci.is_active = true
      ORDER BY ci.content_key
      LIMIT 20
    `);

    console.log('Results (showing first 20 items):\n');
    console.log('Key'.padEnd(40) + ' | ' + 'EN'.padEnd(30) + ' | ' + 'HE'.padEnd(30) + ' | ' + 'RU'.padEnd(30));
    console.log('-'.repeat(140));

    query.rows.forEach(row => {
      const key = row.content_key.padEnd(40);
      const en = (row.title_en || '[null]').substring(0, 28).padEnd(30);
      const he = (row.title_he || '[null]').substring(0, 28).padEnd(30);
      const ru = (row.title_ru || '[null]').substring(0, 28).padEnd(30);
      console.log(`${key} | ${en} | ${he} | ${ru}`);
    });

    // Count statistics
    const stats = await pool.query(`
      SELECT 
        COUNT(DISTINCT ci.id) as total_items,
        COUNT(DISTINCT CASE WHEN ct_en.id IS NOT NULL THEN ci.id END) as with_english,
        COUNT(DISTINCT CASE WHEN ct_he.id IS NOT NULL THEN ci.id END) as with_hebrew,
        COUNT(DISTINCT CASE WHEN ct_ru.id IS NOT NULL THEN ci.id END) as with_russian,
        COUNT(DISTINCT CASE WHEN ct_en.id IS NULL THEN ci.id END) as missing_english,
        COUNT(DISTINCT CASE WHEN ct_he.id IS NULL THEN ci.id END) as missing_hebrew,
        COUNT(DISTINCT CASE WHEN ct_ru.id IS NULL THEN ci.id END) as missing_russian
      FROM content_items ci
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      WHERE ci.screen_location = 'refinance_credit_2'
    `);

    console.log('\n' + '='.repeat(50));
    console.log('📊 TRANSLATION STATISTICS FOR refinance_credit_2');
    console.log('='.repeat(50));
    const s = stats.rows[0];
    console.log(`Total items: ${s.total_items}`);
    console.log(`With English: ${s.with_english} (${Math.round(s.with_english/s.total_items*100)}%)`);
    console.log(`With Hebrew: ${s.with_hebrew} (${Math.round(s.with_hebrew/s.total_items*100)}%)`);
    console.log(`With Russian: ${s.with_russian} (${Math.round(s.with_russian/s.total_items*100)}%)`);
    console.log(`\nMissing English: ${s.missing_english}`);
    console.log(`Missing Hebrew: ${s.missing_hebrew}`);
    console.log(`Missing Russian: ${s.missing_russian}`);

    // Show items still missing translations
    if (s.missing_english > 0) {
      const missing = await pool.query(`
        SELECT ci.content_key
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'en'
        WHERE ci.screen_location = 'refinance_credit_2'
          AND ct.id IS NULL
        LIMIT 10
      `);
      
      console.log('\nItems still missing English translations:');
      missing.rows.forEach(row => console.log(`  - ${row.content_key}`));
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyFix();