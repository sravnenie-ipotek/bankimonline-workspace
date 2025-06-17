import { jsx as _jsx } from "react/jsx-runtime";
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import YupPassword from 'yup-password';
import { useAppDispatch } from '@src/hooks/store';
import { 
// setActiveModal,
updateRegistrationData, } from '@src/pages/Services/slices/loginSlice';
import { useSignUpMutation } from '@src/services/auth/auth';
import { SignUpForm } from './SignUpForm';
YupPassword(Yup); // extend yup
const SignUp = () => {
    const dispatch = useAppDispatch();
    const [signUp] = useSignUpMutation();
    const initialValues = {
        phoneNumber: '',
        email: '',
        password: '',
        repeatPassword: '',
        nameSurname: '',
    };
    // const activeTab = useAppSelector((state) => state.login.activeTab)
    const getAccountUrl = () => {
        return process.env.VITE_ACCOUNT_URL || 'http://localhost:3001/';
    };
    const handleRegisterPhone = async (values) => {
        console.log('Form values:', values);
        // Ensure phone number has + prefix
        let phoneNumber = values.phoneNumber;
        if (phoneNumber && !phoneNumber.startsWith('+')) {
            phoneNumber = '+' + phoneNumber;
        }
        const requestData = {
            name: values.nameSurname,
            mobile_number: phoneNumber,
            email: values.email,
            password: values.password,
            password_confirmation: values.repeatPassword,
        };
        console.log('Sending to API:', requestData);
        try {
            const response = await signUp(requestData).unwrap();
            console.log('Registration successful:', response);
            // Store user data in localStorage for immediate login
            localStorage.setItem('USER_DATA', JSON.stringify(response.data));
            // Update registration data in Redux
            dispatch(updateRegistrationData(response.data));
            // Show success message and redirect to Personal Account
            alert('Регистрация успешна! Перенаправляем в Личный кабинет...');
            // Redirect to Personal Account
            window.location.href = getAccountUrl();
        }
        catch (error) {
            console.error('Registration error:', error);
            alert('Ошибка регистрации. Попробуйте еще раз.');
        }
    };
    /* const handleRegisterEmail = async (values: SignUpFormType) => {
      console.log('Form values:', values)
      
      // Ensure phone number has + prefix
      let phoneNumber = values.phoneNumber
      if (phoneNumber && !phoneNumber.startsWith('+')) {
        phoneNumber = '+' + phoneNumber
      }
      
      const requestData = {
        name: values.nameSurname,
        mobile_number: phoneNumber,
        email: values.email,
        password: values.password,
        password_confirmation: values.repeatPassword,
      }
      
      console.log('Sending to API:', requestData)
      
      try {
        const response = await signUp(requestData).unwrap()
        
        console.log('Registration successful:', response)
        
        // Store user data in localStorage for immediate login
        localStorage.setItem('USER_DATA', JSON.stringify(response.data))
        
        // Update registration data in Redux
        dispatch(updateRegistrationData(response.data))
        
        // Show success message and redirect to Personal Account
        alert('Регистрация успешна! Перенаправляем в Личный кабинет...')
        
        // Redirect to Personal Account
        window.location.href = getAccountUrl()
        
      } catch (error) {
        console.error('Registration error:', error)
        alert('Ошибка регистрации. Попробуйте еще раз.')
      }
    } */
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
        nameSurname: Yup.string()
            .min(2, 'Минимум 2 символа')
            .required('Имя и фамилия обязательны'),
        phoneNumber: Yup.string()
            .min(10, 'Неверный формат номера')
            .required('Номер телефона обязателен'),
        email: Yup.string()
            .email('Неверный формат email')
            .required('Email обязателен'),
        password: Yup.string()
            .password()
            .min(8, 'Минимум 8 символов')
            .minLowercase(1, 'Обязательно должны быть строчные буквы.')
            .minUppercase(1, 'Обязательно должны быть заглавные буквы.')
            .minSymbols(1, 'Обязательно должны быть специальные символы.')
            .minNumbers(1, 'Обязательно должны быть цифры.')
            .required('Пароль обязателен'),
        repeatPassword: Yup.string()
            .equals([Yup.ref('password')], 'Пароли не совпадают')
            .required('Подтверждение пароля обязательно'),
    });
    return (_jsx(Formik, { initialValues: initialValues, 
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        validate: fullValidatorForSchema(validationSchema), onSubmit: (values) => {
            console.log('Form submitted with values:', values);
            // Always use the same registration logic since we need both phone and email
            handleRegisterPhone(values);
        }, children: _jsx(Form, { children: _jsx(SignUpForm, {}) }) }));
};
export default SignUp;
