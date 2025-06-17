import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Button } from '@src/components/ui/ButtonUI';
import { PasswordInput } from '@src/components/ui/PasswordInput';
import styles from './newPassword.module.scss';
const cx = classNames.bind(styles);
const NewPasswordForm = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language?.split('-')[0];
    const { values, setFieldValue, isValid, handleSubmit, errors, setFieldTouched, touched, } = useFormikContext();
    console.log(errors);
    return (_jsxs("div", { className: cx('newPassword'), children: [_jsxs("div", { className: cx('newPassword-header'), children: [_jsx("h2", { className: cx('newPassword-header__title'), children: t('choose_new_password') }), _jsx("p", { className: cx('newPassword-header__desc'), children: t('new_password') })] }), _jsxs("div", { className: cx('newPassword-form'), children: [_jsx("div", { className: cx('newPassword-form__item'), children: _jsx(PasswordInput, { language: i18n.language, error: touched.password && errors.password, title: t('choose_new_password'), value: values.password, placeholder: t('password'), onBlur: () => setFieldTouched('password'), handleChange: (password) => setFieldValue('password', password) }) }), _jsx("div", { className: cx('newPassword-form__item'), children: _jsx(PasswordInput, { language: i18n.language, error: touched.newPassword && errors.newPassword, title: t('confirmed_password'), value: values.newPassword, placeholder: t('confirmed_password'), onBlur: () => setFieldTouched('newPassword'), handleChange: (newPassword) => setFieldValue('newPassword', newPassword) }) })] }), _jsx("div", { className: cx('newPassword-footer'), children: _jsx(Button, { type: "submit", className: cx('newPassword-footer__button'), onClick: () => handleSubmit(), variant: "primary", isDisabled: !isValid, size: "full", children: t('change_password') }) })] }));
};
export default NewPasswordForm;
