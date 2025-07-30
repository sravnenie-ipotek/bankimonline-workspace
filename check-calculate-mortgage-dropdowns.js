const { Pool } = require('pg');
const fs = require('fs').promises;
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkCalculateMortgageDropdowns() {
  try {
    console.log('🔍 CHECKING DROPDOWNS FOR calculate-mortgage/1\n');
    
    // Search for all possible screen variations
    const screenVariations = [
      'calculate-mortgage/1',
      'calculate_mortgage_1',
      'calculate-mortgage-1',
      'mortgage_calculation',
      'mortgage_step1',
      'calculate_mortgage',
      'mortgage_calculator_step1'
    ];
    
    // Get all dropdown content for these screens
    const dropdownQuery = await pool.query(`
      SELECT DISTINCT
        ci.screen_location,
        ci.content_key,
        ci.component_type,
        ct.language_code,
        ct.content_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = ANY($1)
        AND ci.component_type IN ('option', 'dropdown', 'select', 'dropdown_option', 'radio', 'label', 'dropdown_label')
        AND ci.is_active = true
        AND ct.status = 'approved'
        AND ct.language_code = 'en'
      ORDER BY 
        ci.screen_location,
        ci.content_key
    `, [screenVariations]);
    
    // Also search for any content with mortgage/calculate keywords
    const keywordQuery = await pool.query(`
      SELECT DISTINCT
        ci.screen_location,
        ci.content_key,
        ci.component_type,
        ct.content_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE (ci.content_key LIKE '%mortgage%' OR ci.content_key LIKE '%calculate%')
        AND ci.component_type IN ('option', 'dropdown', 'select', 'dropdown_option', 'radio')
        AND ci.is_active = true
        AND ct.status = 'approved'
        AND ct.language_code = 'en'
        AND ci.screen_location NOT IN ('refinance_step1', 'refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3')
      ORDER BY ci.content_key
    `);
    
    // Organize dropdowns by field
    const dropdownsByField = {};
    
    // Process direct screen matches
    dropdownQuery.rows.forEach(row => {
      const fieldName = extractFieldNameFromKey(row.content_key);
      if (!dropdownsByField[fieldName]) {
        dropdownsByField[fieldName] = {
          screen: row.screen_location,
          options: []
        };
      }
      if (row.component_type === 'option' || row.component_type === 'dropdown_option') {
        dropdownsByField[fieldName].options.push({
          key: row.content_key,
          value: row.content_value
        });
      }
    });
    
    // Process keyword matches
    keywordQuery.rows.forEach(row => {
      const fieldName = extractFieldNameFromKey(row.content_key);
      if (!dropdownsByField[fieldName]) {
        dropdownsByField[fieldName] = {
          screen: row.screen_location,
          options: []
        };
      }
      // Check if option already exists
      const exists = dropdownsByField[fieldName].options.some(opt => opt.key === row.content_key);
      if (!exists) {
        dropdownsByField[fieldName].options.push({
          key: row.content_key,
          value: row.content_value
        });
      }
    });
    
    // Generate report
    let report = 'calculate-mortgage/1\n\n';
    report += '==================================\n';
    report += 'DROPDOWNS FOR MORTGAGE CALCULATOR\n';
    report += '==================================\n\n';
    
    // Add summary
    const totalDropdowns = Object.keys(dropdownsByField).length;
    const totalOptions = Object.values(dropdownsByField).reduce((sum, field) => sum + field.options.length, 0);
    report += `Total Dropdowns Found: ${totalDropdowns}\n`;
    report += `Total Options: ${totalOptions}\n\n`;
    
    // List each dropdown
    Object.entries(dropdownsByField).sort().forEach(([fieldName, data]) => {
      report += `${fieldName} (from ${data.screen})\n`;
      data.options.forEach((option, index) => {
        report += `  ${index + 1}. ${option.value}\n`;
      });
      report += '\n';
    });
    
    // Add missing dropdowns section
    report += '\n==================================\n';
    report += 'EXPECTED DROPDOWNS (MAY BE MISSING):\n';
    report += '==================================\n\n';
    
    const expectedDropdowns = [
      'Property Ownership Status',
      'Property Type',
      'City/Location',
      'Bank Selection',
      'Citizenship',
      'Employment Status',
      'Income Source',
      'Education Level',
      'Family Status',
      'Debt Types',
      'Purpose of Mortgage'
    ];
    
    expectedDropdowns.forEach(dropdown => {
      const found = Object.keys(dropdownsByField).some(field => 
        field.toLowerCase().includes(dropdown.toLowerCase().replace(/[^a-z]/g, ''))
      );
      report += `${dropdown}: ${found ? '✅ Found' : '❌ Not found in database'}\n`;
    });
    
    // Write report
    await fs.writeFile('CALCULATE_MORTGAGE_DROPDOWNS.txt', report);
    console.log('✅ Report generated: CALCULATE_MORTGAGE_DROPDOWNS.txt');
    
    // Also check for city dropdown specifically
    console.log('\n🏙️ Checking for city dropdown...');
    const cityQuery = await pool.query(`
      SELECT 
        ci.screen_location,
        ci.content_key,
        COUNT(ct.id) as option_count
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE (ci.content_key LIKE '%city%' OR ci.content_key LIKE '%location%')
        AND ci.component_type IN ('option', 'dropdown', 'select')
        AND ci.is_active = true
      GROUP BY ci.screen_location, ci.content_key
      ORDER BY option_count DESC
    `);
    
    if (cityQuery.rows.length > 0) {
      console.log('City/Location dropdowns found:');
      cityQuery.rows.forEach(row => {
        console.log(`  - ${row.content_key} in ${row.screen_location} (${row.option_count} options)`);
      });
    } else {
      console.log('❌ No city/location dropdown found in database');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

function extractFieldNameFromKey(contentKey) {
  const key = contentKey.toLowerCase();
  
  // Extract field names
  if (key.includes('property_ownership')) return 'Property Ownership Status';
  if (key.includes('property_type') || (key.includes('property') && key.includes('option'))) return 'Property Type';
  if (key.includes('citizenship')) return 'Citizenship';
  if (key.includes('bank') && !key.includes('debt')) return 'Bank Selection';
  if (key.includes('debt_type') || key.includes('debt_types')) return 'Debt Types';
  if (key.includes('education')) return 'Education Level';
  if (key.includes('family_status')) return 'Family Status';
  if (key.includes('employment') || key.includes('main_source')) return 'Employment Status';
  if (key.includes('additional_income') || key.includes('has_additional')) return 'Additional Income Sources';
  if (key.includes('city') || key.includes('location')) return 'City/Location';
  if (key.includes('purpose') || key.includes('why')) return 'Purpose';
  
  // Default: clean the key
  return key
    .replace(/_option_\d+$/, '')
    .replace(/^app\./, '')
    .replace(/^calculate_/, '')
    .replace(/^mortgage_/, '')
    .split(/[._]/)
    .filter(part => part && !['field', 'form', 'calculation'].includes(part))
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

checkCalculateMortgageDropdowns();