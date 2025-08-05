const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.CONTENT_DATABASE_URL });

// Comprehensive translations for all missing franchise keys
const franchiseTranslations = {
  // Image Alt Text Keys
  "franchise_alt_professional_meeting": {
    category: "alt_text",
    component_type: "image_alt",
    description: "Alt text for professional meeting image",
    translations: {
      en: "Professional business meeting",
      he: "פגישה עסקית מקצועית", 
      ru: "Профессиональная деловая встреча"
    }
  },
  
  "franchise_alt_techrealt_logo": {
    category: "alt_text", 
    component_type: "image_alt",
    description: "Alt text for TechRealt logo",
    translations: {
      en: "TechRealt company logo",
      he: "לוגו של חברת TechRealt",
      ru: "Логотип компании TechRealt"
    }
  },
  
  "franchise_alt_bankimonline_platform": {
    category: "alt_text",
    component_type: "image_alt", 
    description: "Alt text for Bankimonline platform",
    translations: {
      en: "Bankimonline platform interface",
      he: "ממשק פלטפורמת Bankimonline",
      ru: "Интерфейс платформы Bankimonline"
    }
  },
  
  "franchise_alt_real_estate_keys": {
    category: "alt_text",
    component_type: "image_alt",
    description: "Alt text for real estate keys image", 
    translations: {
      en: "Real estate keys for property transactions",
      he: "מפתחות נדל\"ן לעסקאות נכסים",
      ru: "Ключи от недвижимости для сделок с недвижимостью"
    }
  },
  
  "franchise_alt_equipped_office": {
    category: "alt_text",
    component_type: "image_alt",
    description: "Alt text for equipped office image",
    translations: {
      en: "Fully equipped modern office space",
      he: "משרד מודרני מאובזר במלואו",
      ru: "Полностью оборудованное современное офисное помещение"
    }
  },

  // Service Items
  "franchise_client_service_credit_calc": {
    category: "service_item",
    component_type: "list_item",
    description: "Credit calculation service",
    translations: {
      en: "Credit calculation",
      he: "חישוב אשראי",
      ru: "Расчет кредита"
    }
  },
  
  "franchise_client_service_credit_refinance": {
    category: "service_item", 
    component_type: "list_item",
    description: "Credit refinancing service",
    translations: {
      en: "Credit refinancing",
      he: "מיחזור אשראי", 
      ru: "Рефинансирование кредита"
    }
  },

  // Turnkey Section
  "franchise_includes_turnkey_title": {
    category: "accordion_title",
    component_type: "heading",
    description: "Turnkey solution section title",
    translations: {
      en: "Turnkey Solution",
      he: "פתרון מפתח בידיים",
      ru: "Решение под ключ"
    }
  },
  
  "franchise_includes_turnkey_benefit_office": {
    category: "accordion_benefit",
    component_type: "benefit_item", 
    description: "Turnkey office benefit",
    translations: {
      en: "Fully equipped office space ready for operations",
      he: "משרד מאובזר במלואו מוכן לפעילות",
      ru: "Полностью оборудованное офисное помещение готовое к работе"
    }
  },
  
  "franchise_includes_turnkey_benefit_team": {
    category: "accordion_benefit",
    component_type: "benefit_item",
    description: "Turnkey team benefit", 
    translations: {
      en: "Professional team training and support",
      he: "הכשרה ותמיכה לצוות מקצועי",
      ru: "Обучение и поддержка профессиональной команды"
    }
  },
  
  "franchise_includes_turnkey_benefit_brand": {
    category: "accordion_benefit",
    component_type: "benefit_item",
    description: "Turnkey brand benefit",
    translations: {
      en: "Established brand recognition and marketing materials",
      he: "זיהוי מותג מבוסס וחומרי שיווק",
      ru: "Узнаваемость бренда и маркетинговые материалы"
    }
  },
  
  "franchise_includes_turnkey_benefit_marketing": {
    category: "accordion_benefit", 
    component_type: "benefit_item",
    description: "Turnkey marketing benefit",
    translations: {
      en: "Complete marketing strategy and campaign support",
      he: "אסטרטגיית שיווק מלאה ותמיכה בקמפיינים",
      ru: "Полная маркетинговая стратегия и поддержка кампаний"
    }
  },

  // Digital Section
  "franchise_includes_digital_title": {
    category: "accordion_title",
    component_type: "heading",
    description: "Digital solutions section title",
    translations: {
      en: "Digital Solutions",
      he: "פתרונות דיגיטליים", 
      ru: "Цифровые решения"
    }
  },
  
  "franchise_includes_digital_platform": {
    category: "accordion_benefit",
    component_type: "benefit_item",
    description: "Digital platform benefit",
    translations: {
      en: "Advanced digital platform with all necessary tools",
      he: "פלטפורמה דיגיטלית מתקדמת עם כל הכלים הנדרשים",
      ru: "Продвинутая цифровая платформа со всеми необходимыми инструментами"
    }
  },
  
  "franchise_includes_digital_tools": {
    category: "accordion_benefit",
    component_type: "benefit_item", 
    description: "Digital tools benefit",
    translations: {
      en: "Professional analytics and reporting tools",
      he: "כלי אנליטיקה ודיווח מקצועיים",
      ru: "Профессиональные инструменты аналитики и отчетности"
    }
  },
  
  "franchise_includes_digital_support": {
    category: "accordion_benefit",
    component_type: "benefit_item",
    description: "Digital support benefit", 
    translations: {
      en: "24/7 technical support and system maintenance",
      he: "תמיכה טכנית ותחזוקת מערכת 24/7",
      ru: "Техническая поддержка и обслуживание системы 24/7"
    }
  },

  // Support Section
  "franchise_includes_support_title": {
    category: "accordion_title",
    component_type: "heading",
    description: "Support services section title",
    translations: {
      en: "Ongoing Support",
      he: "תמיכה שוטפת",
      ru: "Постоянная поддержка"
    }
  },
  
  "franchise_includes_support_training": {
    category: "accordion_benefit", 
    component_type: "benefit_item",
    description: "Support training benefit",
    translations: {
      en: "Comprehensive training programs for all staff",
      he: "תוכניות הכשרה מקיפות לכל הצוות",
      ru: "Комплексные программы обучения для всего персонала"
    }
  },
  
  "franchise_includes_support_phone": {
    category: "accordion_benefit",
    component_type: "benefit_item",
    description: "Support phone benefit",
    translations: {
      en: "Dedicated phone support and consultation hotline",
      he: "קו תמיכה טלפוני ייעוץ ייעודי", 
      ru: "Выделенная телефонная поддержка и консультационная горячая линия"
    }
  },
  
  "franchise_includes_support_consultation": {
    category: "accordion_benefit",
    component_type: "benefit_item", 
    description: "Support consultation benefit",
    translations: {
      en: "Regular business consultation and strategy sessions",
      he: "ייעוץ עסקי קבוע ומפגשי אסטרטגיה",
      ru: "Регулярные бизнес-консультации и стратегические сессии"
    }
  },

  // Info Cards
  "franchise_includes_info_card_brand": {
    category: "info_card",
    component_type: "card_text",
    description: "Brand info card text",
    translations: {
      en: "Established Brand",
      he: "מותג מבוסס",
      ru: "Зарекомендовавший себя бренд"
    }
  },
  
  "franchise_includes_info_card_office": {
    category: "info_card",
    component_type: "card_text", 
    description: "Office info card text",
    translations: {
      en: "Ready Office",
      he: "משרד מוכן",
      ru: "Готовый офис"
    }
  },
  
  "franchise_includes_info_card_manager": {
    category: "info_card",
    component_type: "card_text",
    description: "Manager info card text",
    translations: {
      en: "Dedicated Manager",
      he: "מנהל ייעודי", 
      ru: "Выделенный менеджер"
    }
  },

  // Process Steps
  "franchise_step_1_title": {
    category: "process_step",
    component_type: "step_title",
    description: "Franchise step 1 title",
    translations: {
      en: "Initial Consultation",
      he: "ייעוץ ראשוני",
      ru: "Первичная консультация"
    }
  },
  
  "franchise_step_1_description": {
    category: "process_step",
    component_type: "step_description", 
    description: "Franchise step 1 description",
    translations: {
      en: "Meet with our franchise specialists to discuss your goals and requirements",
      he: "פגישה עם מומחי הזכיינות שלנו לדיון במטרות ובדרישות שלך",
      ru: "Встреча с нашими специалистами по франшизе для обсуждения ваших целей и требований"
    }
  },
  
  "franchise_step_2_title": {
    category: "process_step",
    component_type: "step_title",
    description: "Franchise step 2 title",
    translations: {
      en: "Location Selection",
      he: "בחירת מיקום",
      ru: "Выбор местоположения"
    }
  },
  
  "franchise_step_2_description": {
    category: "process_step",
    component_type: "step_description",
    description: "Franchise step 2 description", 
    translations: {
      en: "We help you find the perfect location for your franchise office",
      he: "אנו עוזרים לך למצוא את המיקום המושלם למשרד הזכיינות שלך",
      ru: "Мы поможем вам найти идеальное место для вашего франчайзингового офиса"
    }
  },
  
  "franchise_step_3_title": {
    category: "process_step",
    component_type: "step_title",
    description: "Franchise step 3 title",
    translations: {
      en: "Training Program",
      he: "תוכנית הכשרה",
      ru: "Программа обучения"
    }
  },
  
  "franchise_step_3_description": {
    category: "process_step", 
    component_type: "step_description",
    description: "Franchise step 3 description",
    translations: {
      en: "Comprehensive training for you and your team on all systems and processes",
      he: "הכשרה מקיפה עבורך ועבור הצוות שלך על כל המערכות והתהליכים",
      ru: "Комплексное обучение для вас и вашей команды по всем системам и процессам"
    }
  },
  
  "franchise_step_4_title": {
    category: "process_step",
    component_type: "step_title",
    description: "Franchise step 4 title",
    translations: {
      en: "Grand Opening",
      he: "פתיחה חגיגית",
      ru: "Торжественное открытие"
    }
  },
  
  "franchise_step_4_description": {
    category: "process_step",
    component_type: "step_description",
    description: "Franchise step 4 description",
    translations: {
      en: "Launch your franchise with our full support and marketing campaign",
      he: "השק את הזכיינות שלך עם התמיכה המלאה שלנו וקמפיין שיווקי", 
      ru: "Запустите свою франшизу с нашей полной поддержкой и маркетинговой кампанией"
    }
  },
  
  "franchise_step_5_title": {
    category: "process_step",
    component_type: "step_title",
    description: "Franchise step 5 title",
    translations: {
      en: "Ongoing Support",
      he: "תמיכה שוטפת",
      ru: "Постоянная поддержка"
    }
  },
  
  "franchise_step_5_description": {
    category: "process_step",
    component_type: "step_description",
    description: "Franchise step 5 description", 
    translations: {
      en: "Continuous support, training, and business development assistance",
      he: "תמיכה רציפה, הכשרה וסיוע בפיתוח עסקי",
      ru: "Постоянная поддержка, обучение и помощь в развитии бизнеса"
    }
  }
};

