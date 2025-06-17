import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
const Step2 = () => {
    const { t } = useTranslation();
    return (_jsx("div", { className: "how-it-works-step", children: _jsx("div", { className: "how-it-works-texts", children: _jsxs("div", { className: "how-it-works-block", children: [_jsx("img", { className: "how-it-works-step__icon", alt: t('fill_form'), src: "/static/frame-14100932551.svg" }), _jsx("div", { className: "how-it-works-step__title", children: t('fill_form') }), _jsx("span", { className: "how-it-works-step__text", children: t('fill_form_text') }), _jsx("span", { className: "how-it-works-step__text how-it-works-step__text_tablet", children: t('fill_form_text_tablet') })] }) }) }));
};
export default Step2;
