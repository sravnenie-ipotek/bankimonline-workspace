require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function addMissingDropdownTranslations() {
  try {
    console.log('🔧 Adding missing dropdown translations...\n');

    // Define missing translations for dropdowns
    const missingTranslations = [
      // Borrowers placeholder and options
      { key: 'calculate_mortgage_borrowers_ph', en: 'Select number of borrowers', he: 'בחר מספר לווים', ru: 'Выберите количество заемщиков' },
      { key: 'calculate_mortgage_borrowers_option_1', en: '1 borrower', he: 'לווה אחד', ru: '1 заемщик' },
      { key: 'calculate_mortgage_borrowers_option_2', en: '2 borrowers', he: '2 לווים', ru: '2 заемщика' },
      { key: 'calculate_mortgage_borrowers_option_3', en: '3 borrowers', he: '3 לווים', ru: '3 заемщика' },
      { key: 'calculate_mortgage_borrowers_option_4', en: '4 borrowers', he: '4 לווים', ru: '4 заемщика' },
      { key: 'calculate_mortgage_borrowers_option_5', en: '5 or more borrowers', he: '5 לווים או יותר', ru: '5 или более заемщиков' },
      
      // Children placeholder and options
      { key: 'calculate_mortgage_children18_ph', en: 'Select number of children', he: 'בחר מספר ילדים', ru: 'Выберите количество детей' },
      { key: 'calculate_mortgage_children18_option_1', en: 'No children', he: 'אין ילדים', ru: 'Нет детей' },
      { key: 'calculate_mortgage_children18_option_2', en: '1 child', he: 'ילד אחד', ru: '1 ребенок' },
      { key: 'calculate_mortgage_children18_option_3', en: '2 children', he: '2 ילדים', ru: '2 детей' },
      { key: 'calculate_mortgage_children18_option_4', en: '3 children', he: '3 ילדים', ru: '3 детей' },
      { key: 'calculate_mortgage_children18_option_5', en: '4 or more children', he: '4 ילדים או יותר', ru: '4 или более детей' }
    ];

    let addedCount = 0;

    for (const trans of missingTranslations) {
      // Get the content item ID
      const itemResult = await pool.query(
        'SELECT id FROM content_items WHERE content_key = $1 AND screen_location = $2',
        [trans.key, 'refinance_credit_2']
      );

      if (itemResult.rows.length === 0) {
        console.log(`❌ Content item not found: ${trans.key}`);
        continue;
      }

      const itemId = itemResult.rows[0].id;

      try {
        // Add translations for all three languages
        for (const lang of ['en', 'he', 'ru']) {
          await pool.query(`
            INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at)
            VALUES ($1, $2, $3, 'approved', NOW())
            ON CONFLICT (content_item_id, language_code) DO UPDATE
            SET content_value = $3, status = 'approved', updated_at = NOW()
          `, [itemId, lang, trans[lang]]);
        }
        
        console.log(`✅ Added translations for: ${trans.key}`);
        addedCount++;
      } catch (error) {
        console.log(`❌ Error adding ${trans.key}: ${error.message}`);
      }
    }

    console.log(`\n✅ Successfully added translations for ${addedCount} items`);

    // Final verification
    console.log('\n🔍 Final verification...');
    const stats = await pool.query(`
      SELECT 
        COUNT(DISTINCT ci.id) as total_items,
        COUNT(DISTINCT CASE WHEN ct_en.id IS NOT NULL THEN ci.id END) as with_english,
        COUNT(DISTINCT CASE WHEN ct_he.id IS NOT NULL THEN ci.id END) as with_hebrew,
        COUNT(DISTINCT CASE WHEN ct_ru.id IS NOT NULL THEN ci.id END) as with_russian
      FROM content_items ci
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      WHERE ci.screen_location = 'refinance_credit_2'
    `);

    const s = stats.rows[0];
    console.log(`\nTotal items: ${s.total_items}`);
    console.log(`With translations: ${s.with_english} (${Math.round(s.with_english/s.total_items*100)}%)`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

addMissingDropdownTranslations();