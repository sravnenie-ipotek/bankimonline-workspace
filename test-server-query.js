/**
 * Test script to simulate exact server dropdown query and see what data is returned
 */

const { Pool } = require('pg');

async function testServerQuery() {
  const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway'
  });

  try {
    console.log('=== Testing exact server query for mortgage_step3/he ===\n');
    
    // This is the exact query from server-db.js
    const result = await contentPool.query(`
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
          AND content_items.component_type IN ('dropdown_container', 'dropdown_option', 'option', 'placeholder', 'label')
      ORDER BY content_items.content_key, content_items.component_type
    `, ['mortgage_step3', 'he']);

    console.log(`Total query results: ${result.rows.length}`);
    
    // Group results just like the server does
    const response = {
      status: 'success',
      screen_location: 'mortgage_step3',
      language_code: 'he',
      dropdowns: [],
      options: {},
      placeholders: {},
      labels: {},
      cached: false
    };

    const dropdownMap = new Map();
    
    console.log('\n=== Processing each row ===');
    result.rows.forEach((row, index) => {
      if (row.content_key.includes('main_source') || row.content_key.includes('additional_income')) {
        console.log(`${index + 1}. ${row.content_key} | ${row.component_type} | ${row.content_value}`);
      }
      
      // Extract field name using the server's logic
      let fieldName = null;
      
      // Pattern 1: handle numbered options first
      let match = row.content_key.match(/^[^.]*\.field\.([^.]+?)_[0-9]_(?:no_additional_income|no_obligations)/);
      if (match) {
        fieldName = match[1];
      } else {
        match = row.content_key.match(/^[^.]*\.field\.([^.]+)_(?:employee|selfemployed|pension|student|unemployed|unpaid_leave|additional_salary|additional_work|property_rental_income|no_additional_income|bank_loan|consumer_credit|credit_card|no_obligations)/);
        if (match) {
          fieldName = match[1];
        }
      }
      
      if (!fieldName) {
        // Fallback pattern
        match = row.content_key.match(/^[^.]*\.field\.([^.]+)/);
        if (match) {
          fieldName = match[1];
        }
      }
      
      // Continue with other patterns if needed...
      if (!fieldName && row.content_key.startsWith('mortgage_step3_')) {
        match = row.content_key.match(/^mortgage_step3_([^_]+(?:_[^_]+)*)$/);
        if (match) {
          fieldName = match[1];
        }
      }
      
      if (fieldName) {
        const dropdownKey = `mortgage_step3_${fieldName}`;
        
        if (!dropdownMap.has(dropdownKey)) {
          dropdownMap.set(dropdownKey, {
            options: [],
            label: null,
            placeholder: null,
            hasContainer: false
          });
        }
        
        const dropdown = dropdownMap.get(dropdownKey);
        
        if (row.component_type === 'dropdown_container') {
          dropdown.hasContainer = true;
          dropdown.label = row.content_value;
        } else if (row.component_type === 'dropdown_option') {
          // Extract option value
          const optionMatch = row.content_key.match(/_([^_]+)$/);
          const optionValue = optionMatch ? optionMatch[1] : 'unknown';
          dropdown.options.push({
            value: optionValue,
            label: row.content_value
          });
        } else if (row.component_type === 'placeholder') {
          dropdown.placeholder = row.content_value;
        } else if (row.component_type === 'label') {
          if (!dropdown.label) dropdown.label = row.content_value;
        }
        
        if ((row.content_key.includes('main_source') || row.content_key.includes('additional_income')) && fieldName) {
          console.log(`    → Grouped into: ${dropdownKey}`);
        }
      }
    });
    
    console.log(`\n=== Generated dropdown groups: ${dropdownMap.size} ===`);
    
    // Only include dropdowns that have containers and options
    for (const [key, dropdown] of dropdownMap) {
      if (dropdown.hasContainer && dropdown.options.length > 0) {
        response.dropdowns.push({
          key: key,
          label: dropdown.label
        });
        response.options[key] = dropdown.options;
        if (dropdown.placeholder) {
          response.placeholders[key] = dropdown.placeholder;
        }
        if (dropdown.label) {
          response.labels[key] = dropdown.label;
        }
        
        console.log(`${key}: ${dropdown.options.length} options`);
        if (key.includes('main_source') || key.includes('additional_income')) {
          dropdown.options.forEach(opt => {
            console.log(`  ${opt.value}: ${opt.label}`);
          });
        }
      }
    }
    
    console.log(`\nFinal response has ${response.dropdowns.length} dropdowns`);
    console.log('Keys:', Object.keys(response.options));
    
    // Check specifically for our target keys
    const hasMainSource = response.options['mortgage_step3_main_source'];
    const hasAdditionalIncome = response.options['mortgage_step3_additional_income'];
    
    console.log(`\n=== Target Check ===`);
    console.log(`mortgage_step3_main_source: ${hasMainSource ? '✅ FOUND' : '❌ MISSING'}`);
    console.log(`mortgage_step3_additional_income: ${hasAdditionalIncome ? '✅ FOUND' : '❌ MISSING'}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await contentPool.end();
  }
}

// Set environment variable
process.env.CONTENT_DATABASE_URL = 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway';

testServerQuery();