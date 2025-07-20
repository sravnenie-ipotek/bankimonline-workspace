#!/usr/bin/env node

/**
 * Comprehensive Migration Script for Mortgage Calculation Content
 * Migrates all remaining translation keys from JSON files to database-driven content management
 */

const baseUrl = 'http://localhost:8003/api/content';

// Complete mapping of all mortgage calculation content items
const mortgageContentItems = [
  // Progress Steps (remaining)
  {
    key: 'app.mortgage.step.mobile_step_3',
    translations: {
      en: 'Income Details',
      he: 'פרטי הכנסה', 
      ru: 'Детали дохода'
    },
    category: 'progress',
    component_type: 'text',
    description: 'Step 3 label in progress bar'
  },
  {
    key: 'app.mortgage.step.mobile_step_4',
    translations: {
      en: 'Bank Offers',
      he: 'הצעות בנקים',
      ru: 'Банковские предложения'
    },
    category: 'progress', 
    component_type: 'text',
    description: 'Step 4 label in progress bar'
  },

  // Main Form Title
  {
    key: 'app.mortgage.form.calculate_mortgage_title_fixed',
    translations: {
      en: 'Calculate Mortgage',
      he: 'חישוב משכנתא',
      ru: 'Расчет ипотеки'
    },
    category: 'form',
    component_type: 'text', 
    description: 'Main form title'
  },

  // Button Labels
  {
    key: 'app.home.button.show_offers',
    translations: {
      en: 'Show Offers',
      he: 'הצג הצעות',
      ru: 'Показать предложения'
    },
    category: 'button',
    component_type: 'text',
    description: 'Show offers button text'
  },

  // Form Field Labels
  {
    key: 'app.mortgage.form.calculate_mortgage_price',
    translations: {
      en: 'Property Value',
      he: 'שווי הנכס',
      ru: 'Стоимость недвижимости'
    },
    category: 'form',
    component_type: 'label',
    description: 'Property value field label'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_city',
    translations: {
      en: 'City',
      he: 'עיר',
      ru: 'Город'
    },
    category: 'form',
    component_type: 'label', 
    description: 'City field label'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_when',
    translations: {
      en: 'When do you plan to take the mortgage?',
      he: 'מתי תרצה לקחת את המשכנתא?',
      ru: 'Когда вы планируете взять ипотеку?'
    },
    category: 'form',
    component_type: 'label',
    description: 'Mortgage timing field label'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_when_options_ph',
    translations: {
      en: 'Select timing',
      he: 'בחר זמן',
      ru: 'Выберите время'
    },
    category: 'form',
    component_type: 'placeholder',
    description: 'Mortgage timing placeholder'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_initial_fee',
    translations: {
      en: 'Down Payment',
      he: 'מקדמה',
      ru: 'Первоначальный взнос'
    },
    category: 'form',
    component_type: 'label',
    description: 'Down payment field label'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_type',
    translations: {
      en: 'Mortgage Type',
      he: 'סוג המשכנתא',
      ru: 'Тип ипотеки'
    },
    category: 'form',
    component_type: 'label',
    description: 'Mortgage type field label'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_type_ph',
    translations: {
      en: 'Select mortgage type',
      he: 'בחר סוג משכנתא',
      ru: 'Выберите тип ипотеки'
    },
    category: 'form',
    component_type: 'placeholder',
    description: 'Mortgage type placeholder'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_first',
    translations: {
      en: 'Is this your first apartment?',
      he: 'האם זו הדירה הראשונה שלך?',
      ru: 'Это ваша первая квартира?'
    },
    category: 'form',
    component_type: 'label',
    description: 'First apartment field label'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_first_ph',
    translations: {
      en: 'Select option',
      he: 'בחר אפשרות',
      ru: 'Выберите вариант'
    },
    category: 'form',
    component_type: 'placeholder',
    description: 'First apartment placeholder'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_property_ownership',
    translations: {
      en: 'Property Ownership Status',
      he: 'סטטוס בעלות על נכס',
      ru: 'Статус владения недвижимостью'
    },
    category: 'form',
    component_type: 'label',
    description: 'Property ownership field label'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_property_ownership_ph',
    translations: {
      en: 'Select your property status',
      he: 'בחר את סטטוס הנכס שלך',
      ru: 'Выберите статус недвижимости'
    },
    category: 'form',
    component_type: 'placeholder',
    description: 'Property ownership placeholder'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_period',
    translations: {
      en: 'Loan Period (Years)',
      he: 'תקופת ההלוואה (שנים)',
      ru: 'Срок кредита (лет)'
    },
    category: 'form',
    component_type: 'label',
    description: 'Loan period field label'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_period_units_min',
    translations: {
      en: 'years minimum',
      he: 'שנים מינימום',
      ru: 'лет минимум'
    },
    category: 'form',
    component_type: 'text',
    description: 'Minimum period unit label'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_period_units_max',
    translations: {
      en: 'years maximum',
      he: 'שנים מקסימום',
      ru: 'лет максимум'
    },
    category: 'form',
    component_type: 'text',
    description: 'Maximum period unit label'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_initial_payment',
    translations: {
      en: 'Monthly Payment',
      he: 'תשלום חודשי',
      ru: 'Ежемесячный платеж'
    },
    category: 'form',
    component_type: 'label',
    description: 'Monthly payment field label'
  },

  // Dropdown Options - Timing
  {
    key: 'app.mortgage.form.calculate_mortgage_when_options_1',
    translations: {
      en: 'In the next 3 months',
      he: 'בשלושת החודשים הקרובים',
      ru: 'В ближайшие 3 месяца'
    },
    category: 'form',
    component_type: 'option',
    description: 'Timing option 1'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_when_options_2',
    translations: {
      en: 'In 3-6 months',
      he: 'בעוד 3-6 חודשים',
      ru: 'Через 3-6 месяцев'
    },
    category: 'form',
    component_type: 'option',
    description: 'Timing option 2'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_when_options_3',
    translations: {
      en: 'In 6-12 months',
      he: 'בעוד 6-12 חודשים',
      ru: 'Через 6-12 месяцев'
    },
    category: 'form',
    component_type: 'option',
    description: 'Timing option 3'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_when_options_4',
    translations: {
      en: 'More than 12 months',
      he: 'יותר מ-12 חודשים',
      ru: 'Более 12 месяцев'
    },
    category: 'form',
    component_type: 'option',
    description: 'Timing option 4'
  },

  // Dropdown Options - Mortgage Type
  {
    key: 'app.mortgage.form.calculate_mortgage_type_options_1',
    translations: {
      en: 'Fixed Rate',
      he: 'ריבית קבועה',
      ru: 'Фиксированная ставка'
    },
    category: 'form',
    component_type: 'option',
    description: 'Mortgage type option 1'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_type_options_2',
    translations: {
      en: 'Variable Rate',
      he: 'ריבית משתנה',
      ru: 'Переменная ставка'
    },
    category: 'form',
    component_type: 'option',
    description: 'Mortgage type option 2'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_type_options_3',
    translations: {
      en: 'Mixed Rate',
      he: 'ריבית מעורבת',
      ru: 'Смешанная ставка'
    },
    category: 'form',
    component_type: 'option',
    description: 'Mortgage type option 3'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_type_options_4',
    translations: {
      en: 'Not Sure',
      he: 'לא בטוח',
      ru: 'Не уверен'
    },
    category: 'form',
    component_type: 'option',
    description: 'Mortgage type option 4'
  },

  // Dropdown Options - First Apartment
  {
    key: 'app.mortgage.form.calculate_mortgage_first_options_1',
    translations: {
      en: 'Yes, first apartment',
      he: 'כן, דירה ראשונה',
      ru: 'Да, первая квартира'
    },
    category: 'form',
    component_type: 'option',
    description: 'First apartment option 1'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_first_options_2',
    translations: {
      en: 'No, not first apartment',
      he: 'לא, לא דירה ראשונה',
      ru: 'Нет, не первая квартира'
    },
    category: 'form',
    component_type: 'option',
    description: 'First apartment option 2'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_first_options_3',
    translations: {
      en: 'Investment property',
      he: 'נכס השקעה',
      ru: 'Инвестиционная недвижимость'
    },
    category: 'form',
    component_type: 'option',
    description: 'First apartment option 3'
  },

  // Dropdown Options - Property Ownership (Critical Business Logic)
  {
    key: 'app.mortgage.form.calculate_mortgage_property_ownership_option_1',
    translations: {
      en: 'I don\'t own any property',
      he: 'אני לא בעל נכס',
      ru: 'У меня нет недвижимости'
    },
    category: 'form',
    component_type: 'option',
    description: 'Property ownership option 1 - No property (75% LTV)'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_property_ownership_option_2',
    translations: {
      en: 'I own a property',
      he: 'אני בעל נכס',
      ru: 'У меня есть недвижимость'
    },
    category: 'form',
    component_type: 'option',
    description: 'Property ownership option 2 - Has property (50% LTV)'
  },
  {
    key: 'app.mortgage.form.calculate_mortgage_property_ownership_option_3',
    translations: {
      en: 'I\'m selling a property',
      he: 'אני מוכר נכס',
      ru: 'Я продаю недвижимость'
    },
    category: 'form',
    component_type: 'option',
    description: 'Property ownership option 3 - Selling property (70% LTV)'
  }
];

// Function to create content item via API
async function createContentItem(item) {
  const payload = {
    content_key: item.key,
    content_type: 'text',
    category: item.category,
    screen_location: 'mortgage_calculation',
    component_type: item.component_type,
    description: item.description,
    created_by: 'migration_script',
    translations: item.translations
  };

  try {
    console.log(`🔄 Creating content item: ${item.key}`);
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Created: ${item.key} -> ${item.translations.he}`);
      return result;
    } else {
      const errorText = await response.text();
      console.error(`❌ Failed to create ${item.key}: ${response.status} ${errorText}`);
      return null;
    }
  } catch (error) {
    console.error(`💥 Error creating ${item.key}:`, error.message);
    return null;
  }
}

// Function to add delay between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Main migration function
async function migrateMortgageContent() {
  console.log('🚀 Starting comprehensive mortgage content migration...');
  console.log(`📊 Total items to migrate: ${mortgageContentItems.length}`);
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const item of mortgageContentItems) {
    const result = await createContentItem(item);
    if (result) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // Add small delay to avoid overwhelming the server
    await delay(500);
  }
  
  console.log('\n📈 Migration Summary:');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📊 Total: ${successCount + failureCount}`);
  
  if (successCount > 0) {
    console.log('\n🎉 Migration completed! Refresh the frontend to see the changes.');
  }
}

// Run the migration
migrateMortgageContent().catch(console.error);