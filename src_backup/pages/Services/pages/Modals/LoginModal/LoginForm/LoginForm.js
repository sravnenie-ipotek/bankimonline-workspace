import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { Form, Formik } from 'formik';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import * as Yup from 'yup';
import 'yup-phone-lite';
import { Button } from '@src/components/ui/ButtonUI';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { Code } from '@src/pages/AuthModal/pages/Code';
import { setActiveModal, setIsLogin, updateLoginData, updateRegistrationData, } from '@src/pages/Services/slices/loginSlice';
import { closeModal } from '@src/pages/Services/slices/modalSlice';
import { useSendSmsCodeMobileMutation, useSignInNameMutation, } from '@src/services/auth/auth';
import styles from './loginForm.module.scss';
import { NameSurnameLogin } from './ui/NameSurnameLogin';
import { PhoneInput } from './ui/PhoneInput';
const cx = classNames.bind(styles);
const LoginForm = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const newPath = currentPath.replace(/\/\d+$/, '');
    // достает старый путь и удаляет последнюю цифру в пути, чтобы подставить новое число
    const dispatch = useAppDispatch();
    const [signInName] = useSignInNameMutation();
    const [sendSmsCodeMobile] = useSendSmsCodeMobileMutation();
    const isLogin = useAppSelector((state) => state.login.isLogin);
    const registrationData = useAppSelector((state) => state.login.registrationData);
    const activeModal = useAppSelector((state) => state.login.activeModal);
    const initialValues = {
        nameSurname: '',
        phoneNumber: '',
    };
    // i18n.language === 'he' ? 'HE' : 'RU',
    // `${t('error_wrong_phone_number_login')}`
    const phoneShema = Yup.string().required(t('error_fill_field'));
    const validationSchema = Yup.object().shape({
        nameSurname: Yup.string()
            .min(3, t('error_not_enough_symbols'))
            .required(t('error_fill_field')),
        phoneNumber: phoneShema,
    });
    const handleSignInName = async (values) => {
        try {
            const response = await signInName({
                mobile_number: values.phoneNumber,
            }).unwrap();
            dispatch(updateLoginData(values));
            dispatch(updateRegistrationData(response.data));
            dispatch(setActiveModal('code'));
        }
        catch (error) {
            console.error(error);
        }
    };
    const handleSendSmsCodeMobile = async (values) => {
        try {
            const response = await sendSmsCodeMobile({
                code: values.code,
                mobile_number: registrationData.mobile_number,
            }).unwrap();
            localStorage.setItem('USER_DATA', JSON.stringify(response.data));
            dispatch(setIsLogin());
            dispatch(closeModal());
            dispatch(setActiveModal('login'));
            navigate(newPath + '/2');
        }
        catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        return () => {
            if (!isLogin) {
                dispatch(setActiveModal('login'));
            }
        };
    }, [dispatch, isLogin]);
    const handlePreviousStep = () => {
        dispatch(setActiveModal('login'));
    };
    return (_jsx(_Fragment, { children: activeModal === 'login' ? (_jsxs("div", { className: cx('login'), children: [_jsxs("div", { className: cx('login-title'), children: [_jsx("h1", { className: cx('login-title__text'), children: t('enter_phone_number_login') }), _jsx("p", { className: cx('login-title__desc'), children: t('confirm_phone_number_login') })] }), _jsx(Formik, { initialValues: initialValues, validationSchema: validationSchema, validateOnMount: true, onSubmit: async (values) => {
                        await handleSignInName(values);
                    }, children: ({ handleSubmit, isValid }) => (_jsxs(Form, { className: cx('login-form'), children: [_jsx("div", { className: cx('login-form__input'), children: _jsx(NameSurnameLogin, {}) }), _jsx("div", { className: cx('login-form__input'), children: _jsx(PhoneInput, {}) }), _jsx("div", { children: _jsxs("p", { className: cx('login-form__desc'), children: [t('accept_conditions_login'), _jsx("span", { className: cx('highlighted'), children: t('user_agreement') }), t('agreement'), _jsx("span", { className: cx('highlighted'), children: t('policy') })] }) }), _jsx(Button, { type: "submit", isDisabled: !isValid, onClick: handleSubmit, children: t('button_next') }), _jsxs("p", { className: cx('login-form__client'), children: [t('already_client'), _jsx("span", { className: cx('highlighted'), children: t('here') })] })] })) })] })) : (_jsx(Code, { title: t('accept_you_profile_for_enter'), subtitle: t('sms_phone'), onSubmit: (values) => {
                handleSendSmsCodeMobile(values);
            }, buttonText: t('accept_phone'), onBack: () => {
                dispatch(handlePreviousStep);
            } })) }));
};
export default LoginForm;
