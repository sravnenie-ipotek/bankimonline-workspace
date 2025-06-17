import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useFormikContext } from 'formik';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button } from '@src/components/ui/ButtonUI';
import { CustomPhoneInput } from '@src/components/ui/CustomPhoneInput';
import StringInput from '@src/components/ui/StringInput/StringInput';
import { Tabs } from '@src/components/ui/Tabs';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { setActiveTab } from '@src/pages/Services/slices/loginSlice';
import styles from './resetPassword.module.scss';
const cx = classNames.bind(styles);
const tabs = [
    {
        value: 'phone',
        label: i18next.t('phone_auth_tab'),
    },
    {
        value: 'email',
        label: i18next.t('email_auth_tab'),
    },
];
const ResetPasswordForm = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language?.split('-')[0];
    const { values, setFieldValue, errors, touched, setFieldTouched, isValid, handleSubmit, } = useFormikContext();
    const activeTab = useAppSelector((state) => state.login.activeTab);
    const dispatch = useAppDispatch();
    return (_jsxs("div", { className: cx('reset'), children: [_jsxs("div", { className: cx('reset-header'), children: [_jsx("h2", { className: cx('reset-header__title'), children: t('title_restore_password') }), _jsx("p", { className: cx('reset-header__text'), children: t('sms_code') }), _jsx(Tabs, { handleChange: (value) => dispatch(setActiveTab(value)), tabs: tabs, tab: activeTab })] }), _jsx("div", { className: cx('reset-form'), children: activeTab === 'phone' ? (_jsx(CustomPhoneInput, { title: t('phone_number'), value: values.phoneNumber, handleChange: (value) => setFieldValue('phoneNumber', value), onBlur: () => setFieldTouched('phoneNumber'), error: touched.phoneNumber && errors.phoneNumber })) : (_jsx(StringInput, { title: t('email'), placeholder: "mail@mail.com", onChange: (value) => setFieldValue('email', value), value: values.email })) }), _jsx(Button, { type: "submit", className: cx('reset-button'), variant: "primary", isDisabled: !isValid, onClick: () => handleSubmit(), children: t('enter') })] }));
};
export default ResetPasswordForm;
