import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Старый код. Файл заменён на index.tsx в этой же папке.
import { useTranslation } from 'react-i18next';
import './HowItWorks.css';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
// Компонент для бока на главной - как это работает
const HowItWorks = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language?.split('-')[0];
    return (_jsxs("div", { className: 'how-it-works', children: [_jsx("div", { className: 'how-it-works-title-' + i18n.language, children: t('how_it_works') }), _jsxs("div", { className: 'how-it-works-inner', children: [_jsx(Step1, {}), _jsx(Step2, {}), _jsx(Step3, {})] })] }));
};
export default HowItWorks;
