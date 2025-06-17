import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
// Компонент кнопки под полем ввода
const InfoButton = () => {
    const { t } = useTranslation();
    return (_jsx("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            textAlign: 'left',
            color: '#fff',
            maxWidth: '514px',
            margin: '0',
        }, children: _jsxs("div", { style: {
                borderRadius: '8px',
                border: '1px dashed #46a08f',
                display: 'flex',
                flexDirection: 'row',
                padding: '0.94rem 1.5rem',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '0.75rem',
                paddingRight: '0',
                marginLeft: '1rem',
                marginRight: '1rem',
            }, children: [_jsx("img", { style: {
                        position: 'relative',
                        marginRight: '1rem',
                        width: '1.5rem',
                        height: '1.5rem',
                    }, alt: "", src: "/static/calculate-credit/shieldcheck1.svg" }), _jsx("div", { style: {
                        position: 'relative',
                        lineHeight: '140%',
                        whiteSpace: 'break-spaces',
                        width: '505px',
                        maxWidth: '505px',
                    }, children: _jsx("span", { children: t('third_persons') }) })] }) }));
};
export default InfoButton;
