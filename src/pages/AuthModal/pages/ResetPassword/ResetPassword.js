import { jsx as _jsx } from "react/jsx-runtime";
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '@src/hooks/store';
import { setActiveModal } from '@src/pages/Services/slices/loginSlice';
import { ResetPasswordForm } from './ResetPasswordForm';
const ResetPassword = () => {
    const dispatch = useAppDispatch();
    const initialValues = {
        phoneNumber: '',
        email: '',
    };
    const validationSchema = Yup.object().shape({
        phoneNumber: Yup.string().required(),
    });
    return (_jsx(Formik, { initialValues: initialValues, validationSchema: validationSchema, validateOnMount: true, onSubmit: (values) => {
            console.log(values);
            dispatch(setActiveModal('newPassword'));
        }, children: _jsx(Form, { children: _jsx(ResetPasswordForm, {}) }) }));
};
export default ResetPassword;
