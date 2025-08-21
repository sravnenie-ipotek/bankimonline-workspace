// Add missing bank_offers_error content key to database
require('dotenv').config();
const { Pool } = require('pg');

// Railway content database connection
const railwayContentPool = new Pool({
  connectionString: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  max: 3
});

async function addBankOffersErrorContent() {
  console.log('📝 ADDING BANK_OFFERS_ERROR CONTENT KEY');
  console.log('=====================================\n');

  try {
    // Insert content item
    console.log('📊 Adding bank_offers_error content item...');
    const contentResult = await railwayContentPool.query(`
      INSERT INTO content_items (
        content_key, screen_location, component_type, 
        category, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (content_key) 
      DO UPDATE SET
        screen_location = EXCLUDED.screen_location,
        component_type = EXCLUDED.component_type,
        category = EXCLUDED.category,
        updated_at = EXCLUDED.updated_at
      RETURNING id
    `, [
      'bank_offers_error',
      'mortgage_step4',
      'error_message',
      'error_handling',
      true,
      new Date(),
      new Date()
    ]);

    const contentItemId = contentResult.rows[0].id;
    console.log(`✅ Content item created/updated with ID: ${contentItemId}`);

    // Add translations
    console.log('\n📊 Adding translations...');
    
    const translations = [
      {
        language: 'en',
        text: 'Error loading bank offers. Please try again later.'
      },
      {
        language: 'he', 
        text: 'שגיאה בטעינת הצעות הבנקים. אנא נסה שוב מאוחר יותר.'
      },
      {
        language: 'ru',
        text: 'Ошибка загрузки банковских предложений. Пожалуйста, попробуйте позже.'
      }
    ];

    for (const trans of translations) {
      await railwayContentPool.query(`
        INSERT INTO content_translations (
          content_item_id, language_code, content_value,
          is_default, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (content_item_id, language_code)
        DO UPDATE SET
          content_value = EXCLUDED.content_value,
          updated_at = EXCLUDED.updated_at
      `, [
        contentItemId,
        trans.language,
        trans.text,
        trans.language === 'en',
        'approved',
        new Date(),
        new Date()
      ]);
      
      console.log(`  ✅ Added ${trans.language} translation: ${trans.text}`);
    }

    // Verify the content
    console.log('\n🔍 Verifying content...');
    const verifyResult = await railwayContentPool.query(`
      SELECT ci.content_key, ct.language_code, ct.content_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key = 'bank_offers_error'
      ORDER BY ct.language_code
    `);

    console.log('\n✅ Verified translations:');
    verifyResult.rows.forEach(row => {
      console.log(`  ${row.language_code}: ${row.content_value}`);
    });

    console.log('\n🎉 Bank offers error content added successfully!');

  } catch (error) {
    console.error('❌ Error adding content:', error.message);
  } finally {
    await railwayContentPool.end();
  }
}

addBankOffersErrorContent();