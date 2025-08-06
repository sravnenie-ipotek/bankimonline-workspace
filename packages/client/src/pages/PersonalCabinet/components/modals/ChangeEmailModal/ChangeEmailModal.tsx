import React, { useState, useEffect } from 'react'
import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import styles from './changeEmailModal.module.scss'

const cx = classNames.bind(styles)

interface ChangeEmailModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (email: string) => void
  currentEmail?: string
}

// Close Icon
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentEmail
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isAgreed, setIsAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Auto-fill current email if provided
  useEffect(() => {
    if (currentEmail && isOpen) {
      setEmail(currentEmail)
    }
  }, [currentEmail, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !isAgreed) {
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (onSuccess) {
        onSuccess(email)
      }
      // Note: In real implementation, this would trigger LK-179 email verification modal
      onClose()
    } catch (error) {
      console.error('Error changing email:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAgreed(e.target.checked)
  }

  const handleUserAgreementClick = () => {
    navigate('/terms')
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
              {t('change_email', 'Изменить email')}
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
                placeholder={t('new_email_placeholder', 'Введите новый email')}
                required
                autoFocus
              />
            </div>

            {/* Warning Description - Action #6 */}
            <div className={cx('warning-section')}>
              <h3 className={cx('warning-title')}>
                {t('email_change_title', 'Что произойдет после смены email?')}
              </h3>
              <div className={cx('warning-details')}>
                <p>{t('email_warning_p1', 'Как владелец старого адреса электронной почты, вы предоставляете владельцу нового адреса электронной почты полный доступ ко всей информации на панели клиентов «Bankimonline Dashboard» и истории разговоров в службе поддержки')}</p>
                <p>{t('email_warning_p2', 'Старый адрес электронной почты больше не будет получать системные напоминания и уведомления или будут перенаправлены на адрес электронной почты')}</p>
                <p>{t('email_warning_p3', 'Вы должны подтвердить свой новый адрес электронной почты, введя код который придет на новый адрес электронной почты')}</p>
                <p>{t('email_warning_p4', 'У вас не будет доступа к вашей учетной записи с прежним адресом электронной почты после завершения процесса проверки.')}</p>
              </div>
              <div className={cx('confirmation-section')}>
                <p className={cx('confirmation-text')}>
                  {t('email_confirmation', 'Я подтверждаю, что:')}
                </p>
                <p className={cx('confirmation-detail')}>
                  {t('email_confirmation_detail1', '• Я являюсь владельцем нового адреса электронной почты (согласно условиям пользовательского соглашения)')}
                </p>
                <p className={cx('confirmation-detail')}>
                  {t('email_confirmation_detail2', '• Я являюсь владельцем этой учетной записи Bankimonline и прошу изменить адрес электронной почты учетной записи.')}
                </p>
              </div>
            </div>

            {/* User Agreement */}
            <div className={cx('agreement-section')}>
              <div className={cx('agreement-text')}>
                <p>
                  {t('email_change_agreement', 'Изменяя email, вы соглашаетесь с тем, что:')}
                </p>
                <ul>
                  <li>{t('agreement_point_1', 'Новый email станет вашим основным способом входа в систему')}</li>
                  <li>{t('agreement_point_2', 'На новый email будут отправляться все уведомления и документы')}</li>
                  <li>{t('agreement_point_3', 'Вы подтверждаете, что имеете доступ к указанному email адресу')}</li>
                  <li>{t('agreement_point_4', 'Изменение email может потребовать повторной верификации аккаунта')}</li>
                </ul>
              </div>

              <div className={cx('checkbox-group')}>
                <label className={cx('checkbox-label')}>
                  <input
                    type="checkbox"
                    checked={isAgreed}
                    onChange={handleCheckboxChange}
                    className={cx('checkbox-input')}
                  />
                  <span className={cx('checkbox-custom')}></span>
                  <span className={cx('checkbox-text')}>
                    {t('agree_to_terms_start', 'Я согласен с условиями')}{' '}
                    <span 
                      className={cx('agreement-link')}
                      onClick={handleUserAgreementClick}
                    >
                      {t('user_agreement', 'пользовательского соглашения')}
                    </span>
                    {' '}{t('and_email_change', 'и изменения email')}
                  </span>
                </label>
              </div>
            </div>

            <div className={cx('button-group')}>
              <button
                type="submit"
                className={cx('continue-button')}
                disabled={!email.trim() || !isAgreed || isLoading}
              >
                {isLoading 
                  ? t('loading', 'Загрузка...') 
                  : t('continue', 'Продолжить')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 