async function createMissingFranchiseKeys() {
  try {
    console.log('=== CREATING MISSING FRANCHISE DATABASE ENTRIES ===');
    console.log('Total keys to create:', Object.keys(franchiseTranslations).length);
    console.log('Total translations to create:', Object.keys(franchiseTranslations).length * 3, '(33 keys × 3 languages)');
    console.log('');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const [contentKey, data] of Object.entries(franchiseTranslations)) {
      try {
        console.log(`Creating: ${contentKey}`);
        
        // 1. Create content item
        const itemResult = await pool.query(`
          INSERT INTO content_items (
            content_key, content_type, category, screen_location, 
            component_type, description, is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
          RETURNING id
        `, [
          contentKey,
          'text',
          data.category, 
          'temporary_franchise',
          data.component_type,
          data.description,
          true
        ]);
        
        const itemId = itemResult.rows[0].id;
        
        // 2. Create translations for all languages
        const languages = ['en', 'he', 'ru'];
        for (const lang of languages) {
          await pool.query(`
            INSERT INTO content_translations (
              content_item_id, language_code, content_value, status, created_at
            ) VALUES ($1, $2, $3, $4, NOW())
          `, [
            itemId,
            lang,
            data.translations[lang],
            'approved'
          ]);
        }
        
        console.log(`  ✅ Created with ID ${itemId} (${languages.length} translations)`);
        successCount++;
        
      } catch (error) {
        console.log(`  ❌ ERROR: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n=== CREATION SUMMARY ===');
    console.log(`✅ Successfully created: ${successCount} content items`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total translations created: ${successCount * 3}`);
    console.log(`🎯 Success rate: ${Math.round((successCount / Object.keys(franchiseTranslations).length) * 100)}%`);
    
    if (errorCount === 0) {
      console.log('\n🎉 ALL FRANCHISE KEYS CREATED SUCCESSFULLY!');
      console.log('✅ Phase 8 database preparation complete');
      console.log('🔄 Ready to proceed with t() fallback removal');
    } else {
      console.log(`\n⚠️  ${errorCount} errors occurred - review and retry failed keys`);
    }
    
  } catch (error) {
    console.error('❌ Fatal error in database creation:', error.message);
  } finally {
    await pool.end();
  }
}

createMissingFranchiseKeys();