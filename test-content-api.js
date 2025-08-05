const fetch = require('node-fetch');

async function testContentAPI() {
    console.log('Testing Content API endpoint...\n');
    
    try {
        // Test the sidebar content endpoint
        const apiUrl = 'http://localhost:8003/api/content/sidebar/he';
        console.log(`Calling: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        console.log('\nAPI Response:');
        console.log('Status:', data.status);
        console.log('Screen Location:', data.screen_location);
        console.log('Language:', data.language_code);
        console.log('Content Count:', data.content_count);
        
        if (data.content && Object.keys(data.content).length > 0) {
            console.log('\nSample content items:');
            const sidebarItems = Object.entries(data.content)
                .filter(([key]) => key.includes('sidebar_company') || key.includes('sidebar_business'))
                .slice(0, 5);
                
            sidebarItems.forEach(([key, item]) => {
                console.log(`\n${key}:`);
                console.log(`  Value: ${item.value}`);
                console.log(`  Category: ${item.category}`);
                console.log(`  Component Type: ${item.component_type}`);
            });
            
            console.log('\n✅ Content API is working! The menu data IS being fetched from the database.');
        } else {
            console.log('\n❌ No content returned from API');
        }
        
    } catch (error) {
        console.error('Error testing API:', error.message);
        console.log('\n❌ Content API might not be accessible. The app would fall back to translation files.');
    }
}

testContentAPI();