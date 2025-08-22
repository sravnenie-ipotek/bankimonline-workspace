import React, { useState } from 'react'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import YupPassword from 'yup-password'

import { useContentApi } from '@src/hooks/useContentApi'
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
  const [isProcessing, setIsProcessing] = useState(false)
  const { getContent } = useContentApi('auth_modal')

  const initialValues: SignUpFormType = {
    phoneNumber: '',
    email: '',
    password: '',
    nameSurname: '',
    repeatPassword: '',
  }

  const getAccountUrl = () => {
    // Get the current URL path to determine the service flow
    const currentPath = window.location.pathname
    
    // If we're in a service flow, redirect to that service's completion page
    if (currentPath.includes('/services/calculate-mortgage')) {
      return window.location.origin + '/services/calculate-mortgage/4'
    } else if (currentPath.includes('/services/calculate-credit')) {
      return window.location.origin + '/services/calculate-credit/4'
    } else if (currentPath.includes('/services/refinance-mortgage')) {
      return window.location.origin + '/services/refinance-mortgage/4'
    } else if (currentPath.includes('/services/refinance-credit')) {
      return window.location.origin + '/services/refinance-credit/4'
    }
    
    // Default fallback
    return window.location.origin + '/'
  }

  const handleRegisterPhone = async (values: SignUpFormType) => {
    // Prevent multiple submissions
    if (isProcessing) return
    
    setIsProcessing(true)
    
    try {
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
      
      const response = await signUp(requestData).unwrap()
      
      console.log('SignUp response:', response)
      
      // Store user data in localStorage for immediate login
      localStorage.setItem('USER_DATA', JSON.stringify(response.data))
      
      // Verify localStorage save
      const savedData = localStorage.getItem('USER_DATA')
      // Update registration data in Redux
      dispatch(updateRegistrationData(response.data))
      
      // Show success message with proper translation
      const successMessage = getContent('registration_success_message', 'Добро пожаловать! Вы успешно вошли в систему.')
      alert(successMessage)
      
      // Close the modal
      dispatch(closeModal())
      
    } catch (error: any) {
      console.error('SignUp error:', error)
      
      // Show error message with proper translation
      const errorMessage = getContent('registration_error_message', 'Ошибка при регистрации. Попробуйте еще раз.')
      alert(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

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
      validationSchema={validationSchema}
      onSubmit={(values) => {
        // Always use the same registration logic since we need both phone and email
        handleRegisterPhone(values)
      }}
    >
      <Form>
        <SignUpForm isProcessing={isProcessing} />
      </Form>
    </Formik>
  )
}

export default SignUp