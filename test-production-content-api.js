#!/usr/bin/env node

// Quick production API test script
// Tests actual production Content API endpoint

async function testProductionContentAPI() {
  console.log('🧪 TESTING PRODUCTION CONTENT API');
  console.log('==================================');
  
  const PRODUCTION_API_URL = 'https://your-production-domain.com'; // UPDATE THIS
  const DEV_API_URL = 'http://localhost:8003';
  
  const testEndpoints = [
    '/api/content/mortgage_step1/en',
    '/api/v1/dropdowns?screen=mortgage_step1&language=en'
  ];
  
  for (const endpoint of testEndpoints) {
    console.log(`\n📡 Testing: ${endpoint}`);
    
    // Test development first
    try {
      console.log('   🔧 Development:');
      const devResponse = await fetch(`${DEV_API_URL}${endpoint}`);
      const devData = await devResponse.json();
      
      if (endpoint.includes('/api/content/')) {
        const mortgageKeys = Object.keys(devData.content || {}).filter(key => 
          key.includes('mortgage_step1.field')
        );
        console.log(`   ✅ Returns ${devData.content_count || 0} total keys`);
        console.log(`   ✅ Includes ${mortgageKeys.length} mortgage_step1.field.* keys`);
        mortgageKeys.slice(0, 3).forEach(key => {
          console.log(`      - ${key}: "${devData.content[key].value}"`);
        });
      } else {
        console.log(`   ✅ Returns ${devData.length || 0} dropdowns`);
      }
      
    } catch (error) {
      console.log(`   ❌ Development Error: ${error.message}`);
    }
    
    // Test production
    try {
      console.log('   🌐 Production:');
      const prodResponse = await fetch(`${PRODUCTION_API_URL}${endpoint}`);
      const prodData = await prodResponse.json();
      
      if (endpoint.includes('/api/content/')) {
        const mortgageKeys = Object.keys(prodData.content || {}).filter(key => 
          key.includes('mortgage_step1.field')
        );
        console.log(`   ✅ Returns ${prodData.content_count || 0} total keys`);
        console.log(`   ${mortgageKeys.length > 0 ? '✅' : '❌'} Includes ${mortgageKeys.length} mortgage_step1.field.* keys`);
        
        if (mortgageKeys.length === 0) {
          console.log('   🚨 PRODUCTION BUG CONFIRMED: No mortgage_step1.field.* keys returned!');
          console.log('   Available keys:', Object.keys(prodData.content || {}).slice(0, 5));
        } else {
          mortgageKeys.slice(0, 3).forEach(key => {
            console.log(`      - ${key}: "${prodData.content[key].value}"`);
          });
        }
      } else {
        console.log(`   ✅ Returns ${prodData.length || 0} dropdowns`);
      }
      
    } catch (error) {
      console.log(`   ❌ Production Error: ${error.message}`);
      if (error.message.includes('fetch')) {
        console.log('   💡 Hint: Update PRODUCTION_API_URL in this script');
      }
    }
  }
  
  console.log('\n🎯 PRODUCTION TEST INSTRUCTIONS:');
  console.log('1. Update PRODUCTION_API_URL in this script');
  console.log('2. Run: node test-production-content-api.js');
  console.log('3. Compare dev vs production responses');
  console.log('4. If production missing mortgage_step1.field.* keys:');
  console.log('   - Check production database connection');
  console.log('   - Clear production content cache');
  console.log('   - Verify contentPool configuration');
}

// Mock fetch for Node.js if needed
if (typeof fetch === 'undefined') {
  const { default: fetch } = await import('node-fetch');
  global.fetch = fetch;
}

testProductionContentAPI()
  .then(() => console.log('\n✅ Production test complete'))
  .catch(error => console.error('❌ Test failed:', error.message));