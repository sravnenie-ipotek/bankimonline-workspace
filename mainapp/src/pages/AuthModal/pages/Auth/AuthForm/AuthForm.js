import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Button } from '@src/components/ui/ButtonUI';
import { CustomPhoneInput } from '@src/components/ui/CustomPhoneInput';
import { PasswordInput } from '@src/components/ui/PasswordInput';
import StringInput from '@src/components/ui/StringInput/StringInput';
import { Tabs } from '@src/components/ui/Tabs';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { setActiveModal, setActiveTab, } from '@src/pages/Services/slices/loginSlice';
import styles from './authForm.module.scss';
const cx = classNames.bind(styles);
const AuthForm = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language?.split('-')[0];
    const tabs = [
        {
            value: 'phone',
            label: t('phone_auth_tab'),
        },
        {
            value: 'email',
            label: t('email_auth_tab'),
        },
    ];
    const dispatch = useAppDispatch();
    const activeTab = useAppSelector((state) => state.login.activeTab);
    const { values, setFieldValue, setFieldTouched, isValid, handleSubmit } = useFormikContext();
    return (_jsxs("div", { className: cx('auth'), children: [_jsxs("div", { className: cx('auth-header'), children: [_jsx("h2", { className: cx('auth-header__title'), children: t('enter_bankimonline') }), _jsx(Tabs, { handleChange: (value) => dispatch(setActiveTab(value)), tabs: tabs, tab: activeTab })] }), _jsxs("div", { className: cx('auth-form'), children: [activeTab === 'phone' ? (_jsx(CustomPhoneInput, { title: t('phone_number'), value: values.phone, handleChange: (value) => setFieldValue('phone', value), onBlur: () => setFieldTouched('phone') })) : (_jsx("div", { className: cx('auth-form__item'), children: _jsx(StringInput, { title: t('email'), placeholder: "mail@mail.com", onChange: (value) => setFieldValue('email', value), value: values.email }) })), _jsx("div", { className: cx('auth-form__item'), children: _jsx(PasswordInput, { language: i18n.language, title: t('password'), placeholder: t('enter_password'), value: values.password, handleChange: (password) => setFieldValue('password', password) }) }), _jsx("p", { className: cx('auth-form__forgot'), onClick: () => dispatch(setActiveModal('reset')), children: t('forgot_password') })] }), _jsxs("div", { className: cx('auth-footer'), children: [_jsx(Button, { type: "submit", className: cx('auth-footer__button'), onClick: () => handleSubmit(), variant: "primary", isDisabled: !isValid, children: t('enter') }), _jsxs("div", { className: cx('auth-footer__account'), children: [_jsx("span", { children: t('no_account') }), _jsx("span", { className: cx('auth-footer__register'), onClick: () => dispatch(setActiveModal('signUp')), children: t('register_here') })] })] })] }));
};
export default AuthForm;
