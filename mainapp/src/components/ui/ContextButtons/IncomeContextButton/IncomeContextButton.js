import { jsx as _jsx } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { Message } from '../../Message';
// Компонент  кнопки под полем ввода с текстом дохода
export default function IncomeContextButton() {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    return _jsx(Message, { children: t('calculate_mortgage_step3_ctx') });
}
