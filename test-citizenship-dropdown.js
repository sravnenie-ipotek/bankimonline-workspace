const fetch = require('node-fetch');

async function testCitizenshipDropdown() {
    try {
        console.log('Testing citizenship dropdown API...\n');
        
        // Test the API endpoint
        const response = await fetch('http://localhost:8003/api/dropdowns/mortgage_step2/he');
        const data = await response.json();
        
        console.log('✅ API Response Status:', response.status);
        
        // Extract citizenship options
        const citizenshipOptions = Object.keys(data.options)
            .filter(key => key.includes('citizenship') && key !== 'mortgage_step2_citizenship')
            .flatMap(key => data.options[key])
            .map(option => option.label)
            .filter((label, index, arr) => arr.indexOf(label) === index); // Remove duplicates
        
        console.log('\n📋 Citizenship Options Found:');
        citizenshipOptions.forEach((option, index) => {
            console.log(`${index + 1}. ${option}`);
        });
        
        console.log(`\n✅ Total citizenship options: ${citizenshipOptions.length}`);
        
        if (citizenshipOptions.length > 0) {
            console.log('🎉 Citizenship dropdown is working correctly!');
        } else {
            console.log('❌ No citizenship options found');
        }
        
    } catch (error) {
        console.error('❌ Error testing citizenship dropdown:', error.message);
    }
}

testCitizenshipDropdown(); 