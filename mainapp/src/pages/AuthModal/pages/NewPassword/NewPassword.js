import { jsx as _jsx } from "react/jsx-runtime";
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import YupPassword from 'yup-password';
import { useAppDispatch } from '@src/hooks/store';
import { setActiveModal } from '@src/pages/Services/slices/loginSlice';
import { NewPasswordForm } from './NewPasswordForm';
YupPassword(Yup); // extend yup
const NewPassword = () => {
    const dispatch = useAppDispatch();
    const initialValues = {
        password: '',
        newPassword: '',
    };
    const fullValidatorForSchema = (schema) => (values) => schema
        .validate(values, {
        abortEarly: false,
        strict: false,
    })
        .then(() => ({}))
        .catch(({ inner }) => inner.reduce(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (memo, { path, message }) => ({
        ...memo,
        [path]: (memo[path] || []).concat(message),
    }), {}));
    const validationSchema = Yup.object().shape({
        password: Yup.string()
            .password()
            .min(8, 'Минимум 8 символов')
            .minLowercase(1, 'Обязательно должны быть строчные буквы.')
            .minUppercase(1, 'Обязательно должны быть заглавные буквы.')
            .minSymbols(1, 'Обязательно должны быть специальные символы.')
            .minNumbers(1, 'Обязательно должны быть цифры.'),
        newPassword: Yup.string().equals([Yup.ref('password')], 'Пароли не совпадают'),
    });
    return (_jsx(Formik, { initialValues: initialValues, 
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        validate: fullValidatorForSchema(validationSchema), 
        // validationSchema={validationSchema}
        // validationSchemaOptions={{ showMultipleFieldErrors: true }}
        // validateOnMount
        onSubmit: (values) => {
            console.log(values);
            dispatch(setActiveModal('codeNewPassword'));
        }, children: _jsx(Form, { children: _jsx(NewPasswordForm, {}) }) }));
};
export default NewPassword;
