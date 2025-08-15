import React, { useState } from 'react'
import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'

import { CodeVerification } from '@components/ui/CodeVerification'
import styles from './emailVerificationModal.module.scss'

const cx = classNames.bind(styles)

interface EmailVerificationModalProps {
  isOpen: boolean
  email: string
  onClose: () => void
  onSuccess: () => void
  onBack: () => void
}

// Close Icon component
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  email,
  onClose,
  onSuccess,
  onBack
}) => {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const initialValues = {
    code: null,
    email: email,
    phone: null
  }

  const validationSchema = Yup.object().shape({
    code: Yup.string().length(4, t('code_length_error', 'Код должен содержать 4 цифры')).required(t('code_required', 'Код обязателен')),
  })

  const handleSubmit = async (code: string) => {
    setIsLoading(true)
    try {
      // Simulate API call for email verification
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onSuccess()
    } catch (error) {
      console.error('Email verification failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className={cx('modal-backdrop')} onClick={handleBackdropClick}>
      <div className={cx('modal-container')}>
        <div className={cx('modal-content')}>
          {/* Action #5 - Close Button */}
          <button 
            className={cx('close-button')}
            onClick={onClose}
            type="button"
            aria-label={t('close', 'Закрыть')}
          >
            <CloseIcon />
          </button>

          {/* Email Verification Form */}
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              // This won't be called directly, CodeVerification handles submission
            }}
          >
            <Form>
              <CodeVerification
                title={t('please_check_email', 'Пожалуйста проверьте Email')}
                tab="email"
                handleNextStep={handleSubmit}
                handlePrevStep={onBack}
                textButton={t('confirm', 'Подтвердить')}
              />
            </Form>
          </Formik>
        </div>
      </div>
    </div>
  )
} 