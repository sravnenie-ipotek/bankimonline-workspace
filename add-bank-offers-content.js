const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/bankdev'
})

const bankOffersContent = [
  {
    content_key: 'bank_offers_credit_register',
    content_type: 'text',
    category: 'bank_offers',
    screen_location: 'calculate_credit_4',
    component_type: 'info_title',
    description: 'Credit application registration button text',
    translations: {
      en: 'Credit application registration',
      he: 'רישום בקשת אשראי',
      ru: 'Регистрация заявки на кредит'
    }
  },
  {
    content_key: 'mortgage_register',
    content_type: 'text',
    category: 'bank_offers',
    screen_location: 'calculate_mortgage_4',
    component_type: 'info_title',
    description: 'Mortgage application registration button text',
    translations: {
      en: 'Mortgage application registration',
      he: 'רישום בקשת משכנתא',
      ru: 'Регистрация заявки на ипотеку'
    }
  },
  {
    content_key: 'no_bank_offers_available',
    content_type: 'text',
    category: 'bank_offers',
    screen_location: 'bank_offers',
    component_type: 'heading',
    description: 'No bank offers message title',
    translations: {
      en: 'No Bank Offers Available',
      he: 'לא נמצאו הצעות בנק',
      ru: 'Предложения банков не найдены'
    }
  },
  {
    content_key: 'no_offers_message',
    content_type: 'text',
    category: 'bank_offers',
    screen_location: 'bank_offers',
    component_type: 'message',
    description: 'No bank offers explanation message',
    translations: {
      en: 'No bank offers match your profile. Try adjusting your parameters.',
      he: 'לא נמצאו הצעות בנק המתאימות לפרופיל שלך. נסה לעדכן את הפרמטרים.',
      ru: 'Не найдены предложения банков, соответствующие вашему профилю. Попробуйте изменить параметры.'
    }
  },
  {
    content_key: 'bank_name',
    content_type: 'text',
    category: 'bank_offers',
    screen_location: 'bank_offers',
    component_type: 'label',
    description: 'Generic bank name fallback',
    translations: {
      en: 'Bank',
      he: 'בנק',
      ru: 'Банк'
    }
  }
]

async function addBankOffersContent() {
  try {
    console.log('🚀 Adding Bank Offers content to database...')
    
    for (const content of bankOffersContent) {
      console.log(`📝 Adding content: ${content.content_key}`)
      
      // Insert content item
      const contentItemResult = await pool.query(`
        INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        ON CONFLICT (content_key) DO UPDATE SET
          content_type = EXCLUDED.content_type,
          category = EXCLUDED.category,
          screen_location = EXCLUDED.screen_location,
          component_type = EXCLUDED.component_type,
          description = EXCLUDED.description,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `, [content.content_key, content.content_type, content.category, content.screen_location, content.component_type, content.description])
      
      const contentItemId = contentItemResult.rows[0].id
      
      // Insert translations
      for (const [lang, text] of Object.entries(content.translations)) {
        await pool.query(`
          INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status)
          VALUES ($1, $2, $3, $4, 'approved')
          ON CONFLICT (content_item_id, language_code) DO UPDATE SET
            content_value = EXCLUDED.content_value,
            status = 'approved',
            updated_at = CURRENT_TIMESTAMP
        `, [contentItemId, lang, text, lang === 'en'])
        
        console.log(`  ✅ ${lang}: ${text}`)
      }
    }
    
    console.log('🎉 Bank Offers content added successfully!')
    
    // Verify the content
    console.log('\\n🔍 Verification:')
    const verification = await pool.query(`
      SELECT ci.content_key, ct.language_code, ct.content_value
      FROM content_items ci 
      JOIN content_translations ct ON ci.id = ct.content_item_id 
      WHERE ci.content_key = 'bank_offers_credit_register'
      ORDER BY ct.language_code
    `)
    
    verification.rows.forEach(row => {
      console.log(`  ${row.language_code}: ${row.content_value}`)
    })
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
  } finally {
    await pool.end()
  }
}

addBankOffersContent()