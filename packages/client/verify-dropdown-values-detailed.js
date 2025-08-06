const fetch = require('node-fetch');

async function verifyDropdownValuesDetailed() {
  console.log('🔍 DETAILED DROPDOWN VALUES VERIFICATION\n');
  
  const baseUrl = 'http://localhost:8003';
  const languages = ['en', 'he', 'ru'];
  const screens = [
    'mortgage_step1', 'mortgage_step2', 'mortgage_step3',
    'credit_step1', 'credit_step2', 'credit_step3',
    'refinance_mortgage_step1', 'refinance_mortgage_step2', 'refinance_mortgage_step3',
    'refinance_credit_step1', 'refinance_credit_step2', 'refinance_credit_step3'
  ];

  const detailedResults = [];
  let totalDropdowns = 0;
  let totalOptions = 0;

  for (const screen of screens) {
    console.log(`\n📋 ANALYZING ${screen.toUpperCase()}`);
    
    for (const lang of languages) {
      const endpoint = `${baseUrl}/api/dropdowns/${screen}/${lang}`;
      
      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          console.log(`❌ ${lang}: HTTP ${response.status}`);
          continue;
        }

        const data = await response.json();
        const dropdowns = Object.keys(data.options || {});
        let screenTotalOptions = 0;
        
        console.log(`\n${lang.toUpperCase()} Language:`);
        
        if (dropdowns.length === 0) {
          console.log('  ❌ No dropdowns found');
          continue;
        }
        
        dropdowns.forEach(dropdownKey => {
          const options = data.options[dropdownKey];
          if (Array.isArray(options)) {
            const optionCount = options.length;
            screenTotalOptions += optionCount;
            
            if (optionCount > 0) {
              const sampleOptions = options.slice(0, 3).map(opt => opt.label || opt.value || opt).join(', ');
              console.log(`  ✅ ${dropdownKey}: ${optionCount} options (${sampleOptions}${optionCount > 3 ? '...' : ''})`);
            } else {
              console.log(`  ⚠️  ${dropdownKey}: 0 options`);
            }
          } else {
            console.log(`  ❓ ${dropdownKey}: Invalid format`);
          }
        });
        
        totalDropdowns += dropdowns.length;
        totalOptions += screenTotalOptions;
        
        detailedResults.push({
          screen,
          language: lang,
          dropdownCount: dropdowns.length,
          optionCount: screenTotalOptions,
          dropdowns: dropdowns
        });
        
        console.log(`  📊 Summary: ${dropdowns.length} dropdowns, ${screenTotalOptions} total options`);
        
      } catch (error) {
        console.log(`❌ ${lang}: ${error.message}`);
      }
    }
  }

  // Final comprehensive analysis
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE DROPDOWN VALUES ANALYSIS');
  console.log('='.repeat(80));
  
  console.log(`Total API calls made: ${screens.length * languages.length}`);
  console.log(`Total successful responses: ${detailedResults.length}`);
  console.log(`Total dropdowns found: ${totalDropdowns}`);
  console.log(`Total options found: ${totalOptions}`);
  console.log(`Average options per dropdown: ${totalDropdowns > 0 ? (totalOptions / totalDropdowns).toFixed(1) : 0}`);

  // Group by screen
  console.log('\n📱 DETAILED BREAKDOWN BY SCREEN:');
  screens.forEach(screen => {
    const screenResults = detailedResults.filter(r => r.screen === screen);
    if (screenResults.length > 0) {
      console.log(`\n${screen}:`);
      screenResults.forEach(result => {
        console.log(`  ${result.language}: ${result.dropdownCount} dropdowns, ${result.optionCount} options`);
      });
      
      const avgDropdowns = screenResults.reduce((sum, r) => sum + r.dropdownCount, 0) / screenResults.length;
      const avgOptions = screenResults.reduce((sum, r) => sum + r.optionCount, 0) / screenResults.length;
      console.log(`  Average: ${avgDropdowns.toFixed(1)} dropdowns, ${avgOptions.toFixed(1)} options per language`);
    }
  });

  // Process comparison
  console.log('\n🔄 PROCESS COMPARISON:');
  const processes = {
    'Mortgage Calculator': ['mortgage_step1', 'mortgage_step2', 'mortgage_step3'],
    'Credit Calculator': ['credit_step1', 'credit_step2', 'credit_step3'],
    'Refinance Mortgage': ['refinance_mortgage_step1', 'refinance_mortgage_step2', 'refinance_mortgage_step3'],
    'Refinance Credit': ['refinance_credit_step1', 'refinance_credit_step2', 'refinance_credit_step3']
  };

  Object.entries(processes).forEach(([processName, processScreens]) => {
    const processResults = detailedResults.filter(r => processScreens.includes(r.screen));
    const totalProcessDropdowns = processResults.reduce((sum, r) => sum + r.dropdownCount, 0);
    const totalProcessOptions = processResults.reduce((sum, r) => sum + r.optionCount, 0);
    
    console.log(`${processName}:`);
    console.log(`  Total dropdowns: ${totalProcessDropdowns}`);
    console.log(`  Total options: ${totalProcessOptions}`); 
    console.log(`  Steps working: ${new Set(processResults.map(r => r.screen)).size}/3`);
    console.log(`  Languages working: ${new Set(processResults.map(r => r.language)).size}/3`);
  });

  // Quality assessment
  console.log('\n✅ QUALITY ASSESSMENT:');
  const workingScreens = new Set(detailedResults.map(r => r.screen)).size;
  const expectedScreens = screens.length;
  const workingLanguages = new Set(detailedResults.map(r => r.language)).size;
  const expectedLanguages = languages.length;
  
  console.log(`Screen coverage: ${workingScreens}/${expectedScreens} (${(workingScreens/expectedScreens*100).toFixed(1)}%)`);
  console.log(`Language coverage: ${workingLanguages}/${expectedLanguages} (${(workingLanguages/expectedLanguages*100).toFixed(1)}%)`);
  console.log(`Average options per screen: ${totalOptions/workingScreens}`);
  
  if (totalOptions > 500) {
    console.log('🎉 EXCELLENT: Very comprehensive dropdown coverage!');
  } else if (totalOptions > 200) {
    console.log('✅ GOOD: Solid dropdown coverage');
  } else {
    console.log('⚠️  BASIC: Minimal dropdown coverage');
  }

  return {
    totalDropdowns,
    totalOptions,
    workingScreens,
    workingLanguages,
    detailedResults
  };
}

// Run the verification
if (require.main === module) {
  verifyDropdownValuesDetailed().catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
}

module.exports = { verifyDropdownValuesDetailed };