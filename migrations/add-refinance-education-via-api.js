const axios = require('axios');

const API_BASE = 'http://localhost:8003/api/content';

// Education content to add
const educationContent = [
  {
    content_key: 'refinance_step2_education',
    component_type: 'field_label',
    screen_location: 'refinance_step2',
    category: 'personal_details',
    description: 'Education dropdown label',
    translations: {
      en: 'Education',
      he: 'השכלה',
      ru: 'Образование'
    }
  },
  {
    content_key: 'refinance_step2_education_ph',
    component_type: 'placeholder',
    screen_location: 'refinance_step2',
    category: 'personal_details',
    description: 'Education dropdown placeholder',
    translations: {
      en: 'Select education level',
      he: 'בחר רמת השכלה',
      ru: 'Выберите уровень образования'
    }
  },
  {
    content_key: 'refinance_step2_education_option_1',
    component_type: 'option',
    screen_location: 'refinance_step2',
    category: 'personal_details',
    description: 'Education option 1 - No high school certificate',
    translations: {
      en: 'No high school certificate',
      he: 'ללא תעודת בגרות',
      ru: 'Без аттестата средней школы'
    }
  },
  {
    content_key: 'refinance_step2_education_option_2',
    component_type: 'option',
    screen_location: 'refinance_step2',
    category: 'personal_details',
    description: 'Education option 2 - Partial high school certificate',
    translations: {
      en: 'Partial high school certificate',
      he: 'תעודת בגרות חלקית',
      ru: 'Частичный аттестат средней школы'
    }
  },
  {
    content_key: 'refinance_step2_education_option_3',
    component_type: 'option',
    screen_location: 'refinance_step2',
    category: 'personal_details',
    description: 'Education option 3 - Full high school certificate',
    translations: {
      en: 'Full high school certificate',
      he: 'תעודת בגרות מלאה',
      ru: 'Полный аттестат средней школы'
    }
  },
  {
    content_key: 'refinance_step2_education_option_4',
    component_type: 'option',
    screen_location: 'refinance_step2',
    category: 'personal_details',
    description: 'Education option 4 - Post-secondary education',
    translations: {
      en: 'Post-secondary education',
      he: 'השכלה על-תיכונית',
      ru: 'Послешкольное образование'
    }
  },
  {
    content_key: 'refinance_step2_education_option_5',
    component_type: 'option',
    screen_location: 'refinance_step2',
    category: 'personal_details',
    description: 'Education option 5 - Bachelor\'s degree',
    translations: {
      en: 'Bachelor\'s degree',
      he: 'תואר ראשון',
      ru: 'Степень бакалавра'
    }
  },
  {
    content_key: 'refinance_step2_education_option_6',
    component_type: 'option',
    screen_location: 'refinance_step2',
    category: 'personal_details',
    description: 'Education option 6 - Master\'s degree',
    translations: {
      en: 'Master\'s degree',
      he: 'תואר שני',
      ru: 'Степень магистра'
    }
  },
  {
    content_key: 'refinance_step2_education_option_7',
    component_type: 'option',
    screen_location: 'refinance_step2',
    category: 'personal_details',
    description: 'Education option 7 - Doctoral degree',
    translations: {
      en: 'Doctoral degree',
      he: 'תואר שלישי',
      ru: 'Докторская степень'
    }
  }
];

async function addContentViaAPI() {
  console.log('🚀 Starting Refinance Step 2 Education Migration via API...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const content of educationContent) {
    try {
      console.log(`⏳ Adding: ${content.content_key}...`);
      
      const response = await axios.post(API_BASE, content);
      
      if (response.data.status === 'success') {
        console.log(`✅ Success: ${content.content_key} (ID: ${response.data.content_item_id})`);
        successCount++;
      } else {
        console.log(`❌ Failed: ${content.content_key} - ${response.data.message}`);
        errorCount++;
      }
      
    } catch (error) {
      console.error(`❌ Error adding ${content.content_key}:`, error.response?.data?.message || error.message);
      errorCount++;
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`✅ Successfully added: ${successCount} items`);
  console.log(`❌ Failed: ${errorCount} items`);
  
  if (successCount > 0) {
    console.log('\n🔍 Verifying migration...');
    try {
      const verifyResponse = await axios.get(`${API_BASE}/refinance_step2/he`);
      const contentCount = verifyResponse.data.content_count;
      console.log(`✅ API now returns ${contentCount} content items for refinance_step2`);
      
      if (contentCount > 1) {
        console.log('🎉 Migration successful! Education dropdown should now work.');
      } else {
        console.log('⚠️  Content count still low - may need to restart server');
      }
    } catch (error) {
      console.error('❌ Error verifying migration:', error.message);
    }
  }
}

// Run the migration
addContentViaAPI().catch(console.error); 