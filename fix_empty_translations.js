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
        let fixedCount = 0;
        const fixedKeys = [];
        
        // Apply fixes
        for (const [key, translation] of Object.entries(translationFixes)) {
            if (russianData[key] === '' || russianData[key] === undefined) {
                russianData[key] = translation;
                fixedCount++;
                fixedKeys.push(key);
                }
        }
        
        // Find other empty translations
        const emptyKeys = Object.keys(russianData).filter(key => 
            russianData[key] === '' || 
            (typeof russianData[key] === 'string' && russianData[key].trim() === '')
        );
        
        if (emptyKeys.length > 0) {
            emptyKeys.slice(0, 10).forEach(key => {
                });
            if (emptyKeys.length > 10) {
                }
        }
        
        // Save the updated file
        fs.writeFileSync(config.russianFile, JSON.stringify(russianData, null, 2));
        
        if (fixedKeys.length > 0) {
            }`);
        }
        
    } catch (error) {
        console.error('❌ Error fixing translations:', error.message);
        process.exit(1);
    }
}

// Run the fix
fixEmptyTranslations();
