const express = require('express');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
  ssl: { rejectUnauthorized: false }
});

async function addMortgageContent() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Define mortgage content with translations
    const mortgageContent = [
      // Progress Steps
      {
        key: 'app.mortgage.step.mobile_step_1',
        en: 'Calculator',
        he: 'מחשבון',
        ru: 'Калькулятор',
        component_type: 'text',
        category: 'progress'
      },
      {
        key: 'app.mortgage.step.mobile_step_2',
        en: 'Personal details',
        he: 'פרטים אישיים',
        ru: 'Личные данные',
        component_type: 'text',
        category: 'progress'
      },
      {
        key: 'app.mortgage.step.mobile_step_3',
        en: 'Income',
        he: 'הכנסות',
        ru: 'Доходы',
        component_type: 'text',
        category: 'progress'
      },
      {
        key: 'app.mortgage.step.mobile_step_4',
        en: 'Programs',
        he: 'תוכניות',
        ru: 'Программы',
        component_type: 'text',
        category: 'progress'
      },
      // Video Header
      {
        key: 'app.mortgage.header.video_calculate_mortgage_title',
        en: 'Mortgage Calculation',
        he: 'חישוב משכנתא',
        ru: 'Расчет ипотеки',
        component_type: 'text',
        category: 'header'
      },
      // Form Fields
      {
        key: 'app.mortgage.form.calculate_mortgage_title',
        en: 'Calculate Mortgage',
        he: 'חישוב משכנתא',
        ru: 'Расчет ипотеки',
        component_type: 'text',
        category: 'form'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_price',
        en: 'Property price',
        he: 'שווי הנכס',
        ru: 'Стоимость недвижимости',
        component_type: 'label',
        category: 'form'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_city',
        en: 'City where the property is located',
        he: 'עיר בא נמצא הנכס',
        ru: 'Город, где находится недвижимость',
        component_type: 'label',
        category: 'form'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_when',
        en: 'When do you need the mortgage?',
        he: 'מתי תזדקק למשכנתא?',
        ru: 'Когда вам нужна ипотека?',
        component_type: 'label',
        category: 'form'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_when_options_ph',
        en: 'Select timeframe',
        he: 'בחר מסגרת זמן',
        ru: 'Выберите срок',
        component_type: 'placeholder',
        category: 'form'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_when_options_1',
        en: 'Within 3 months',
        he: 'תוך 3 חודשים',
        ru: 'В течение 3 месяцев',
        component_type: 'option',
        category: 'dropdown'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_when_options_2',
        en: 'Within 3-6 months',
        he: 'תוך 3-6 חודשים',
        ru: 'В течение 3-6 месяцев',
        component_type: 'option',
        category: 'dropdown'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_when_options_3',
        en: 'Within 6-12 months',
        he: 'תוך 6-12 חודשים',
        ru: 'В течение 6-12 месяцев',
        component_type: 'option',
        category: 'dropdown'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_when_options_4',
        en: 'Over 12 months',
        he: 'מעל 12 חודשים',
        ru: 'Более 12 месяцев',
        component_type: 'option',
        category: 'dropdown'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_initial_fee',
        en: 'Down payment',
        he: 'הון עצמי',
        ru: 'Первоначальный взнос',
        component_type: 'label',
        category: 'form'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_type',
        en: 'Mortgage type',
        he: 'סוג משכנתא',
        ru: 'Тип ипотеки',
        component_type: 'label',
        category: 'form'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_type_ph',
        en: 'Select mortgage type',
        he: 'בחר סוג משכנתא',
        ru: 'Выберите тип ипотеки',
        component_type: 'placeholder',
        category: 'form'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_type_options_1',
        en: 'Apartment',
        he: 'דירה',
        ru: 'Квартира',
        component_type: 'option',
        category: 'dropdown'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_type_options_2',
        en: 'Private house',
        he: 'בית פרטי',
        ru: 'Частный дом',
        component_type: 'option',
        category: 'dropdown'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_type_options_3',
        en: 'Garden apartment',
        he: 'דירת גן',
        ru: 'Квартира с садом',
        component_type: 'option',
        category: 'dropdown'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_type_options_4',
        en: 'Penthouse',
        he: 'פנטהאוז',
        ru: 'Пентхаус',
        component_type: 'option',
        category: 'dropdown'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_first',
        en: 'Is this a first home?',
        he: 'האם מדובר בדירה ראשונה?',
        ru: 'Это первое жилье?',
        component_type: 'label',
        category: 'form'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_first_ph',
        en: 'Select property status',
        he: 'בחר סטטוס הנכס',
        ru: 'Выберите статус недвижимости',
        component_type: 'placeholder',
        category: 'form'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_first_options_1',
        en: 'Yes, first home',
        he: 'כן, דירה ראשונה',
        ru: 'Да, первое жилье',
        component_type: 'option',
        category: 'dropdown'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_first_options_2',
        en: 'No, additional property',
        he: 'לא, נכס נוסף',
        ru: 'Нет, дополнительная недвижимость',
        component_type: 'option',
        category: 'dropdown'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_first_options_3',
        en: 'Investment property',
        he: 'נכס השקעה',
        ru: 'Инвестиционная недвижимость',
        component_type: 'option',
        category: 'dropdown'
      },
      // Critical Property Ownership Field (LTV Logic)
      {
        key: 'app.mortgage.form.calculate_mortgage_property_ownership',
        en: 'Property Ownership Status',
        he: 'סטטוס בעלות על נכס',
        ru: 'Статус владения недвижимостью',
        component_type: 'label',
        category: 'form'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_property_ownership_ph',
        en: 'Select your property ownership status',
        he: 'בחר את סטטוס הבעלות על הנכס שלך',
        ru: 'Выберите статус владения недвижимостью',
        component_type: 'placeholder',
        category: 'form'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_property_ownership_option_1',
        en: "I don't own any property",
        he: 'אני לא מחזיק בשום נכס',
        ru: 'У меня нет недвижимости',
        component_type: 'option',
        category: 'dropdown'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_property_ownership_option_2',
        en: 'I own a property',
        he: 'אני מחזיק בנכס',
        ru: 'У меня есть недвижимость',
        component_type: 'option',
        category: 'dropdown'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_property_ownership_option_3',
        en: "I'm selling a property",
        he: 'אני מוכר נכס',
        ru: 'Я продаю недвижимость',
        component_type: 'option',
        category: 'dropdown'
      },
      // Credit Parameters
      {
        key: 'app.mortgage.form.calculate_mortgage_period',
        en: 'Desired mortgage period',
        he: 'תקופת משכנתא רצויה',
        ru: 'Желаемый срок ипотеки',
        component_type: 'label',
        category: 'form'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_period_units_min',
        en: 'years',
        he: 'שנים',
        ru: 'лет',
        component_type: 'text',
        category: 'form'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_period_units_max',
        en: 'years',
        he: 'שנים',
        ru: 'лет',
        component_type: 'text',
        category: 'form'
      },
      {
        key: 'app.mortgage.form.calculate_mortgage_initial_payment',
        en: 'Monthly payment',
        he: 'תשלום חודשי',
        ru: 'Ежемесячный платеж',
        component_type: 'label',
        category: 'form'
      }
    ];

    console.log(`Adding ${mortgageContent.length} mortgage content items...`);

    // Insert content items and translations
    for (const content of mortgageContent) {
      // Insert content item and get the ID
      const contentResult = await client.query(`
        INSERT INTO content_items (content_key, component_type, category, screen_location, is_active)
        VALUES ($1, $2, $3, 'mortgage_calculation', true)
        ON CONFLICT (content_key) DO UPDATE SET
          component_type = EXCLUDED.component_type,
          category = EXCLUDED.category,
          screen_location = EXCLUDED.screen_location,
          is_active = EXCLUDED.is_active
        RETURNING id
      `, [content.key, content.component_type, content.category]);
      
      const contentItemId = contentResult.rows[0].id;

      // Insert translations for each language
      const languages = ['en', 'he', 'ru'];
      for (const lang of languages) {
        if (content[lang]) {
          await client.query(`
            INSERT INTO content_translations (content_item_id, language_code, content_value, status)
            VALUES ($1, $2, $3, 'approved')
            ON CONFLICT (content_item_id, language_code) DO UPDATE SET
              content_value = EXCLUDED.content_value,
              status = EXCLUDED.status,
              updated_at = CURRENT_TIMESTAMP
          `, [contentItemId, lang, content[lang]]);
        }
      }
    }

    await client.query('COMMIT');
    console.log('✅ Mortgage content added successfully!');

    // Verify the data
    const result = await client.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ci.category,
        COUNT(ct.language_code) as translation_count
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'mortgage_calculation'
      GROUP BY ci.content_key, ci.component_type, ci.category
      ORDER BY ci.content_key
    `);

    console.log('\n📊 Verification Results:');
    console.log(`Total mortgage content items: ${result.rows.length}`);
    result.rows.forEach(row => {
      console.log(`  ${row.content_key}: ${row.translation_count} translations`);
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error adding mortgage content:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the migration
addMortgageContent()
  .then(() => {
    console.log('\n🎉 Mortgage content migration completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });