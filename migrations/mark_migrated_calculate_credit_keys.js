const fs = require('fs');
const path = require('path');

// List of migrated keys for Calculate Credit
const migratedKeys = [
  // Step 1 - Labels and Placeholders
  'calculate_why',
  'calculate_amount', 
  'calculate_when',
  'calculate_prolong',
  'calculate_credit_target_ph',
  'calculate_credit_prolong_ph',
  'calculate_mortgage_when_options_Time',
  
  // Step 1 - Options (already migrated)
  'calculate_credit_target_option_1',
  'calculate_credit_target_option_2',
  'calculate_credit_target_option_3',
  'calculate_credit_target_option_4',
  'calculate_credit_target_option_5',
  'calculate_credit_target_option_6',
  'calculate_mortgage_when_options_1',
  'calculate_mortgage_when_options_2',
  'calculate_mortgage_when_options_3',
  'calculate_mortgage_when_options_4',
  'calculate_credit_prolong_option_1',
  'calculate_credit_prolong_option_2',
  'calculate_credit_prolong_option_3',
  'calculate_credit_prolong_option_4',
  'calculate_credit_prolong_option_5',
  'calculate_credit_prolong_option_6',
  'calculate_credit_prolong_option_7',
  
  // Step 2 - Already migrated in DB
  'calculate_credit_step2_title',
  'calculate_credit_citizenship',
  'calculate_credit_citizenship_ph',
  'calculate_credit_citizenship_option_1',
  'calculate_credit_citizenship_option_2',
  'calculate_credit_citizenship_option_3',
  'calculate_credit_education',
  'calculate_credit_education_ph',
  'calculate_credit_education_option_1',
  'calculate_credit_education_option_2',
  'calculate_credit_education_option_3',
  'calculate_credit_education_option_4',
  'calculate_credit_education_option_5',
  'calculate_credit_education_option_6',
  'calculate_credit_education_option_7',
  'calculate_credit_family_status',
  'calculate_credit_family_status_ph',
  'calculate_credit_family_status_option_1',
  'calculate_credit_family_status_option_2',
  'calculate_credit_family_status_option_3',
  'calculate_credit_family_status_option_4',
  'calculate_credit_family_status_option_5',
  'calculate_credit_family_status_option_6',
  
  // Step 3 - Just migrated
  'credit_step3_title',
  'add_place_to_work',
  'add_additional_source_of_income',
  'add_obligation',
  'add_borrower',
  'main_income_source',
  'borrower',
  
  // Step 4 - Just migrated
  'calculate_credit_final',
  'calculate_credit_warning'
];

// Function to mark keys as migrated
function markKeysAsMigrated(filePath, screenLocation) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    let modified = false;
    
    migratedKeys.forEach(key => {
      if (data[key] !== undefined) {
        // Store original value
        const originalValue = data[key];
        
        // Mark as migrated
        delete data[key];
        data[`__MIGRATED_${key}`] = `MIGRATED to database - screen_location: ${screenLocation}, content_key: ${key}`;
        
        console.log(`✅ Marked as migrated: ${key}`);
        modified = true;
      }
    });
    
    if (modified) {
      // Write back with proper formatting
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
      console.log(`📝 Updated: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Process all language files
const languages = ['en', 'he', 'ru'];
const baseDir = path.join(__dirname, '../mainapp/public/locales');

languages.forEach(lang => {
  const filePath = path.join(baseDir, lang, 'translation.json');
  console.log(`\n🔄 Processing ${lang} translations...`);
  
  // Map keys to their screen locations
  const screenLocations = {
    'calculate_why': 'calculate_credit_1',
    'calculate_amount': 'calculate_credit_1',
    'calculate_when': 'calculate_credit_1',
    'calculate_prolong': 'calculate_credit_1',
    'calculate_credit_target_ph': 'calculate_credit_1',
    'calculate_credit_prolong_ph': 'calculate_credit_1',
    'calculate_mortgage_when_options_Time': 'calculate_credit_1',
    'credit_step3_title': 'calculate_credit_3',
    'add_place_to_work': 'calculate_credit_3',
    'add_additional_source_of_income': 'calculate_credit_3',
    'add_obligation': 'calculate_credit_3',
    'add_borrower': 'calculate_credit_3',
    'main_income_source': 'calculate_credit_3',
    'borrower': 'calculate_credit_3',
    'calculate_credit_final': 'calculate_credit_4',
    'calculate_credit_warning': 'calculate_credit_4'
  };
  
  markKeysAsMigrated(filePath, 'various - see individual keys');
});

console.log('\n✅ Migration marking complete!');