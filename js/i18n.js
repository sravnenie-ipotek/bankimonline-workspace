// i18n.js - Complete Internationalization Manager as specified in bankMgmt.txt
class I18nManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('admin_language') || 'he'; // Default to Hebrew
        this.translations = {};
        this.rtlLanguages = ['he', 'ar'];
        this.initialized = false;
    }
    
    async init() {
        try {
            console.log('🚀 Initializing i18n...');
            
            // Load all supported languages
            const languages = ['en', 'he', 'ru'];
            
            for (const lang of languages) {
                await this.loadTranslations(lang);
            }
            
            // Set the current language
            await this.changeLanguage(this.currentLanguage);
            
            this.initialized = true;
            console.log('✅ i18n initialization complete');
            
            // Test critical translations
            this.testTranslations();
            
        } catch (error) {
            console.error('❌ i18n initialization failed:', error);
        }
    }
    
    testTranslations() {
        const testKeys = [
            'calculate_mortgage_when_options_ph',
            'calculate_mortgage_first_ph', 
            'calculate_mortgage_type_ph',
            'city',
            'button_next'
        ];
        
        console.log('🧪 Testing translations:');
        testKeys.forEach(key => {
            const translation = this.getTranslation(key);
            console.log(`"${key}" = "${translation}"`);
        });
    }
    
    async loadTranslations(language) {
        try {
            // Try multiple paths to find translations
            const paths = [
                `/locales/${language}/translation.json`,
                `/locales/${language}.json`,
                `./locales/${language}/translation.json`,
                `./locales/${language}.json`,
                `locales/${language}/translation.json`,
                `locales/${language}.json`
            ];
            
            for (const path of paths) {
                try {
                    console.log(`🔍 Trying to load: ${path}`);
                    const response = await fetch(path);
                    if (response.ok) {
                        this.translations[language] = await response.json();
                        console.log(`✅ Loaded translations from: ${path}`);
                        console.log(`📦 ${language} translations:`, Object.keys(this.translations[language]).length, 'keys');
                        return true;
                    }
                } catch (e) {
                    console.log(`❌ Failed to load from: ${path}`, e.message);
                }
            }
            
            console.error(`❌ Failed to load translations for ${language} from any path`);
            return false;
        } catch (error) {
            console.error(`❌ Failed to load translations for ${language}:`, error);
            return false;
        }
    }
    
    async changeLanguage(language) {
        if (!this.translations[language]) {
            const loaded = await this.loadTranslations(language);
            if (!loaded) {
                console.warn(`⚠️ Language ${language} not loaded, falling back to English`);
                language = 'en';
            }
        }
        
        this.currentLanguage = language;
        localStorage.setItem('admin_language', language);
        
        // Update document direction for RTL languages
        document.dir = this.rtlLanguages.includes(language) ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        
        // Update all translated elements
        this.updateTranslations();
        
        // Update language selector
        this.updateLanguageSelector();
        
        console.log(`🔄 Language changed to: ${language}`);
        return true;
    }
    
    updateTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        console.log(`🔄 Updating ${elements.length} translation elements`);
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            if (translation && translation !== key) {
                if (element.tagName === 'INPUT' && element.type === 'submit') {
                    element.value = translation;
                } else if (element.hasAttribute('placeholder')) {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
                console.log(`✅ Updated "${key}" to "${translation}"`);
            } else {
                console.warn(`⚠️ No translation found for "${key}"`);
            }
        });
    }
    
    getTranslation(key) {
        if (!key) return '';
        
        const keys = key.split('.');
        let translation = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (translation && translation[k]) {
                translation = translation[k];
            } else {
                // Fallback to English if translation not found
                translation = this.translations['en'];
                if (translation) {
                    for (const fallbackKey of keys) {
                        if (translation && translation[fallbackKey]) {
                            translation = translation[fallbackKey];
                        } else {
                            return key; // Return key if no translation found
                        }
                    }
                }
                break;
            }
        }
        
        return translation || key;
    }
    
    // Alias for getTranslation
    t(key, params = {}) {
        return this.getTranslation(key);
    }
    
    updateLanguageSelector() {
        const currentLangElement = document.getElementById('currentLanguage');
        const langNames = {
            'en': 'English',
            'he': 'עברית',
            'ru': 'Русский'
        };
        
        if (currentLangElement) {
            currentLangElement.textContent = langNames[this.currentLanguage];
        }
    }
    
    // Format numbers according to locale
    formatNumber(number, options = {}) {
        const locales = {
            'en': 'en-US',
            'he': 'he-IL',
            'ru': 'ru-RU'
        };
        
        return new Intl.NumberFormat(locales[this.currentLanguage], options).format(number);
    }
    
    // Format currency
    formatCurrency(amount, currency = 'ILS') {
        return this.formatNumber(amount, {
            style: 'currency',
            currency: currency
        });
    }
    
    // Format dates
    formatDate(date, options = {}) {
        const locales = {
            'en': 'en-US',
            'he': 'he-IL',
            'ru': 'ru-RU'
        };
        
        return new Intl.DateTimeFormat(locales[this.currentLanguage], options).format(date);
    }
}

