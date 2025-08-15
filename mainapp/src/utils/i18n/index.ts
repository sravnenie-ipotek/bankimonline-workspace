import i18n, { InitOptions } from 'i18next'
import HttpBackend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

import format from './i18n-format.ts'

// Get language from localStorage or default to 'he' (Hebrew)
// Use the same key as admin system for consistency
const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_language') || localStorage.getItem('language') || 'he'
  }
  return 'he'
}

const i18nConfig: InitOptions = {
  lng: getInitialLanguage(), // Language from localStorage or default to Hebrew
  fallbackLng: 'he', // Fallback language is Hebrew
  interpolation: {
    escapeValue: false,
    format,
  },
  ns: ['translation'], // Namespace for translations
  defaultNS: 'translation',
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json?v=' + new Date().getTime(),
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
    bindI18n: 'languageChanged loaded', // Re-render on language change and resource load
    bindI18nStore: 'added removed', // Re-render when resources are added/removed
  },
  initImmediate: false, // Don't initialize immediately to ensure proper loading
  load: 'languageOnly', // Load only the language, not region variants
  preload: ['he', 'en', 'ru'], // Preload all supported languages (Hebrew first)
  returnEmptyString: false, // Return key instead of empty string when translation missing
  returnNull: false, // Don't return null for missing translations
  saveMissing: false, // Don't save missing translations
  updateMissing: false, // Don't update missing translations
  missingKeyHandler: (lng, ns, key) => {
    console.warn(`🔍 Missing translation key: "${key}" for language: "${lng}"`)
    return key // Return the key itself as fallback
  },
}

// Initialize i18n with error handling
i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init(i18nConfig)
  .then(() => {
    // Test specific translations that are commonly problematic
    const testKeys = [
      'yes', 
      'no', 
      'calculate_mortgage_when',
      'calculate_mortgage_when_options_1',
      'calculate_mortgage_type_options_1',
      'button_next_save'
    ]
    testKeys.forEach(key => {
      const translation = i18n.t(key)
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
  })

i18n.on('loaded', (loaded) => {
  // Force a small delay to ensure all components can access the new translations
  setTimeout(() => {
    }, 100)
})

i18n.on('languageChanged', (lng) => {
  // Ensure translations are loaded for the new language
  if (!i18n.hasResourceBundle(lng, 'translation')) {
    i18n.loadLanguages(lng)
  }
})

i18n.on('failedLoading', (lng, ns, msg) => {
  console.error(`❌ Failed loading ${lng}/${ns}: ${msg}`)
})

export default i18n
