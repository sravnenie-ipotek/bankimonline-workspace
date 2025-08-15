/**
 * Direct insert migration for mortgage_step3 content
 */

const { Pool } = require('pg');

const sourceDb = new Pool({
  connectionString: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway'
});

const targetDb = new Pool({
  connectionString: 'postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway'
});

async function directInsert() {
  try {
    console.log('=== Direct Insert Migration ===');
    
    // Clear existing mortgage_step3 content first
    await targetDb.query(`
      DELETE FROM content_translations 
      WHERE content_item_id IN (
        SELECT id FROM content_items WHERE screen_location = 'mortgage_step3'
      )
    `);
    
    await targetDb.query(`
      DELETE FROM content_items WHERE screen_location = 'mortgage_step3'
    `);
    
    console.log('Cleared existing mortgage_step3 content');
    
    // Get key content from source
    const keyItems = [
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
    ];
    
    const sourceContent = await sourceDb.query(`
      SELECT 
        content_key,
        screen_location,
        component_type,
        category
      FROM content_items 
      WHERE content_key = ANY($1)
    `, [keyItems]);
    
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
    `, [keyItems]);
    
    console.log(`Source: ${sourceContent.rows.length} items, ${sourceTranslations.rows.length} translations`);
    
    // Insert content items
    for (const item of sourceContent.rows) {
      const result = await targetDb.query(`
        INSERT INTO content_items (
          content_key, screen_location, component_type, category, 
          element_order, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, 1, true, NOW(), NOW())
        RETURNING id
      `, [
        item.content_key,
        item.screen_location, 
        item.component_type,
        item.category || 'form'
      ]);
      
      const contentItemId = result.rows[0].id;
      
      // Insert translations for this item
      const itemTranslations = sourceTranslations.rows.filter(t => t.content_key === item.content_key);
      
      for (const trans of itemTranslations) {
        await targetDb.query(`
          INSERT INTO content_translations (
            content_item_id, language_code, content_value, status,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, NOW(), NOW())
        `, [
          contentItemId,
          trans.language_code,
          trans.content_value,
          trans.status
        ]);
      }
      
      console.log(`✅ ${item.content_key} (${itemTranslations.length} translations)`);
    }
    
    console.log('Migration complete!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sourceDb.end();
    await targetDb.end();
  }
}

directInsert();