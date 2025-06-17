import { jsx as _jsx } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { Message } from '../../Message';
// Компонент  кнопки под полем ввода для заполнения формы кредита
const CreditContextButton = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    return _jsx(Message, { children: t('calculate_mortgage_ctx') });
};
export default CreditContextButton;
