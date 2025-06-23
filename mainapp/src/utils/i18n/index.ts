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
  })
  .catch((error) => {
    console.error('❌ i18n initialization failed:', error)
  })

export default i18n
