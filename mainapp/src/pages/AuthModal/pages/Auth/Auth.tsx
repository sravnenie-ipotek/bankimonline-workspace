import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'

import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import {
  setActiveModal,
  updateRegistrationData,
} from '@src/pages/Services/slices/loginSlice'
import {
  useSignInEmailMutation,
  useSignInPhoneMutation,
} from '@src/services/auth/auth'

import { AuthForm } from './AuthForm'

export type AuthFormType = {
  phone: string
  email: string
  password: string
}

const Auth = () => {
  const { i18n } = useTranslation()
  i18n.language = i18n.language?.split('-')[0]
  const initialValues: AuthFormType = {
    phone: '',
    email: '',
    password: '',
  }
  const activeTab = useAppSelector((state) => state.login.activeTab)

  const phoneShema = Yup.string().required()

  const validationSchema = Yup.object().shape({
    password: Yup.string().required(),
    phone: activeTab === 'phone' ? phoneShema : Yup.string().notRequired(),
  })

  const dispatch = useAppDispatch()

  const [signInEmail] = useSignInEmailMutation()
  const [signInPhone] = useSignInPhoneMutation()

  const handleSignInEmail = async (values: AuthFormType) => {
    try {
      const response = await signInEmail({
        email: values.email,
        password: values.password,
      }).unwrap()
      dispatch(updateRegistrationData(response.data))
      dispatch(setActiveModal('codeAuth'))
      console.log(response)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSignInPhone = async (values: AuthFormType) => {
    try {
      const response = await signInPhone({
        mobile_number: values.phone,
        password: values.password,
      }).unwrap()
      dispatch(updateRegistrationData(response.data))
      dispatch(setActiveModal('codeAuth'))
      console.log(response)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnMount
      onSubmit={async (values) => {
        activeTab === 'email'
          ? await handleSignInEmail(values)
          : await handleSignInPhone(values)
      }}
    >
      <Form autoComplete="off">
        <AuthForm />
      </Form>
    </Formik>
  )
}

export default Auth
