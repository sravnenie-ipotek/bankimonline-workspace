import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useFormik, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { validationSchemaHE } from '@components/layout/Flows/validations/validationSchemaHE.ts';
import { validationSchemaRU } from '@components/layout/Flows/validations/validationSchemaRU.ts';
import { CodeInput } from '@components/ui/CodeInput';
import { Button } from '@components/ui/CustomButton';
import styles from './CodeVerification.module.scss';
export function CodeVerification({ title, handlePrevStep, handleNextStep, tab, textButton, }) {
    const formikContext = useFormikContext();
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language?.split('-')[0];
    const formik = useFormik({
        initialValues: {
            code: formikContext.values.code,
        },
        onSubmit: async (values) => {
            await handleNextStep(values.code, formik);
            console.log(values);
            // alert(JSON.stringify(values, null, 2))
            await formikContext.setValues({ ...formikContext.values, ...values });
        },
        validationSchema: i18n.language === 'he'
            ? validationSchemaHE.AuthFlow.CodeVerify
            : validationSchemaRU.AuthFlow.CodeVerify,
        validateOnMount: false,
    });
    return (_jsxs("form", { className: styles.wrapper, onSubmit: formik.handleSubmit, children: [_jsx("h2", { className: styles.title, children: title }), (() => {
                switch (tab) {
                    case 'phone': {
                        return (_jsxs(_Fragment, { children: [_jsxs("p", { className: styles.descr, children: [t('sms_phone'), " ", formikContext.values.phone] }), _jsx("div", { className: styles.verifyInputs, children: _jsx(CodeInput, { error: formik.errors.code, otpValue: formik.values.code || '', setOtpValue: (code) => formik.setFieldValue('code', code) }) }), _jsxs("div", { className: styles.sendAgainWrapper, children: [_jsx("span", { children: t('not_received_sms') }), _jsx("button", { type: "submit", className: styles.sendAgainButton, children: t('send_sms_code_again') })] })] }));
                    }
                    case 'email': {
                        return (_jsxs(_Fragment, { children: [_jsxs("p", { className: styles.descr, children: [t('sms_email'), " ", formikContext.values.email] }), _jsx("div", { className: styles.verifyInputs, children: _jsx(CodeInput, { error: formik.errors.code, otpValue: formik.values.code || '', setOtpValue: (code) => formik.setFieldValue('code', code) }) }), _jsxs("div", { className: styles.sendAgainWrapper, children: [_jsx("span", { children: t('not_received_sms') }), _jsx("button", { className: styles.sendAgainButton, children: t('send_sms_code_again') })] })] }));
                    }
                    default:
                        return null;
                }
            })(), _jsxs("div", { className: styles.wrapperButtons, children: [_jsx(Button, { variant: "primary", disabled: !(formik.isValid && formik.dirty), type: "submit", className: styles.confirm, children: textButton }), _jsx(Button, { variant: "secondary", onClick: handlePrevStep, type: "button", children: t('back') })] })] }));
}
