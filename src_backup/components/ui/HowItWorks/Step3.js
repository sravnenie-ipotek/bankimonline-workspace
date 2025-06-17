import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
const Step3 = () => {
    const { t } = useTranslation();
    return (_jsx("div", { className: "how-it-works-step", children: _jsx("div", { className: "how-it-works-texts", children: _jsxs("div", { className: "how-it-works-block", children: [_jsx("img", { className: "how-it-works-step__icon", alt: t('get_program'), src: "/static/frame-1410093255.svg" }), _jsx("div", { className: "how-it-works-step__title", children: t('get_program') }), _jsx("span", { className: "how-it-works-step__text", children: t('get_program_text') }), _jsx("span", { className: "how-it-works-step__text how-it-works-step__text_tablet", children: t('get_program_text_tablet') })] }) }) }));
};
export default Step3;
