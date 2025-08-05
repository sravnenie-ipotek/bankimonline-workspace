const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });
const pool = new Pool({ connectionString: process.env.CONTENT_DATABASE_URL });

async function createMissingDropdownContent() {
  console.log('🚀 Creating missing dropdown content for all processes...\n');
  
  try {
    // Start transaction
    await pool.query('BEGIN');
    
    const missingScreens = [
      'credit_step1', 'credit_step2', 'credit_step3',
      'refinance_mortgage_step1', 'refinance_mortgage_step2', 'refinance_mortgage_step3',
      'refinance_credit_step1', 'refinance_credit_step2', 'refinance_credit_step3'
    ];
    
    let totalCreated = 0;
    
    for (const screen of missingScreens) {
      console.log(`\n📝 Creating content for ${screen}...`);
      
      // Determine the base pattern based on step number
      const stepNumber = screen.includes('step1') ? 1 : screen.includes('step2') ? 2 : 3;
      const baseScreen = `mortgage_step${stepNumber}`;
      
      // Copy mortgage step content to the new screen
      const copyQuery = `
        INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, created_at, updated_at)
        SELECT 
          REPLACE(content_key, '${baseScreen}', '${screen}'),
          component_type,
          '${screen}',
          category,
          is_active,
          NOW(),
          NOW()
        FROM content_items 
        WHERE screen_location = '${baseScreen}'
          AND component_type IN ('dropdown_container', 'dropdown_option')
          AND content_key NOT LIKE '%mortgage%' -- Skip mortgage-specific keys
      `;
      
      const result = await pool.query(copyQuery);
      console.log(`   Created ${result.rowCount} items`);
      totalCreated += result.rowCount;
      
      // Also create process-specific keys
      const processType = screen.includes('credit') ? 'credit' : 
                         screen.includes('refinance_mortgage') ? 'refinance_mortgage' :
                         'refinance_credit';
      
      // Add specific dropdown containers for this process
      const specificDropdowns = [];
      
      if (stepNumber === 1) {
        specificDropdowns.push(
          { key: `${screen}.field.loan_amount`, type: 'dropdown_container' },
          { key: `${screen}.field.loan_purpose`, type: 'dropdown_container' },
          { key: `${screen}.field.loan_period`, type: 'dropdown_container' }
        );
      }
      
      for (const dropdown of specificDropdowns) {
        await pool.query(`
          INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, 'form', true, NOW(), NOW())
          ON CONFLICT (content_key) DO NOTHING
        `, [dropdown.key, dropdown.type, screen]);
        console.log(`   Added specific dropdown: ${dropdown.key}`);
        totalCreated++;
      }
    }
    
    // Now copy translations for all the new content
    console.log(`\n🌐 Creating translations for new content...`);
    
    for (const screen of missingScreens) {
      const stepNumber = screen.includes('step1') ? 1 : screen.includes('step2') ? 2 : 3;
      const baseScreen = `mortgage_step${stepNumber}`;
      
      // Copy translations
      const translationQuery = `
        INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
        SELECT 
          new_items.id,
          ct.language_code,
          REPLACE(REPLACE(ct.content_value, 'mortgage', '${screen.includes('credit') ? 'credit' : 'refinance'}'), 'Mortgage', '${screen.includes('credit') ? 'Credit' : 'Refinance'}'),
          ct.status,
          NOW(),
          NOW()
        FROM content_items original_items
        JOIN content_translations ct ON original_items.id = ct.content_item_id
        JOIN content_items new_items ON new_items.content_key = REPLACE(original_items.content_key, '${baseScreen}', '${screen}')
        WHERE original_items.screen_location = '${baseScreen}'
          AND original_items.component_type IN ('dropdown_container', 'dropdown_option')
          AND new_items.screen_location = '${screen}'
      `;
      
      const translationResult = await pool.query(translationQuery);
      console.log(`   Created ${translationResult.rowCount} translations for ${screen}`);
    }
    
    // Commit transaction
    await pool.query('COMMIT');
    
    console.log(`\n✅ SUCCESS! Created ${totalCreated} content items with translations`);
    console.log(`📊 Verifying results...`);
    
    // Verify results
    for (const screen of missingScreens) {
      const checkResult = await pool.query(`
        SELECT COUNT(*) as count 
        FROM content_items 
        WHERE screen_location = $1 AND component_type IN ('dropdown_container', 'dropdown_option')
      `, [screen]);
      
      console.log(`   ${screen}: ${checkResult.rows[0].count} items`);
    }
    
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Error creating dropdown content:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  createMissingDropdownContent().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { createMissingDropdownContent };