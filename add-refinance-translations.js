require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

// Load translation files
const enTranslations = JSON.parse(fs.readFileSync(path.join(__dirname, 'translations/en.json'), 'utf8'));
const heTranslations = JSON.parse(fs.readFileSync(path.join(__dirname, 'translations/he.json'), 'utf8'));
const ruTranslations = JSON.parse(fs.readFileSync(path.join(__dirname, 'translations/ru.json'), 'utf8'));

async function addMissingTranslations() {
  try {
    console.log('🔧 Adding missing translations for refinance credit...\n');

    // Get all content items without translations
    const missingItems = await pool.query(`
      SELECT DISTINCT ci.id, ci.content_key, ci.screen_location
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location LIKE 'refinance_credit_%'
        AND ct.id IS NULL
      ORDER BY ci.screen_location, ci.content_key
    `);

    console.log(`Found ${missingItems.rows.length} items without translations\n`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const item of missingItems.rows) {
      const { id, content_key, screen_location } = item;
      
      // Try to find translations in JSON files
      const enValue = enTranslations[content_key];
      const heValue = heTranslations[content_key];
      const ruValue = ruTranslations[content_key];

      if (!enValue) {
        console.log(`⚠️  No English translation found for: ${content_key}`);
        skippedCount++;
        continue;
      }

      console.log(`\n📝 Adding translations for: ${content_key}`);
      console.log(`   Screen: ${screen_location}`);

      // Begin transaction
      await pool.query('BEGIN');

      try {
        // Add English translation
        await pool.query(`
          INSERT INTO content_translations (content_item_id, language_code, content_value, status, is_default, created_at)
          VALUES ($1, 'en', $2, 'approved', true, NOW())
          ON CONFLICT (content_item_id, language_code) DO UPDATE
          SET content_value = $2, status = 'approved', updated_at = NOW()
        `, [id, enValue]);
        console.log(`   ✅ EN: "${enValue.substring(0, 50)}..."`);

        // Add Hebrew translation
        const hebrewValue = heValue || enValue; // Fallback to English if no Hebrew
        await pool.query(`
          INSERT INTO content_translations (content_item_id, language_code, content_value, status, is_default, created_at)
          VALUES ($1, 'he', $2, 'approved', false, NOW())
          ON CONFLICT (content_item_id, language_code) DO UPDATE
          SET content_value = $2, status = 'approved', updated_at = NOW()
        `, [id, hebrewValue]);
        console.log(`   ✅ HE: "${hebrewValue.substring(0, 50)}..."`);

        // Add Russian translation
        const russianValue = ruValue || enValue; // Fallback to English if no Russian
        await pool.query(`
          INSERT INTO content_translations (content_item_id, language_code, content_value, status, is_default, created_at)
          VALUES ($1, 'ru', $2, 'approved', false, NOW())
          ON CONFLICT (content_item_id, language_code) DO UPDATE
          SET content_value = $2, status = 'approved', updated_at = NOW()
        `, [id, russianValue]);
        console.log(`   ✅ RU: "${russianValue.substring(0, 50)}..."`);

        await pool.query('COMMIT');
        addedCount++;

      } catch (error) {
        await pool.query('ROLLBACK');
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Added translations for ${addedCount} items`);
    console.log(`⚠️  Skipped ${skippedCount} items (no English translation found)`);

    // Verify the fix
    console.log('\n🔍 Verifying the fix...');
    const verifyQuery = await pool.query(`
      SELECT 
        ci.content_key,
        ct_en.content_value as title_en,
        ct_he.content_value as title_he,
        ct_ru.content_value as title_ru
      FROM content_items ci
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      WHERE ci.screen_location = 'refinance_credit_2'
      ORDER BY ci.content_key
      LIMIT 5
    `);

    console.log('\nSample results after fix:');
    verifyQuery.rows.forEach(row => {
      console.log(`\n${row.content_key}:`);
      console.log(`  EN: ${row.title_en ? row.title_en.substring(0, 40) + '...' : '[null]'}`);
      console.log(`  HE: ${row.title_he ? row.title_he.substring(0, 40) + '...' : '[null]'}`);
      console.log(`  RU: ${row.title_ru ? row.title_ru.substring(0, 40) + '...' : '[null]'}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

addMissingTranslations();