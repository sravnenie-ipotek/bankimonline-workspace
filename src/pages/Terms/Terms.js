import { jsx as _jsx } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { TextPage } from '@src/components/ui/TextPage';
const Terms = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    return _jsx(TextPage, { title: t('terms_title'), text: t('terms_text') });
};
export default Terms;
