import { Form, Formik } from 'formik'
import * as Yup from 'yup'

import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { setActiveModal } from '@src/pages/Services/slices/loginSlice'

import { ResetPasswordForm } from './ResetPasswordForm'

export type ResetPasswordFormType = {
  phoneNumber: string
  email: string
}

const ResetPassword = () => {
  const dispatch = useAppDispatch()
  const activeTab = useAppSelector((state) => state.login.activeTab)

  const initialValues: ResetPasswordFormType = {
    phoneNumber: '',
    email: '',
  }

  // Email validation schema
  const emailSchema = Yup.string()
    .email('Invalid email format')
    .required('Email is required')

  // Phone validation schema  
  const phoneSchema = Yup.string().required('Phone number is required')

  // Conditional validation based on active tab
  const validationSchema = Yup.object().shape({
    phoneNumber: activeTab === 'phone' ? phoneSchema : Yup.string().notRequired(),
    email: activeTab === 'email' ? emailSchema : Yup.string().notRequired(),
  })

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnMount
      onSubmit={(values) => {
        dispatch(setActiveModal('newPassword'))
      }}
    >
      <Form>
        <ResetPasswordForm />
      </Form>
    </Formik>
  )
}

export default ResetPassword
