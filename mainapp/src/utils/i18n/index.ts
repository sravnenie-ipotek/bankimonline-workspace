import i18n, { InitOptions } from 'i18next'
import HttpBackend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

import format from './i18n-format.ts'

// Get language from localStorage or default to 'ru'
const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'ru'
  }
  return 'ru'
}

const i18nConfig: InitOptions = {
  lng: getInitialLanguage(), // Язык из localStorage или по умолчанию
  fallbackLng: 'ru', // Язык, который будет использоваться в случае отсутствия перевода
  interpolation: {
    escapeValue: false,
    format,
  },
  ns: ['translation'], // Пространство имён для переводов
  defaultNS: 'translation',
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },
}

i18n.use(HttpBackend).use(initReactI18next).init(i18nConfig)

export default i18n
