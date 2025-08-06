const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function verifyMenuContent() {
  console.log('Verifying sidebar menu content in database...\n');
  
  try {
    // Check if content items exist
    const itemsResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM content_items 
      WHERE content_key LIKE 'sidebar_%'
    `);
    
    console.log(`Total sidebar menu items in database: ${itemsResult.rows[0].count}`);
    
    // Get all menu categories
    console.log('\n=== Menu Categories ===');
    const categoriesResult = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ci.element_order,
        ct_en.translation_text as en_text,
        ct_he.translation_text as he_text,
        ct_ru.translation_text as ru_text
      FROM content_items ci
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en' AND ct_en.field_name = 'text'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he' AND ct_he.field_name = 'text'
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru' AND ct_ru.field_name = 'text'
      WHERE ci.component_type = 'menu_category' 
        AND ci.screen_location = 'sidebar'
      ORDER BY ci.element_order
    `);
    
    categoriesResult.rows.forEach(cat => {
      console.log(`\n${cat.content_key}:`);
      console.log(`  EN: ${cat.en_text}`);
      console.log(`  HE: ${cat.he_text}`);
      console.log(`  RU: ${cat.ru_text}`);
    });
    
    // Get all menu items grouped by category
    console.log('\n=== Menu Items ===');
    
    // Company menu items
    console.log('\nCompany Menu Items:');
    const companyItemsResult = await pool.query(`
      SELECT 
        ci.content_key,
        ci.element_order,
        ct_en.translation_text as en_text,
        ct_he.translation_text as he_text,
        ct_ru.translation_text as ru_text
      FROM content_items ci
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en' AND ct_en.field_name = 'text'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he' AND ct_he.field_name = 'text'
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru' AND ct_ru.field_name = 'text'
      WHERE ci.content_key LIKE 'sidebar_company_%' 
        AND ci.content_key != 'sidebar_company'
        AND ci.screen_location = 'sidebar'
      ORDER BY ci.element_order
    `);
    
    companyItemsResult.rows.forEach(item => {
      console.log(`\n${item.content_key}:`);
      console.log(`  EN: ${item.en_text}`);
      console.log(`  HE: ${item.he_text}`);
      console.log(`  RU: ${item.ru_text}`);
    });
    
    // Business menu items
    console.log('\nBusiness Menu Items:');
    const businessItemsResult = await pool.query(`
      SELECT 
        ci.content_key,
        ci.element_order,
        ct_en.translation_text as en_text,
        ct_he.translation_text as he_text,
        ct_ru.translation_text as ru_text
      FROM content_items ci
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en' AND ct_en.field_name = 'text'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he' AND ct_he.field_name = 'text'
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru' AND ct_ru.field_name = 'text'
      WHERE ci.content_key LIKE 'sidebar_business_%' 
        AND ci.content_key != 'sidebar_business'
        AND ci.screen_location = 'sidebar'
      ORDER BY ci.element_order
    `);
    
    businessItemsResult.rows.forEach(item => {
      console.log(`\n${item.content_key}:`);
      console.log(`  EN: ${item.en_text}`);
      console.log(`  HE: ${item.he_text}`);
      console.log(`  RU: ${item.ru_text}`);
    });
    
    // Check for any missing translations
    console.log('\n=== Checking for Missing Translations ===');
    const missingResult = await pool.query(`
      SELECT 
        ci.content_key,
        COUNT(DISTINCT ct.language_code) as translation_count
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key LIKE 'sidebar_%'
      GROUP BY ci.content_key
      HAVING COUNT(DISTINCT ct.language_code) < 3
    `);
    
    if (missingResult.rows.length > 0) {
      console.log('⚠️  Items with missing translations:');
      missingResult.rows.forEach(item => {
        console.log(`  - ${item.content_key}: ${item.translation_count}/3 languages`);
      });
    } else {
      console.log('✅ All items have translations in all 3 languages!');
    }
    
    // Test the API endpoint format
    console.log('\n=== API Response Format Test ===');
    const apiFormatResult = await pool.query(`
      SELECT 
        ci.content_key,
        ci.screen_location,
        ci.component_type,
        ci.element_order,
        json_object_agg(
          ct.language_code, 
          json_build_object('text', ct.translation_text)
        ) as translations
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key = 'sidebar_company_1'
      GROUP BY ci.id, ci.content_key, ci.screen_location, ci.component_type, ci.element_order
    `);
    
    console.log('Sample API response for sidebar_company_1:');
    console.log(JSON.stringify(apiFormatResult.rows[0], null, 2));
    
  } catch (error) {
    console.error('Verification failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the verification
verifyMenuContent().catch(console.error);