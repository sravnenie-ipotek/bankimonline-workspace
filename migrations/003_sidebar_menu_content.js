const { Client } = require('pg');
require('dotenv').config();

// Sidebar menu items with their translations
const sidebarMenuItems = [
  {
    content_key: 'sidebar_menu_dashboard',
    content_type: 'text',
    category: 'sidebar_menu',
    screen_location: 'sidebar',
    component_type: 'menu_item',
    description: 'Dashboard menu item in sidebar',
    legacy_translation_key: 'Dashboard',
    translations: {
      en: 'Dashboard',
      he: 'לוח בקרה',
      ru: 'Панель управления'
    }
  },
  {
    content_key: 'sidebar_menu_bank_offers',
    content_type: 'text',
    category: 'sidebar_menu',
    screen_location: 'sidebar',
    component_type: 'menu_item',
    description: 'Bank Offers menu item in sidebar',
    legacy_translation_key: 'Bank Offers',
    translations: {
      en: 'Bank Offers',
      he: 'הצעות בנקים',
      ru: 'Банковские предложения'
    }
  },
  {
    content_key: 'sidebar_menu_calculate_mortgage',
    content_type: 'text',
    category: 'sidebar_menu',
    screen_location: 'sidebar',
    component_type: 'menu_item',
    description: 'Calculate Mortgage menu item in sidebar',
    legacy_translation_key: 'Calculate Mortgage',
    translations: {
      en: 'Calculate Mortgage',
      he: 'חישוב משכנתא',
      ru: 'Расчет ипотеки'
    }
  },
  {
    content_key: 'sidebar_menu_calculate_credit',
    content_type: 'text',
    category: 'sidebar_menu',
    screen_location: 'sidebar',
    component_type: 'menu_item',
    description: 'Calculate Credit menu item in sidebar',
    legacy_translation_key: 'Calculate Credit',
    translations: {
      en: 'Calculate Credit',
      he: 'חישוב אשראי',
      ru: 'Расчет кредита'
    }
  },
  {
    content_key: 'sidebar_menu_refinance_mortgage',
    content_type: 'text',
    category: 'sidebar_menu',
    screen_location: 'sidebar',
    component_type: 'menu_item',
    description: 'Refinance Mortgage menu item in sidebar',
    legacy_translation_key: 'Refinance Mortgage',
    translations: {
      en: 'Refinance Mortgage',
      he: 'מימון מחדש משכנתא',
      ru: 'Рефинансирование ипотеки'
    }
  },
  {
    content_key: 'sidebar_menu_refinance_credit',
    content_type: 'text',
    category: 'sidebar_menu',
    screen_location: 'sidebar',
    component_type: 'menu_item',
    description: 'Refinance Credit menu item in sidebar',
    legacy_translation_key: 'Refinance Credit',
    translations: {
      en: 'Refinance Credit',
      he: 'מימון מחדש אשראי',
      ru: 'Рефинансирование кредита'
    }
  },
  {
    content_key: 'sidebar_menu_personal_cabinet',
    content_type: 'text',
    category: 'sidebar_menu',
    screen_location: 'sidebar',
    component_type: 'menu_item',
    description: 'Personal Cabinet menu item in sidebar',
    legacy_translation_key: 'Personal Cabinet',
    translations: {
      en: 'Personal Cabinet',
      he: 'ארון אישי',
      ru: 'Личный кабинет'
    }
  },
  {
    content_key: 'sidebar_menu_about_us',
    content_type: 'text',
    category: 'sidebar_menu',
    screen_location: 'sidebar',
    component_type: 'menu_item',
    description: 'About Us menu item in sidebar',
    legacy_translation_key: 'About Us',
    translations: {
      en: 'About Us',
      he: 'אודותינו',
      ru: 'О нас'
    }
  },
  {
    content_key: 'sidebar_menu_contact',
    content_type: 'text',
    category: 'sidebar_menu',
    screen_location: 'sidebar',
    component_type: 'menu_item',
    description: 'Contact menu item in sidebar',
    legacy_translation_key: 'Contact',
    translations: {
      en: 'Contact',
      he: 'צור קשר',
      ru: 'Контакты'
    }
  },
  {
    content_key: 'sidebar_menu_settings',
    content_type: 'text',
    category: 'sidebar_menu',
    screen_location: 'sidebar',
    component_type: 'menu_item',
    description: 'Settings menu item in sidebar',
    legacy_translation_key: 'Settings',
    translations: {
      en: 'Settings',
      he: 'הגדרות',
      ru: 'Настройки'
    }
  },
  {
    content_key: 'sidebar_menu_support',
    content_type: 'text',
    category: 'sidebar_menu',
    screen_location: 'sidebar',
    component_type: 'menu_item',
    description: 'Support menu item in sidebar',
    legacy_translation_key: 'Support',
    translations: {
      en: 'Support',
      he: 'תמיכה',
      ru: 'Поддержка'
    }
  },
  {
    content_key: 'sidebar_menu_help',
    content_type: 'text',
    category: 'sidebar_menu',
    screen_location: 'sidebar',
    component_type: 'menu_item',
    description: 'Help menu item in sidebar',
    legacy_translation_key: 'Help',
    translations: {
      en: 'Help',
      he: 'עזרה',
      ru: 'Помощь'
    }
  },
  {
    content_key: 'sidebar_menu_faq',
    content_type: 'text',
    category: 'sidebar_menu',
    screen_location: 'sidebar',
    component_type: 'menu_item',
    description: 'FAQ menu item in sidebar',
    legacy_translation_key: 'FAQ',
    translations: {
      en: 'FAQ',
      he: 'שאלות נפוצות',
      ru: 'Часто задаваемые вопросы'
    }
  },
  {
    content_key: 'sidebar_menu_privacy_policy',
    content_type: 'text',
    category: 'sidebar_menu',
    screen_location: 'sidebar',
    component_type: 'menu_item',
    description: 'Privacy Policy menu item in sidebar',
    legacy_translation_key: 'Privacy Policy',
    translations: {
      en: 'Privacy Policy',
      he: 'מדיניות פרטיות',
      ru: 'Политика конфиденциальности'
    }
  },
  {
    content_key: 'sidebar_menu_terms_of_service',
    content_type: 'text',
    category: 'sidebar_menu',
    screen_location: 'sidebar',
    component_type: 'menu_item',
    description: 'Terms of Service menu item in sidebar',
    legacy_translation_key: 'Terms of Service',
    translations: {
      en: 'Terms of Service',
      he: 'תנאי שירות',
      ru: 'Условия обслуживания'
    }
  },
  {
    content_key: 'sidebar_menu_logout',
    content_type: 'text',
    category: 'sidebar_menu',
    screen_location: 'sidebar',
    component_type: 'menu_item',
    description: 'Logout menu item in sidebar',
    legacy_translation_key: 'Logout',
    translations: {
      en: 'Logout',
      he: 'התנתק',
      ru: 'Выйти'
    }
  }
];

