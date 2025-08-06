const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });
const pool = new Pool({ connectionString: process.env.CONTENT_DATABASE_URL });

async function createComprehensiveDropdownContent() {
  console.log('🚀 Creating comprehensive dropdown content for all missing processes...\n');
  
  try {
    await pool.query('BEGIN');
    
    const missingScreens = [
      'credit_step1', 'credit_step2', 'credit_step3',
      'refinance_mortgage_step1', 'refinance_mortgage_step2', 'refinance_mortgage_step3',
      'refinance_credit_step1', 'refinance_credit_step2', 'refinance_credit_step3'
    ];
    
    // Define standard dropdown content for each step type
    const dropdownTemplates = {
      step1: [
        // Basic form fields
        { key: 'field.loan_amount', type: 'dropdown_container', options: [] },
        { key: 'field.loan_period', type: 'dropdown_container', options: [
          'period_5_years', 'period_10_years', 'period_15_years', 'period_20_years', 'period_25_years', 'period_30_years'
        ]},
        { key: 'field.loan_purpose', type: 'dropdown_container', options: [
          'purpose_investment', 'purpose_personal', 'purpose_business', 'purpose_other'
        ]},
        { key: 'field.city', type: 'dropdown_container', options: [] },
        { key: 'field.when_needed', type: 'dropdown_container', options: [
          'when_needed_within_3_months', 'when_needed_3_to_6_months', 'when_needed_6_to_12_months', 'when_needed_over_12_months'
        ]},
      ],
      step2: [
        // Personal information
        { key: 'field.education', type: 'dropdown_container', options: [
          'education_no_high_school_diploma', 'education_partial_high_school_diploma', 'education_full_high_school_diploma',
          'education_postsecondary_education', 'education_bachelors', 'education_masters', 'education_doctorate'
        ]},
        { key: 'field.family_status', type: 'dropdown_container', options: [
          'family_status_single', 'family_status_married', 'family_status_divorced', 'family_status_widowed', 'family_status_commonlaw_partner', 'family_status_other'
        ]},
        { key: 'field.citizenship', type: 'dropdown_container', options: [
          'citizenship_israel', 'citizenship_united_states', 'citizenship_canada', 'citizenship_united_kingdom', 
          'citizenship_france', 'citizenship_germany', 'citizenship_russia', 'citizenship_ukraine', 'citizenship_other'
        ]},
        { key: 'field.how_much_childrens', type: 'dropdown_container', options: [] },
      ],
      step3: [
        // Income information
        { key: 'field.main_source', type: 'dropdown_container', options: [
          'main_source_employee', 'main_source_selfemployed', 'main_source_unemployed', 'main_source_student',
          'main_source_pension', 'main_source_unpaid_leave', 'main_source_other'
        ]},
        { key: 'field.additional_income', type: 'dropdown_container', options: [
          'additional_income_no_additional_income', 'additional_income_additional_salary', 'additional_income_additional_work',
          'additional_income_investment', 'additional_income_property_rental_income', 'additional_income_pension', 'additional_income_other'
        ]},
        { key: 'field.obligations', type: 'dropdown_container', options: [
          'obligations_no_obligations', 'obligations_credit_card', 'obligations_bank_loan', 'obligations_consumer_credit', 'obligations_other'
        ]},
      ]
    };
    
    // Standard translations
    const translations = {
      en: {
        // Step 1
        'field.loan_amount': 'Loan Amount',
        'field.loan_period': 'Loan Period',
        'field.loan_purpose': 'Loan Purpose',
        'field.city': 'City',
        'field.when_needed': 'When do you need the loan?',
        'period_5_years': '5 years',
        'period_10_years': '10 years',
        'period_15_years': '15 years',
        'period_20_years': '20 years',
        'period_25_years': '25 years',
        'period_30_years': '30 years',
        'purpose_investment': 'Investment',
        'purpose_personal': 'Personal use',
        'purpose_business': 'Business',
        'purpose_other': 'Other',
        'when_needed_within_3_months': 'Within 3 months',
        'when_needed_3_to_6_months': '3-6 months',
        'when_needed_6_to_12_months': '6-12 months',
        'when_needed_over_12_months': 'Over 12 months',
        
        // Step 2
        'field.education': 'Education',
        'field.family_status': 'Family Status',
        'field.citizenship': 'Citizenship',
        'field.how_much_childrens': 'Number of Children',
        'education_no_high_school_diploma': 'No high school diploma',
        'education_partial_high_school_diploma': 'Partial high school',
        'education_full_high_school_diploma': 'High school diploma',
        'education_postsecondary_education': 'Post-secondary education',
        'education_bachelors': 'Bachelor\'s degree',
        'education_masters': 'Master\'s degree',
        'education_doctorate': 'Doctorate',
        'family_status_single': 'Single',
        'family_status_married': 'Married',
        'family_status_divorced': 'Divorced',
        'family_status_widowed': 'Widowed',
        'family_status_commonlaw_partner': 'Common-law partner',
        'family_status_other': 'Other',
        'citizenship_israel': 'Israeli citizen',
        'citizenship_united_states': 'United States',
        'citizenship_canada': 'Canada',
        'citizenship_united_kingdom': 'United Kingdom',
        'citizenship_france': 'France',
        'citizenship_germany': 'Germany',
        'citizenship_russia': 'Russia',
        'citizenship_ukraine': 'Ukraine',
        'citizenship_other': 'Other',
        
        // Step 3
        'field.main_source': 'Main Income Source',
        'field.additional_income': 'Additional Income',
        'field.obligations': 'Financial Obligations',
        'main_source_employee': 'Employee',
        'main_source_selfemployed': 'Self-employed',
        'main_source_unemployed': 'Unemployed',
        'main_source_student': 'Student',
        'main_source_pension': 'Pension',
        'main_source_unpaid_leave': 'Unpaid leave',
        'main_source_other': 'Other',
        'additional_income_no_additional_income': 'No additional income',
        'additional_income_additional_salary': 'Additional salary',
        'additional_income_additional_work': 'Additional work',
        'additional_income_investment': 'Investment income',
        'additional_income_property_rental_income': 'Property rental income',
        'additional_income_pension': 'Pension',
        'additional_income_other': 'Other',
        'obligations_no_obligations': 'No obligations',
        'obligations_credit_card': 'Credit card debt',
        'obligations_bank_loan': 'Bank loan',
        'obligations_consumer_credit': 'Consumer credit',
        'obligations_other': 'Other obligations'
      },
      he: {
        // Step 1
        'field.loan_amount': 'סכום ההלוואה',
        'field.loan_period': 'תקופת ההלוואה',
        'field.loan_purpose': 'מטרת ההלוואה',
        'field.city': 'עיר',
        'field.when_needed': 'מתי אתה צריך את ההלוואה?',
        'period_5_years': '5 שנים',
        'period_10_years': '10 שנים',
        'period_15_years': '15 שנים',
        'period_20_years': '20 שנים',
        'period_25_years': '25 שנים',
        'period_30_years': '30 שנים',
        'purpose_investment': 'השקעה',
        'purpose_personal': 'שימוש אישי',
        'purpose_business': 'עסק',
        'purpose_other': 'אחר',
        'when_needed_within_3_months': 'תוך 3 חודשים',
        'when_needed_3_to_6_months': '3-6 חודשים',
        'when_needed_6_to_12_months': '6-12 חודשים',
        'when_needed_over_12_months': 'מעל 12 חודשים',
        
        // Step 2
        'field.education': 'השכלה',
        'field.family_status': 'מצב משפחתי',
        'field.citizenship': 'אזרחות',
        'field.how_much_childrens': 'מספר ילדים',
        'education_no_high_school_diploma': 'ללא תעודת בגרות',
        'education_partial_high_school_diploma': 'בגרות חלקית',
        'education_full_high_school_diploma': 'תעודת בגרות מלאה',
        'education_postsecondary_education': 'השכלה על-תיכונית',
        'education_bachelors': 'תואר ראשון',
        'education_masters': 'תואר שני',
        'education_doctorate': 'דוקטורט',
        'family_status_single': 'רווק/ה',
        'family_status_married': 'נשוי/אה',
        'family_status_divorced': 'גרוש/ה',
        'family_status_widowed': 'אלמן/ה',
        'family_status_commonlaw_partner': 'ידוע/ה בציבור',
        'family_status_other': 'אחר',
        'citizenship_israel': 'אזרח ישראלי',
        'citizenship_united_states': 'ארצות הברית',
        'citizenship_canada': 'קנדה',
        'citizenship_united_kingdom': 'בריטניה',
        'citizenship_france': 'צרפת',
        'citizenship_germany': 'גרמניה',
        'citizenship_russia': 'רוסיה',
        'citizenship_ukraine': 'אוקראינה',
        'citizenship_other': 'אחר',
        
        // Step 3
        'field.main_source': 'מקור הכנסה עיקרי',
        'field.additional_income': 'הכנסה נוספת',
        'field.obligations': 'התחייבויות כספיות',
        'main_source_employee': 'עובד שכיר',
        'main_source_selfemployed': 'עצמאי',
        'main_source_unemployed': 'מובטל',
        'main_source_student': 'סטודנט',
        'main_source_pension': 'פנסיה',
        'main_source_unpaid_leave': 'חופשה ללא תשלום',
        'main_source_other': 'אחר',
        'additional_income_no_additional_income': 'אין הכנסה נוספת',
        'additional_income_additional_salary': 'משכורת נוספת',
        'additional_income_additional_work': 'עבודה נוספת',
        'additional_income_investment': 'הכנסה מהשקעות',
        'additional_income_property_rental_income': 'הכנסה משכירות נכס',
        'additional_income_pension': 'פנסיה',
        'additional_income_other': 'אחר',
        'obligations_no_obligations': 'אין התחייבויות',
        'obligations_credit_card': 'חוב כרטיס אשראי',
        'obligations_bank_loan': 'הלוואה בנקאית',
        'obligations_consumer_credit': 'אשראי צרכני',
        'obligations_other': 'התחייבויות אחרות'
      },
      ru: {
        // Step 1
        'field.loan_amount': 'Сумма кредита',
        'field.loan_period': 'Срок кредита',
        'field.loan_purpose': 'Цель кредита',
        'field.city': 'Город',
        'field.when_needed': 'Когда вам нужен кредит?',
        'period_5_years': '5 лет',
        'period_10_years': '10 лет',
        'period_15_years': '15 лет',
        'period_20_years': '20 лет',
        'period_25_years': '25 лет',
        'period_30_years': '30 лет',
        'purpose_investment': 'Инвестиции',
        'purpose_personal': 'Личное использование',
        'purpose_business': 'Бизнес',
        'purpose_other': 'Другое',
        'when_needed_within_3_months': 'В течение 3 месяцев',
        'when_needed_3_to_6_months': '3-6 месяцев',
        'when_needed_6_to_12_months': '6-12 месяцев',
        'when_needed_over_12_months': 'Более 12 месяцев',
        
        // Step 2 (basic set)
        'field.education': 'Образование',
        'field.family_status': 'Семейное положение',
        'field.citizenship': 'Гражданство',
        'field.how_much_childrens': 'Количество детей',
        'citizenship_israel': 'Израильский гражданин',
        'citizenship_russia': 'Россия',
        'citizenship_ukraine': 'Украина',
        'citizenship_other': 'Другое',
        
        // Step 3 (basic set)
        'field.main_source': 'Основной источник дохода',
        'field.additional_income': 'Дополнительный доход',
        'field.obligations': 'Финансовые обязательства',
        'main_source_employee': 'Наемный работник',
        'main_source_selfemployed': 'Самозанятый',
        'main_source_other': 'Другое'
      }
    };
    
    let totalCreated = 0;
    
    for (const screen of missingScreens) {
      console.log(`\n📝 Creating content for ${screen}...`);
      
      const stepNumber = screen.includes('step1') ? 1 : screen.includes('step2') ? 2 : 3;
      const stepKey = `step${stepNumber}`;
      const templates = dropdownTemplates[stepKey];
      
      let screenItems = 0;
      
      for (const template of templates) {
        const contentKey = `${screen}.${template.key}`;
        
        // Create container
        await pool.query(`
          INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, 'form', true, NOW(), NOW())
          ON CONFLICT (content_key) DO NOTHING
        `, [contentKey, 'dropdown_container', screen]);
        screenItems++;
        
        // Create options
        for (const option of template.options) {
          const optionKey = `${screen}.${template.key}.${option}`;
          await pool.query(`
            INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, 'form', true, NOW(), NOW())
            ON CONFLICT (content_key) DO NOTHING
          `, [optionKey, 'dropdown_option', screen]);
          screenItems++;
        }
        
        // Create translations for all languages
        for (const [lang, langTranslations] of Object.entries(translations)) {
          // Container translation
          if (langTranslations[template.key]) {
            const containerItem = await pool.query(`
              SELECT id FROM content_items WHERE content_key = $1
            `, [contentKey]);
            
            if (containerItem.rows.length > 0) {
              await pool.query(`
                INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
                VALUES ($1, $2, $3, 'approved', NOW(), NOW())
                ON CONFLICT (content_item_id, language_code) DO NOTHING
              `, [containerItem.rows[0].id, lang, langTranslations[template.key]]);
            }
          }
          
          // Option translations
          for (const option of template.options) {
            if (langTranslations[option]) {
              const optionKey = `${screen}.${template.key}.${option}`;
              const optionItem = await pool.query(`
                SELECT id FROM content_items WHERE content_key = $1
              `, [optionKey]);
              
              if (optionItem.rows.length > 0) {
                await pool.query(`
                  INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
                  VALUES ($1, $2, $3, 'approved', NOW(), NOW())
                  ON CONFLICT (content_item_id, language_code) DO NOTHING
                `, [optionItem.rows[0].id, lang, langTranslations[option]]);
              }
            }
          }
        }
      }
      
      console.log(`   Created ${screenItems} items for ${screen}`);
      totalCreated += screenItems;
    }
    
    await pool.query('COMMIT');
    
    console.log(`\n✅ SUCCESS! Created ${totalCreated} content items with translations`);
    
    // Verify results
    console.log(`\n📊 Verification:`);
    for (const screen of missingScreens) {
      const result = await pool.query(`
        SELECT COUNT(*) as count 
        FROM content_items 
        WHERE screen_location = $1 AND component_type IN ('dropdown_container', 'dropdown_option')
      `, [screen]);
      
      console.log(`   ${screen}: ${result.rows[0].count} items`);
    }
    
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  createComprehensiveDropdownContent().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { createComprehensiveDropdownContent };