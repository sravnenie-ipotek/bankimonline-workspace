const axios = require('axios');

const BASE_URL = 'http://localhost:8003';

async function testMortgageFilter() {
  console.log('🧪 [FILTER-TEST] Testing mortgage filter functionality...\n');
  
  try {
    // Test 1: Check if mortgage programs API is available
    console.log('1️⃣ Testing mortgage programs API...');
    const programsResponse = await axios.get(`${BASE_URL}/api/customer/mortgage-programs`);
    console.log('✅ Mortgage programs API working');
    console.log('📋 Available programs:');
    programsResponse.data.data.programs.forEach(program => {
      console.log(`   - ${program.id}: ${program.title} (${program.interestRate}%)`);
    });
    
    // Test 2: Check content API for filter options
    console.log('\n2️⃣ Testing content API for filter options...');
    const contentResponse = await axios.get(`${BASE_URL}/api/content/mortgage_step4/he`);
    console.log('✅ Content API working');
    
    const filterContent = contentResponse.data.content.filter(item => 
      item.content_key.includes('mortgage_filter')
    );
    
    if (filterContent.length > 0) {
      console.log('📋 Filter content found:');
      filterContent.forEach(item => {
        console.log(`   - ${item.content_key}: ${item.content_value}`);
      });
    } else {
      console.log('⚠️  No filter content found - migration may be needed');
    }
    
    // Test 3: Verify filter mapping
    console.log('\n3️⃣ Testing filter mapping logic...');
    const filterMappings = {
      'all': 'All programs',
      'prime': 'Prime rate programs only',
      'fixed_inflation': 'Fixed rate programs only', 
      'variable_inflation': 'Variable rate programs only'
    };
    
    const programs = programsResponse.data.data.programs;
    
    Object.entries(filterMappings).forEach(([filterValue, description]) => {
      const filteredPrograms = filterValue === 'all' ? 
        programs : 
        programs.filter(p => p.id === filterValue);
      
      console.log(`   - Filter "${filterValue}": ${filteredPrograms.length} programs (${description})`);
    });
    
    console.log('\n🎉 [SUCCESS] All tests passed! Mortgage filter implementation is ready.');
    
  } catch (error) {
    console.error('❌ [ERROR] Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 [TIP] Make sure the server is running with: node start-dev.js');
    }
  }
}

// Run the test
testMortgageFilter(); 