import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import YupPassword from 'yup-password'

import { useAppDispatch } from '@src/hooks/store'
import { setActiveModal } from '@src/pages/Services/slices/loginSlice'

import { NewPasswordForm } from './NewPasswordForm'

YupPassword(Yup) // extend yup

export type NewPasswordFormType = {
  password: string
  newPassword: string
}

const NewPassword = () => {
  const dispatch = useAppDispatch()

  const initialValues: NewPasswordFormType = {
    password: '',
    newPassword: '',
  }

  const fullValidatorForSchema =
    (
      schema: Yup.ObjectSchema<{
        password: string
        newPassword: string
      }>
    ) =>
    (values: NewPasswordFormType) =>
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
    newPassword: Yup.string().equals(
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
      // validationSchema={validationSchema}
      // validationSchemaOptions={{ showMultipleFieldErrors: true }}
      // validateOnMount
      onSubmit={(values) => {
        dispatch(setActiveModal('codeNewPassword'))
      }}
    >
      <Form>
        <NewPasswordForm />
      </Form>
    </Formik>
  )
}

export default NewPassword
