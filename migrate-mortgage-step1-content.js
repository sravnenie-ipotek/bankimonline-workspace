const { Pool } = require('pg');

// Use current database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
  ssl: { rejectUnauthorized: false }
});

async function migrateMortgageStep1Content() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🚀 Starting Mortgage Step 1 Content Migration');
    console.log('Following @translationRules conventions...\n');
    
    // Define mortgage step 1 content following translationRules patterns
    const mortgageStep1Content = [
      // Progress Steps (mobile_step_X pattern from rules)
      {
        content_key: 'mortgage_mobile_step_1',
        en: 'Calculator',
        he: 'מחשבון',
        ru: 'Калькулятор',
        component_type: 'text',
        category: 'progress',
        screen_location: 'mortgage_calculation'
      },
      {
        content_key: 'mortgage_mobile_step_2', 
        en: 'Personal details',
        he: 'פרטים אישיים',
        ru: 'Личные данные',
        component_type: 'text',
        category: 'progress',
        screen_location: 'mortgage_calculation'
      },
      {
        content_key: 'mortgage_mobile_step_3',
        en: 'Income',
        he: 'הכנסות', 
        ru: 'Доходы',
        component_type: 'text',
        category: 'progress',
        screen_location: 'mortgage_calculation'
      },
      {
        content_key: 'mortgage_mobile_step_4',
        en: 'Programs',
        he: 'תוכניות',
        ru: 'Программы',
        component_type: 'text',
        category: 'progress',
        screen_location: 'mortgage_calculation'
      },
      
      // Video Header Content
      {
        content_key: 'mortgage_video_title',
        en: 'Mortgage Calculator',
        he: 'מחשבון משכנתא',
        ru: 'Калькулятор ипотеки',
        component_type: 'title',
        category: 'header',
        screen_location: 'mortgage_calculation'
      },
      {
        content_key: 'mortgage_show_offers',
        en: 'Show offers',
        he: 'הצג הצעות',
        ru: 'Показать предложения',
        component_type: 'button',
        category: 'navigation',
        screen_location: 'mortgage_calculation'
      },
      
      // Form Fields for Step 1
      {
        content_key: 'mortgage_price_of_estate',
        en: 'Property value',
        he: 'שווי הנכס',
        ru: 'Стоимость недвижимости',
        component_type: 'field_label',
        category: 'form_field',
        screen_location: 'mortgage_calculation'
      },
      {
        content_key: 'mortgage_city_where_you_buy',
        en: 'City where you buy',
        he: 'עיר בה אתה קונה',
        ru: 'Город покупки',
        component_type: 'field_label',
        category: 'form_field',
        screen_location: 'mortgage_calculation'
      },
      {
        content_key: 'mortgage_when_do_you_need_money',
        en: 'When do you need the money?',
        he: 'מתי אתה זקוק לכסף?',
        ru: 'Когда вам нужны деньги?',
        component_type: 'field_label',
        category: 'form_field',
        screen_location: 'mortgage_calculation'
      },
      {
        content_key: 'mortgage_initial_fee',
        en: 'Down payment',
        he: 'מקדמה',
        ru: 'Первоначальный взнос',
        component_type: 'field_label',
        category: 'form_field',
        screen_location: 'mortgage_calculation'
      },
      {
        content_key: 'mortgage_property_type',
        en: 'Property type',
        he: 'סוג הנכס',
        ru: 'Тип недвижимости',
        component_type: 'field_label',
        category: 'form_field',
        screen_location: 'mortgage_calculation'
      },
      {
        content_key: 'mortgage_will_be_your_first',
        en: 'Is this your first property?',
        he: 'האם זה הנכס הראשון שלך?',
        ru: 'Это ваша первая недвижимость?',
        component_type: 'field_label',
        category: 'form_field',
        screen_location: 'mortgage_calculation'
      },
      {
        content_key: 'mortgage_property_ownership',
        en: 'Property ownership status',
        he: 'סטטוס בעלות על נכס',
        ru: 'Статус владения недвижимостью',
        component_type: 'field_label',
        category: 'form_field',
        screen_location: 'mortgage_calculation'
      },
      
      // Dropdown Options for Property Type
      {
        content_key: 'mortgage_property_type_option_1',
        en: 'Apartment',
        he: 'דירה',
        ru: 'Квартира',
        component_type: 'option',
        category: 'dropdown',
        screen_location: 'mortgage_calculation'
      },
      {
        content_key: 'mortgage_property_type_option_2',
        en: 'House',
        he: 'בית',
        ru: 'Дом',
        component_type: 'option',
        category: 'dropdown',
        screen_location: 'mortgage_calculation'
      },
      {
        content_key: 'mortgage_property_type_option_3',
        en: 'Commercial',
        he: 'מסחרי',
        ru: 'Коммерческая',
        component_type: 'option',
        category: 'dropdown',
        screen_location: 'mortgage_calculation'
      },
      
      // First Property Options
      {
        content_key: 'mortgage_first_property_option_1',
        en: 'Yes, first property',
        he: 'כן, נכס ראשון',
        ru: 'Да, первая недвижимость',
        component_type: 'option',
        category: 'dropdown',
        screen_location: 'mortgage_calculation'
      },
      {
        content_key: 'mortgage_first_property_option_2',
        en: 'No, additional property',
        he: 'לא, נכס נוסף',
        ru: 'Нет, дополнительная недвижимость',
        component_type: 'option',
        category: 'dropdown',
        screen_location: 'mortgage_calculation'
      },
      
      // Property Ownership Options
      {
        content_key: 'mortgage_ownership_option_1',
        en: 'I don\'t own property',
        he: 'אני לא מחזיק בנכס',
        ru: 'У меня нет недвижимости',
        component_type: 'option',
        category: 'dropdown',
        screen_location: 'mortgage_calculation'
      },
      {
        content_key: 'mortgage_ownership_option_2',
        en: 'I own a property',
        he: 'אני מחזיק בנכס',
        ru: 'У меня есть недвижимость',
        component_type: 'option',
        category: 'dropdown',
        screen_location: 'mortgage_calculation'
      },
      {
        content_key: 'mortgage_ownership_option_3',
        en: 'I\'m selling a property',
        he: 'אני מוכר נכס',
        ru: 'Я продаю недвижимость',
        component_type: 'option',
        category: 'dropdown',
        screen_location: 'mortgage_calculation'
      },
      
      // Credit Parameters
      {
        content_key: 'mortgage_desired_period',
        en: 'Desired mortgage period',
        he: 'תקופת משכנתא רצויה',
        ru: 'Желаемый срок ипотеки',
        component_type: 'field_label',
        category: 'form_field',
        screen_location: 'mortgage_calculation'
      },
      {
        content_key: 'mortgage_monthly_payment',
        en: 'Monthly payment',
        he: 'תשלום חודשי',
        ru: 'Ежемесячный платеж',
        component_type: 'field_label',
        category: 'form_field',
        screen_location: 'mortgage_calculation'
      },
      {
        content_key: 'mortgage_period_years',
        en: 'years',
        he: 'שנים',
        ru: 'лет',
        component_type: 'text',
        category: 'form_field',
        screen_location: 'mortgage_calculation'
      }
    ];

    console.log(`📝 Inserting ${mortgageStep1Content.length} content items...`);

    // Insert content items and translations following translationRules
    for (const content of mortgageStep1Content) {
      // Insert content item and get the ID (RETURNING clause for foreign key)
      const contentResult = await client.query(`
        INSERT INTO content_items (key, component_type, category, screen_location, status)
        VALUES ($1, $2, $3, $4, 'active')
        ON CONFLICT (key, screen_location) DO UPDATE SET
          component_type = EXCLUDED.component_type,
          category = EXCLUDED.category,
          screen_location = EXCLUDED.screen_location,
          status = EXCLUDED.status,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `, [content.content_key, content.component_type, content.category, content.screen_location]);
      
      const contentItemId = contentResult.rows[0].id;

      // Insert translations for all three languages (EN/HE/RU as per rules)
      const languages = ['en', 'he', 'ru'];
      for (const lang of languages) {
        if (content[lang]) {
          await client.query(`
            INSERT INTO content_translations (content_item_id, language_code, value, status)
            VALUES ($1, $2, $3, 'active')
            ON CONFLICT (content_item_id, language_code) DO UPDATE SET
              value = EXCLUDED.value,
              status = EXCLUDED.status,
              updated_at = CURRENT_TIMESTAMP
          `, [contentItemId, lang, content[lang]]);
        }
      }
    }

    await client.query('COMMIT');
    console.log('✅ Mortgage Step 1 content migration completed!');

    // Verify the migration following translationRules verification pattern
    console.log('\n📊 Verification Results:');
    console.log('========================');
    
    const countResult = await client.query(`
      SELECT COUNT(*) as total_items
      FROM content_items 
      WHERE screen_location = 'mortgage_calculation' 
        AND status = 'active'
    `);
    
    const detailResult = await client.query(`
      SELECT 
        ci.key,
        ci.component_type,
        ci.category,
        COUNT(ct.language_code) as translation_count,
        ARRAY_AGG(ct.language_code ORDER BY ct.language_code) as languages
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'mortgage_calculation'
        AND ci.status = 'active'
      GROUP BY ci.key, ci.component_type, ci.category
      ORDER BY ci.category, ci.component_type, ci.key
    `);

    console.log(`📈 Total mortgage_calculation items: ${countResult.rows[0].total_items}`);
    console.log(`📈 Expected translations: ${countResult.rows[0].total_items * 3} (3 languages)`);
    console.log('\n📋 Content breakdown by category:');
    
    detailResult.rows.forEach(row => {
      const status = row.translation_count === 3 ? '✅' : '❌';
      console.log(`${status} ${row.key} (${row.component_type}): ${row.translation_count}/3 translations`);
    });
    
    // Test API endpoint
    console.log('\n🔗 Test API endpoints:');
    console.log('EN: GET /api/content/mortgage_calculation/en');
    console.log('HE: GET /api/content/mortgage_calculation/he'); 
    console.log('RU: GET /api/content/mortgage_calculation/ru');
    
    console.log('\n🎯 Frontend component should use:');
    console.log('const { getContent } = useContentApi(\'mortgage_calculation\')');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the migration
migrateMortgageStep1Content()
  .then(() => {
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  }); 