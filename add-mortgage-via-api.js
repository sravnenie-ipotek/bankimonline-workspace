const fetch = require('node-fetch');

const mortgageContent = [
  // Progress Steps
  {
    content_key: 'app.mortgage.step.mobile_step_2',
    component_type: 'text',
    category: 'progress',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Personal details',
      he: 'פרטים אישיים',
      ru: 'Личные данные'
    }
  },
  {
    content_key: 'app.mortgage.step.mobile_step_3',
    component_type: 'text',
    category: 'progress',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Income',
      he: 'הכנסות',
      ru: 'Доходы'
    }
  },
  {
    content_key: 'app.mortgage.step.mobile_step_4',
    component_type: 'text',
    category: 'progress',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Programs',
      he: 'תוכניות',
      ru: 'Программы'
    }
  },
  // Video Header
  {
    content_key: 'app.mortgage.header.video_calculate_mortgage_title',
    component_type: 'text',
    category: 'header',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Mortgage Calculation',
      he: 'חישוב משכנתא',
      ru: 'Расчет ипотеки'
    }
  },
  // Form Fields
  {
    content_key: 'app.mortgage.form.calculate_mortgage_title',
    component_type: 'text',
    category: 'form',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Calculate Mortgage',
      he: 'חישוב משכנתא',
      ru: 'Рассчитать ипотеку'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_price',
    component_type: 'label',
    category: 'form',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Property price',
      he: 'שווי הנכס',
      ru: 'Стоимость недвижимости'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_city',
    component_type: 'label',
    category: 'form',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'City where the property is located',
      he: 'עיר בא נמצא הנכס',
      ru: 'Город, где находится недвижимость'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_when',
    component_type: 'label',
    category: 'form',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'When do you need the mortgage?',
      he: 'מתי תזדקק למשכנתא?',
      ru: 'Когда вам нужна ипотека?'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_when_options_ph',
    component_type: 'placeholder',
    category: 'form',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Select timeframe',
      he: 'בחר מסגרת זמן',
      ru: 'Выберите срок'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_when_options_1',
    component_type: 'option',
    category: 'dropdown',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Within 3 months',
      he: 'תוך 3 חודשים',
      ru: 'В течение 3 месяцев'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_when_options_2',
    component_type: 'option',
    category: 'dropdown',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Within 3-6 months',
      he: 'תוך 3-6 חודשים',
      ru: 'В течение 3-6 месяцев'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_when_options_3',
    component_type: 'option',
    category: 'dropdown',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Within 6-12 months',
      he: 'תוך 6-12 חודשים',
      ru: 'В течение 6-12 месяцев'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_when_options_4',
    component_type: 'option',
    category: 'dropdown',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Over 12 months',
      he: 'מעל 12 חודשים',
      ru: 'Более 12 месяцев'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_initial_fee',
    component_type: 'label',
    category: 'form',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Down payment',
      he: 'הון עצמי',
      ru: 'Первоначальный взнос'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_type',
    component_type: 'label',
    category: 'form',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Mortgage type',
      he: 'סוג משכנתא',
      ru: 'Тип ипотеки'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_type_ph',
    component_type: 'placeholder',
    category: 'form',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Select mortgage type',
      he: 'בחר סוג משכנתא',
      ru: 'Выберите тип ипотеки'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_type_options_1',
    component_type: 'option',
    category: 'dropdown',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Apartment',
      he: 'דירה',
      ru: 'Квартира'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_type_options_2',
    component_type: 'option',
    category: 'dropdown',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Private house',
      he: 'בית פרטי',
      ru: 'Частный дом'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_type_options_3',
    component_type: 'option',
    category: 'dropdown',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Garden apartment',
      he: 'דירת גן',
      ru: 'Квартира с садом'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_type_options_4',
    component_type: 'option',
    category: 'dropdown',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Penthouse',
      he: 'פנטהאוס',
      ru: 'Пентхаус'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_first',
    component_type: 'label',
    category: 'form',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Is this a first home?',
      he: 'האם מדובר בדירה ראשונה?',
      ru: 'Это первое жилье?'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_first_ph',
    component_type: 'placeholder',
    category: 'form',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Select property status',
      he: 'בחר סטטוס הנכס',
      ru: 'Выберите статус недвижимости'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_first_options_1',
    component_type: 'option',
    category: 'dropdown',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Yes, first home',
      he: 'כן, דירה ראשונה',
      ru: 'Да, первое жилье'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_first_options_2',
    component_type: 'option',
    category: 'dropdown',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'No, additional property',
      he: 'לא, נכס נוסף',
      ru: 'Нет, дополнительная недвижимость'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_first_options_3',
    component_type: 'option',
    category: 'dropdown',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Investment property',
      he: 'נכס השקעה',
      ru: 'Инвестиционная недвижимость'
    }
  },
  // Critical Property Ownership Field (LTV Logic)
  {
    content_key: 'app.mortgage.form.calculate_mortgage_property_ownership',
    component_type: 'label',
    category: 'form',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Property Ownership Status',
      he: 'סטטוס בעלות על נכס',
      ru: 'Статус владения недвижимостью'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_property_ownership_ph',
    component_type: 'placeholder',
    category: 'form',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Select your property ownership status',
      he: 'בחר את סטטוס הבעלות על הנכס שלך',
      ru: 'Выберите статус владения недвижимостью'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_property_ownership_option_1',
    component_type: 'option',
    category: 'dropdown',
    screen_location: 'mortgage_calculation',
    translations: {
      en: "I don't own any property",
      he: 'אני לא מחזיק בשום נכס',
      ru: 'У меня нет недвижимости'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_property_ownership_option_2',
    component_type: 'option',
    category: 'dropdown',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'I own a property',
      he: 'אני מחזיק בנכס',
      ru: 'У меня есть недвижимость'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_property_ownership_option_3',
    component_type: 'option',
    category: 'dropdown',
    screen_location: 'mortgage_calculation',
    translations: {
      en: "I'm selling a property",
      he: 'אני מוכר נכס',
      ru: 'Я продаю недвижимость'
    }
  },
  // Credit Parameters
  {
    content_key: 'app.mortgage.form.calculate_mortgage_period',
    component_type: 'label',
    category: 'form',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Desired mortgage period',
      he: 'תקופת משכנתא רצויה',
      ru: 'Желаемый срок ипотеки'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_period_units_min',
    component_type: 'text',
    category: 'form',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'years',
      he: 'שנים',
      ru: 'лет'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_period_units_max',
    component_type: 'text',
    category: 'form',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'years',
      he: 'שנים',
      ru: 'лет'
    }
  },
  {
    content_key: 'app.mortgage.form.calculate_mortgage_initial_payment',
    component_type: 'label',
    category: 'form',
    screen_location: 'mortgage_calculation',
    translations: {
      en: 'Monthly payment',
      he: 'תשלום חודשי',
      ru: 'Ежемесячный платеж'
    }
  }
];

async function addMortgageContent() {
  console.log(`🚀 Adding ${mortgageContent.length} mortgage content items via API...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const [index, content] of mortgageContent.entries()) {
    try {
      const response = await fetch('http://localhost:8003/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content)
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        successCount++;
        console.log(`✅ ${index + 1}/${mortgageContent.length}: ${content.content_key}`);
      } else {
        errorCount++;
        console.log(`❌ ${index + 1}/${mortgageContent.length}: ${content.content_key} - ${result.message}`);
      }
    } catch (error) {
      errorCount++;
      console.log(`💥 ${index + 1}/${mortgageContent.length}: ${content.content_key} - ${error.message}`);
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n📊 Migration Results:`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📋 Total: ${mortgageContent.length}`);
  
  if (successCount > 0) {
    console.log(`\n🎉 Successfully added ${successCount} mortgage content items!`);
  }
}

addMortgageContent().catch(console.error);