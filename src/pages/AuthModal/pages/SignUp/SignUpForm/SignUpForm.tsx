import classNames from 'classnames/bind'
import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { LogoPrimaryIcon } from '@assets/icons/LogoPrimaryIcon'
import { Button } from '@src/components/ui/ButtonUI'
import { CustomPhoneInput } from '@src/components/ui/CustomPhoneInput'
import { PasswordInput } from '@src/components/ui/PasswordInput'
import StringInput from '@src/components/ui/StringInput/StringInput'
import { Tabs } from '@src/components/ui/Tabs'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import {
  setActiveModal,
  setActiveTab,
} from '@src/pages/Services/slices/loginSlice'

import { SignUpFormType } from '../SignUp'
import styles from './signUpForm.module.scss'

const cx = classNames.bind(styles)

const SignUpForm = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language?.split('-')[0]

  const activeTab = useAppSelector((state) => state.login.activeTab)
  const dispatch = useAppDispatch()

  const tabs = [
    {
      value: 'phone',
      label: t('phone_auth_tab'),
    },
    {
      value: 'email',
      label: t('email_auth_tab'),
    },
  ]

  const {
    values,
    setFieldValue,
    errors,
    touched,
    setFieldTouched,
    isValid,
    handleSubmit,
  } = useFormikContext<SignUpFormType>()

  return (
    <div className={cx('signUp')}>
      <div className={cx('signUp-left')}>
        <div className={cx('signUp-left__bg')}></div>
        <div className={cx('signUp-left__logo')}>
          <LogoPrimaryIcon color="#161616" />
        </div>
        <h2 className={cx('signUp-left__title')}>
          {t('register_banner_title')}
        </h2>
        <p className={cx('signUp-left__desc')}>
          {t('register_banner_description')}
        </p>
        <div className={cx('signUp-left__img')}>
          <img src={'/static/sign-up/bank.png'} alt="bank" />
        </div>
      </div>
      <div className={cx('signUp-right')}>
        <div className={cx('signUp-right__header')}>
          <h2 className={cx('signUp-right__header-title')}>
            {t('register_title')}
          </h2>
          <p className={cx('signUp-right__header-desc')}>
            {t('register_description')}
          </p>
          <Tabs
            handleChange={(value) => dispatch(setActiveTab(value))}
            tabs={tabs}
            tab={activeTab}
          />
        </div>
        <div className={cx('signUp-right__form')}>
          <div className={cx('signUp-right__form-item')}>
            <StringInput
              title={t('calculate_mortgage_name_surname')}
              placeholder={t('calculate_mortgage_name_surname_ph')}
              onChange={(value) => setFieldValue('nameSurname', value)}
              onBlur={() => setFieldTouched('nameSurname')}
              error={touched.nameSurname && errors.nameSurname}
              value={values.nameSurname}
            />
          </div>
          <div className={cx('signUp-right__form-item')}>
            {activeTab === 'phone' ? (
              <>
                <CustomPhoneInput
                  title={t('phone_number')}
                  tooltip={t('change_phone')}
                  value={values.phoneNumber}
                  handleChange={(value) => setFieldValue('phoneNumber', value)}
                  onBlur={() => setFieldTouched('phoneNumber')}
                  error={touched.phoneNumber && errors.phoneNumber}
                />
              </>
            ) : (
              <StringInput
                title={t('email')}
                placeholder="mail@mail.com"
                onChange={(value) => setFieldValue('email', value)}
                value={values.email}
              />
            )}
          </div>
        </div>
        <div className={cx('signUp-right__form')}>
          <div className={cx('signUp-right__form-item')}>
            <PasswordInput
              language={i18n.language}
              title={t('create_password')}
              placeholder={t('password')}
              value={values.password}
              handleChange={(password) => setFieldValue('password', password)}
              onBlur={() => setFieldTouched('password')}
              error={touched.password && errors.password}
            />
          </div>
          <div className={cx('signUp-right__form-item')}>
            <PasswordInput
              language={i18n.language}
              title={t('confirm_password')}
              placeholder={t('password')}
              value={values.repeatPassword}
              handleChange={(password) =>
                setFieldValue('repeatPassword', password)
              }
              onBlur={() => setFieldTouched('repeatPassword')}
              error={touched.repeatPassword && errors.repeatPassword}
            />
          </div>
        </div>
        <div>
          <p className={cx('login-form__desc')}>
            {t('press_register')}
            <span className={cx('highlighted')}>{t('user_agreement')}</span>
            {t('agreement')}
            <span className={cx('highlighted')}>{t('policy')}</span>
          </p>
          <Button
            type="submit"
            className={cx('login-form__desc-button')}
            variant="primary"
            isDisabled={!isValid}
            onClick={() => handleSubmit()}
          >
            {t('enter')}
          </Button>
          <div className={cx('login-form__desc-footer')}>
            <span>{t('has_account')}</span>
            <span
              className={cx('highlighted')}
              onClick={() => dispatch(setActiveModal('auth'))}
            >
              {t('here')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpForm
