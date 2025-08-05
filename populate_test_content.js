const { Pool } = require('pg');

// Database configuration (using Railway database like server-db.js)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
  ssl: {
    rejectUnauthorized: false
  }
});

async function populateTestContent() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting content population...');
    
    // Sample content for testing
    const testContent = [
      // Navigation/Sidebar content
      { key: 'sidebar_company', screen: 'navigation', en: 'Company', he: 'חברה', ru: 'Компания' },
      { key: 'sidebar_company_1', screen: 'navigation', en: 'Our services', he: 'השירותים שלנו', ru: 'Наши услуги' },
      { key: 'sidebar_company_2', screen: 'navigation', en: 'About', he: 'אודות', ru: 'О нас' },
      { key: 'sidebar_company_3', screen: 'navigation', en: 'Jobs', he: 'משרות', ru: 'Вакансии' },
      { key: 'sidebar_company_4', screen: 'navigation', en: 'Contact', he: 'צור קשר', ru: 'Контакты' },
      { key: 'sidebar_company_5', screen: 'navigation', en: 'Temporary Franchise for Brokers', he: 'זכיון זמני למתווכים', ru: 'Временная франшиза для брокеров' },
      
      { key: 'sidebar_business', screen: 'navigation', en: 'Business', he: 'עסקים', ru: 'Бизнес' },
      { key: 'sidebar_business_1', screen: 'navigation', en: 'Partner financial institutions', he: 'מוסדות פיננסיים שותפים', ru: 'Партнерские финансовые учреждения' },
      { key: 'sidebar_business_2', screen: 'navigation', en: 'Partner program', he: 'תוכנית שותפים', ru: 'Партнерская программа' },
      { key: 'sidebar_business_3', screen: 'navigation', en: 'Broker franchise', he: 'זכיון מתווכים', ru: 'Брокерская франшиза' },
      { key: 'sidebar_business_4', screen: 'navigation', en: 'Lawyer partner program', he: 'תוכנית שותפים עורכי דין', ru: 'Партнерская программа юристов' },
      
      // About page content
      { key: 'about_title', screen: 'about', en: 'About us', he: 'אודותינו', ru: 'О нас' },
      { key: 'about_desc', screen: 'about', en: 'We are leaders in the field of financing offer comparison and help our clients find the best financial solution for them.', he: 'אנחנו מובילים בתחום השוואת הצעות מימון ועוזרים ללקוחותינו למצוא את הפתרון הפיננסי הטוב ביותר עבורם.', ru: 'Мы лидеры в области сравнения финансовых предложений и помогаем нашим клиентам найти лучшее финансовое решение для них.' },
      
      // Contacts page content
      { key: 'contacts_title', screen: 'contacts', en: 'Contact us', he: 'צור קשר', ru: 'Связаться с нами' },
      { key: 'contacts_main_office', screen: 'contacts', en: 'Main office', he: 'משרד ראשי', ru: 'Главный офис' },
      
      // Franchise page content
      { key: 'franchise_main_hero_title', screen: 'temporary_franchise', en: 'Strategic Business Opportunity in Real Estate', he: 'הזדמנות עסקית אסטרטגית בנדלן', ru: 'Стратегическая бизнес возможность в недвижимости' }
    ];
    
    let insertedCount = 0;
    
    for (const item of testContent) {
      // Insert content item
      const itemResult = await client.query(`
        INSERT INTO content_items (key, screen_location, component_type, category, status)
        VALUES ($1, $2, 'text', 'general', 'active')
        ON CONFLICT (key, screen_location) 
        DO UPDATE SET component_type = 'text', category = 'general', status = 'active'
        RETURNING id, key
      `, [item.key, item.screen]);
      
      const contentId = itemResult.rows[0].id;
      console.log(`📝 Content item: ${item.key} (ID: ${contentId})`);
      
      // Insert translations for each language
      const languages = [
        { code: 'en', name: 'English', value: item.en },
        { code: 'he', name: 'Hebrew', value: item.he },
        { code: 'ru', name: 'Russian', value: item.ru }
      ];
      
      for (const lang of languages) {
        await client.query(`
          INSERT INTO content_translations (content_item_id, language_code, value, status)
          VALUES ($1, $2, $3, 'active')
          ON CONFLICT (content_item_id, language_code)
          DO UPDATE SET value = $3, status = 'active'
        `, [contentId, lang.code, lang.value]);
        
        console.log(`  ✅ ${lang.name}: ${lang.value}`);
      }
      
      insertedCount++;
    }
    
    console.log(`\n🎉 Successfully populated ${insertedCount} content items with translations!`);
    console.log('\n🔍 Testing API endpoints:');
    
    // Test the API endpoints
    const testScreens = ['navigation', 'about', 'contacts', 'temporary_franchise'];
    for (const screen of testScreens) {
      const result = await client.query(`
        SELECT ci.key, ct.language_code, ct.value
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.screen_location = $1 AND ct.status = 'active'
        ORDER BY ci.key, ct.language_code
      `, [screen]);
      
      console.log(`📱 Screen "${screen}": ${result.rows.length} translations`);
    }
    
  } catch (error) {
    console.error('❌ Error populating content:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the population
populateTestContent().catch(console.error);