const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    hebrewFile: path.join(__dirname, 'locales/he/translation.json'),
    russianFile: path.join(__dirname, 'locales/ru/translation.json'),
    outputFile: path.join(__dirname, 'missing_translations.json'),
    apiKey: process.env.GOOGLE_TRANSLATE_API_KEY || '', // Set your API key
    batchSize: 10, // Number of translations per batch
    delay: 1000 // Delay between batches (ms)
};

// Translation service class
class TranslationService {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    // Google Translate API (REST) using API key directly
    async translateWithGoogle(text, targetLang = 'ru') {
        if (!this.apiKey) {
            console.log('⚠️  Google Translate API key not provided. Using fallback method.');
            return this.translateWithFallback(text);
        }

        try {
            const url = `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`;
            const body = {
                q: text,
                target: targetLang,
                format: 'text'
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            const translation = data?.data?.translations?.[0]?.translatedText;
            if (!translation) throw new Error('Empty translation result');
            return translation;
        } catch (error) {
            console.log(`❌ Google Translate REST error: ${error.message}`);
            return this.translateWithFallback(text);
        }
    }

    // Fallback translation using a simple mapping (for demo purposes)
    translateWithFallback(text) {
        // This is a very basic fallback - in production, you'd want a more sophisticated approach
        const commonTerms = {
            'מידע נוסף': 'Дополнительная информация',
            'עיר': 'Город',
            'שם': 'Имя',
            'טלפון': 'Телефон',
            'אימייל': 'Email',
            'סיסמה': 'Пароль',
            'המשך': 'Продолжить',
            'חזור': 'Назад',
            'שמור': 'Сохранить',
            'בטל': 'Отмена'
        };

        let translated = text;
        for (const [hebrew, russian] of Object.entries(commonTerms)) {
            translated = translated.replace(new RegExp(hebrew, 'g'), russian);
        }

        return translated || `[TRANSLATION NEEDED: ${text}]`;
    }

    // DeepL API (alternative to Google Translate)
    async translateWithDeepL(text, targetLang = 'RU') {
        // Implementation would require DeepL API key
        console.log('DeepL translation not implemented - requires API key');
        return this.translateWithFallback(text);
    }
}

// Main translation processor
class TranslationProcessor {
    constructor() {
        this.translationService = new TranslationService(config.apiKey);
        this.hebrewData = {};
        this.russianData = {};
        this.missingKeys = [];
        this.translations = {};
    }

    async loadData() {
        try {
            this.hebrewData = JSON.parse(fs.readFileSync(config.hebrewFile, 'utf8'));
            this.russianData = JSON.parse(fs.readFileSync(config.russianFile, 'utf8'));
            
            // Find missing keys
            const hebrewKeys = Object.keys(this.hebrewData);
            const russianKeys = Object.keys(this.russianData);
            
            this.missingKeys = hebrewKeys.filter(key => !russianKeys.includes(key));
            
            console.log(`📊 Loaded ${hebrewKeys.length} Hebrew keys and ${russianKeys.length} Russian keys`);
            console.log(`🔍 Found ${this.missingKeys.length} missing translations`);
            
        } catch (error) {
            console.error('❌ Error loading translation files:', error.message);
            process.exit(1);
        }
    }

    async translateBatch(keys) {
        const batch = [];
        
        for (const key of keys) {
            const hebrewText = this.hebrewData[key];
            if (typeof hebrewText === 'string' && hebrewText.trim()) {
                batch.push({ key, text: hebrewText });
            }
        }

        console.log(`🔄 Translating batch of ${batch.length} items...`);

        for (const item of batch) {
            try {
                const translation = await this.translationService.translateWithGoogle(item.text);
                this.translations[item.key] = translation;
                console.log(`✅ ${item.key}: "${item.text}" → "${translation}"`);
                
                // Add delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));
                
            } catch (error) {
                console.error(`❌ Error translating ${item.key}:`, error.message);
                this.translations[item.key] = `[ERROR: ${item.text}]`;
            }
        }
    }

    async processAllTranslations() {
        console.log('🚀 Starting translation process...\n');
        
        // Process in batches
        for (let i = 0; i < this.missingKeys.length; i += config.batchSize) {
            const batch = this.missingKeys.slice(i, i + config.batchSize);
            await this.translateBatch(batch);
            
            // Delay between batches
            if (i + config.batchSize < this.missingKeys.length) {
                console.log(`⏳ Waiting ${config.delay}ms before next batch...\n`);
                await new Promise(resolve => setTimeout(resolve, config.delay));
            }
        }
    }

    saveResults() {
        const output = {
            metadata: {
                generated: new Date().toISOString(),
                totalMissing: this.missingKeys.length,
                totalTranslated: Object.keys(this.translations).length,
                sourceFile: config.hebrewFile,
                targetFile: config.russianFile
            },
            translations: this.translations,
            missingKeys: this.missingKeys.filter(key => !this.translations[key])
        };

        fs.writeFileSync(config.outputFile, JSON.stringify(output, null, 2));
        console.log(`\n💾 Results saved to ${config.outputFile}`);
        
        // Also create a ready-to-use Russian translation file
        const updatedRussianData = { ...this.russianData, ...this.translations };
        const backupFile = config.russianFile.replace('.json', '.backup.json');
        fs.writeFileSync(backupFile, JSON.stringify(this.russianData, null, 2));
        fs.writeFileSync(config.russianFile, JSON.stringify(updatedRussianData, null, 2));
        
        console.log(`💾 Updated Russian translation file (backup saved to ${backupFile})`);
    }

    generateReport() {
        console.log('\n📋 Translation Report:');
        console.log('====================');
        console.log(`Total missing keys: ${this.missingKeys.length}`);
        console.log(`Successfully translated: ${Object.keys(this.translations).length}`);
        console.log(`Failed translations: ${this.missingKeys.length - Object.keys(this.translations).length}`);
        
        if (Object.keys(this.translations).length > 0) {
            console.log('\n✅ Sample translations:');
            const sampleKeys = Object.keys(this.translations).slice(0, 5);
            sampleKeys.forEach(key => {
                console.log(`  ${key}: "${this.hebrewData[key]}" → "${this.translations[key]}"`);
            });
        }
    }
}

// Main execution
async function main() {
    const processor = new TranslationProcessor();
    
    try {
        await processor.loadData();
        
        if (processor.missingKeys.length === 0) {
            console.log('🎉 No missing translations found!');
            return;
        }
        
        await processor.processAllTranslations();
        processor.saveResults();
        processor.generateReport();
        
        console.log('\n🎯 Next steps:');
        console.log('1. Review the generated translations in the output file');
        console.log('2. Manually verify critical business terms');
        console.log('3. Test the translations with Russian-speaking users');
        console.log('4. Consider professional review for legal/financial content');
        
    } catch (error) {
        console.error('❌ Translation process failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { TranslationProcessor, TranslationService };
