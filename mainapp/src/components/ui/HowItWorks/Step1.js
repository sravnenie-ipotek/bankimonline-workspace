import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
const Step1 = () => {
    const { t } = useTranslation();
    return (_jsx("div", { className: "how-it-works-step", children: _jsx("div", { className: "how-it-works-texts", children: _jsxs("div", { className: "how-it-works-block", children: [_jsx("img", { className: "how-it-works-step__icon", alt: t('mortgage_calculator'), src: "/static/frame-14100932552.svg" }), _jsx("div", { className: "how-it-works-step__title", children: t('mortgage_calculator') }), _jsx("span", { className: "how-it-works-step__text", children: t('mortgage_calculator_text') }), _jsx("span", { className: "how-it-works-step__text how-it-works-step__text_tablet", children: t('mortgage_calculator_text') })] }) }) }));
};
export default Step1;
