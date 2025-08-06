#!/usr/bin/env node

const http = require('http');

console.log('🔍 Validating ServicesOverview Migration...\n');

// Test if server is running
function testServer() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:5176', (res) => {
      console.log('✅ CLIENT server is running on port 5176');
      console.log(`   Status: ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log('❌ CLIENT server is not running');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ SERVER request timeout');
      req.destroy();
      resolve(false);
    });
  });
}

// Test ServicesOverview route
function testServicesRoute() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5176/services', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ /services route is accessible');
          
          // Check for key component elements
          const hasServicesOverview = data.includes('services-overview');
          const hasServiceCards = data.includes('service-card');
          const hasContainer = data.includes('container');
          
          console.log(`   ServicesOverview class: ${hasServicesOverview ? '✅' : '❌'}`);
          console.log(`   Service cards: ${hasServiceCards ? '✅' : '❌'}`);
          console.log(`   Container: ${hasContainer ? '✅' : '❌'}`);
          
          resolve(hasServicesOverview && hasServiceCards && hasContainer);
        } else {
          console.log(`❌ /services route returned status ${res.statusCode}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      console.log('❌ /services route is not accessible');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ /services route timeout');
      req.destroy();
      resolve(false);
    });
  });
}

// Run validation
async function runValidation() {
  console.log('Phase 2A: ServicesOverview Migration Validation');
  console.log('=' .repeat(50));
  
  const serverRunning = await testServer();
  if (!serverRunning) {
    console.log('\n❌ VALIDATION FAILED: Server not running');
    process.exit(1);
  }
  
  const servicesWorking = await testServicesRoute();
  
  console.log('\n' + '=' .repeat(50));
  console.log('VALIDATION SUMMARY:');
  console.log('=' .repeat(50));
  
  if (servicesWorking) {
    console.log('✅ ServicesOverview migration SUCCESSFUL');
    console.log('   - Component is accessible via /services route');
    console.log('   - All key CSS classes are present');
    console.log('   - Container component is working');
    console.log('   - Service cards are rendered');
    console.log('\n🎉 Phase 2A Complete! ServicesOverview successfully migrated to CLIENT package.');
  } else {
    console.log('❌ ServicesOverview migration FAILED');
    console.log('   - Check component imports and CSS classes');  
    console.log('   - Verify translation keys are available');
    console.log('   - Check console for JavaScript errors');
  }
  
  console.log('\nNext Steps:');
  console.log('• Run Cypress tests when ready: npm run test:e2e');
  console.log('• Access page manually: http://localhost:5176/services');
  console.log('• Begin next service migration');
}

runValidation().catch(console.error);