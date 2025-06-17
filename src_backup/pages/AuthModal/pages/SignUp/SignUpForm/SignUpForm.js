import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { LogoPrimaryIcon } from '@assets/icons/LogoPrimaryIcon';
import { Button } from '@src/components/ui/ButtonUI';
import { CustomPhoneInput } from '@src/components/ui/CustomPhoneInput';
import { PasswordInput } from '@src/components/ui/PasswordInput';
import StringInput from '@src/components/ui/StringInput/StringInput';
// import { Tabs } from '@src/components/ui/Tabs'
import { useAppDispatch } from '@src/hooks/store';
import { setActiveModal,
// setActiveTab,
 } from '@src/pages/Services/slices/loginSlice';
import styles from './signUpForm.module.scss';
const cx = classNames.bind(styles);
const SignUpForm = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language?.split('-')[0];
    // const activeTab = useAppSelector((state) => state.login.activeTab)
    const dispatch = useAppDispatch();
    /* const tabs = [
      {
        value: 'phone',
        label: t('phone_auth_tab'),
      },
      {
        value: 'email',
        label: t('email_auth_tab'),
      },
    ] */
    const { values, setFieldValue, errors, touched, setFieldTouched, isValid, handleSubmit, } = useFormikContext();
    return (_jsxs("div", { className: cx('signUp'), children: [_jsxs("div", { className: cx('signUp-left'), children: [_jsx("div", { className: cx('signUp-left__bg') }), _jsx("div", { className: cx('signUp-left__logo'), children: _jsx(LogoPrimaryIcon, { color: "#161616" }) }), _jsx("h2", { className: cx('signUp-left__title'), children: t('register_banner_title') }), _jsx("p", { className: cx('signUp-left__desc'), children: t('register_banner_description') }), _jsx("div", { className: cx('signUp-left__img'), children: _jsx("img", { src: '/static/sign-up/bank.png', alt: "bank" }) })] }), _jsxs("div", { className: cx('signUp-right'), children: [_jsxs("div", { className: cx('signUp-right__header'), children: [_jsx("h2", { className: cx('signUp-right__header-title'), children: t('register_title') }), _jsx("p", { className: cx('signUp-right__header-desc'), children: t('register_description') })] }), _jsxs("div", { className: cx('signUp-right__form'), children: [_jsx("div", { className: cx('signUp-right__form-item'), children: _jsx(StringInput, { title: t('calculate_mortgage_name_surname'), placeholder: t('calculate_mortgage_name_surname_ph'), onChange: (value) => setFieldValue('nameSurname', value), onBlur: () => setFieldTouched('nameSurname'), error: touched.nameSurname && errors.nameSurname, value: values.nameSurname }) }), _jsx("div", { className: cx('signUp-right__form-item'), children: _jsx(CustomPhoneInput, { title: t('phone_number'), tooltip: t('change_phone'), value: values.phoneNumber, handleChange: (value) => setFieldValue('phoneNumber', value), onBlur: () => setFieldTouched('phoneNumber'), error: touched.phoneNumber && errors.phoneNumber }) }), _jsx("div", { className: cx('signUp-right__form-item'), children: _jsx(StringInput, { title: t('email'), placeholder: "mail@mail.com", onChange: (value) => setFieldValue('email', value), onBlur: () => setFieldTouched('email'), error: touched.email && errors.email, value: values.email }) })] }), _jsxs("div", { className: cx('signUp-right__form'), children: [_jsx("div", { className: cx('signUp-right__form-item'), children: _jsx(PasswordInput, { language: i18n.language, title: t('create_password'), placeholder: t('password'), value: values.password, handleChange: (password) => setFieldValue('password', password), onBlur: () => setFieldTouched('password'), error: touched.password && errors.password }) }), _jsx("div", { className: cx('signUp-right__form-item'), children: _jsx(PasswordInput, { language: i18n.language, title: t('confirm_password'), placeholder: t('password'), value: values.repeatPassword, handleChange: (password) => setFieldValue('repeatPassword', password), onBlur: () => setFieldTouched('repeatPassword'), error: touched.repeatPassword && errors.repeatPassword }) })] }), _jsxs("div", { children: [_jsxs("p", { className: cx('login-form__desc'), children: [t('press_register'), _jsx("span", { className: cx('highlighted'), children: t('user_agreement') }), t('agreement'), _jsx("span", { className: cx('highlighted'), children: t('policy') })] }), _jsx(Button, { type: "submit", className: cx('login-form__desc-button'), variant: "primary", isDisabled: !isValid, onClick: () => handleSubmit(), children: t('enter') }), _jsxs("div", { className: cx('login-form__desc-footer'), children: [_jsx("span", { children: t('has_account') }), _jsx("span", { className: cx('highlighted'), onClick: () => dispatch(setActiveModal('auth')), children: t('here') })] })] })] })] }));
};
export default SignUpForm;
