import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import BackButton from '@src/components/ui/BackButton/BackButton';
import { Button } from '@src/components/ui/ButtonUI';
import { CodeInput } from '@src/components/ui/CodeInput';
import styles from './codeForm.module.scss';
const cx = classNames.bind(styles);
const CodeForm = ({ title, subtitle, onSubmit, buttonText, onBack, }) => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language?.split('-')[0];
    const { values, setFieldValue, isValid } = useFormikContext();
    return (_jsxs("div", { className: cx('code'), children: [_jsxs("div", { className: cx('code-header'), children: [_jsx("h2", { className: cx('code-header__title'), children: title }), _jsx("p", { className: cx('code-header__desc'), children: subtitle })] }), _jsx("div", { className: cx('code-form'), children: _jsx(CodeInput
                // error={formik.errors.code as string}
                , { 
                    // error={formik.errors.code as string}
                    otpValue: values.code, setOtpValue: (code) => setFieldValue('code', code) }) }), _jsxs("p", { className: cx('code-again'), children: [t('not_received_sms'), ' ', _jsx("span", { className: cx('highlighted'), children: t('send_sms_code_again') })] }), _jsxs("div", { className: cx('code-footer'), children: [_jsx(Button, { type: "submit", className: cx('code-footer__button'), onClick: () => onSubmit(values), variant: "primary", isDisabled: !isValid, size: "full", children: buttonText }), _jsx(BackButton, { className: cx('code-footer__button'), handleClick: onBack, title: t('back') })] })] }));
};
export default CodeForm;
