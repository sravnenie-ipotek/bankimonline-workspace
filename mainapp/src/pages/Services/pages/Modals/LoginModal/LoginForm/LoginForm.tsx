import classNames from 'classnames/bind'
import { Form, Formik } from 'formik'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import * as Yup from 'yup'
import 'yup-phone-lite'

import { Button } from '@src/components/ui/ButtonUI'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { Code } from '@src/pages/AuthModal/pages/Code'
import {
  setActiveModal,
  setIsLogin,
  updateLoginData,
  updateRegistrationData,
} from '@src/pages/Services/slices/loginSlice'
import { closeModal } from '@src/pages/Services/slices/modalSlice'
import {
  useSendSmsCodeMobileMutation,
  useSignInNameMutation,
} from '@src/services/auth/auth'
import { getValidationErrorSync } from '@src/utils/validationHelpers'

import styles from './loginForm.module.scss'
import { NameSurnameLogin } from './ui/NameSurnameLogin'
import { PhoneInput } from './ui/PhoneInput'

export type LoginFormTypes = {
  nameSurname: string
  phoneNumber: string
}

const cx = classNames.bind(styles)
const LoginForm = () => {
  const { t, i18n } = useTranslation()

  const navigate = useNavigate()

  const location = useLocation()
  const currentPath = location.pathname
  const newPath = currentPath.replace(/\/\d+$/, '')
  // достает старый путь и удаляет последнюю цифру в пути, чтобы подставить новое число

  const dispatch = useAppDispatch()

  const [signInName] = useSignInNameMutation()
  const [sendSmsCodeMobile] = useSendSmsCodeMobileMutation()

  const isLogin = useAppSelector((state) => state.login.isLogin)
  const registrationData = useAppSelector(
    (state) => state.login.registrationData
  )

  const activeModal = useAppSelector((state) => state.login.activeModal)

  const initialValues = {
    nameSurname: '',
    phoneNumber: '',
  }

  // i18n.language === 'he' ? 'HE' : 'RU',
  // `${t('error_wrong_phone_number_login')}`

  const phoneShema = Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field'))

  const validationSchema = Yup.object().shape({
    nameSurname: Yup.string()
      .min(3, getValidationErrorSync('error_not_enough_symbols', 'Not enough symbols'))
      .required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    phoneNumber: phoneShema,
  })

  const handleSignInName = async (values: LoginFormTypes) => {
    try {
      const response = await signInName({
        mobile_number: values.phoneNumber,
      }).unwrap()
      dispatch(updateLoginData(values))
      dispatch(updateRegistrationData(response.data))
      dispatch(setActiveModal('code'))
    } catch (error) {
      console.error(error)
    }
  }

  const handleSendSmsCodeMobile = async (values: { code: string }) => {
    try {
      const response = await sendSmsCodeMobile({
        code: values.code,
        mobile_number: registrationData.mobile_number,
      }).unwrap()
      localStorage.setItem('USER_DATA', JSON.stringify(response.data))
      dispatch(setIsLogin())
      dispatch(closeModal())
      dispatch(setActiveModal('login'))
      navigate(newPath + '/2')
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    return () => {
      if (!isLogin) {
        dispatch(setActiveModal('login'))
      }
    }
  }, [dispatch, isLogin])

  const handlePreviousStep = () => {
    dispatch(setActiveModal('login'))
  }

  return (
    <>
      {activeModal === 'login' ? (
        <div className={cx('login')}>
          <div className={cx('login-title')}>
            <h1 className={cx('login-title__text')}>
              {t('enter_phone_number_login')}
            </h1>
            <p className={cx('login-title__desc')}>
              {t('confirm_phone_number_login')}
            </p>
          </div>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            validateOnMount={true}
            onSubmit={async (values) => {
              await handleSignInName(values)
            }}
          >
            {({ handleSubmit, isValid }) => (
              <Form className={cx('login-form')}>
                <div className={cx('login-form__input')}>
                  <NameSurnameLogin />
                </div>
                <div className={cx('login-form__input')}>
                  <PhoneInput />
                </div>
                <div>
                  <p className={cx('login-form__desc')}>
                    {t('accept_conditions_login')}
                    <span className={cx('highlighted')}>
                      {t('user_agreement')}
                    </span>
                    {t('agreement')}
                    <span className={cx('highlighted')}>{t('policy')}</span>
                  </p>
                </div>
                <Button
                  type="submit"
                  isDisabled={!isValid}
                  onClick={handleSubmit as () => void}
                >
                  {t('button_next')}
                </Button>
                <p className={cx('login-form__client')}>
                  {t('already_client')}
                  <span className={cx('highlighted')}>{t('here')}</span>
                </p>
              </Form>
            )}
          </Formik>
        </div>
      ) : (
        <Code
          title={t('accept_you_profile_for_enter')}
          subtitle={t('sms_phone')}
          onSubmit={(values) => {
            handleSendSmsCodeMobile(values)
          }}
          buttonText={t('accept_phone')}
          onBack={() => {
            dispatch(handlePreviousStep)
          }}
        />
      )}
    </>
  )
}

export default LoginForm
