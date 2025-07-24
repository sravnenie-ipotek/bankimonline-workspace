const fs = require('fs');
const path = require('path');

// List of keys that have been migrated to the database
const migratedKeys = [
  'calculate_mortgage',
  'calculate_mortgage_calculator',
  'calculate_mortgage_filter_title',
  'video_calculate_mortgage_title',
  'calculate_mortgage_banner_subtext',
  'calculate_mortgage_parameters',
  'calculate_mortgage_parameters_initial',
  'calculate_mortgage_profile_title',
  'calculate_mortgage_price',
  'calculate_mortgage_initial_fee',
  'calculate_mortgage_period',
  'calculate_mortgage_monthly_payment',
  'calculate_mortgage_city',
  'calculate_mortgage_property_ownership',
  'calculate_mortgage_property_ownership_ph',
  'calculate_mortgage_property_ownership_option_1',
  'calculate_mortgage_property_ownership_option_2',
  'calculate_mortgage_property_ownership_option_3',
  'calculate_mortgage_type',
  'calculate_mortgage_type_ph',
  'calculate_mortgage_type_options_1',
  'calculate_mortgage_type_options_2',
  'calculate_mortgage_type_options_3',
  'calculate_mortgage_type_options_4',
  'calculate_mortgage_type_options_5',
  'calculate_mortgage_first',
  'calculate_mortgage_first_ph',
  'calculate_mortgage_first_options_1',
  'calculate_mortgage_first_options_2',
  'calculate_mortgage_first_options_3',
  'calculate_mortgage_when',
  'calculate_mortgage_when_options_ph',
  'calculate_mortgage_when_options_1',
  'calculate_mortgage_when_options_2',
  'calculate_mortgage_when_options_3',
  'calculate_mortgage_when_options_4',
  'show_offers',
  'calculate_mortgage_add_partner',
  'calculate_mortgage_name_surname',
  'calculate_mortgage_name_surname_ph',
  'calculate_mortgage_birth_date',
  'calculate_mortgage_education',
  'calculate_mortgage_education_ph',
  'calculate_mortgage_education_option_1',
  'calculate_mortgage_education_option_2',
  'calculate_mortgage_education_option_3',
  'calculate_mortgage_education_option_4',
  'calculate_mortgage_education_option_5',
  'calculate_mortgage_education_option_6',
  'calculate_mortgage_education_option_7',
  'calculate_mortgage_family_status',
  'calculate_mortgage_family_status_ph',
  'calculate_mortgage_family_status_option_1',
  'calculate_mortgage_family_status_option_2',
  'calculate_mortgage_family_status_option_3',
  'calculate_mortgage_family_status_option_4',
  'calculate_mortgage_family_status_option_5',
  'calculate_mortgage_family_status_option_6',
  'calculate_mortgage_company',
  'calculate_mortgage_profession',
  'calculate_mortgage_profession_ph',
  'calculate_mortgage_start_date',
  'calculate_mortgage_monthly_income',
  'calculate_mortgage_monthly_income_ph',
  'calculate_mortgage_monthly_income_hint',
  'calculate_mortgage_main_source',
  'calculate_mortgage_main_source_ph',
  'calculate_mortgage_main_source_option_1',
  'calculate_mortgage_main_source_option_2',
  'calculate_mortgage_main_source_option_3',
  'calculate_mortgage_main_source_option_4',
  'calculate_mortgage_main_source_option_5',
  'calculate_mortgage_main_source_option_6',
  'calculate_mortgage_main_source_option_7',
  'calculate_mortgage_sphere',
  'calculate_mortgage_sphere_option_1',
  'calculate_mortgage_sphere_option_2',
  'calculate_mortgage_sphere_option_3',
  'calculate_mortgage_sphere_option_4',
  'calculate_mortgage_sphere_option_5',
  'calculate_mortgage_sphere_option_6',
  'calculate_mortgage_sphere_option_7',
  'calculate_mortgage_sphere_option_8',
  'calculate_mortgage_sphere_option_9',
  'calculate_mortgage_sphere_option_10',
  'calculate_mortgage_has_additional',
  'calculate_mortgage_has_additional_ph',
  'calculate_mortgage_has_additional_option_1',
  'calculate_mortgage_has_additional_option_2',
  'calculate_mortgage_has_additional_option_3',
  'calculate_mortgage_has_additional_option_4',
  'calculate_mortgage_has_additional_option_5',
  'calculate_mortgage_has_additional_option_6',
  'calculate_mortgage_has_additional_option_7',
  'calculate_mortgage_debt_types',
  'calculate_mortgage_debt_types_ph',
  'calculate_mortgage_debt_types_option_1',
  'calculate_mortgage_debt_types_option_2',
  'calculate_mortgage_debt_types_option_3',
  'calculate_mortgage_debt_types_option_4',
  'calculate_mortgage_debt_types_option_5',
  'calculate_mortgage_citizenship',
  'calculate_mortgage_citizenship_ph',
  'calculate_mortgage_is_foreigner',
  'calculate_mortgage_is_medinsurance',
  'calculate_mortgage_is_public',
  'calculate_mortgage_tax',
  'calculate_mortgage_partner_pay_mortgage',
  'calculate_mortgage_borrowers',
  'calculate_mortgage_children18',
  'calculate_mortgage_how_much_childrens',
  'calculate_mortgage_period_units_min',
  'calculate_mortgage_period_units_max',
  'calculate_mortgage_parameters_months',
  'calculate_mortgage_parameters_cost',
  'calculate_mortgage_monthy_income_title',
  'calculate_mortgage_step3_ctx',
  'calculate_mortgage_ctx',
  'calculate_mortgage_ctx_1',
  'calculate_mortgage_bank',
  'calculate_mortgage_end_date'
];

// Language files to update
const languages = ['en', 'he', 'ru'];

function commentOutKeys() {
  for (const lang of languages) {
    const filePath = path.join(__dirname, `../mainapp/public/locales/${lang}/translation.json`);
    
    try {
      // Read the file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const translations = JSON.parse(fileContent);
      
      // Comment out migrated keys by prefixing with __MIGRATED_
      let keysCommented = 0;
      for (const key of migratedKeys) {
        if (translations[key] !== undefined) {
          // Store the original value with __MIGRATED_ prefix
          translations[`__MIGRATED_${key}`] = translations[key];
          // Delete the original key
          delete translations[key];
          keysCommented++;
        }
      }
      
      // Write the updated file
      fs.writeFileSync(filePath, JSON.stringify(translations, null, 2) + '\n', 'utf8');
      
      console.log(`✓ Updated ${lang}/translation.json - commented out ${keysCommented} keys`);
      
    } catch (error) {
      console.error(`Error processing ${lang}/translation.json:`, error.message);
    }
  }
}

// Run the script
console.log('Commenting out migrated keys in translation files...\n');
commentOutKeys();
console.log('\nCompleted! All migrated keys have been prefixed with __MIGRATED_');