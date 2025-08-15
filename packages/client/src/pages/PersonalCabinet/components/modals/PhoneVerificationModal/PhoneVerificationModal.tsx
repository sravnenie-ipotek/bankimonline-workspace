import React, { useState } from 'react'
import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'

import { CodeVerification } from '@components/ui/CodeVerification'
import { Close } from '@assets/icons/Close'
import styles from './phoneVerificationModal.module.scss'

const cx = classNames.bind(styles)

interface PhoneVerificationModalProps {
  isOpen: boolean
  phone: string
  onClose: () => void
  onSuccess: () => void
  onBack: () => void
}

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  isOpen,
  phone,
  onClose,
  onSuccess,
  onBack
}) => {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const initialValues = {
    code: null,
    email: null,
    phone: phone
  }

  const validationSchema = Yup.object().shape({
    code: Yup.string().length(4, t('code_length_error', 'Код должен содержать 4 цифры')).required(t('code_required', 'Код обязателен')),
  })

  const handleSubmit = async (code: string) => {
    setIsLoading(true)
    try {
      // Simulate API call for phone verification
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onSuccess()
    } catch (error) {
      console.error('Phone verification failed:', error)
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
            <Close />
          </button>

          {/* Phone Verification Form */}
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              // This won't be called directly, CodeVerification handles submission
            }}
          >
            <Form>
              <CodeVerification
                title={t('please_check_phone', 'Пожалуйста проверьте телефон')}
                tab="phone"
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