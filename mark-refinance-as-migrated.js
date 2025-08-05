const fs = require('fs');
const path = require('path');

function markAsMigrated() {
  console.log('📝 Marking refinance credit translations as migrated...\n');

  const languages = ['en', 'he', 'ru'];
  const directories = [
    'translations',
    'public/locales',
    'mainapp/public/locales'
  ];

  // Keys that were successfully migrated to database
  const migratedKeys = [
    'calculate_mortgage_add_partner',
    'calculate_mortgage_add_partner_title',
    'calculate_mortgage_birth_date',
    'calculate_mortgage_borrowers',
    'calculate_mortgage_borrowers_option_1',
    'calculate_mortgage_borrowers_option_2',
    'calculate_mortgage_borrowers_option_3',
    'calculate_mortgage_borrowers_option_4',
    'calculate_mortgage_borrowers_option_5',
    'calculate_mortgage_borrowers_ph',
    'calculate_mortgage_children18',
    'calculate_mortgage_children18_option_1',
    'calculate_mortgage_children18_option_2',
    'calculate_mortgage_children18_option_3',
    'calculate_mortgage_children18_option_4',
    'calculate_mortgage_children18_option_5',
    'calculate_mortgage_children18_ph',
    'calculate_mortgage_citizenship',
    'calculate_mortgage_citizenship_option_1',
    'calculate_mortgage_citizenship_option_2',
    'calculate_mortgage_citizenship_option_3',
    'calculate_mortgage_citizenship_option_4',
    'calculate_mortgage_citizenship_option_5',
    'calculate_mortgage_citizenship_option_6',
    'calculate_mortgage_citizenship_option_7',
    'calculate_mortgage_citizenship_option_8',
    'calculate_mortgage_citizenship_option_9',
    'calculate_mortgage_citizenship_ph',
    'calculate_mortgage_citizenship_title',
    'calculate_mortgage_ctx',
    'calculate_mortgage_education',
    'calculate_mortgage_education_option_1',
    'calculate_mortgage_education_option_2',
    'calculate_mortgage_education_option_3',
    'calculate_mortgage_education_option_4',
    'calculate_mortgage_education_option_5',
    'calculate_mortgage_education_option_6',
    'calculate_mortgage_education_option_7',
    'calculate_mortgage_education_ph'
  ];

  let totalMarked = 0;

  for (const dir of directories) {
    for (const lang of languages) {
      const filePath = path.join(__dirname, dir, lang, 'translation.json');
      
      if (!fs.existsSync(filePath)) {
        continue;
      }

      console.log(`\n📄 Processing: ${filePath}`);
      
      const translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let markedCount = 0;
      
      // Create a new object to maintain order
      const updatedTranslations = {};
      
      for (const [key, value] of Object.entries(translations)) {
        // Skip if already marked as migrated
        if (key.startsWith('__MIGRATED_')) {
          updatedTranslations[key] = value;
          continue;
        }
        
        // If this key is in our migrated list, mark it
        if (migratedKeys.includes(key)) {
          // Add the migrated version with reference info
          updatedTranslations[`__MIGRATED_${key}`] = `MIGRATED to database - screen_location: refinance_credit_2, content_key: ${key}`;
          markedCount++;
          console.log(`   ✅ Marked: ${key}`);
        } else {
          // Keep the original key
          updatedTranslations[key] = value;
        }
      }
      
      if (markedCount > 0) {
        // Write the updated file
        fs.writeFileSync(filePath, JSON.stringify(updatedTranslations, null, 2), 'utf8');
        console.log(`   💾 Saved: ${markedCount} keys marked as migrated`);
        totalMarked += markedCount;
      } else {
        console.log(`   ℹ️  No changes needed`);
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Total keys marked as migrated: ${totalMarked}`);
  console.log('\n📝 Next steps:');
  console.log('1. Run: npm run sync-translations');
  console.log('2. Test the application to ensure content loads from database');
  console.log('3. Components should now use database content via useContentApi');
}

markAsMigrated();