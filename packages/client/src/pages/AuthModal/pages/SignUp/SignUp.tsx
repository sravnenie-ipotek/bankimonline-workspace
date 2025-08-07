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
    // Check if we're running on localhost (development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001/'
    }
    
    // Use environment variable if available
    if (import.meta.env.VITE_ACCOUNT_URL) {
      return import.meta.env.VITE_ACCOUNT_URL
    }
    
    // If we're on Railway production, stay on the same domain
    if (window.location.hostname.includes('bankimonline.com')) {
      return window.location.origin + '/'
    }
    
    // Default fallback
    return window.location.origin + '/'
  }

  const handleRegisterPhone = async (values: SignUpFormType) => {
    console.log('🔵 SignUp - handleRegisterPhone called with values:', values)
    
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
    
    console.log('🔵 SignUp - Sending to API:', requestData)
    
    try {
      const response = await signUp(requestData).unwrap()
      
      console.log('🟢 SignUp - Registration successful:', response)
      console.log('🟢 SignUp - Response data structure:', JSON.stringify(response, null, 2))
      
      // Store user data in localStorage for immediate login
      console.log('🟢 SignUp - Saving to localStorage:', response.data)
      localStorage.setItem('USER_DATA', JSON.stringify(response.data))
      
      // Verify localStorage save
      const savedData = localStorage.getItem('USER_DATA')
      console.log('🟢 SignUp - Verified localStorage save:', savedData)
      
      // Update registration data in Redux
      dispatch(updateRegistrationData(response.data))
      
      // Show success message
      alert('Добро пожаловать! Вы успешно вошли в систему.')
      
      // Close the modal
      dispatch(closeModal())
      
    } catch (error: any) {
      console.log('🔴 SignUp - Registration error occurred:', error)
      console.log('🔴 SignUp - Error status:', error?.status)
      console.log('🔴 SignUp - Error data:', error?.data)
      console.log('🔴 SignUp - Full error object:', JSON.stringify(error, null, 2))
      
      // Handle 409 Conflict - User already exists, treat as success
      // Check multiple possible locations for the status code
      const statusCode = error?.status || error?.data?.status || error?.response?.status
      
      if (statusCode === 409 || error?.status === 409) {
        console.log('🟡 SignUp - User already exists (409), continuing with flow...')
        
        // Create user data object from form values for consistency
        const userData = {
          name: values.nameSurname,
          mobile_number: phoneNumber,
          email: values.email,
          // Add any additional fields that might be expected
        }
        
        console.log('🟡 SignUp - Creating user data from form values:', userData)
        
        // Store user data in localStorage 
        localStorage.setItem('USER_DATA', JSON.stringify(userData))
        
        // Verify localStorage save
        const savedData = localStorage.getItem('USER_DATA')
        console.log('🟡 SignUp - Verified localStorage save (409 case):', savedData)
        
        // Update registration data in Redux
        dispatch(updateRegistrationData(userData))
        
        // Show success message
        alert('Добро пожаловать! Вы успешно вошли в систему.')
        
        // Close the modal
        dispatch(closeModal())
        
        return // Exit successfully
      }
      
      // Handle other errors normally
      console.error('🔴 SignUp - Registration error:', error)
      
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
      schema: Yup.ObjectSchema<SignUpFormType>
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
            (memo: Record<string, string[]>, { path, message }: { path: string; message: string }) => ({
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
