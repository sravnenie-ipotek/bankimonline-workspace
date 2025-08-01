const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL
});

async function addMissingEntries() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Adding missing label and placeholder entries for additional_income...');
    
    // Check if mortgage_step3_additional_income_label exists
    const labelCheck = await client.query(`
      SELECT id FROM content_items 
      WHERE content_key = 'mortgage_step3_additional_income_label'
      AND screen_location = 'mortgage_step3'
    `);
    
    if (labelCheck.rows.length === 0) {
      // Insert label
      const labelInsert = await client.query(`
        INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
        VALUES ('mortgage_step3_additional_income_label', 'label', 'mortgage_step3', 'form', true)
        RETURNING id
      `);
      
      const labelId = labelInsert.rows[0].id;
      console.log(`✅ Created label with ID: ${labelId}`);
      
      // Insert translations for label
      await client.query(`
        INSERT INTO content_translations (content_item_id, language_code, content_value, status)
        VALUES 
          ($1, 'en', 'Do you have additional income?', 'approved'),
          ($1, 'he', 'האם קיימות הכנסות נוספות?', 'approved'),
          ($1, 'ru', 'Есть ли дополнительные доходы?', 'approved')
      `, [labelId]);
      
      console.log('✅ Added translations for label');
    } else {
      console.log('ℹ️ Label already exists');
    }
    
    // Check if mortgage_step3_additional_income_ph exists
    const phCheck = await client.query(`
      SELECT id FROM content_items 
      WHERE content_key = 'mortgage_step3_additional_income_ph'
      AND screen_location = 'mortgage_step3'
    `);
    
    if (phCheck.rows.length === 0) {
      // Insert placeholder
      const phInsert = await client.query(`
        INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
        VALUES ('mortgage_step3_additional_income_ph', 'placeholder', 'mortgage_step3', 'form', true)
        RETURNING id
      `);
      
      const phId = phInsert.rows[0].id;
      console.log(`✅ Created placeholder with ID: ${phId}`);
      
      // Insert translations for placeholder
      await client.query(`
        INSERT INTO content_translations (content_item_id, language_code, content_value, status)
        VALUES 
          ($1, 'en', 'Select additional income type', 'approved'),
          ($1, 'he', 'בחר סוג הכנסה נוספת', 'approved'),
          ($1, 'ru', 'Выберите тип дополнительного дохода', 'approved')
      `, [phId]);
      
      console.log('✅ Added translations for placeholder');
    } else {
      console.log('ℹ️ Placeholder already exists');
    }
    
    await client.query('COMMIT');
    console.log('\n✅ Successfully added missing entries!');
    
    // Clear cache
    console.log('\nClearing API cache...');
    await fetch('http://localhost:8003/api/content/cache/clear', { method: 'POST' });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addMissingEntries();