// Initialize i18n
const i18n = new I18nManager();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await i18n.init();
});

// Make i18n available globally for admin.html
window.i18n = {
    instance: i18n,
    currentLang: i18n.currentLanguage,
    translations: i18n.translations,
    t: (key, params = {}) => i18n.getTranslation(key),
    getTranslation: (key) => i18n.getTranslation(key),
    setLanguage: async (lang) => {
        const success = await i18n.changeLanguage(lang);
        if (success) {
            window.i18n.currentLang = i18n.currentLanguage;
            window.i18n.translations = i18n.translations;
            // Dispatch language change event
            document.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language: lang }
            }));
        }
        return success;
    }
};

// Global functions for language switching
async function changeLanguage(language) {
    const success = await i18n.changeLanguage(language);
    if (success) {
        // Reload dynamic content with new language
        if (typeof loadBankSelector === 'function') loadBankSelector();
        if (typeof loadUsersList === 'function') loadUsersList();
        
        // Show success message
        showNotification(i18n.getTranslation('messages.language_changed'), 'success');
    }
}

// Setup UI based on user role
function setupUIForRole(userRole, bankId = null) {
    // This function handles role-based UI setup
    // For customer-approval-check.html, we don't need role-based restrictions
    
    // Hide/show elements based on role
    const adminElements = document.querySelectorAll('[data-role="admin"]');
    const bankElements = document.querySelectorAll('[data-role="bank"]');
    const customerElements = document.querySelectorAll('[data-role="customer"]');
    
    // Show/hide based on role
    switch(userRole) {
        case 'super_admin':
            adminElements.forEach(el => el.style.display = 'block');
            bankElements.forEach(el => el.style.display = 'block');
            customerElements.forEach(el => el.style.display = 'block');
            break;
        case 'business_admin':
            adminElements.forEach(el => el.style.display = 'block');
            bankElements.forEach(el => el.style.display = 'none');
            customerElements.forEach(el => el.style.display = 'block');
            break;
        case 'bank_admin':
            adminElements.forEach(el => el.style.display = 'none');
            bankElements.forEach(el => el.style.display = 'block');
            customerElements.forEach(el => el.style.display = 'block');
            break;
        default:
            // Customer or public access
            adminElements.forEach(el => el.style.display = 'none');
            bankElements.forEach(el => el.style.display = 'none');
            customerElements.forEach(el => el.style.display = 'block');
    }
    
    // Store role info globally
    window.userRole = userRole;
    window.userBankId = bankId;
}

// Initialize role-based UI
function initializeRoleBasedUI() {
    // Get user role from localStorage or API
    const userRole = localStorage.getItem('userRole') || 'customer';
    const bankId = localStorage.getItem('userBankId') || null;
    
    // Setup UI based on role
    setupUIForRole(userRole, bankId);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Load initial translations
    await i18n.loadTranslations(i18n.currentLanguage);
    
    // Load English as fallback
    if (i18n.currentLanguage !== 'en') {
        await i18n.loadTranslations('en');
    }
    
    // Update global window.i18n with loaded translations
    window.i18n.currentLang = i18n.currentLanguage;
    window.i18n.translations = i18n.translations;
    
    // Apply translations
    i18n.updateTranslations();
    i18n.updateLanguageSelector();
    
    // Set document direction
    document.dir = i18n.rtlLanguages.includes(i18n.currentLanguage) ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.currentLanguage;
    
    // Initialize role-based UI
    initializeRoleBasedUI();
});

// Helper function for showing notifications
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Helper function for translations (backward compatibility)
function t(key, params = {}) {
    return i18n.getTranslation(key);
}