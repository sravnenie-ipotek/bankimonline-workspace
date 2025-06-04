import classNames from 'classnames/bind'
import { Form, FormikProvider, useFormik } from 'formik'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'

import { useAppDispatch } from '@src/hooks/store'
import { changeName } from '@src/store/slices/settingsUserSlice'

import { ModalButton } from '../ModalButton'
import { ModalTextInput } from '../ModalTextInput'
import { FormProps } from '../formTypes'
import styles from './changeNameForm.module.scss'

const cx = classNames.bind(styles)

const ChangeNameForm: FC<FormProps> = ({ onModalClose }) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  type InitialValuesProps = {
    name: string
  }

  const initialValues = {
    name: '',
  } as InitialValuesProps

  const onSubmit = () => {
    dispatch(changeName(values.name))
    onModalClose()
  }

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(5, t('settings.inputErrors.minLength'))
      .max(25, t('settings.inputErrors.maxLength'))
      .required(t('settings.inputErrors.require')),
  })

  const formik = useFormik({
    validationSchema,
    initialValues,
    validateOnMount: true,
    onSubmit,
  })

  console.log(formik)

  const {
    values,
    errors,
    touched,
    isValid,
    setFieldTouched,
    handleChange,
    handleSubmit,
    dirty,
  } = formik

  return (
    <FormikProvider value={formik}>
      <Form onSubmit={handleSubmit}>
        <div className={cx(styles.root)}>
          <div className={cx(styles.input_wrapper)}>
            <ModalTextInput
              name={'name'}
              variant="name"
              value={values.name}
              onChange={handleChange}
              onBlur={() => setFieldTouched('name', true)}
              isError={!!touched.name && !!errors.name}
              errorText={errors.name}
            />
          </div>

          {/* Кнопка/Кнопки модалки в зависимости от варианта модалки */}

          <div className={cx(styles.button)}>
            <ModalButton
              onClick={onSubmit}
              variant="save"
              type="submit"
              disabled={!isValid && dirty}
            />
          </div>
        </div>
      </Form>
    </FormikProvider>
  )
}

export default ChangeNameForm
