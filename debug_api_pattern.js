const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL
});

async function debugApiPattern() {
  try {
    // Run the exact query the API uses
    const result = await pool.query(`
      SELECT 
        content_items.content_key,
        content_items.component_type,
        content_translations.content_value
      FROM content_items
      JOIN content_translations ON content_items.id = content_translations.content_item_id
      WHERE content_items.screen_location = 'mortgage_step3' 
        AND content_translations.language_code = 'he'
        AND content_translations.status = 'approved'
        AND content_items.is_active = true
        AND content_items.component_type IN ('dropdown_container', 'dropdown_option', 'placeholder', 'label')
        AND content_items.content_key LIKE '%additional_income%'
      ORDER BY content_items.content_key, content_items.component_type
    `);
    
    console.log('API Query Results:');
    console.log('==================');
    
    result.rows.forEach(row => {
      console.log(`${row.component_type}: ${row.content_key} = "${row.content_value}"`);
    });
    
    console.log('\n\nNow let\'s see how the API would process these:');
    console.log('==============================================');
    
    result.rows.forEach(row => {
      let fieldName = null;
      
      // Try Pattern 1: mortgage_step3.field.{fieldname}
      let match = row.content_key.match(/^[^.]*\.field\.([^.]+?)_(?:no_additional_income)/);
      if (match) {
        fieldName = match[1];
      } else {
        match = row.content_key.match(/^[^.]*\.field\.([^.]+)/);
        if (match) {
          fieldName = match[1];
        }
      }
      
      // Try Pattern for label/placeholder: look for _label or _ph suffix
      if (!fieldName && (row.component_type === 'label' || row.component_type === 'placeholder')) {
        match = row.content_key.match(/mortgage_step3_(.+?)(?:_label|_ph)$/);
        if (match) {
          fieldName = match[1];
        }
      }
      
      const dropdownKey = fieldName ? `mortgage_step3_${fieldName}` : 'NOT_MATCHED';
      
      console.log(`\n${row.content_key}:`);
      console.log(`  Type: ${row.component_type}`);
      console.log(`  Extracted fieldName: ${fieldName || 'NONE'}`);
      console.log(`  Would create dropdownKey: ${dropdownKey}`);
    });
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await pool.end();
  }
}

debugApiPattern();