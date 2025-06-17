import i18n, { InitOptions } from 'i18next'
import HttpBackend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

import format from './i18n-format.ts'

const i18nConfig: InitOptions = {
  lng: 'ru', // Язык по умолчанию
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
