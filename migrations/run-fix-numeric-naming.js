const { Pool } = require('pg');

async function runMigration() {
  const pool = new Pool({ 
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway'
  });
  
  try {
    console.log('🚀 Running complete migration to fix numeric dropdown naming...');
    console.log('🔗 Connecting to Railway database...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    // Start transaction
    await pool.query('BEGIN');
    
    // All UPDATE statements
    const updates = [
      // When Money Needed Options
      "UPDATE content_items SET content_key = 'mortgage_step1_field_when_needed_immediately' WHERE content_key = 'mortgage_step1_field_when_needed_option_1'",
      "UPDATE content_items SET content_key = 'mortgage_step1_field_when_needed_within_month' WHERE content_key = 'mortgage_step1_field_when_needed_option_2'",
      "UPDATE content_items SET content_key = 'mortgage_step1_field_when_needed_within_3months' WHERE content_key = 'mortgage_step1_field_when_needed_option_3'",
      "UPDATE content_items SET content_key = 'mortgage_step1_field_when_needed_within_6months' WHERE content_key = 'mortgage_step1_field_when_needed_option_4'",
      
      // Credit Purpose Options
      "UPDATE content_items SET content_key = 'calculate_credit_credit_purpose_new_car' WHERE content_key = 'calculate_credit_credit_purpose_option_1'",
      "UPDATE content_items SET content_key = 'calculate_credit_credit_purpose_used_car' WHERE content_key = 'calculate_credit_credit_purpose_option_2'",
      "UPDATE content_items SET content_key = 'calculate_credit_credit_purpose_home_renovation' WHERE content_key = 'calculate_credit_credit_purpose_option_3'",
      "UPDATE content_items SET content_key = 'calculate_credit_credit_purpose_vacation' WHERE content_key = 'calculate_credit_credit_purpose_option_4'",
      "UPDATE content_items SET content_key = 'calculate_credit_credit_purpose_wedding' WHERE content_key = 'calculate_credit_credit_purpose_option_5'",
      "UPDATE content_items SET content_key = 'calculate_credit_credit_purpose_medical' WHERE content_key = 'calculate_credit_credit_purpose_option_6'",
      "UPDATE content_items SET content_key = 'calculate_credit_credit_purpose_other' WHERE content_key = 'calculate_credit_credit_purpose_option_7'",
      
      // Marital Status Options
      "UPDATE content_items SET content_key = 'personal_data_marital_status_single' WHERE content_key = 'personal_data_marital_status_option_1'",
      "UPDATE content_items SET content_key = 'personal_data_marital_status_married' WHERE content_key = 'personal_data_marital_status_option_2'",
      "UPDATE content_items SET content_key = 'personal_data_marital_status_divorced' WHERE content_key = 'personal_data_marital_status_option_3'",
      "UPDATE content_items SET content_key = 'personal_data_marital_status_widowed' WHERE content_key = 'personal_data_marital_status_option_4'",
      "UPDATE content_items SET content_key = 'personal_data_marital_status_separated' WHERE content_key = 'personal_data_marital_status_option_5'",
      "UPDATE content_items SET content_key = 'personal_data_marital_status_cohabiting' WHERE content_key = 'personal_data_marital_status_option_6'",
      
      // Education Options
      "UPDATE content_items SET content_key = 'calculate_mortgage_education_elementary' WHERE content_key = 'calculate_mortgage_education_option_1'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_education_high_school' WHERE content_key = 'calculate_mortgage_education_option_2'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_education_high_school_diploma' WHERE content_key = 'calculate_mortgage_education_option_3'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_education_professional' WHERE content_key = 'calculate_mortgage_education_option_4'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_education_bachelors' WHERE content_key = 'calculate_mortgage_education_option_5'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_education_masters' WHERE content_key = 'calculate_mortgage_education_option_6'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_education_doctorate' WHERE content_key = 'calculate_mortgage_education_option_7'",
      
      // Refinance Credit - Why Options
      "UPDATE content_items SET content_key = 'app.refinance_credit.step1.why_reduce_monthly' WHERE content_key = 'app.refinance_credit.step1.why_option_1'",
      "UPDATE content_items SET content_key = 'app.refinance_credit.step1.why_reduce_amount' WHERE content_key = 'app.refinance_credit.step1.why_option_2'",
      "UPDATE content_items SET content_key = 'app.refinance_credit.step1.why_consolidate' WHERE content_key = 'app.refinance_credit.step1.why_option_3'",
      "UPDATE content_items SET content_key = 'app.refinance_credit.step1.why_other' WHERE content_key = 'app.refinance_credit.step1.why_option_4'",
      
      // Main Source of Income Options
      "UPDATE content_items SET content_key = 'calculate_mortgage_main_source_salary' WHERE content_key = 'calculate_mortgage_main_source_option_1'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_main_source_business' WHERE content_key = 'calculate_mortgage_main_source_option_2'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_main_source_freelance' WHERE content_key = 'calculate_mortgage_main_source_option_3'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_main_source_pension' WHERE content_key = 'calculate_mortgage_main_source_option_4'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_main_source_investment' WHERE content_key = 'calculate_mortgage_main_source_option_5'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_main_source_rental' WHERE content_key = 'calculate_mortgage_main_source_option_6'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_main_source_other' WHERE content_key = 'calculate_mortgage_main_source_option_7'",
      
      // Additional Income Options
      "UPDATE content_items SET content_key = 'calculate_mortgage_has_additional_salary' WHERE content_key = 'calculate_mortgage_has_additional_option_1'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_has_additional_business' WHERE content_key = 'calculate_mortgage_has_additional_option_2'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_has_additional_freelance' WHERE content_key = 'calculate_mortgage_has_additional_option_3'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_has_additional_pension' WHERE content_key = 'calculate_mortgage_has_additional_option_4'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_has_additional_investment' WHERE content_key = 'calculate_mortgage_has_additional_option_5'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_has_additional_rental' WHERE content_key = 'calculate_mortgage_has_additional_option_6'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_has_additional_other' WHERE content_key = 'calculate_mortgage_has_additional_option_7'",
      
      // Debt Types Options
      "UPDATE content_items SET content_key = 'calculate_mortgage_debt_types_mortgage' WHERE content_key = 'calculate_mortgage_debt_types_option_1'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_debt_types_car_loan' WHERE content_key = 'calculate_mortgage_debt_types_option_2'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_debt_types_student_loan' WHERE content_key = 'calculate_mortgage_debt_types_option_3'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_debt_types_credit_card' WHERE content_key = 'calculate_mortgage_debt_types_option_4'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_debt_types_other' WHERE content_key = 'calculate_mortgage_debt_types_option_5'",
      
      // Property Type Options
      "UPDATE content_items SET content_key = 'calculate_mortgage_type_apartment' WHERE content_key = 'calculate_mortgage_type_options_1'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_type_private_house' WHERE content_key = 'calculate_mortgage_type_options_2'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_type_penthouse' WHERE content_key = 'calculate_mortgage_type_options_3'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_type_land' WHERE content_key = 'calculate_mortgage_type_options_4'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_type_commercial' WHERE content_key = 'calculate_mortgage_type_options_5'",
      
      // First Home Options
      "UPDATE content_items SET content_key = 'calculate_mortgage_first_yes' WHERE content_key = 'calculate_mortgage_first_options_1'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_first_no' WHERE content_key = 'calculate_mortgage_first_options_2'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_first_improvement' WHERE content_key = 'calculate_mortgage_first_options_3'",
      
      // Property Ownership Options
      "UPDATE content_items SET content_key = 'calculate_mortgage_property_ownership_no_property' WHERE content_key = 'calculate_mortgage_property_ownership_option_1'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_property_ownership_has_property' WHERE content_key = 'calculate_mortgage_property_ownership_option_2'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_property_ownership_selling_property' WHERE content_key = 'calculate_mortgage_property_ownership_option_3'",
      
      // Family Status Options
      "UPDATE content_items SET content_key = 'calculate_mortgage_family_status_single' WHERE content_key = 'calculate_mortgage_family_status_option_1'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_family_status_married' WHERE content_key = 'calculate_mortgage_family_status_option_2'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_family_status_divorced' WHERE content_key = 'calculate_mortgage_family_status_option_3'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_family_status_widowed' WHERE content_key = 'calculate_mortgage_family_status_option_4'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_family_status_separated' WHERE content_key = 'calculate_mortgage_family_status_option_5'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_family_status_cohabiting' WHERE content_key = 'calculate_mortgage_family_status_option_6'",
      
      // Mortgage Filter Options
      "UPDATE content_items SET content_key = 'calculate_mortgage_filter_best_monthly' WHERE content_key = 'calculate_mortgage_filter_1'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_filter_best_rate' WHERE content_key = 'calculate_mortgage_filter_2'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_filter_best_total' WHERE content_key = 'calculate_mortgage_filter_3'",
      "UPDATE content_items SET content_key = 'calculate_mortgage_filter_recommended' WHERE content_key = 'calculate_mortgage_filter_4'",
      
      // Refinance Mortgage - Why Options
      "UPDATE content_items SET content_key = 'mortgage_refinance_why_lower_payment' WHERE content_key = 'mortgage_refinance_why_option_1'",
      "UPDATE content_items SET content_key = 'mortgage_refinance_why_better_rate' WHERE content_key = 'mortgage_refinance_why_option_2'",
      "UPDATE content_items SET content_key = 'mortgage_refinance_why_cash_out' WHERE content_key = 'mortgage_refinance_why_option_3'",
      "UPDATE content_items SET content_key = 'mortgage_refinance_why_change_terms' WHERE content_key = 'mortgage_refinance_why_option_4'",
      "UPDATE content_items SET content_key = 'mortgage_refinance_why_other' WHERE content_key = 'mortgage_refinance_why_option_5'",
      
      // Refinance Mortgage - Registration Options
      "UPDATE content_items SET content_key = 'mortgage_refinance_reg_on_me' WHERE content_key = 'mortgage_refinance_reg_option_1'",
      "UPDATE content_items SET content_key = 'mortgage_refinance_reg_on_other' WHERE content_key = 'mortgage_refinance_reg_option_2'",
      
      // Refinance Mortgage - Program Options
      "UPDATE content_items SET content_key = 'program_refinance_mortgage_prime' WHERE content_key = 'program_refinance_mortgage_option_1'",
      "UPDATE content_items SET content_key = 'program_refinance_mortgage_fixed' WHERE content_key = 'program_refinance_mortgage_option_2'",
      "UPDATE content_items SET content_key = 'program_refinance_mortgage_variable' WHERE content_key = 'program_refinance_mortgage_option_3'",
      "UPDATE content_items SET content_key = 'program_refinance_mortgage_eligibility' WHERE content_key = 'program_refinance_mortgage_option_4'",
      "UPDATE content_items SET content_key = 'program_refinance_mortgage_other' WHERE content_key = 'program_refinance_mortgage_option_5'"
    ];
    
    let totalUpdated = 0;
    console.log('\n📝 Executing ' + updates.length + ' update statements...');
    
    for (let i = 0; i < updates.length; i++) {
      const result = await pool.query(updates[i]);
      if (result.rowCount > 0) {
        totalUpdated += result.rowCount;
        console.log(`  ✓ Statement ${i + 1}: Updated ${result.rowCount} rows`);
      }
    }
    
    console.log('\n✅ Total rows updated: ' + totalUpdated);
    
    // Update timestamps
    await pool.query("UPDATE content_items SET updated_at = NOW() WHERE updated_at < NOW() - INTERVAL '1 minute'");
    
    // Commit transaction
    await pool.query('COMMIT');
    console.log('✅ Transaction committed successfully');
    
    // Verification
    console.log('\n🔍 Verification Results:');
    
    // Check for remaining numeric patterns
    const remaining = await pool.query(
      "SELECT COUNT(*) as count FROM content_items WHERE component_type = 'option' AND (content_key LIKE '%_option_%' OR content_key LIKE '%_options_%' OR content_key ~ '_[0-9]+$')"
    );
    console.log('Remaining numeric patterns: ' + remaining.rows[0].count);
    
    // Show samples of updated names
    const samples = await pool.query(
      "SELECT content_key, screen_location FROM content_items WHERE component_type = 'option' AND (content_key LIKE '%mortgage%' OR content_key LIKE '%credit%') AND content_key NOT LIKE '%_option_%' ORDER BY screen_location, content_key LIMIT 15"
    );
    
    console.log('\n📋 Sample of updated dropdown options:');
    let currentScreen = '';
    samples.rows.forEach(row => {
      if (row.screen_location !== currentScreen) {
        currentScreen = row.screen_location;
        console.log('\n  ' + currentScreen + ':');
      }
      console.log('    - ' + row.content_key);
    });
    
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('\n❌ Migration failed, rolled back:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration();