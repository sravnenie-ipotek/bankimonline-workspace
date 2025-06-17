import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import format from './i18n-format.ts';
const i18nConfig = {
    lng: 'ru',
    fallbackLng: 'ru',
    interpolation: {
        escapeValue: false,
        format,
    },
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
};
i18n.use(HttpBackend).use(initReactI18next).init(i18nConfig);
export default i18n;
