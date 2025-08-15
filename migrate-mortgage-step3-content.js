/**
 * Migrate mortgage_step3 content from working database to server database
 */

const { Pool } = require('pg');

const sourceDb = new Pool({
  connectionString: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway'
});

const targetDb = new Pool({
  connectionString: 'postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway'
});

async function migrateMortgageStep3Content() {
  try {
    console.log('=== Migrating mortgage_step3 content ===');
    
    // Step 1: Export content from source database
    console.log('1. Exporting content from source database...');
    const contentItems = await sourceDb.query(`
      SELECT 
        content_key,
        content_type,
        category,
        screen_location,
        component_type,
        description,
        is_active,
        sort_order,
        metadata
      FROM content_items 
      WHERE screen_location = 'mortgage_step3'
      ORDER BY id
    `);
    
    console.log(`Found ${contentItems.rows.length} content items`);
    
    // Step 2: Get translations for these items
    console.log('2. Exporting translations...');
    const translations = await sourceDb.query(`
      SELECT 
        ci.content_key,
        ct.language_code,
        ct.content_value,
        ct.status,
        ct.metadata as translation_metadata
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'mortgage_step3'
      ORDER BY ci.content_key, ct.language_code
    `);
    
    console.log(`Found ${translations.rows.length} translations`);
    
    // Step 3: Insert into target database
    console.log('3. Inserting content into server database...');
    
    for (const item of contentItems.rows) {
      try {
        // Insert content item
        const insertResult = await targetDb.query(`
          INSERT INTO content_items (
            content_key, content_type, category, screen_location, 
            component_type, description, is_active, sort_order, metadata,
            created_at, updated_at, created_by, updated_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), 1, 1)
          ON CONFLICT (content_key) DO UPDATE SET
            content_type = EXCLUDED.content_type,
            category = EXCLUDED.category,
            screen_location = EXCLUDED.screen_location,
            component_type = EXCLUDED.component_type,
            description = EXCLUDED.description,
            is_active = EXCLUDED.is_active,
            sort_order = EXCLUDED.sort_order,
            metadata = EXCLUDED.metadata,
            updated_at = NOW(),
            updated_by = 1
          RETURNING id
        `, [
          item.content_key,
          item.content_type,
          item.category,
          item.screen_location,
          item.component_type,
          item.description,
          item.is_active,
          item.sort_order,
          item.metadata
        ]);
        
        const contentItemId = insertResult.rows[0].id;
        
        // Insert translations for this item
        const itemTranslations = translations.rows.filter(t => t.content_key === item.content_key);
        
        for (const translation of itemTranslations) {
          await targetDb.query(`
            INSERT INTO content_translations (
              content_item_id, language_code, content_value, status, metadata,
              created_at, updated_at, created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), 1, 1)
            ON CONFLICT (content_item_id, language_code) DO UPDATE SET
              content_value = EXCLUDED.content_value,
              status = EXCLUDED.status,
              metadata = EXCLUDED.metadata,
              updated_at = NOW(),
              updated_by = 1
          `, [
            contentItemId,
            translation.language_code,
            translation.content_value,
            translation.status,
            translation.translation_metadata
          ]);
        }
        
        console.log(`✅ Migrated: ${item.content_key} (${itemTranslations.length} translations)`);
        
      } catch (err) {
        console.error(`❌ Failed to migrate ${item.content_key}:`, err.message);
      }
    }
    
    // Step 4: Verify migration
    console.log('4. Verifying migration...');
    const verifyResult = await targetDb.query(`
      SELECT COUNT(*) FROM content_items 
      WHERE screen_location = 'mortgage_step3'
    `);
    
    console.log(`Migration complete! ${verifyResult.rows[0].count} items in target database`);
    
  } catch (error) {
    console.error('Migration error:', error.message);
  } finally {
    await sourceDb.end();
    await targetDb.end();
  }
}

migrateMortgageStep3Content();