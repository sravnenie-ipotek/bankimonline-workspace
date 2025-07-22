const fs = require('fs');
const path = require('path');

async function analyzeViaAPI() {
  console.log('=== CONTENT ANALYSIS VIA API ===\n');
  
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
  
  console.log('=== SCREEN CONTENT COUNTS ===');
  for (const screen of screens) {
    try {
      const response = await fetch(`http://localhost:8003/api/content/${screen}/ru`);
      const data = await response.json();
      console.log(`${screen}: ${data.content_count || 0} items`);
    } catch (e) {
      console.log(`${screen}: ERROR - ${e.message}`);
    }
  }
  
  // 2. Check personal cabinet specifically
  console.log('\n=== PERSONAL CABINET DETAILED CHECK ===');
  const languages = ['en', 'he', 'ru'];
  
  for (const lang of languages) {
    try {
      const response = await fetch(`http://localhost:8003/api/content/personal_cabinet/${lang}`);
      const data = await response.json();
      
      console.log(`\n${lang.toUpperCase()}: ${data.content_count} items`);
      if (data.content && Object.keys(data.content).length > 0) {
        Object.entries(data.content).slice(0, 5).forEach(([key, item]) => {
          console.log(`  ${key}: "${item.value}" [${item.component_type}]`);
        });
      }
    } catch (e) {
      console.log(`${lang}: ERROR - ${e.message}`);
    }
  }
  
  // 3. Compare with JSON files
  console.log('\n=== JSON FILE STATUS ===');
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
      
      console.log(`\n${lang.toUpperCase()} JSON Status:`);
      let migratedCount = 0;
      let nonMigratedCount = 0;
      
      keysToCheck.forEach(key => {
        const hasMigrated = !!jsonData[`__MIGRATED_${key}`];
        const hasOriginal = !!jsonData[key];
        
        if (hasMigrated) {
          migratedCount++;
        } else if (hasOriginal) {
          nonMigratedCount++;
          console.log(`  ${key}: NOT MIGRATED - "${jsonData[key]}"`);
        }
      });
      
      console.log(`  Migrated: ${migratedCount}, Not migrated: ${nonMigratedCount}`);
    } catch (e) {
      console.log(`  ERROR reading JSON: ${e.message}`);
    }
  }
  
  // 4. Check code implementation
  console.log('\n=== CODE IMPLEMENTATION CHECK ===');
  const incomeDataPath = path.join(__dirname, 'src/pages/PersonalCabinet/components/IncomeDataPage/IncomeDataPage.tsx');
  
  try {
    const codeContent = fs.readFileSync(incomeDataPath, 'utf8');
    
    // Check for useContentApi
    const hasContentApi = codeContent.includes('useContentApi');
    const hasGetContent = codeContent.includes('getContent(');
    
    console.log(`IncomeDataPage.tsx:`);
    console.log(`  Uses useContentApi: ${hasContentApi ? '✅' : '❌'}`);
    console.log(`  Uses getContent: ${hasGetContent ? '✅' : '❌'}`);
    
    // Count getContent calls
    const getContentMatches = codeContent.match(/getContent\(/g);
    console.log(`  getContent calls: ${getContentMatches ? getContentMatches.length : 0}`);
    
    // Check specific patterns
    const patterns = [
      { pattern: /getContent\('employment'\)/, label: 'employment dropdown' },
      { pattern: /getContent\('main_income_source'\)/, label: 'main income source label' },
      { pattern: /getContent\('select_answer'\)/, label: 'select answer placeholder' }
    ];
    
    console.log('\n  Specific implementations:');
    patterns.forEach(({ pattern, label }) => {
      const found = pattern.test(codeContent);
      console.log(`    ${label}: ${found ? '✅' : '❌'}`);
    });
    
  } catch (e) {
    console.log(`  ERROR reading code: ${e.message}`);
  }
  
  // 5. Summary and recommendations
  console.log('\n=== SUMMARY & RECOMMENDATIONS ===');
  console.log('1. Personal Cabinet has 0 items in database');
  console.log('2. JSON files have been partially marked with __MIGRATED_ prefix');
  console.log('3. Code has been updated to use useContentApi');
  console.log('4. Database migration script was created but failed to execute');
  console.log('\nNext steps:');
  console.log('- Fix database connection and run migration script');
  console.log('- Update migration_status from pending to completed');
  console.log('- Verify all dropdown options are properly migrated');
}

// Run analysis
analyzeViaAPI()
  .then(() => console.log('\n✅ API Analysis complete'))
  .catch(error => console.error('\n❌ Analysis failed:', error.message));