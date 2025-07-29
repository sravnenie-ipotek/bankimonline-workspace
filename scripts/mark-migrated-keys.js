const fs = require('fs');
const path = require('path');

// List of keys that have been migrated to the database
const migratedKeys = [
  'credit_refinance_title',
  'credit_refinance_banner_subtext',
  'mortgage_credit_why',
  'credit_refinance_why_ph',
  'calculate_credit_why_option_1',
  'calculate_credit_why_option_2',
  'calculate_credit_why_option_3',
  'calculate_credit_why_option_4',
  'list_credits_title',
  'bank_apply_credit',
  'bank_hapoalim',
  'bank_leumi',
  'bank_discount',
  'bank_massad',
  'bank_israel',
  'amount_credit_title',
  'calculate_mortgage_initial_payment',
  'refinance_credit_start_date',
  'refinance_credit_end_date',
  'early_repayment',
  'add_credit',
  'desired_monthly_payment',
  'credit_loan_period',
  'calculate_mortgage_period_units_max',
  'calculate_mortgage_period_units_min',
  'date_ph',
  'calculate_mortgage_first_ph'
];

// Languages to process
const languages = ['en', 'he', 'ru'];

languages.forEach(lang => {
  const filePath = path.join(__dirname, '..', 'translations', `${lang}.json`);
  
  if (fs.existsSync(filePath)) {
    console.log(`Processing ${lang} translation file...`);
    
    const translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let markedCount = 0;

    migratedKeys.forEach(key => {
      if (translations[key] && !translations[`__MIGRATED_${key}`]) {
        // Mark as migrated (preserve original for fallback)
        translations[`__MIGRATED_${key}`] = `MIGRATED to database - screen_location: refinance_credit_1, content_key: ${key}`;
        markedCount++;
        console.log(`✅ MARKED: ${key} → __MIGRATED_${key} in ${lang}`);
      }
    });

    if (markedCount > 0) {
      // Save updated file
      fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8');
      console.log(`💾 SAVED: ${markedCount} keys marked in ${lang}/translation.json`);
    } else {
      console.log(`ℹ️  No new keys to mark in ${lang}`);
    }
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('\n🎉 Migration marking completed!');
console.log('📝 All migrated keys have been marked with __MIGRATED_ prefix');
console.log('🔄 Original keys are preserved as fallbacks');
console.log('🗄️  Database content is now the primary source'); 