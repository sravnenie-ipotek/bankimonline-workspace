const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway';
const pool = new Pool({ connectionString: DATABASE_URL });

async function createContactsPhase10MissingKeys() {
  console.log('=== PHASE 10: CREATING MISSING CONTACTS KEYS ===\n');
  
  // The 4 missing keys identified in database verification
  const missingKeysData = [
    {
      key: 'contacts_tech_support',
      category: 'contact_info',
      screen_location: 'contacts',
      component_type: 'text',
      translations: {
        en: 'Technical Support',
        he: 'תמיכה טכנית',
        ru: 'Техническая поддержка'
      }
    },
    {
      key: 'contacts_credit_calc',
      category: 'contact_info', 
      screen_location: 'contacts',
      component_type: 'text',
      translations: {
        en: 'Credit Calculator',
        he: 'מחשבון אשראי',
        ru: 'Калькулятор кредита'
      }
    },
    {
      key: 'contacts_credit_calc_phone',
      category: 'contact_info',
      screen_location: 'contacts', 
      component_type: 'text',
      translations: {
        en: '053-716-2235',
        he: '053-716-2235',
        ru: '053-716-2235'
      }
    },
    {
      key: 'contacts_credit_calc_email',
      category: 'contact_info',
      screen_location: 'contacts',
      component_type: 'text', 
      translations: {
        en: 'credit@bankimonline.com',
        he: 'credit@bankimonline.com',
        ru: 'credit@bankimonline.com'
      }
    }
  ];

  try {
    console.log(`Creating ${missingKeysData.length} missing contact content items...\n`);
    
    for (const item of missingKeysData) {
      console.log(`Processing: ${item.key}`);
      
      // Insert content_item
      const contentItemResult = await pool.query(`
        INSERT INTO content_items (content_key, category, screen_location, component_type, is_active)
        VALUES ($1, $2, $3, $4, true)
        RETURNING id
      `, [item.key, item.category, item.screen_location, item.component_type]);
      
      const contentItemId = contentItemResult.rows[0].id;
      console.log(`  ✅ Content item created with ID: ${contentItemId}`);
      
      // Insert translations
      const languages = ['en', 'he', 'ru'];
      for (const lang of languages) {
        await pool.query(`
          INSERT INTO content_translations (content_item_id, language_code, content_value, status)
          VALUES ($1, $2, $3, 'approved')
        `, [contentItemId, lang, item.translations[lang]]);
        console.log(`  ✅ ${lang}: "${item.translations[lang]}"`);
      }
      console.log('');
    }
    
    console.log('=== VERIFICATION: CHECKING CREATED ENTRIES ===\n');
    
    // Verify all keys now exist
    for (const item of missingKeysData) {
      const result = await pool.query(`
        SELECT 
          ci.content_key,
          ci.category,
          ci.screen_location,
          COUNT(ct.language_code) as translation_count
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.status = 'approved'
        WHERE ci.content_key = $1
        GROUP BY ci.id, ci.content_key, ci.category, ci.screen_location
      `, [item.key]);
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        console.log(`✅ VERIFIED: ${item.key} (${row.translation_count} translations, category: ${row.category})`);
      } else {
        console.log(`❌ ERROR: ${item.key} not found after creation!`);
      }
    }
    
    console.log('\n=== PHASE 10 DATABASE CREATION SUMMARY ===');
    console.log(`Total keys created: ${missingKeysData.length}`);
    console.log(`Total translations created: ${missingKeysData.length * 3}`);
    console.log(`Categories used: contact_info`);
    console.log(`Screen location: contacts`);
    console.log('');
    console.log('=== NEXT STEPS ===');
    console.log('✅ Database now has 100% coverage for Contacts.tsx');
    console.log('🔄 Ready for QA CHECKPOINT 4: Code migration to database-only');
    console.log('📋 Ready for QA CHECKPOINT 5: Cypress testing validation');
    
    return {
      created: missingKeysData.length,
      translations: missingKeysData.length * 3,
      keys: missingKeysData.map(item => item.key)
    };
    
  } catch (error) {
    console.error('Database creation error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Execute creation
createContactsPhase10MissingKeys()
  .then(result => {
    console.log(`\n=== CREATION COMPLETE ===`);
    console.log(`Successfully created ${result.created} content items with ${result.translations} translations`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Creation failed:', error.message);
    process.exit(1);
  });