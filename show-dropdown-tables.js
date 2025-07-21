const { Pool } = require('pg');
require('dotenv').config();

// Use content database URL like in the migration script
const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function showDropdownTables() {
  try {
    console.log('📊 DROPDOWN VALUES DATABASE STRUCTURE\n');
    console.log('=====================================\n');
    
    // First check what's in content_items
    const itemsCount = await pool.query(`
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN component_type = 'option' THEN 1 END) as dropdown_count
      FROM content_items
    `);
    
    console.log(`Total content items: ${itemsCount.rows[0].total}`);
    console.log(`Dropdown options: ${itemsCount.rows[0].dropdown_count}\n`);
    
    // Show example dropdown from content_items
    console.log('📋 TABLE 1: content_items (stores dropdown metadata)');
    console.log('----------------------------------------------------');
    
    const exampleItem = await pool.query(`
      SELECT * FROM content_items 
      WHERE component_type = 'option' 
        AND content_key = 'tenders_step1_title'
      LIMIT 1
    `);
    
    if (exampleItem.rows.length > 0) {
      const item = exampleItem.rows[0];
      console.log('Example row:');
      console.log(`  id: ${item.id}`);
      console.log(`  screen_location: ${item.screen_location}`);
      console.log(`  content_key: ${item.content_key}`);
      console.log(`  component_type: ${item.component_type} <-- "option" means dropdown`);
      console.log(`  category: ${item.category}`);
      console.log(`  is_active: ${item.is_active}`);
    }
    
    // Show translations
    console.log('\n\n📋 TABLE 2: content_translations (stores actual text)');
    console.log('-----------------------------------------------------');
    
    const exampleTranslations = await pool.query(`
      SELECT ct.*, ci.content_key
      FROM content_translations ct
      JOIN content_items ci ON ci.id = ct.content_item_id
      WHERE ci.content_key = 'tenders_step1_title'
        AND ci.component_type = 'option'
      ORDER BY ct.language_code
    `);
    
    console.log('Same dropdown in 3 languages:');
    exampleTranslations.rows.forEach(trans => {
      console.log(`\n  Language: ${trans.language_code}`);
      console.log(`  content_value: "${trans.content_value}"`);
      console.log(`  status: ${trans.status}`);
      console.log(`  content_item_id: ${trans.content_item_id} (links to content_items.id)`);
    });
    
    // Show more dropdown examples
    console.log('\n\n📋 MORE DROPDOWN EXAMPLES:');
    console.log('---------------------------');
    
    const moreExamples = await pool.query(`
      SELECT 
        ci.content_key,
        ci.screen_location,
        ct.content_value as english_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.component_type = 'option'
        AND ct.language_code = 'en'
        AND ci.screen_location = 'tenders_for_brokers'
      LIMIT 5
    `);
    
    moreExamples.rows.forEach(ex => {
      console.log(`\n${ex.screen_location} > ${ex.content_key}:`);
      console.log(`  "${ex.english_value}"`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

showDropdownTables();
