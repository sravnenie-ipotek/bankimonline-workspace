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
  },
  debug: false, // Enable debug logging
}

i18n.use(HttpBackend).use(initReactI18next).init(i18nConfig)

export default i18n
