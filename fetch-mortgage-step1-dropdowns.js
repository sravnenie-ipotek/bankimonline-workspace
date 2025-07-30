const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fetchMortgageStep1Dropdowns() {
  try {
    console.log('🔍 FETCHING ALL 5 DROPDOWNS FROM MORTGAGE STEP 1\n');
    console.log('Based on the UI screenshot, these are the dropdowns:\n');
    console.log('1. עיר בא נמצא הנכס? (City where property is located)');
    console.log('2. מתי תזדקק למשכנתא? (When do you need the mortgage)');
    console.log('3. סוג משכנתא (Type of mortgage)');
    console.log('4. האם מדובר בדירה ראשונה? (Is this your first home)');
    console.log('5. סטטוס בעלות על נכס (Property ownership status)\n');
    console.log('═'.repeat(80) + '\n');

    // Query to get all dropdown content organized by dropdown
    const dropdownQuery = `
      WITH dropdown_mapping AS (
        SELECT 
          ci.id,
          ci.content_key,
          ci.component_type,
          ct.content_value as translation,
          CASE 
            WHEN ci.content_key LIKE 'mortgage_calculation.field.city%' THEN '1_city'
            WHEN ci.content_key LIKE 'mortgage_calculation.field.when_needed%' THEN '2_when_needed'
            WHEN ci.content_key LIKE 'mortgage_calculation.field.type%' THEN '3_property_type'
            WHEN ci.content_key LIKE 'mortgage_calculation.field.first_home%' THEN '4_first_home'
            WHEN ci.content_key LIKE 'mortgage_calculation.field.property_ownership%' THEN '5_property_ownership'
            ELSE NULL
          END as dropdown_group,
          CASE
            WHEN ci.content_key LIKE '%_ph' THEN 'placeholder'
            WHEN ci.content_key LIKE '%_option_%' THEN 'option'
            ELSE 'title'
          END as element_type,
          CASE 
            WHEN ci.content_key LIKE '%_option_1' THEN 1
            WHEN ci.content_key LIKE '%_option_2' THEN 2
            WHEN ci.content_key LIKE '%_option_3' THEN 3
            WHEN ci.content_key LIKE '%_option_4' THEN 4
            ELSE 0
          END as option_order
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.screen_location = 'mortgage_calculation'
          AND ci.is_active = true
          AND ct.status = 'approved'
          AND ct.language_code = 'he'
      )
      SELECT 
        dropdown_group,
        element_type,
        content_key,
        translation,
        option_order
      FROM dropdown_mapping
      WHERE dropdown_group IS NOT NULL
      ORDER BY dropdown_group, element_type DESC, option_order;
    `;

    const result = await pool.query(dropdownQuery);
    
    // Group results by dropdown
    const dropdowns = {};
    result.rows.forEach(row => {
      if (!dropdowns[row.dropdown_group]) {
        dropdowns[row.dropdown_group] = {
          title: '',
          placeholder: '',
          options: []
        };
      }
      
      if (row.element_type === 'title') {
        dropdowns[row.dropdown_group].title = row.translation;
      } else if (row.element_type === 'placeholder') {
        dropdowns[row.dropdown_group].placeholder = row.translation;
      } else if (row.element_type === 'option') {
        dropdowns[row.dropdown_group].options.push({
          order: row.option_order,
          text: row.translation,
          key: row.content_key
        });
      }
    });

    // Display results
    const dropdownNames = {
      '1_city': '1. CITY DROPDOWN (עיר בא נמצא הנכס)',
      '2_when_needed': '2. WHEN NEEDED DROPDOWN (מתי תזדקק למשכנתא)',
      '3_property_type': '3. PROPERTY TYPE DROPDOWN (סוג משכנתא)',
      '4_first_home': '4. FIRST HOME DROPDOWN (האם מדובר בדירה ראשונה)',
      '5_property_ownership': '5. PROPERTY OWNERSHIP DROPDOWN (סטטוס בעלות על נכס)'
    };

    Object.keys(dropdowns).sort().forEach(key => {
      const dropdown = dropdowns[key];
      console.log(`${dropdownNames[key] || key}`);
      console.log('─'.repeat(60));
      console.log(`Title: ${dropdown.title || 'N/A'}`);
      console.log(`Placeholder: ${dropdown.placeholder || 'N/A'}`);
      
      if (dropdown.options.length > 0) {
        console.log('Options:');
        dropdown.options.sort((a, b) => a.order - b.order).forEach(option => {
          console.log(`  ${option.order}. ${option.text}`);
        });
      }
      console.log('\n');
    });

    // Get specific content keys for React component reference
    console.log('CONTENT KEYS FOR REACT COMPONENTS:');
    console.log('═'.repeat(80));
    
    const keyMappingQuery = `
      SELECT DISTINCT
        content_key,
        CASE 
          WHEN content_key LIKE '%city%' THEN 'City Dropdown'
          WHEN content_key LIKE '%when_needed%' THEN 'When Needed Dropdown'
          WHEN content_key LIKE '%type%' AND content_key NOT LIKE '%component_type%' THEN 'Property Type Dropdown'
          WHEN content_key LIKE '%first_home%' THEN 'First Home Dropdown'
          WHEN content_key LIKE '%property_ownership%' THEN 'Property Ownership Dropdown'
        END as dropdown_name
      FROM content_items
      WHERE screen_location = 'mortgage_calculation'
        AND is_active = true
        AND (
          content_key IN (
            'mortgage_calculation.field.city',
            'mortgage_calculation.field.city_ph',
            'mortgage_calculation.field.when_needed',
            'mortgage_calculation.field.when_needed_ph',
            'mortgage_calculation.field.when_needed_option_1',
            'mortgage_calculation.field.when_needed_option_2',
            'mortgage_calculation.field.when_needed_option_3',
            'mortgage_calculation.field.when_needed_option_4',
            'mortgage_calculation.field.type',
            'mortgage_calculation.field.type_ph',
            'mortgage_calculation.field.type_option_1',
            'mortgage_calculation.field.type_option_2',
            'mortgage_calculation.field.type_option_3',
            'mortgage_calculation.field.type_option_4',
            'mortgage_calculation.field.first_home',
            'mortgage_calculation.field.first_home_ph',
            'mortgage_calculation.field.first_home_option_1',
            'mortgage_calculation.field.first_home_option_2',
            'mortgage_calculation.field.first_home_option_3',
            'mortgage_calculation.field.property_ownership',
            'mortgage_calculation.field.property_ownership_ph',
            'mortgage_calculation.field.property_ownership_option_1',
            'mortgage_calculation.field.property_ownership_option_2',
            'mortgage_calculation.field.property_ownership_option_3'
          )
        )
      ORDER BY dropdown_name, content_key;
    `;

    const keyResult = await pool.query(keyMappingQuery);
    keyResult.rows.forEach(row => {
      console.log(`${row.dropdown_name}: ${row.content_key}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

fetchMortgageStep1Dropdowns();