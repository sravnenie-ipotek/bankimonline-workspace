import classNames from 'classnames/bind'
import { useFormikContext } from 'formik'
import React from 'react'
import { useTranslation } from 'react-i18next'

import BackButton from '@src/components/ui/BackButton/BackButton'
import { Button } from '@src/components/ui/ButtonUI'
import { CodeInput } from '@src/components/ui/CodeInput'

import { CodeFormType } from '../Code'
import styles from './codeForm.module.scss'

const cx = classNames.bind(styles)

// { title, subtitle, onSubmit, buttonText, onBack }

type TypeProps = {
  title: string
  subtitle: string
  onSubmit: ({ code }: { code: string }) => void
  buttonText: string
  onBack: () => void
}

const CodeForm: React.FC<TypeProps> = ({
  title,
  subtitle,
  onSubmit,
  buttonText,
  onBack,
}) => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language?.split('-')[0]

  const { values, setFieldValue, isValid } = useFormikContext<CodeFormType>()

  return (
    <div className={cx('code')}>
      <div className={cx('code-header')}>
        <h2 className={cx('code-header__title')}>{title}</h2>
        <p className={cx('code-header__desc')}>{subtitle}</p>
      </div>
      <div className={cx('code-form')}>
        <CodeInput
          // error={formik.errors.code as string}
          otpValue={values.code}
          setOtpValue={(code) => setFieldValue('code', code)}
        />
      </div>
      <p className={cx('code-again')}>
        {t('not_received_sms')}{' '}
        <span className={cx('highlighted')}>{t('send_sms_code_again')}</span>
      </p>
      <div className={cx('code-footer')}>
        <Button
          type="submit"
          className={cx('code-footer__button')}
          onClick={() => onSubmit(values)}
          variant="primary"
          isDisabled={!isValid}
          size="full"
        >
          {buttonText}
        </Button>
        <BackButton
          className={cx('code-footer__button')}
          handleClick={onBack}
          title={t('back')}
        />
      </div>
    </div>
  )
}

export default CodeForm
