#!/usr/bin/env node

// Quick test to verify the obligations dropdown API
const http = require('http');

function testObligationsAPI() {
  console.log('🧪 Testing obligations dropdown API...\n');
  
  const options = {
    hostname: 'localhost',
    port: 8003,
    path: '/api/dropdowns/mortgage_step3/he',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        console.log(`✅ API Response Status: ${res.statusCode}`);
        console.log(`✅ Response Status: ${response.status}`);
        console.log(`✅ Screen Location: ${response.screen_location}`);
        console.log(`✅ Language: ${response.language_code}\n`);
        
        // Check if obligations dropdown exists
        const obligationsKey = 'mortgage_step3_obligations';
        
        if (response.options && response.options[obligationsKey]) {
          console.log(`✅ Found ${obligationsKey} with ${response.options[obligationsKey].length} options:`);
          response.options[obligationsKey].forEach((option, index) => {
            console.log(`   ${index + 1}. ${option.value}: "${option.label}"`);
          });
        } else {
          console.log(`❌ Missing ${obligationsKey} in options`);
          console.log('Available option keys:', Object.keys(response.options || {}));
        }
        
        // Check placeholders and labels
        if (response.placeholders && response.placeholders[obligationsKey]) {
          console.log(`✅ Placeholder: "${response.placeholders[obligationsKey]}"`);
        } else {
          console.log(`❌ Missing placeholder for ${obligationsKey}`);
        }
        
        if (response.labels && response.labels[obligationsKey]) {
          console.log(`✅ Label: "${response.labels[obligationsKey]}"`);
        } else {
          console.log(`❌ Missing label for ${obligationsKey}`);
        }
        
      } catch (error) {
        console.error('❌ Failed to parse JSON response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ API request failed:', error.message);
    console.log('🔧 Make sure the API server is running on port 8003');
    console.log('   Run: npm run dev');
  });

  req.end();
}

testObligationsAPI();