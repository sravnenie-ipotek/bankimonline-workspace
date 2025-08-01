const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL
});

async function debugDropdownApi() {
  try {
    // Run the exact query with debug
    const result = await pool.query(`
      SELECT 
        content_items.content_key,
        content_items.component_type,
        content_translations.content_value
      FROM content_items
      JOIN content_translations ON content_items.id = content_translations.content_item_id
      WHERE content_items.screen_location = $1 
        AND content_translations.language_code = $2
        AND content_translations.status = 'approved'
        AND content_items.is_active = true
        AND content_items.component_type IN ('dropdown_container', 'dropdown_option', 'placeholder', 'label')
      ORDER BY content_items.content_key, content_items.component_type
    `, ['mortgage_step3', 'he']);
    
    console.log('Processing dropdown options for additional_income:');
    console.log('=================================================');
    
    result.rows
      .filter(row => row.content_key.includes('additional_income') && row.component_type === 'dropdown_option')
      .forEach(row => {
        console.log(`\nProcessing: ${row.content_key}`);
        
        // Extract field name
        let fieldName = null;
        let match = row.content_key.match(/^[^.]*\.field\.([^.]+?)_(?:no_additional_income)/);
        if (match) {
          fieldName = match[1];
        } else {
          match = row.content_key.match(/^[^.]*\.field\.([^.]+)/);
          if (match) {
            fieldName = match[1];
          }
        }
        
        console.log(`  Field name extracted: ${fieldName}`);
        
        // Extract option value
        let optionValue = null;
        const optionPatterns = [
          /_option_(.+)$/,
          /_(1_no_additional_income)$/,
          /_(additional_salary)$/,
          /_(additional_work)$/,
          /_(property_rental_income)$/,
          /_(no_additional_income)$/,
          /_(investment)$/,
          /_(pension)$/,
          /_(other)$/,
          /_([^_]+)$/
        ];
        
        for (const pattern of optionPatterns) {
          const optionMatch = row.content_key.match(pattern);
          if (optionMatch) {
            optionValue = optionMatch[1];
            console.log(`  Matched pattern: ${pattern}`);
            console.log(`  Raw option value: ${optionValue}`);
            
            // Special handling
            if (optionValue === '1_no_additional_income') {
              optionValue = 'no_additional_income';
              console.log(`  Transformed to: ${optionValue}`);
            }
            
            break;
          }
        }
        
        const dropdownKey = fieldName ? `mortgage_step3_${fieldName}` : 'NOT_MATCHED';
        console.log(`  Would add to dropdown: ${dropdownKey}`);
        console.log(`  Final value: ${optionValue}`);
        console.log(`  Label: ${row.content_value}`);
      });
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await pool.end();
  }
}

debugDropdownApi();