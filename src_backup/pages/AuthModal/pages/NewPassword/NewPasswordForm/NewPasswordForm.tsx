import classNames from 'classnames/bind'
import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Button } from '@src/components/ui/ButtonUI'
import { PasswordInput } from '@src/components/ui/PasswordInput'

import { NewPasswordFormType } from '../NewPassword'
import styles from './newPassword.module.scss'

const cx = classNames.bind(styles)

const NewPasswordForm = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language?.split('-')[0]

  const {
    values,
    setFieldValue,
    isValid,
    handleSubmit,
    errors,
    setFieldTouched,
    touched,
  } = useFormikContext<NewPasswordFormType>()

  console.log(errors)

  return (
    <div className={cx('newPassword')}>
      <div className={cx('newPassword-header')}>
        <h2 className={cx('newPassword-header__title')}>
          {t('choose_new_password')}
        </h2>
        <p className={cx('newPassword-header__desc')}>{t('new_password')}</p>
      </div>
      <div className={cx('newPassword-form')}>
        <div className={cx('newPassword-form__item')}>
          <PasswordInput
            language={i18n.language}
            error={touched.password && errors.password}
            title={t('choose_new_password')}
            value={values.password}
            placeholder={t('password')}
            onBlur={() => setFieldTouched('password')}
            handleChange={(password) => setFieldValue('password', password)}
          />
        </div>
        <div className={cx('newPassword-form__item')}>
          <PasswordInput
            language={i18n.language}
            error={touched.newPassword && errors.newPassword}
            title={t('confirmed_password')}
            value={values.newPassword}
            placeholder={t('confirmed_password')}
            onBlur={() => setFieldTouched('newPassword')}
            handleChange={(newPassword) =>
              setFieldValue('newPassword', newPassword)
            }
          />
        </div>
      </div>
      <div className={cx('newPassword-footer')}>
        <Button
          type="submit"
          className={cx('newPassword-footer__button')}
          onClick={() => handleSubmit()}
          variant="primary"
          isDisabled={!isValid}
          size="full"
        >
          {t('change_password')}
        </Button>
      </div>
    </div>
  )
}

export default NewPasswordForm
