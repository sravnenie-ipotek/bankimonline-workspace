import classNames from 'classnames/bind'
import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

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

import { AuthFormType } from '../Auth'
import styles from './authForm.module.scss'

const cx = classNames.bind(styles)

const AuthForm = () => {
  const { t, i18n } = useTranslation()

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

  const dispatch = useAppDispatch()

  const activeTab = useAppSelector((state) => state.login.activeTab)

  const { values, setFieldValue, setFieldTouched, isValid, handleSubmit } =
    useFormikContext<AuthFormType>()

  return (
    <div className={cx('auth')}>
      <div className={cx('auth-header')}>
        <h2 className={cx('auth-header__title')}>{t('enter_bankimonline')}</h2>
        <Tabs
          handleChange={(value) => dispatch(setActiveTab(value))}
          tabs={tabs}
          tab={activeTab}
        />
      </div>
      <div className={cx('auth-form')}>
        {activeTab === 'phone' ? (
          <CustomPhoneInput
            title={t('phone_number')}
            value={values.phone}
            handleChange={(value) => setFieldValue('phone', value)}
            onBlur={() => setFieldTouched('phone')}
            // error={touched.phone && errors.phone}
          />
        ) : (
          <div className={cx('auth-form__item')}>
            <StringInput
              title={t('email')}
              placeholder="mail@mail.com"
              onChange={(value) => setFieldValue('email', value)}
              value={values.email}
            />
          </div>
        )}
        <div className={cx('auth-form__item')}>
          <PasswordInput
            language={i18n.language}
            title={t('password')}
            placeholder={t('enter_password')}
            value={values.password}
            handleChange={(password) => setFieldValue('password', password)}
          />
        </div>
        <p
          className={cx('auth-form__forgot')}
          onClick={() => dispatch(setActiveModal('reset'))}
        >
          {t('forgot_password')}
        </p>
      </div>
      <div className={cx('auth-footer')}>
        <Button
          type="submit"
          className={cx('auth-footer__button')}
          onClick={() => handleSubmit()}
          variant="primary"
          isDisabled={!isValid}
        >
          {t('enter')}
        </Button>
        <div className={cx('auth-footer__account')}>
          <span>{t('no_account')}</span>
          <span
            className={cx('auth-footer__register')}
            onClick={() => dispatch(setActiveModal('signUp'))}
          >
            {t('register_here')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default AuthForm
