import classNames from 'classnames/bind'
import { useFormikContext } from 'formik'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'

import { Button } from '@src/components/ui/ButtonUI'
import { CustomPhoneInput } from '@src/components/ui/CustomPhoneInput'
import StringInput from '@src/components/ui/StringInput/StringInput'
import { Tabs } from '@src/components/ui/Tabs'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { setActiveTab } from '@src/pages/Services/slices/loginSlice'

import { ResetPasswordFormType } from '../ResetPassword'
import styles from './resetPassword.module.scss'

const cx = classNames.bind(styles)

const tabs = [
  {
    value: 'phone',
    label: i18next.t('phone_auth_tab'),
  },
  {
    value: 'email',
    label: i18next.t('email_auth_tab'),
  },
]

const ResetPasswordForm = () => {
  const { t, i18n } = useTranslation()

  const {
    values,
    setFieldValue,
    errors,
    touched,
    setFieldTouched,
    isValid,
    handleSubmit,
  } = useFormikContext<ResetPasswordFormType>()

  const activeTab = useAppSelector((state) => state.login.activeTab)
  const dispatch = useAppDispatch()

  return (
    <div className={cx('reset')}>
      <div className={cx('reset-header')}>
        <h2 className={cx('reset-header__title')}>
          {t('title_restore_password')}
        </h2>
        <p className={cx('reset-header__text')}>{t('sms_code')}</p>
        <Tabs
          handleChange={(value) => dispatch(setActiveTab(value))}
          tabs={tabs}
          tab={activeTab}
        />
      </div>
      <div className={cx('reset-form')}>
        {activeTab === 'phone' ? (
          <CustomPhoneInput
            title={t('phone_number')}
            value={values.phoneNumber}
            handleChange={(value) => setFieldValue('phoneNumber', value)}
            onBlur={() => setFieldTouched('phoneNumber')}
            error={touched.phoneNumber && errors.phoneNumber}
          />
        ) : (
          <StringInput
            title={t('email')}
            placeholder="mail@mail.com"
            onChange={(value) => setFieldValue('email', value)}
            value={values.email}
          />
        )}
      </div>
      <Button
        type="submit"
        className={cx('reset-button')}
        variant="primary"
        isDisabled={!isValid}
        onClick={() => handleSubmit()}
      >
        {t('enter')}
      </Button>
    </div>
  )
}

export default ResetPasswordForm
