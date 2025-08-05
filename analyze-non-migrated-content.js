const fs = require('fs');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 
                     process.env.DATABASE_PUBLIC_URL || 
                     process.env.DATABASE_URL || 
                     'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
    ssl: { rejectUnauthorized: false }
});

async function analyzeNonMigratedContent() {
    try {
        console.log('📊 ANALYSIS: Content NOT Yet Migrated to Database');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Load English translation file (as reference)
        const enTranslation = JSON.parse(fs.readFileSync('locales/en/translation.json', 'utf8'));
        
        // Separate migrated vs non-migrated keys
        const migratedKeys = Object.keys(enTranslation).filter(key => key.startsWith('__MIGRATED_'));
        const nonMigratedKeys = Object.keys(enTranslation).filter(key => !key.startsWith('__MIGRATED_'));
        
        console.log(`📖 Total English keys: ${Object.keys(enTranslation).length}`);
        console.log(`✅ Migrated keys: ${migratedKeys.length}`);
        console.log(`❌ NOT migrated keys: ${nonMigratedKeys.length}`);
        console.log();
        
        // Analyze non-migrated keys by category
        const categories = {
            'calculate_credit': [],
            'calculate_mortgage': [],
            'mortgage_refinance': [],
            'credit_refinance': [],
            'sidebar': [],
            'footer': [],
            'about': [],
            'contacts': [],
            'cooperation': [],
            'franchise': [],
            'lawyers': [],
            'bank_worker': [],
            'bank_partner': [],
            'privacy_policy': [],
            'cookie': [],
            'error': [],
            'validation': [],
            'navigation': [],
            'common': [],
            'other': []
        };
        
        // Categorize non-migrated keys
        nonMigratedKeys.forEach(key => {
            let categorized = false;
            
            for (const category of Object.keys(categories)) {
                if (key.startsWith(category)) {
                    categories[category].push(key);
                    categorized = true;
                    break;
                }
            }
            
            if (!categorized) {
                categories.other.push(key);
            }
        });
        
        // Display analysis by category
        console.log('🗂️  NON-MIGRATED CONTENT BY CATEGORY:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        Object.entries(categories).forEach(([category, keys]) => {
            if (keys.length > 0) {
                console.log(`\n📁 ${category.toUpperCase()} (${keys.length} keys):`);
                console.log('─'.repeat(50));
                
                // Show first 10 keys as examples
                keys.slice(0, 10).forEach(key => {
                    console.log(`   📝 ${key}`);
                });
                
                if (keys.length > 10) {
                    console.log(`   ... and ${keys.length - 10} more keys`);
                }
            }
        });
        
        // Priority migration candidates
        console.log('\n🎯 PRIORITY MIGRATION CANDIDATES:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const priorities = [
            { name: 'Credit Calculator', keys: categories.calculate_credit, priority: 'HIGH' },
            { name: 'Credit Refinance', keys: categories.credit_refinance, priority: 'HIGH' },
            { name: 'Footer Content', keys: categories.footer, priority: 'MEDIUM' },
            { name: 'Error Messages', keys: categories.error, priority: 'MEDIUM' },
            { name: 'Navigation', keys: categories.navigation, priority: 'MEDIUM' },
            { name: 'About Page', keys: categories.about, priority: 'LOW' },
            { name: 'Privacy/Cookie', keys: [...categories.privacy_policy, ...categories.cookie], priority: 'LOW' }
        ];
        
        priorities.forEach(item => {
            if (item.keys.length > 0) {
                const icon = item.priority === 'HIGH' ? '🔴' : item.priority === 'MEDIUM' ? '🟡' : '🟢';
                console.log(`${icon} ${item.name}: ${item.keys.length} keys (${item.priority} priority)`);
            }
        });
        
        // Find process-specific patterns
        console.log('\n🔍 PROCESS-SPECIFIC PATTERNS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const processes = ['calculate_credit', 'calculate_mortgage', 'mortgage_refinance', 'credit_refinance'];
        
        processes.forEach(process => {
            const processKeys = nonMigratedKeys.filter(key => key.startsWith(process));
            if (processKeys.length > 0) {
                console.log(`\n📊 ${process.toUpperCase()}:`);
                
                // Analyze by step patterns
                for (let step = 1; step <= 4; step++) {
                    const stepKeys = processKeys.filter(key => key.includes(`_step_${step}`) || key.includes(`_step${step}`));
                    if (stepKeys.length > 0) {
                        console.log(`   Step ${step}: ${stepKeys.length} keys`);
                    }
                }
                
                // Analyze by component type
                const bannerKeys = processKeys.filter(key => key.includes('banner'));
                const progressKeys = processKeys.filter(key => key.includes('progress'));
                const optionKeys = processKeys.filter(key => key.includes('option'));
                const titleKeys = processKeys.filter(key => key.includes('title'));
                
                if (bannerKeys.length > 0) console.log(`   Banners: ${bannerKeys.length} keys`);
                if (progressKeys.length > 0) console.log(`   Progress: ${progressKeys.length} keys`);
                if (optionKeys.length > 0) console.log(`   Options: ${optionKeys.length} keys`);
                if (titleKeys.length > 0) console.log(`   Titles: ${titleKeys.length} keys`);
            }
        });
        
        // Summary and recommendations
        console.log('\n💡 MIGRATION RECOMMENDATIONS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('1. 🎯 Start with calculate_credit (HIGH priority)');
        console.log('2. 🎯 Continue with credit_refinance (HIGH priority)');
        console.log('3. 📄 Migrate footer content (shared across all pages)');
        console.log('4. ⚠️  Migrate error/validation messages (user experience)');
        console.log('5. 🧭 Migrate navigation components');
        console.log('6. 📝 Handle static pages (about, privacy, etc.) last');
        
        console.log('\n📈 MIGRATION STATISTICS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📊 Migration Progress: ${Math.round((migratedKeys.length / Object.keys(enTranslation).length) * 100)}%`);
        console.log(`🎯 High Priority Remaining: ${categories.calculate_credit.length + categories.credit_refinance.length} keys`);
        console.log(`📋 Total Remaining: ${nonMigratedKeys.length} keys`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

analyzeNonMigratedContent(); 