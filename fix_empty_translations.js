const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    russianFile: path.join(__dirname, 'locales/ru/translation.json'),
    backupFile: path.join(__dirname, 'locales/ru/translation.backup.json')
};

// Common fixes for empty or problematic translations
const translationFixes = {
    'step3_description': 'Описание третьего шага', // Generic step 3 description
    // Add more fixes as needed
};

function fixEmptyTranslations() {
    try {
        // Read the Russian translation file
        const russianData = JSON.parse(fs.readFileSync(config.russianFile, 'utf8'));
        
        // Create backup
        fs.writeFileSync(config.backupFile, JSON.stringify(russianData, null, 2));
        console.log(`💾 Backup created: ${config.backupFile}`);
        
        let fixedCount = 0;
        const fixedKeys = [];
        
        // Apply fixes
        for (const [key, translation] of Object.entries(translationFixes)) {
            if (russianData[key] === '' || russianData[key] === undefined) {
                russianData[key] = translation;
                fixedCount++;
                fixedKeys.push(key);
                console.log(`✅ Fixed "${key}": "${translation}"`);
            }
        }
        
        // Find other empty translations
        const emptyKeys = Object.keys(russianData).filter(key => 
            russianData[key] === '' || 
            (typeof russianData[key] === 'string' && russianData[key].trim() === '')
        );
        
        if (emptyKeys.length > 0) {
            console.log(`\n⚠️  Found ${emptyKeys.length} other empty translations:`);
            emptyKeys.slice(0, 10).forEach(key => {
                console.log(`  - ${key}`);
            });
            if (emptyKeys.length > 10) {
                console.log(`  ... and ${emptyKeys.length - 10} more`);
            }
        }
        
        // Save the updated file
        fs.writeFileSync(config.russianFile, JSON.stringify(russianData, null, 2));
        
        console.log(`\n📊 Summary:`);
        console.log(`- Fixed ${fixedCount} translations`);
        console.log(`- Found ${emptyKeys.length} other empty translations`);
        console.log(`- Updated file: ${config.russianFile}`);
        
        if (fixedKeys.length > 0) {
            console.log(`\n🎯 Fixed keys: ${fixedKeys.join(', ')}`);
        }
        
    } catch (error) {
        console.error('❌ Error fixing translations:', error.message);
        process.exit(1);
    }
}

// Run the fix
fixEmptyTranslations();
