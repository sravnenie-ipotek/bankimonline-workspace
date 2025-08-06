import React, { useState } from 'react'
import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import styles from './emailSettingsModal.module.scss'

const cx = classNames.bind(styles)

interface EmailSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (email: string) => void
}

// Close Icon
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const EmailSettingsModal: React.FC<EmailSettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (onSuccess) {
        onSuccess(email)
      }
      onClose()
    } catch (error) {
      console.error('Error updating email:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
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
          {/* Header */}
          <div className={cx('modal-header')}>
            <h2 className={cx('modal-title')}>
              {t('enter_email', 'Введите email')}
            </h2>
            <button 
              className={cx('close-button')}
              onClick={onClose}
              type="button"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={cx('modal-form')}>
            <div className={cx('input-group')}>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={cx('email-input')}
                placeholder={t('email_placeholder', 'example@bankimonline.com')}
                required
                autoFocus
              />
            </div>

            <div className={cx('button-group')}>
              <button
                type="submit"
                className={cx('continue-button')}
                disabled={!email.trim() || isLoading}
              >
                {isLoading ? t('loading', 'Загрузка...') : t('continue', 'Продолжить')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 