const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function showDropdownData() {
  try {
    // First, let's see the structure
    console.log('🗄️ DATABASE STRUCTURE FOR DROPDOWNS:\n');
    console.log('1️⃣ CONTENT_ITEMS table - stores dropdown metadata');
    console.log('   Fields: id, screen_location, content_key, component_type, category, is_active\n');
    
    // Get some dropdown examples from content_items
    const itemsQuery = `
      SELECT 
        id,
        screen_location,
        content_key,
        component_type,
        category
      FROM content_items
      WHERE component_type = 'option'
        AND screen_location = 'tenders_for_brokers'
      LIMIT 3
    `;
    
    const items = await pool.query(itemsQuery);
    console.log('📋 Example dropdown items from CONTENT_ITEMS:');
    console.log('----------------------------------------------');
    items.rows.forEach(row => {
      console.log(`ID: ${row.id}`);
      console.log(`Screen: ${row.screen_location}`);
      console.log(`Key: ${row.content_key}`);
      console.log(`Type: ${row.component_type} (this marks it as a dropdown option)`);
      console.log(`Category: ${row.category}\n`);
    });
    
    // Now show the translations
    console.log('\n2️⃣ CONTENT_TRANSLATIONS table - stores the actual text in each language');
    console.log('   Fields: id, content_item_id, language_code, content_value, status\n');
    
    // Get translations for one specific dropdown
    const translationsQuery = `
      SELECT 
        ct.content_item_id,
        ct.language_code,
        ct.content_value,
        ci.content_key
      FROM content_translations ct
      JOIN content_items ci ON ci.id = ct.content_item_id
      WHERE ci.content_key = 'tenders_step1_title'
        AND ci.component_type = 'option'
      ORDER BY ct.language_code
    `;
    
    const translations = await pool.query(translationsQuery);
    console.log('📋 Example: "tenders_step1_title" dropdown translations:');
    console.log('-------------------------------------------------------');
    translations.rows.forEach(row => {
      console.log(`Language: ${row.language_code} -> "${row.content_value}"`);
    });
    
    // Show a complete example with JOIN
    console.log('\n\n🔗 COMPLETE EXAMPLE - How tables connect:');
    console.log('=========================================\n');
    
    const fullExample = await pool.query(`
      SELECT 
        ci.id as item_id,
        ci.content_key,
        ci.screen_location,
        ci.component_type,
        ct.language_code,
        ct.content_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key = 'tenders_license_feature1_p1'
      ORDER BY ct.language_code
    `);
    
    console.log('One dropdown option stored across both tables:');
    fullExample.rows.forEach(row => {
      console.log(`\nLanguage: ${row.language_code}`);
      console.log(`  content_items.id: ${row.item_id}`);
      console.log(`  content_items.content_key: ${row.content_key}`);
      console.log(`  content_items.screen_location: ${row.screen_location}`);
      console.log(`  content_items.component_type: ${row.component_type}`);
      console.log(`  content_translations.content_value: "${row.content_value}"`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

showDropdownData();
