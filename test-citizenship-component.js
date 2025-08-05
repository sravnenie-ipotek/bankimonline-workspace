const fetch = require('node-fetch');

async function testCitizenshipComponent() {
    try {
        console.log('Testing citizenship component logic...\\n');
        
        // Simulate the component's API call
        const response = await fetch('http://localhost:8003/api/dropdowns/mortgage_step2/he');
        const data = await response.json();
        
        console.log('✅ API Response Status:', response.status);
        
        // Extract all citizenship options (same logic as component)
        const allOptions = [];
        Object.keys(data.options).forEach(key => {
            if (key.includes('citizenship') && key !== 'mortgage_step2_citizenship') {
                const options = data.options[key];
                if (Array.isArray(options) && options.length > 0) {
                    allOptions.push(...options);
                }
            }
        });
        
        // Remove duplicates based on value
        const uniqueOptions = allOptions.filter((option, index, arr) => 
            arr.findIndex(o => o.value === option.value) === index
        );
        
        console.log('✅ Citizenship options extracted:');
        uniqueOptions.forEach(option => {
            console.log(`  - ${option.label} (${option.value})`);
        });
        
        console.log(`\\n✅ Total unique options: ${uniqueOptions.length}`);
        
        if (uniqueOptions.length > 0) {
            console.log('\\n🎉 Citizenship dropdown should work correctly!');
        } else {
            console.log('\\n❌ No citizenship options found');
        }
        
    } catch (err) {
        console.error('❌ Test failed:', err.message);
    }
}

testCitizenshipComponent(); 