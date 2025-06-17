import { Form, Formik } from 'formik'
import * as Yup from 'yup'

import { useAppDispatch } from '@src/hooks/store'
import { setActiveModal } from '@src/pages/Services/slices/loginSlice'

import { ResetPasswordForm } from './ResetPasswordForm'

export type ResetPasswordFormType = {
  phoneNumber: string
  email: string
}

const ResetPassword = () => {
  const dispatch = useAppDispatch()

  const initialValues: ResetPasswordFormType = {
    phoneNumber: '',
    email: '',
  }

  const validationSchema = Yup.object().shape({
    phoneNumber: Yup.string().required(),
  })

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnMount
      onSubmit={(values) => {
        console.log(values)
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
