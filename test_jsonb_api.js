const http = require('http');

// Test the new JSONB dropdown API
function testDropdownAPI() {
    const options = {
        hostname: 'localhost',
        port: 8003,
        path: '/api/dropdowns/mortgage_step1/en',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                console.log('✅ API Response received!');
                console.log('  Status:', response.status);
                console.log('  JSONB Source:', response.jsonb_source);
                console.log('  Dropdowns found:', response.dropdowns?.length);
                console.log('  Performance:', response.performance);
                
                // Check for property_ownership dropdown
                const propertyOwnership = response.dropdowns?.find(d => d.key === 'mortgage_step1_property_ownership');
                if (propertyOwnership) {
                    console.log('  ✅ Found property_ownership dropdown!');
                    const options = response.options['mortgage_step1_property_ownership'];
                    if (options && options.length > 0) {
                        console.log('  ✅ Has', options.length, 'options');
                    }
                } else {
                    console.log('  ⚠️  property_ownership dropdown not found');
                }
            } catch (error) {
                console.error('Failed to parse response:', error);
                console.log('Response:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('Request failed:', error);
        console.log('Make sure the server is running on port 8003');
    });

    req.end();
}

console.log('Testing JSONB Dropdown API...');
testDropdownAPI();