async function migrate() {
  const client = new Client({
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Start transaction
    await client.query('BEGIN');
    console.log('Started transaction');

    // First, check if sidebar_menu content already exists
    const checkExisting = await client.query(
      'SELECT COUNT(*) FROM content_items WHERE category = $1',
      ['sidebar_menu']
    );
    
    if (parseInt(checkExisting.rows[0].count) > 0) {
      console.log('Sidebar menu content already exists. Skipping migration.');
      await client.query('ROLLBACK');
      return;
    }

    console.log('Inserting sidebar menu items...');
    
    for (const item of sidebarMenuItems) {
      // Insert content item
      const insertItemQuery = `
        INSERT INTO content_items (
          content_key,
          content_type,
          category,
          screen_location,
          component_type,
          description,
          legacy_translation_key,
          migration_status,
          is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id;
      `;
      
      const itemResult = await client.query(insertItemQuery, [
        item.content_key,
        item.content_type,
        item.category,
        item.screen_location,
        item.component_type,
        item.description,
        item.legacy_translation_key,
        'migrated',
        true
      ]);
      
      const contentItemId = itemResult.rows[0].id;
      console.log(`  Created content item: ${item.content_key} (ID: ${contentItemId})`);
      
      // Insert translations for each language
      for (const [lang, translation] of Object.entries(item.translations)) {
        const insertTranslationQuery = `
          INSERT INTO content_translations (
            content_item_id,
            language_code,
            content_value,
            is_default,
            status
          ) VALUES ($1, $2, $3, $4, $5);
        `;
        
        await client.query(insertTranslationQuery, [
          contentItemId,
          lang,
          translation,
          lang === 'en', // English is default
          'approved'
        ]);
        
        console.log(`    Added ${lang} translation: "${translation}"`);
      }
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log('\nMigration completed successfully!');
    console.log(`Total items migrated: ${sidebarMenuItems.length}`);

  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run migration
migrate().catch(error => {
  console.error('Migration error:', error);
  process.exit(1);
});