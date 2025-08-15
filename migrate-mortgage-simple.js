/**
 * Simple migration for mortgage_step3 content with compatible schema
 */

const { Pool } = require('pg');

const sourceDb = new Pool({
  connectionString: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway'
});

const targetDb = new Pool({
  connectionString: 'postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway'
});

async function simpleMigration() {
  try {
    console.log('=== Simple Migration for mortgage_step3 ===');
    
    // Get key content items from source
    const sourceContent = await sourceDb.query(`
      SELECT DISTINCT
        content_key,
        screen_location,
        component_type,
        category
      FROM content_items 
      WHERE screen_location = 'mortgage_step3'
      AND content_key IN (
        'mortgage_step3.field.main_source',
        'mortgage_step3.field.main_source_employee',
        'mortgage_step3.field.main_source_selfemployed', 
        'mortgage_step3.field.main_source_pension',
        'mortgage_step3.field.main_source_student',
        'mortgage_step3.field.main_source_unemployed',
        'mortgage_step3.field.main_source_unpaid_leave',
        'mortgage_step3.field.main_source_other',
        'mortgage_step3.field.additional_income',
        'mortgage_step3.field.additional_income_0_no_additional_income',
        'mortgage_step3.field.additional_income_additional_salary',
        'mortgage_step3.field.additional_income_additional_work',
        'mortgage_step3.field.additional_income_investment',
        'mortgage_step3.field.additional_income_other',
        'mortgage_step3.field.additional_income_pension',
        'mortgage_step3.field.additional_income_property_rental_income'
      )
      ORDER BY content_key
    `);
    
    console.log(`Found ${sourceContent.rows.length} key content items`);
    
    // Get translations
    const sourceTranslations = await sourceDb.query(`
      SELECT 
        ci.content_key,
        ct.language_code,
        ct.content_value,
        ct.status
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key = ANY($1)
      AND ct.status = 'approved'
      ORDER BY ci.content_key, ct.language_code
    `, [sourceContent.rows.map(r => r.content_key)]);
    
    console.log(`Found ${sourceTranslations.rows.length} translations`);
    
    // Insert into target
    for (const item of sourceContent.rows) {
      try {
        // Insert content item with simple schema
        const result = await targetDb.query(`
          INSERT INTO content_items (
            content_key, screen_location, component_type, category, 
            element_order, is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, 1, true, NOW(), NOW())
          ON CONFLICT (content_key) DO UPDATE SET
            screen_location = EXCLUDED.screen_location,
            component_type = EXCLUDED.component_type,
            category = EXCLUDED.category,
            updated_at = NOW()
          RETURNING id
        `, [
          item.content_key,
          item.screen_location, 
          item.component_type,
          item.category
        ]);
        
        const contentItemId = result.rows[0].id;
        
        // Insert translations
        const itemTranslations = sourceTranslations.rows.filter(t => t.content_key === item.content_key);
        
        for (const trans of itemTranslations) {
          await targetDb.query(`
            INSERT INTO content_translations (
              content_item_id, language_code, content_value, status,
              created_at, updated_at
            ) VALUES ($1, $2, $3, $4, NOW(), NOW())
            ON CONFLICT (content_item_id, language_code) DO UPDATE SET
              content_value = EXCLUDED.content_value,
              status = EXCLUDED.status,
              updated_at = NOW()
          `, [
            contentItemId,
            trans.language_code,
            trans.content_value,
            trans.status
          ]);
        }
        
        console.log(`✅ ${item.content_key} (${itemTranslations.length} translations)`);
        
      } catch (err) {
        console.error(`❌ Failed ${item.content_key}:`, err.message);
      }
    }
    
    // Verify
    const verify = await targetDb.query(`
      SELECT COUNT(*) FROM content_items 
      WHERE screen_location = 'mortgage_step3'
    `);
    
    console.log(`\n✅ Migration complete! ${verify.rows[0].count} items in target database`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sourceDb.end();
    await targetDb.end();
  }
}

simpleMigration();