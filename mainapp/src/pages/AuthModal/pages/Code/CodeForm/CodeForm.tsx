import classNames from 'classnames/bind'
import { useFormikContext } from 'formik'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import BackButton from '@src/components/ui/BackButton/BackButton'
import { Button } from '@src/components/ui/ButtonUI'
import { CodeInput } from '@src/components/ui/CodeInput'
import { useAppSelector } from '@src/hooks/store'

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

  const { values, setFieldValue, isValid } = useFormikContext<CodeFormType>()
  const registrationData = useAppSelector((state) => state.login.registrationData)
  
  // Rate limiting state
  const [canResendSMS, setCanResendSMS] = useState(true)
  const [countdown, setCountdown] = useState(0)

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && !canResendSMS) {
      setCanResendSMS(true)
    }
  }, [countdown, canResendSMS])

  // SMS resend constants
  const SMS_COUNTDOWN_SECONDS = 60
  const SMS_DELAY_MS = 1000

  // Mock SMS resend function
  const handleResendSMS = async () => {
    if (!canResendSMS) return

    try {
      // Save user verification attempt data
      const userData = {
        name: registrationData.nameSurname || 'Unknown',
        phone: registrationData.mobile_number || 'Unknown',
        service: 'phone_verification',
        timestamp: new Date().toISOString()
      }
      
      // Store in localStorage for now (in real app would be backend)
      const existingData = JSON.parse(localStorage.getItem('unregistered_users') || '[]')
      existingData.push(userData)
      localStorage.setItem('unregistered_users', JSON.stringify(existingData))
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, SMS_DELAY_MS))
      
      // Start countdown
      setCanResendSMS(false)
      setCountdown(SMS_COUNTDOWN_SECONDS)
      
    } catch (error) {
      // Handle error silently or show user-friendly message
      setCanResendSMS(true)
    }
  }

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
        {canResendSMS ? (
          <span 
            className={cx('highlighted', 'clickable')} 
            onClick={handleResendSMS}
            style={{ cursor: 'pointer' }}
          >
            {t('send_sms_code_again')}
          </span>
        ) : (
          <span className={cx('highlighted', 'disabled')}>
            {t('send_sms_code_again')} ({countdown}s)
          </span>
        )}
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
