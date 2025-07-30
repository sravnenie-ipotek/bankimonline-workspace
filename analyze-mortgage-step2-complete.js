const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function analyzeMortgageStep2Complete() {
  try {
    console.log('📊 COMPLETE ANALYSIS OF MORTGAGE_STEP2 FORM FIELDS\n');
    
    // Get all content grouped by field type
    const query = `
      WITH field_analysis AS (
        SELECT 
          ci.content_key,
          ci.component_type,
          ct.content_value as hebrew_text,
          CASE 
            -- Identify the field group
            WHEN ci.content_key LIKE '%education%' THEN 'Education (השכלה)'
            WHEN ci.content_key LIKE '%family_status%' THEN 'Family Status (מצב משפחתי)'
            WHEN ci.content_key LIKE '%citizenship%' THEN 'Citizenship (אזרחות)'
            WHEN ci.content_key LIKE '%children%' THEN 'Children (ילדים)'
            WHEN ci.content_key LIKE '%birth%' THEN 'Birth Date (תאריך לידה)'
            WHEN ci.content_key LIKE '%tax%' THEN 'Tax Obligations (חובות מס)'
            WHEN ci.content_key LIKE '%medinsurance%' THEN 'Health Insurance (ביטוח בריאות)'
            WHEN ci.content_key LIKE '%public%' THEN 'Public Position (תפקיד ציבורי)'
            WHEN ci.content_key LIKE '%partner%' THEN 'Partner (בן/בת זוג)'
            WHEN ci.content_key LIKE '%name%' THEN 'Name (שם)'
            WHEN ci.content_key LIKE '%borrowers%' THEN 'Borrowers (לווים)'
            WHEN ci.content_key LIKE '%foreigner%' THEN 'Foreign Resident (תושב חוץ)'
            WHEN ci.content_key LIKE '%gender%' THEN 'Gender (מגדר)'
            WHEN ci.content_key LIKE '%property_ownership%' THEN 'Property Ownership (בעלות נכס)'
            ELSE 'Other'
          END as field_group,
          CASE 
            WHEN ci.content_key LIKE '%_option_%' THEN 'option'
            WHEN ci.content_key LIKE '%_ph' THEN 'placeholder'
            WHEN ci.component_type = 'button' THEN 'button'
            ELSE 'field'
          END as element_type
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
        WHERE ci.screen_location = 'mortgage_step2'
          AND ci.is_active = true
      )
      SELECT 
        field_group,
        COUNT(DISTINCT CASE WHEN element_type = 'field' THEN content_key END) as field_count,
        COUNT(DISTINCT CASE WHEN element_type = 'option' THEN content_key END) as option_count,
        COUNT(DISTINCT CASE WHEN element_type = 'placeholder' THEN content_key END) as placeholder_count,
        COUNT(DISTINCT CASE WHEN element_type = 'button' THEN content_key END) as button_count,
        array_agg(DISTINCT hebrew_text ORDER BY hebrew_text) FILTER (WHERE element_type = 'option') as options
      FROM field_analysis
      WHERE field_group != 'Other'
      GROUP BY field_group
      ORDER BY 
        CASE 
          WHEN field_group LIKE 'Education%' THEN 1
          WHEN field_group LIKE 'Family Status%' THEN 2
          WHEN field_group LIKE 'Birth Date%' THEN 3
          WHEN field_group LIKE 'Citizenship%' THEN 4
          WHEN field_group LIKE 'Children%' THEN 5
          WHEN field_group LIKE 'Tax%' THEN 6
          WHEN field_group LIKE 'Health%' THEN 7
          WHEN field_group LIKE 'Public%' THEN 8
          WHEN field_group LIKE 'Partner%' THEN 9
          ELSE 99
        END;
    `;
    
    const result = await pool.query(query);
    
    console.log('FORM FIELDS IN MORTGAGE_STEP2:');
    console.log('='.repeat(80) + '\n');
    
    let totalDropdowns = 0;
    let totalFields = 0;
    let totalOptions = 0;
    
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.field_group}`);
      
      if (row.option_count > 0) {
        // This is a dropdown/select field
        totalDropdowns++;
        totalOptions += row.option_count;
        console.log(`   Type: Dropdown/Select`);
        console.log(`   Options (${row.option_count}):`);
        if (row.options) {
          row.options.forEach(opt => {
            if (opt) console.log(`     • ${opt}`);
          });
        }
      } else {
        // This is a yes/no field or other input
        totalFields++;
        console.log(`   Type: Yes/No field or input`);
      }
      
      if (row.placeholder_count > 0) {
        console.log(`   Has placeholder text`);
      }
      
      console.log('');
    });
    
    // Get total count including all legacy items
    const totalQuery = `
      SELECT 
        COUNT(DISTINCT ci.content_key) as total_items,
        COUNT(DISTINCT CASE WHEN ci.content_key LIKE '%_option_%' THEN ci.content_key END) as total_options
      FROM content_items ci
      WHERE ci.screen_location = 'mortgage_step2'
        AND ci.is_active = true;
    `;
    
    const totalResult = await pool.query(totalQuery);
    
    console.log('\nSUMMARY FOR DROPDOWNS_BY_SCREEN.md UPDATE:');
    console.log('='.repeat(80));
    console.log(`Total Interactive Fields: ${totalDropdowns + totalFields}`);
    console.log(`- Dropdown/Select fields: ${totalDropdowns}`);
    console.log(`- Yes/No & Input fields: ${totalFields}`);
    console.log(`- Total Options: ${totalResult.rows[0].total_options}`);
    console.log(`- Total Database Items: ${totalResult.rows[0].total_items}`);
    
    console.log('\n📝 For DROPDOWNS_BY_SCREEN.md, mortgage_step2 should show:');
    console.log(`**Total Dropdowns**: ${totalDropdowns + totalFields} (includes all interactive fields)`);
    console.log(`**Total Options**: ${totalResult.rows[0].total_options}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

analyzeMortgageStep2Complete();