import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Container } from '@components/ui/Container';
import { DoubleButtons } from '@src/pages/Services/components/DoubleButtons';
import FourthStepForm from './FourthStepForm/FourthStepForm';
const initialValues = {};
export const validationSchema = Yup.object().shape({});
const FourthStep = () => {
    return (_jsx(Formik, { initialValues: initialValues, validationSchema: validationSchema, validateOnMount: true, onSubmit: () => {
            console.log('нажата кнопка');
        }, children: _jsxs(Form, { children: [_jsx(Container, { children: _jsx(FourthStepForm, {}) }), _jsx(DoubleButtons, {})] }) }));
};
export default FourthStep;
