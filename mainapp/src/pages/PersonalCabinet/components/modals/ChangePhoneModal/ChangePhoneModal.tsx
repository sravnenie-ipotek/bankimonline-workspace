import React, { useState } from 'react'
import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import styles from './changePhoneModal.module.scss'

const cx = classNames.bind(styles)

interface ChangePhoneModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (phone: string) => void
  currentPhone?: string
}

// Close Icon
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const ChangePhoneModal: React.FC<ChangePhoneModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPhone = '+972 50 123 4567'
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [countryCode, setCountryCode] = useState('+972')
  const [phone, setPhone] = useState(currentPhone.replace('+972 ', ''))
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phone.trim() || !isAgreedToTerms) {
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call for phone update
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const fullPhone = `${countryCode} ${phone}`
      if (onSuccess) {
        onSuccess(fullPhone)
      }
      // Don't close here - PersonalCabinet will handle transition to verification
    } catch (error) {
      console.error('Error changing phone:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value)
  }

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountryCode(e.target.value)
  }

  const handleUserAgreementClick = () => {
    navigate('/terms')
  }

  const handlePrivacyPolicyClick = () => {
    navigate('/privacy-policy')
  }

  const isFormValid = phone.trim() && isAgreedToTerms

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
          {/* Action #1 - Close Button */}
          <button 
            className={cx('close-button')}
            onClick={onClose}
            type="button"
            aria-label={t('close', 'Закрыть')}
          >
            <CloseIcon />
          </button>

          {/* Header */}
          <div className={cx('modal-header')}>
            <h2 className={cx('modal-title')}>
              {t('change_phone', 'Изменить номер телефона')}
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={cx('modal-form')}>
            {/* Action #2 - Phone Input with Country Code */}
            <div className={cx('input-group')}>
              <label className={cx('input-label')}>
                {t('new_phone_number', 'Новый номер телефона')}
              </label>
              <div className={cx('phone-input-wrapper')}>
                <select 
                  value={countryCode}
                  onChange={handleCountryCodeChange}
                  className={cx('country-select')}
                >
                  <option value="+972">🇮🇱 +972</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+7">🇷🇺 +7</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+49">🇩🇪 +49</option>
                </select>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  className={cx('phone-input')}
                  placeholder="50 123 4567"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Action #6 - Warning Description */}
            <div className={cx('warning-section')}>
              <h3 className={cx('warning-title')}>
                {t('phone_change_title', 'Что произойдет после смены номера телефона?')}
              </h3>
              <div className={cx('warning-details')}>
                <p>
                  {t('phone_warning_p1', 'Как владелец старого номера телефона, вы предоставляете владельцу нового номера телефона полный доступ ко всей информации на панели клиентов «Bankimonline Dashboards» и истории разговоров в службе поддержки')}
                </p>
                <p>
                  {t('phone_warning_p2', 'Старый номер телефона больше не будет получать системные напоминания и уведомления или будут перенаправлены на новый номер телефона')}
                </p>
                <p>
                  {t('phone_warning_p3', 'Вы должны подтвердить свой новый номер телефона, введя код который придет на новый номер телефона')}
                </p>
                <p>
                  {t('phone_warning_p4', 'У вас не будет доступа к вашей учетной записи с прежним номером телефона после завершения процесса проверки.')}
                </p>
              </div>
              <div className={cx('confirmation-section')}>
                <p className={cx('confirmation-text')}>
                  {t('phone_confirmation_text', 'Я подтверждаю, что:')}
                </p>
                <p>{t('phone_confirmation_p1', 'Я являюсь владельцем нового номера телефона (согласно условиям пользовательского соглашения)')}</p>
                <p>{t('phone_confirmation_p2', 'Я являюсь владельцем этой учетной записи Bankimonline и прошу изменить номер телефона.')}</p>
              </div>
            </div>

            {/* Action #3 - User Agreement Link */}
            <div className={cx('legal-section')}>
              <p className={cx('legal-text')}>
                {t('agreement_prefix', 'Я прочитал и согласен с условиями')}{' '}
                <span 
                  className={cx('legal-link')}
                  onClick={handleUserAgreementClick}
                >
                  {t('user_agreement', 'пользовательского соглашения')}
                </span>
              </p>
            </div>

            {/* Action #4 - Agreement Checkbox */}
            <div className={cx('checkbox-section')}>
              <label className={cx('checkbox-label')}>
                <input
                  type="checkbox"
                  checked={isAgreedToTerms}
                  onChange={(e) => setIsAgreedToTerms(e.target.checked)}
                  className={cx('checkbox-input')}
                />
                <span className={cx('checkbox-custom')}></span>
                <span className={cx('checkbox-text')}>
                  {t('agree_to_terms', 'Я прочитал и согласен с условиями')}
                </span>
              </label>
            </div>

            {/* Action #5 - Continue Button */}
            <div className={cx('button-group')}>
              <button
                type="submit"
                className={cx('continue-button')}
                disabled={!isFormValid || isLoading}
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