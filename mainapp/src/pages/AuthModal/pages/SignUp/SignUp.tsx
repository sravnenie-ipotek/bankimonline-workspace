import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import YupPassword from 'yup-password'

import { useAppDispatch } from '@src/hooks/store'
import {
  // setActiveModal,
  updateRegistrationData,
} from '@src/pages/Services/slices/loginSlice'
import { closeModal } from '@src/pages/Services/slices/modalSlice'
import { useSignUpMutation } from '@src/services/auth/auth'

import { SignUpForm } from './SignUpForm'

YupPassword(Yup) // extend yup

export type SignUpFormType = {
  phoneNumber: string
  email: string
  password: string
  nameSurname: string
  repeatPassword: string
}

const SignUp = () => {
  const dispatch = useAppDispatch()
  const [signUp] = useSignUpMutation()

  const initialValues: SignUpFormType = {
    phoneNumber: '',
    email: '',
    password: '',
    repeatPassword: '',
    nameSurname: '',
  }

  // const activeTab = useAppSelector((state) => state.login.activeTab)

  const getAccountUrl = () => {
    // For production, use current domain; for development, use localhost:3001
    if (import.meta.env.VITE_ACCOUNT_URL) {
      return import.meta.env.VITE_ACCOUNT_URL
    }
    
    // If we're on Railway production, stay on the same domain
    if (window.location.hostname.includes('railway.app')) {
      return window.location.origin + '/'
    }
    
    // Default to localhost for development
    return 'http://localhost:3001/'
  }

  const handleRegisterPhone = async (values: SignUpFormType) => {
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
      
      // Show success message
      alert('Добро пожаловать! Вы успешно вошли в систему.')
      
      // Close the modal
      dispatch(closeModal())
      
    } catch (error: any) {
      console.log('Registration response:', error)
      console.log('Error status:', error?.status)
      console.log('Error data:', error?.data)
      console.log('Full error object:', JSON.stringify(error, null, 2))
      
      // Handle 409 Conflict - User already exists, treat as success
      // Check multiple possible locations for the status code
      const statusCode = error?.status || error?.data?.status || error?.response?.status
      
      if (statusCode === 409 || error?.status === 409) {
        console.log('User already exists, continuing with flow...')
        
        // Create user data object from form values for consistency
        const userData = {
          name: values.nameSurname,
          mobile_number: phoneNumber,
          email: values.email,
          // Add any additional fields that might be expected
        }
        
        // Store user data in localStorage 
        localStorage.setItem('USER_DATA', JSON.stringify(userData))
        
        // Update registration data in Redux
        dispatch(updateRegistrationData(userData))
        
        // Show success message
        alert('Добро пожаловать! Вы успешно вошли в систему.')
        
        // Close the modal
        dispatch(closeModal())
        
        return // Exit successfully
      }
      
      // Handle other errors normally
      console.error('Registration error:', error)
      
      // Show more specific error messages
      if (statusCode === 400) {
        alert('Ошибка данных. Проверьте правильность заполнения полей.')
      } else if (statusCode === 500) {
        alert('Ошибка сервера. Попробуйте позже.')
      } else {
        alert('Ошибка регистрации. Попробуйте еще раз.')
      }
    }
  }

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

  const fullValidatorForSchema =
    (
      schema: Yup.ObjectSchema<{
        password: string
        newPassword: string
      }>
    ) =>
    (values: SignUpFormType) =>
      schema
        .validate(values, {
          abortEarly: false,
          strict: false,
        })
        .then(() => ({}))
        .catch(({ inner }) =>
          inner.reduce(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            (memo, { path, message }) => ({
              ...memo,
              [path]: (memo[path] || []).concat(message),
            }),
            {}
          )
        )

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
  })

  return (
    <Formik
      initialValues={initialValues}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      validate={fullValidatorForSchema(validationSchema)}
      onSubmit={(values) => {
        console.log('Form submitted with values:', values)
        // Always use the same registration logic since we need both phone and email
        handleRegisterPhone(values)
      }}
    >
      <Form>
        <SignUpForm />
      </Form>
    </Formik>
  )
}

export default SignUp
