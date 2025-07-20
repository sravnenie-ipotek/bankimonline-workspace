#!/usr/bin/env node

/**
 * Comprehensive Migration Script for Mortgage Step 2 Personal Details Content
 * Migrates all translation keys from JSON files to database-driven content management
 * Following DEVHelp/DevRules/translationRules for legal-grade translation standards
 */

const baseUrl = 'http://localhost:8003/api/content';

// Complete mapping of all mortgage step 2 content items
const mortgageStep2ContentItems = [
  // Main Page Content
  {
    key: 'app.mortgage.step2.title',
    translations: {
      en: 'Personal Details',
      he: 'פרטים אישיים',
      ru: 'Личные данные'
    },
    category: 'form',
    component_type: 'title',
    description: 'Step 2 main page title'
  },
  {
    key: 'app.mortgage.step2.privacy_notice',
    translations: {
      en: 'Your personal data will not be transferred to third parties. We operate in accordance with the Privacy Protection Law, 1981 and data protection regulations',
      he: 'הנתונים האישיים שלכם לא יועברו לגורמים חיצוניים. אנו פועלים בהתאם להוראות חוק הגנת הפרטיות התשמ"א-1981 ותקנות הגנת הנתונים',
      ru: 'Ваши личные данные не будут переданы третьим лицам. Мы действуем в соответствии с Законом о защите конфиденциальности 1981 года и правилами защиты данных'
    },
    category: 'legal',
    component_type: 'notice',
    description: 'Privacy law compliance statement - critical legal text'
  },

  // Personal Information Fields
  {
    key: 'app.mortgage.step2.name_surname',
    translations: {
      en: 'Full Name',
      he: 'שם מלא',
      ru: 'Полное имя'
    },
    category: 'form',
    component_type: 'label',
    description: 'Full name field label'
  },
  {
    key: 'app.mortgage.step2.name_surname_ph',
    translations: {
      en: 'Enter first name and last name',
      he: 'הזן שם פרטי ושם משפחה',
      ru: 'Введите имя и фамилию'
    },
    category: 'form',
    component_type: 'placeholder',
    description: 'Full name field placeholder'
  },
  {
    key: 'app.mortgage.step2.birth_date',
    translations: {
      en: 'Date of Birth',
      he: 'תאריך לידה',
      ru: 'Дата рождения'
    },
    category: 'form',
    component_type: 'label',
    description: 'Birthday field label'
  },

  // Education Section
  {
    key: 'app.mortgage.step2.education',
    translations: {
      en: 'Education',
      he: 'השכלה',
      ru: 'Образование'
    },
    category: 'form',
    component_type: 'label',
    description: 'Education dropdown label'
  },
  {
    key: 'app.mortgage.step2.education_ph',
    translations: {
      en: 'Select education level',
      he: 'בחר רמת השכלה',
      ru: 'Выберите уровень образования'
    },
    category: 'form',
    component_type: 'placeholder',
    description: 'Education dropdown placeholder'
  },

  // Education Options
  {
    key: 'app.mortgage.step2.education_option_1',
    translations: {
      en: 'No high school certificate',
      he: 'ללא תעודת בגרות',
      ru: 'Без аттестата средней школы'
    },
    category: 'form',
    component_type: 'option',
    description: 'Education option 1'
  },
  {
    key: 'app.mortgage.step2.education_option_2',
    translations: {
      en: 'Partial high school certificate',
      he: 'תעודת בגרות חלקית',
      ru: 'Частичный аттестат средней школы'
    },
    category: 'form',
    component_type: 'option',
    description: 'Education option 2'
  },
  {
    key: 'app.mortgage.step2.education_option_3',
    translations: {
      en: 'Full high school certificate',
      he: 'תעודת בגרות מלאה',
      ru: 'Полный аттестат средней школы'
    },
    category: 'form',
    component_type: 'option',
    description: 'Education option 3'
  },
  {
    key: 'app.mortgage.step2.education_option_4',
    translations: {
      en: 'Post-secondary education',
      he: 'השכלה על-תיכונית',
      ru: 'Послешкольное образование'
    },
    category: 'form',
    component_type: 'option',
    description: 'Education option 4'
  },
  {
    key: 'app.mortgage.step2.education_option_5',
    translations: {
      en: 'Bachelor\'s degree',
      he: 'תואר ראשון',
      ru: 'Степень бакалавра'
    },
    category: 'form',
    component_type: 'option',
    description: 'Education option 5'
  },
  {
    key: 'app.mortgage.step2.education_option_6',
    translations: {
      en: 'Master\'s degree',
      he: 'תואר שני',
      ru: 'Степень магистра'
    },
    category: 'form',
    component_type: 'option',
    description: 'Education option 6'
  },
  {
    key: 'app.mortgage.step2.education_option_7',
    translations: {
      en: 'Doctoral degree',
      he: 'תואר שלישי',
      ru: 'Докторская степень'
    },
    category: 'form',
    component_type: 'option',
    description: 'Education option 7'
  },

  // Citizenship Section
  {
    key: 'app.mortgage.step2.citizenship',
    translations: {
      en: 'Do you have additional citizenship?',
      he: 'האם יש לך אזרחות נוספת?',
      ru: 'Есть ли у вас дополнительное гражданство?'
    },
    category: 'form',
    component_type: 'label',
    description: 'Additional citizenship question'
  },
  {
    key: 'app.mortgage.step2.citizenship_title',
    translations: {
      en: 'Citizenship',
      he: 'אזרחות',
      ru: 'Гражданство'
    },
    category: 'form',
    component_type: 'title',
    description: 'Citizenship dropdown title'
  },
  {
    key: 'app.mortgage.step2.citizenship_ph',
    translations: {
      en: 'Select citizenship',
      he: 'בחר אזרחות',
      ru: 'Выберите гражданство'
    },
    category: 'form',
    component_type: 'placeholder',
    description: 'Citizenship dropdown placeholder'
  },

  // Tax Obligations (Legal Section)
  {
    key: 'app.mortgage.step2.tax_obligations',
    translations: {
      en: 'Are you liable for tax in foreign countries or additional jurisdictions?',
      he: 'האם אתם חייבים במס במדינות זרות או בתחומי שיפוט נוספים?',
      ru: 'Обязаны ли вы платить налоги в зарубежных странах или дополнительных юрисдикциях?'
    },
    category: 'legal',
    component_type: 'label',
    description: 'Tax obligations question - legal compliance'
  },
  {
    key: 'app.mortgage.step2.tax_tooltip',
    translations: {
      en: 'Do you pay taxes abroad?',
      he: 'האם אתה משלם מס בחו"ל?',
      ru: 'Платите ли вы налоги за границей?'
    },
    category: 'legal',
    component_type: 'tooltip',
    description: 'Tax obligations tooltip'
  },

  // Children Information
  {
    key: 'app.mortgage.step2.children_under_18',
    translations: {
      en: 'Children under 18',
      he: 'ילדים מתחת לגיל 18',
      ru: 'Дети до 18 лет'
    },
    category: 'form',
    component_type: 'label',
    description: 'Children under 18 question'
  },
  {
    key: 'app.mortgage.step2.children_count',
    translations: {
      en: 'Number of children under 18',
      he: 'כמות ילדים מתחת לגיל 18',
      ru: 'Количество детей до 18 лет'
    },
    category: 'form',
    component_type: 'label',
    description: 'Number of children field'
  },

  // Medical and Legal Status
  {
    key: 'app.mortgage.step2.medical_insurance',
    translations: {
      en: 'Are you insured with valid health insurance and entitled to medical insurance benefits?',
      he: 'האם אתם מבוטחים בביטוח בריאות תקף וחלים עליכם זכויות ביטוח רפואי?',
      ru: 'Застрахованы ли вы действующей медицинской страховкой и имеете ли право на льготы по медицинскому страхованию?'
    },
    category: 'legal',
    component_type: 'label',
    description: 'Medical insurance compliance question'
  },
  {
    key: 'app.mortgage.step2.foreign_resident',
    translations: {
      en: 'Are you considered a foreign resident under the Income Tax Law?',
      he: 'האם אתם נחשבים לתושבי חוץ על פי חוק מס הכנסה?',
      ru: 'Считаетесь ли вы иностранным резидентом согласно Закону о подоходном налоге?'
    },
    category: 'legal',
    component_type: 'label',
    description: 'Foreign resident status - tax law compliance'
  },
  {
    key: 'app.mortgage.step2.foreign_resident_tooltip',
    translations: {
      en: 'A foreign resident under the Income Tax Law is a person who resides abroad or does not meet the definition of an Israeli resident for tax purposes',
      he: 'תושב חוץ על פי חוק מס הכנסה הוא אדם המתגורר בחו"ל או אינו עונה על הגדרת תושב ישראל לצורכי מס',
      ru: 'Иностранный резидент согласно Закону о подоходном налоге - это лицо, проживающее за границей или не соответствующее определению израильского резидента для налоговых целей'
    },
    category: 'legal',
    component_type: 'tooltip',
    description: 'Foreign resident definition - tax law reference'
  },
  {
    key: 'app.mortgage.step2.public_person',
    translations: {
      en: 'Do you hold a senior public position or are you among the family members/business partners of a public official?',
      he: 'האם אתם מכהנים בתפקיד ציבורי בכיר או נמנים עם קרובי המשפחה/השותפים העסקיים של נושא תפקיד ציבורי?',
      ru: 'Занимаете ли вы высокую государственную должность или являетесь членом семьи/деловым партнером государственного должностного лица?'
    },
    category: 'legal',
    component_type: 'label',
    description: 'Public person status - compliance declaration'
  },
  {
    key: 'app.mortgage.step2.public_person_tooltip',
    translations: {
      en: 'Public position: MKs, ministers, judges, senior officers, heads of authorities. Relationship: close family or business partners. Required by law.',
      he: 'תפקיד ציבורי: חכ"ם, שרים, שופטים, קצינים בכירים, ראשי רשויות. קרבה: משפחה קרובה או שותפים עסקיים. נדרש על פי חוק.',
      ru: 'Государственная должность: депутаты Кнессета, министры, судьи, старшие офицеры, главы органов власти. Родство: близкая семья или деловые партнеры. Требуется по закону.'
    },
    category: 'legal',
    component_type: 'tooltip',
    description: 'Public person definition - legal requirement'
  },

  // Borrowers and Family Status
  {
    key: 'app.mortgage.step2.borrowers_count',
    translations: {
      en: 'How many borrowers will there be in total, including you?',
      he: 'כמה חייבים במשכנתא יהיו בסך הכול, כולל אתכם?',
      ru: 'Сколько заемщиков будет всего, включая вас?'
    },
    category: 'form',
    component_type: 'label',
    description: 'Number of borrowers question'
  },
  {
    key: 'app.mortgage.step2.borrowers_placeholder',
    translations: {
      en: 'Enter number of borrowers',
      he: 'הזן מספר לווים',
      ru: 'Введите количество заемщиков'
    },
    category: 'form',
    component_type: 'placeholder',
    description: 'Borrowers field placeholder'
  },
  {
    key: 'app.mortgage.step2.family_status',
    translations: {
      en: 'Marital Status',
      he: 'מצב משפחתי',
      ru: 'Семейное положение'
    },
    category: 'form',
    component_type: 'label',
    description: 'Family status dropdown label'
  },
  {
    key: 'app.mortgage.step2.family_status_ph',
    translations: {
      en: 'Select marital status',
      he: 'בחר מצב משפחתי',
      ru: 'Выберите семейное положение'
    },
    category: 'form',
    component_type: 'placeholder',
    description: 'Family status dropdown placeholder'
  },

  // Family Status Options
  {
    key: 'app.mortgage.step2.family_status_option_1',
    translations: {
      en: 'Single',
      he: 'רווק/רווקה',
      ru: 'Холост/незамужем'
    },
    category: 'form',
    component_type: 'option',
    description: 'Family status option 1'
  },
  {
    key: 'app.mortgage.step2.family_status_option_2',
    translations: {
      en: 'Married',
      he: 'נשוי/נשואה',
      ru: 'Женат/замужем'
    },
    category: 'form',
    component_type: 'option',
    description: 'Family status option 2'
  },
  {
    key: 'app.mortgage.step2.family_status_option_3',
    translations: {
      en: 'Divorced',
      he: 'גרוש/גרושה',
      ru: 'Разведен/разведена'
    },
    category: 'form',
    component_type: 'option',
    description: 'Family status option 3'
  },
  {
    key: 'app.mortgage.step2.family_status_option_4',
    translations: {
      en: 'Widowed',
      he: 'אלמן/אלמנה',
      ru: 'Вдовец/вдова'
    },
    category: 'form',
    component_type: 'option',
    description: 'Family status option 4'
  },
  {
    key: 'app.mortgage.step2.family_status_option_5',
    translations: {
      en: 'Common-law marriage',
      he: 'ידוע/ידועה בציבור',
      ru: 'Гражданский брак'
    },
    category: 'form',
    component_type: 'option',
    description: 'Family status option 5'
  },
  {
    key: 'app.mortgage.step2.family_status_option_6',
    translations: {
      en: 'Other',
      he: 'אחר',
      ru: 'Другое'
    },
    category: 'form',
    component_type: 'option',
    description: 'Family status option 6'
  },

  // Partner Information
  {
    key: 'app.mortgage.step2.partner_mortgage_participation',
    translations: {
      en: 'Will the partner participate in mortgage payments?',
      he: 'האם השותף ישתתף בתשלומי המשכנתא?',
      ru: 'Будет ли партнер участвовать в выплатах по ипотеке?'
    },
    category: 'form',
    component_type: 'label',
    description: 'Partner mortgage participation question'
  },
  {
    key: 'app.mortgage.step2.add_partner_title',
    translations: {
      en: 'Add',
      he: 'הוסף',
      ru: 'Добавить'
    },
    category: 'form',
    component_type: 'title',
    description: 'Add partner section title'
  },
  {
    key: 'app.mortgage.step2.add_partner',
    translations: {
      en: 'Add Partner',
      he: 'הוסף שותף',
      ru: 'Добавить партнера'
    },
    category: 'form',
    component_type: 'button',
    description: 'Add partner button text'
  },

  // Dropdown Support Text
  {
    key: 'app.mortgage.step2.search',
    translations: {
      en: 'Search',
      he: 'חיפוש',
      ru: 'Поиск'
    },
    category: 'form',
    component_type: 'placeholder',
    description: 'Search placeholder for multiselect dropdowns'
  },
  {
    key: 'app.mortgage.step2.nothing_found',
    translations: {
      en: 'No results found',
      he: 'לא נמצאו תוצאות',
      ru: 'Результаты не найдены'
    },
    category: 'form',
    component_type: 'text',
    description: 'No results text for multiselect dropdowns'
  },
  {
    key: 'app.mortgage.step2.countries',
    translations: {
      en: 'Countries',
      he: 'מדינות',
      ru: 'Страны'
    },
    category: 'form',
    component_type: 'text',
    description: 'Countries label for multiselect'
  }
];

// Function to create content item via API
async function createContentItem(item) {
  const payload = {
    content_key: item.key,
    content_type: 'text',
    category: item.category,
    screen_location: 'mortgage_step2',
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
async function migrateMortgageStep2Content() {
  console.log('🚀 Starting comprehensive mortgage step 2 content migration...');
  console.log(`📊 Total items to migrate: ${mortgageStep2ContentItems.length}`);
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const item of mortgageStep2ContentItems) {
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
    console.log('\n🎉 Migration completed! Now update the components to use content API.');
  }
}

// Run the migration
migrateMortgageStep2Content().catch(console.error);