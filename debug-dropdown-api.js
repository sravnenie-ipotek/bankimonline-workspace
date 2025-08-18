const http = require('http');

// Make the API request and debug the response
const options = {
    hostname: 'localhost',
    port: 8003,
    path: '/api/dropdowns/mortgage_step2/he',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        const response = JSON.parse(data);
        console.log('📊 API Response Analysis:');
        console.log('Status:', response.status);
        console.log('Total dropdowns:', response.dropdowns?.length || 0);
        console.log('JSONB source:', response.jsonb_source);
        console.log('Performance:', response.performance);
        console.log('\n📋 Checking specific dropdown (education):');
        const education = response.dropdowns?.find(d => d.field === 'education');
        if (education) {
            console.log('Education dropdown found:');
            console.log('- Label:', education.label);
            console.log('- Placeholder:', education.placeholder);
            console.log('- Options count:', education.options?.length || 0);
            console.log('- Options:', JSON.stringify(education.options, null, 2));
        } else {
            console.log('❌ Education dropdown not found');
        }
        
        console.log('\n🔍 Checking options object:');
        const educationKey = 'mortgage_step2_education';
        if (response.options && response.options[educationKey]) {
            console.log(`Options for ${educationKey}:`, response.options[educationKey]);
        } else {
            console.log(`❌ No options found for ${educationKey}`);
        }
        
        // Check first dropdown with options
        console.log('\n🔎 Looking for any dropdown with options:');
        const withOptions = response.dropdowns?.find(d => d.options && d.options.length > 0);
        if (withOptions) {
            console.log('Found dropdown with options:', withOptions.field);
            console.log('Options:', withOptions.options);
        } else {
            console.log('❌ No dropdowns have any options!');
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request error:', error);
});

req.end();