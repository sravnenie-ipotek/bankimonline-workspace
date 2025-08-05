#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const translationFiles = [
    'public/locales/en/translation.json',
    'public/locales/he/translation.json', 
    'public/locales/ru/translation.json'
];

const migratedKeys = [
    'calculate_credit_add_additional_borrower',
    'calculate_credit_add_borrower_title',
    'calculate_credit_calculate',
    'calculate_credit_citizenship',
    'calculate_credit_citizenship_option_1',
    'calculate_credit_citizenship_option_2',
    'calculate_credit_citizenship_option_3',
    'calculate_credit_citizenship_ph',
    'calculate_credit_education',
    'calculate_credit_education_option_1',
    'calculate_credit_education_option_2',
    'calculate_credit_education_option_3',
    'calculate_credit_education_option_4',
    'calculate_credit_education_option_5',
    'calculate_credit_education_option_6',
    'calculate_credit_education_option_7',
    'calculate_credit_education_ph',
    'calculate_credit_family_status',
    'calculate_credit_family_status_option_1',
    'calculate_credit_family_status_option_2',
    'calculate_credit_family_status_option_3',
    'calculate_credit_family_status_option_4',
    'calculate_credit_family_status_option_5',
    'calculate_credit_family_status_option_6',
    'calculate_credit_family_status_ph',
    'calculate_credit_first_borrower_title',
    'calculate_credit_foreigner',
    'calculate_credit_foreigner_option_1',
    'calculate_credit_foreigner_option_2',
    'calculate_credit_medical_insurance',
    'calculate_credit_medical_insurance_option_1',
    'calculate_credit_medical_insurance_option_2',
    'calculate_credit_next_step',
    'calculate_credit_previous_step',
    'calculate_credit_prolong_option_1',
    'calculate_credit_prolong_option_2',
    'calculate_credit_prolong_option_3',
    'calculate_credit_prolong_option_4',
    'calculate_credit_prolong_option_5',
    'calculate_credit_prolong_option_6',
    'calculate_credit_prolong_option_7',
    'calculate_credit_public_person',
    'calculate_credit_public_person_option_1',
    'calculate_credit_public_person_option_2',
    'calculate_credit_step2_back_button',
    'calculate_credit_step2_next_button',
    'calculate_credit_step2_title',
    'calculate_credit_step3_birthday',
    'calculate_credit_step3_birthday_ph',
    'calculate_credit_step3_city',
    'calculate_credit_step3_city_ph',
    'calculate_credit_step3_family_name',
    'calculate_credit_step3_family_name_ph',
    'calculate_credit_step3_id',
    'calculate_credit_step3_id_ph',
    'calculate_credit_step3_private_name',
    'calculate_credit_step3_private_name_ph',
    'calculate_credit_step3_street',
    'calculate_credit_step3_street_ph',
    'calculate_credit_step3_title',
    'calculate_credit_step4_additional_income',
    'calculate_credit_step4_additional_income_ph',
    'calculate_credit_step4_employment_type',
    'calculate_credit_step4_employment_type_option_1',
    'calculate_credit_step4_employment_type_option_2',
    'calculate_credit_step4_employment_type_option_3',
    'calculate_credit_step4_employment_type_option_4',
    'calculate_credit_step4_employment_type_ph',
    'calculate_credit_step4_monthly_expenses',
    'calculate_credit_step4_monthly_expenses_ph',
    'calculate_credit_step4_monthly_salary',
    'calculate_credit_step4_monthly_salary_ph',
    'calculate_credit_step4_title',
    'calculate_credit_target_option_1',
    'calculate_credit_target_option_2',
    'calculate_credit_target_option_3',
    'calculate_credit_target_option_4',
    'calculate_credit_target_option_5',
    'calculate_credit_target_option_6',
    'calculate_credit_us_tax_reporting',
    'calculate_credit_us_tax_reporting_option_1',
    'calculate_credit_us_tax_reporting_option_2'
];

console.log('🔄 Adding __MIGRATED_ prefix to credit calculator keys...');
console.log(`📋 Processing ${migratedKeys.length} keys across ${translationFiles.length} translation files`);

let totalUpdated = 0;

translationFiles.forEach(filePath => {
    try {
        console.log(`\n📂 Processing: ${filePath}`);
        
        if (!fs.existsSync(filePath)) {
            console.log(`❌ File not found: ${filePath}`);
            return;
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const translations = JSON.parse(content);
        
        let fileUpdatedCount = 0;
        
        migratedKeys.forEach(key => {
            if (translations[key] && !key.startsWith('__MIGRATED_')) {
                const newKey = '__MIGRATED_' + key;
                translations[newKey] = translations[key];
                delete translations[key];
                fileUpdatedCount++;
                totalUpdated++;
            }
        });

        // Write back to file with proper formatting
        const updatedContent = JSON.stringify(translations, null, 2);
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        
        console.log(`✅ Updated ${fileUpdatedCount} keys in ${filePath}`);
        
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
});

console.log(`\n🎉 Migration complete! Total keys updated: ${totalUpdated}`);
console.log('📋 All credit calculator content is now available from database');
console.log('🔄 Translation files updated with __MIGRATED_ prefix for historical reference');