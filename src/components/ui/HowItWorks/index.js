import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import './HowItWorks.css';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
// Компонент для бока на главной - Как это работает
const HowItWorks = () => {
    const { t } = useTranslation();
    return (_jsxs("div", { className: "how-it-works", children: [_jsx("div", { className: "how-it-works__title", children: t('how_it_works') }), _jsxs("div", { className: "how-it-works-inner", children: [_jsx("div", { className: "how-it-works-inner__step-wrapper", "data-number": "1", children: _jsx(Step1, {}) }), _jsx("div", { className: "how-it-works-inner__step-wrapper", "data-number": "2", children: _jsx(Step2, {}) }), _jsx("div", { className: "how-it-works-inner__step-wrapper", "data-number": "3", children: _jsx(Step3, {}) })] })] }));
};
export default HowItWorks;
