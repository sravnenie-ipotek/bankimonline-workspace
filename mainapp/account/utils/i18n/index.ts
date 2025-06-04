import i18n from 'i18next'
import HttpBackend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: 'ru', // Язык по умолчанию
    fallbackLng: 'ru', // Язык, который будет использоваться в случае отсутствия перевода
    interpolation: {
      escapeValue: false,
    },
    ns: ['translation'], // Пространство имён для переводов
    defaultNS: 'translation',
    backend: {
      loadPath: '/account/locale/{{lng}}/{{ns}}.json',
    },
  })

export default i18n
