import i18n, { InitOptions } from 'i18next'
import HttpBackend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

import format from './i18n-format.ts'

// Get language from localStorage or default to 'en'
const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'en'
  }
  return 'en'
}

const i18nConfig: InitOptions = {
  lng: getInitialLanguage(), // Language from localStorage or default to English
  fallbackLng: 'en', // Fallback language is English
  interpolation: {
    escapeValue: false,
    format,
  },
  ns: ['translation'], // Namespace for translations
  defaultNS: 'translation',
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
    requestOptions: {
      cache: 'no-cache', // Prevent caching issues
    },
    addPath: '/locales/add/{{lng}}/{{ns}}',
    allowMultiLoading: false,
    reloadInterval: false,
  },
  debug: true, // Enable debug logging to see what's happening
  react: {
    useSuspense: false, // Disable suspense to prevent loading issues
  },
  initImmediate: true, // Initialize immediately
  load: 'languageOnly', // Load only the language, not region variants
  preload: ['en', 'he', 'ru'], // Preload all supported languages
  returnEmptyString: false, // Return key instead of empty string when translation missing
  returnNull: false, // Don't return null for missing translations
  saveMissing: false, // Don't save missing translations
}

// Initialize i18n with error handling
i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init(i18nConfig)
  .then(() => {
    console.log('✅ i18n initialized successfully')
    console.log('🔍 Available resources:', i18n.store.data)
    console.log('🔍 Current language:', i18n.language)
    
    // Test specific translations
    const testKeys = ['yes', 'no', 'calculate_mortgage_is_medinsurance', 'calculate_mortgage_children18']
    testKeys.forEach(key => {
      const translation = i18n.t(key)
      console.log(`🧪 "${key}" = "${translation}"`)
      if (translation === key) {
        console.warn(`⚠️ Translation key "${key}" not found!`)
      }
    })
  })
  .catch((error) => {
    console.error('❌ i18n initialization failed:', error)
  })

// Add event listeners for debugging
i18n.on('initialized', () => {
  console.log('🎯 i18n initialized event fired')
})

i18n.on('loaded', (loaded) => {
  console.log('📦 i18n resources loaded:', loaded)
})

i18n.on('languageChanged', (lng) => {
  console.log('🔄 Language changed to:', lng)
})

export default i18n
