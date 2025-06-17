import { jsx as _jsx } from "react/jsx-runtime";
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useAppSelector } from '@src/hooks/store';
import { CodeForm } from './CodeForm';
const Code = ({ title, subtitle, onSubmit, buttonText, onBack, }) => {
    const code = useAppSelector((state) => state.login.registrationData.code);
    const initialValues = {
        code: code || '',
    };
    const validationSchema = Yup.object().shape({
        code: Yup.string().min(4).max(4).required(),
    });
    return (_jsx(Formik, { validationSchema: validationSchema, validateOnMount: true, initialValues: initialValues, onSubmit: (values) => console.log(values), children: _jsx(Form, { children: _jsx(CodeForm, { title: title, subtitle: subtitle, onSubmit: onSubmit, buttonText: buttonText, onBack: onBack }) }) }));
};
export default Code;
