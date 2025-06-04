import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import YupPassword from 'yup-password'

import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import {
  setActiveModal,
  updateRegistrationData,
} from '@src/pages/Services/slices/loginSlice'
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

  const activeTab = useAppSelector((state) => state.login.activeTab)

  const handleRegisterPhone = async (values: SignUpFormType) => {
    try {
      const response = await signUp({
        name: values.nameSurname,
        mobile_number: values.phoneNumber,
        email: values.email,
        password: values.password,
        password_confirmation: values.repeatPassword,
      }).unwrap()
      dispatch(updateRegistrationData(response.data))
      // localStorage.setItem(USER_DATA, JSON.stringify(response.data.data))
      dispatch(setActiveModal('codeSignUp'))
    } catch (error) {
      console.error(error)
      dispatch(setActiveModal('codeSignUp'))
    }
  }

  const handleRegisterEmail = async (values: SignUpFormType) => {
    try {
      const response = await signUp({
        name: values.nameSurname,
        email: values.email,
        mobile_number: values.phoneNumber,
        password: values.password,
        password_confirmation: values.repeatPassword,
      }).unwrap()
      dispatch(updateRegistrationData(response.data))
      // localStorage.setItem(USER_DATA, JSON.stringify(response.data.data))
      dispatch(setActiveModal('codeSignUp'))
    } catch (error) {
      console.error(error)
      dispatch(setActiveModal('codeSignUp'))
    }
  }

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
    password: Yup.string()
      .password()
      .min(8, 'Минимум 8 символов')
      .minLowercase(1, 'Обязательно должны быть строчные буквы.')
      .minUppercase(1, 'Обязательно должны быть заглавные буквы.')
      .minSymbols(1, 'Обязательно должны быть специальные символы.')
      .minNumbers(1, 'Обязательно должны быть цифры.'),
    repeatPassword: Yup.string().equals(
      [Yup.ref('password')],
      'Пароли не совпадают'
    ),
  })

  return (
    <Formik
      initialValues={initialValues}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      validate={fullValidatorForSchema(validationSchema)}
      onSubmit={(values) => {
        console.log(values)
        activeTab === 'phone'
          ? handleRegisterPhone(values)
          : handleRegisterEmail(values)
      }}
    >
      <Form>
        <SignUpForm />
      </Form>
    </Formik>
  )
}

export default SignUp
