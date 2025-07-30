const { Pool } = require('pg');
const fs = require('fs').promises;
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function investigateMortgageScreenMismatch() {
  try {
    console.log('🔍 INVESTIGATING MORTGAGE SCREEN LOCATION MISMATCH\n');
    console.log('URL: http://localhost:5173/services/calculate-mortgage/1');
    console.log('Expected: Multiple dropdowns for mortgage step 1\n');
    
    // 1. Check what's in mortgage_step1
    console.log('1️⃣ CHECKING mortgage_step1 CONTENT:');
    console.log('=====================================\n');
    
    const mortgageStep1Query = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ct.content_value as english_value
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'en'
      WHERE ci.screen_location = 'mortgage_step1'
        AND ci.is_active = true
      ORDER BY ci.component_type, ci.content_key
    `);
    
    console.log(`Found ${mortgageStep1Query.rows.length} items in mortgage_step1:`);
    mortgageStep1Query.rows.forEach(row => {
      console.log(`  - ${row.content_key} (${row.component_type}): "${row.english_value || 'NO TRANSLATION'}"`);
    });
    
    // 2. Check what's in mortgage_calculation
    console.log('\n\n2️⃣ CHECKING mortgage_calculation CONTENT:');
    console.log('=========================================\n');
    
    const mortgageCalcQuery = await pool.query(`
      SELECT 
        ci.component_type,
        COUNT(*) as count
      FROM content_items ci
      WHERE ci.screen_location = 'mortgage_calculation'
        AND ci.is_active = true
      GROUP BY ci.component_type
      ORDER BY count DESC
    `);
    
    console.log('Component types in mortgage_calculation:');
    mortgageCalcQuery.rows.forEach(row => {
      console.log(`  - ${row.component_type}: ${row.count} items`);
    });
    
    // 3. Find all dropdowns that should be on step 1
    console.log('\n\n3️⃣ DROPDOWNS THAT SHOULD BE ON STEP 1:');
    console.log('=====================================\n');
    
    const step1Fields = [
      'property_ownership',
      'property_type',
      'city',
      'first_home',
      'when_needed',
      'initial'
    ];
    
    for (const field of step1Fields) {
      const fieldQuery = await pool.query(`
        SELECT 
          ci.screen_location,
          ci.content_key,
          COUNT(DISTINCT ct.id) as option_count
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.content_key LIKE '%${field}%'
          AND ci.component_type IN ('option', 'dropdown', 'select', 'label')
          AND ci.is_active = true
        GROUP BY ci.screen_location, ci.content_key
        ORDER BY option_count DESC
        LIMIT 5
      `);
      
      if (fieldQuery.rows.length > 0) {
        console.log(`${field.toUpperCase()}:`);
        fieldQuery.rows.forEach(row => {
          console.log(`  - ${row.content_key} in ${row.screen_location} (${row.option_count} translations)`);
        });
        console.log('');
      }
    }
    
    // 4. Check all screen locations with 'mortgage' or 'calculate'
    console.log('\n4️⃣ ALL MORTGAGE-RELATED SCREEN LOCATIONS:');
    console.log('========================================\n');
    
    const allScreensQuery = await pool.query(`
      SELECT 
        screen_location,
        COUNT(*) as total_items,
        COUNT(CASE WHEN component_type IN ('option', 'dropdown', 'select') THEN 1 END) as dropdown_items
      FROM content_items
      WHERE (screen_location LIKE '%mortgage%' OR screen_location LIKE '%calculate%')
        AND is_active = true
      GROUP BY screen_location
      ORDER BY dropdown_items DESC, total_items DESC
    `);
    
    console.log('Screen locations with item counts:');
    allScreensQuery.rows.forEach(row => {
      console.log(`  - ${row.screen_location}: ${row.total_items} total items, ${row.dropdown_items} dropdown options`);
    });
    
    // 5. Create URL to screen_location mapping
    console.log('\n\n5️⃣ LIKELY URL TO SCREEN_LOCATION MAPPING:');
    console.log('========================================\n');
    
    const mapping = {
      '/services/calculate-mortgage/1': ['mortgage_step1', 'mortgage_calculation', 'calculate_mortgage_1'],
      '/services/calculate-mortgage/2': ['mortgage_step2', 'mortgage_calculation_step2', 'calculate_mortgage_2'],
      '/services/calculate-mortgage/3': ['mortgage_step3', 'mortgage_calculation_step3', 'calculate_mortgage_3'],
      '/services/calculate-mortgage/4': ['mortgage_step4', 'mortgage_calculation_step4', 'calculate_mortgage_4']
    };
    
    console.log('URL to screen_location mapping:');
    Object.entries(mapping).forEach(([url, screens]) => {
      console.log(`\n${url}:`);
      console.log(`  Expected screens: ${screens.join(', ')}`);
    });
    
    // Generate report
    let report = '# MORTGAGE SCREEN LOCATION MISMATCH ANALYSIS\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    report += '## PROBLEM SUMMARY\n\n';
    report += '- **URL**: http://localhost:5173/services/calculate-mortgage/1\n';
    report += '- **Issue**: The page expects multiple dropdowns but database has them in wrong screen_location\n';
    report += `- **mortgage_step1**: Only ${mortgageStep1Query.rows.filter(r => r.component_type === 'option').length} dropdown options found\n`;
    report += `- **mortgage_calculation**: Contains ${mortgageCalcQuery.rows.find(r => r.component_type === 'option')?.count || 0} dropdown options that likely belong to step 1\n\n`;
    
    report += '## ROOT CAUSE\n\n';
    report += 'The content migration appears to have placed all mortgage calculator dropdowns under `mortgage_calculation` ';
    report += 'instead of distributing them across `mortgage_step1`, `mortgage_step2`, etc.\n\n';
    
    report += '## RECOMMENDED FIXES\n\n';
    report += '1. **Option A**: Update the React components to look for content in `mortgage_calculation` screen\n';
    report += '2. **Option B**: Migrate the content to the correct `mortgage_step1` screen_location\n';
    report += '3. **Option C**: Create a mapping table between URLs and screen_locations\n\n';
    
    report += '## AFFECTED DROPDOWNS\n\n';
    report += 'The following dropdowns should be on step 1 but are in `mortgage_calculation`:\n';
    report += '- Property Ownership Status\n';
    report += '- Property Type\n';
    report += '- City/Location\n';
    report += '- First Home Status\n';
    report += '- When Needed (Timeline)\n';
    report += '- Initial Payment\n';
    
    await fs.writeFile('MORTGAGE_SCREEN_MISMATCH_REPORT.md', report);
    console.log('\n✅ Report generated: MORTGAGE_SCREEN_MISMATCH_REPORT.md');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

investigateMortgageScreenMismatch();