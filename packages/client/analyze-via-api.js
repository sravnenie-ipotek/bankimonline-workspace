const fs = require('fs');
const path = require('path');

async function analyzeViaAPI() {
  // 1. Check all screen locations
  const screens = [
    'personal_cabinet',
    'home',
    'sidebar',
    'about_us',
    'contacts',
    'calculate_mortgage_1',
    'calculate_mortgage_2',
    'borrowers_step_1',
    'borrowers_step_2'
  ];
  
  for (const screen of screens) {
    try {
      const response = await fetch(`http://localhost:8003/api/content/${screen}/ru`);
      const data = await response.json();
      } catch (e) {
      }
  }
  
  // 2. Check personal cabinet specifically
  const languages = ['en', 'he', 'ru'];
  
  for (const lang of languages) {
    try {
      const response = await fetch(`http://localhost:8003/api/content/personal_cabinet/${lang}`);
      const data = await response.json();
      
      }: ${data.content_count} items`);
      if (data.content && Object.keys(data.content).length > 0) {
        Object.entries(data.content).slice(0, 5).forEach(([key, item]) => {
          });
      }
    } catch (e) {
      }
  }
  
  // 3. Compare with JSON files
  const keysToCheck = [
    'main_income_source',
    'employment',
    'self_employed',
    'business',
    'pension',
    'unemployed',
    'select_answer',
    'profession_name',
    'it_technology',
    'finance_banking',
    'healthcare',
    'education'
  ];
  
  for (const lang of languages) {
    const jsonPath = path.join(__dirname, 'public', 'locales', lang, 'translation.json');
    try {
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      } JSON Status:`);
      let migratedCount = 0;
      let nonMigratedCount = 0;
      
      keysToCheck.forEach(key => {
        const hasMigrated = !!jsonData[`__MIGRATED_${key}`];
        const hasOriginal = !!jsonData[key];
        
        if (hasMigrated) {
          migratedCount++;
        } else if (hasOriginal) {
          nonMigratedCount++;
          }
      });
      
      } catch (e) {
      }
  }
  
  // 4. Check code implementation
  const incomeDataPath = path.join(__dirname, 'src/pages/PersonalCabinet/components/IncomeDataPage/IncomeDataPage.tsx');
  
  try {
    const codeContent = fs.readFileSync(incomeDataPath, 'utf8');
    
    // Check for useContentApi
    const hasContentApi = codeContent.includes('useContentApi');
    const hasGetContent = codeContent.includes('getContent(');
    
    // Count getContent calls
    const getContentMatches = codeContent.match(/getContent\(/g);
    // Check specific patterns
    const patterns = [
      { pattern: /getContent\('employment'\)/, label: 'employment dropdown' },
      { pattern: /getContent\('main_income_source'\)/, label: 'main income source label' },
      { pattern: /getContent\('select_answer'\)/, label: 'select answer placeholder' }
    ];
    
    patterns.forEach(({ pattern, label }) => {
      const found = pattern.test(codeContent);
      });
    
  } catch (e) {
    }
  
  // 5. Summary and recommendations
  }

// Run analysis
analyzeViaAPI()
  .then(() => )
  .catch(error => console.error('\n❌ Analysis failed:', error.message));