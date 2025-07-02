import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { useAppDispatch } from '@src/hooks/store'
import { setActiveModal } from '@src/pages/Services/slices/loginSlice'
import styles from './phoneVerificationModalDark.module.scss'

interface FormData {
  name: string
  phone: string
}

interface FormErrors {
  name?: string
  phone?: string
}

interface PhoneVerificationModalDarkProps {
  onClose?: () => void
  onSuccess?: () => void
}

const PhoneVerificationModalDark: React.FC<PhoneVerificationModalDarkProps> = ({ onClose, onSuccess }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const validateName = (name: string): string | undefined => {
    if (!name.trim()) {
      return t('name_required', 'Имя обязательно')
    }
    if (!/^[a-zA-Zа-яА-Я\u0590-\u05FF\s]+$/.test(name)) {
      return t('name_letters_only', 'Используйте только буквы и пробелы')
    }
    if (name.trim().length < 2) {
      return t('name_min_length', 'Минимум 2 символа')
    }
    return undefined
  }

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) {
      return t('phone_required', 'Номер телефона обязателен')
    }
    if (phone.length < 10) {
      return t('phone_invalid', 'Введите корректный номер телефона')
    }
    return undefined
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({ ...prev, name }))
    
    if (errors.name) {
      const nameError = validateName(name)
      setErrors(prev => ({ ...prev, name: nameError }))
    }
  }

  const handlePhoneChange = (phone: string) => {
    setFormData(prev => ({ ...prev, phone }))
    
    if (errors.phone) {
      const phoneError = validatePhone(phone)
      setErrors(prev => ({ ...prev, phone: phoneError }))
    }
  }

  const handleContinue = async () => {
    const nameError = validateName(formData.name)
    const phoneError = validatePhone(formData.phone)

    if (nameError || phoneError) {
      setErrors({
        name: nameError,
        phone: phoneError
      })
      return
    }

    try {
      // Save data to localStorage for development
      localStorage.setItem('phoneVerificationData', JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        timestamp: new Date().toISOString()
      }))

      // Use onSuccess callback if provided (for mortgage flow), otherwise use default flow
      if (onSuccess) {
        onSuccess()
      } else {
        // Navigate to SMS verification (default flow)
        dispatch(setActiveModal('codeSignUp'))
      }
    } catch (error) {
      // Handle error silently or show user-friendly message
      setErrors({ phone: t('sms_send_error', 'Ошибка отправки SMS. Попробуйте еще раз.') })
    }
  }

  const handleLoginClick = () => {
    dispatch(setActiveModal('auth'))
  }

  const handleUserAgreementClick = () => {
    navigate('/terms')
    if (onClose) onClose()
  }

  const handlePrivacyPolicyClick = () => {
    navigate('/privacy-policy')
    if (onClose) onClose()
  }

  const handleClose = () => {
    if (onClose) onClose()
  }

  const isFormValid = formData.name.length > 0 && formData.phone.length > 0 && 
                      !validateName(formData.name) && !validatePhone(formData.phone)

  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={handleClose} aria-label={t('close', 'Закрыть')}>
          <img src="/static/x.svg" width="24" height="24" alt="" />
        </button>

        <h2 className={styles.title}>
          {t('enter_phone_for_offers', 'Введите свой номер телефона, чтобы получить предложения от банков')}
        </h2>
        
        <p className={styles.subtitle}>
          {t('confirm_phone_sms', 'Подтвердите свой номер телефона, чтобы мы смогли прислать SMS с решением от банков. Мы гарантируем безопасность и сохранность ваших данных.')}
        </p>

        <div className={styles.formContainer}>
          <div className={styles.inputGroup}>
            <input 
              type="text" 
              placeholder={t('content', 'Контент')}
              value={formData.name}
              onChange={handleNameChange}
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            />
            {errors.name && (
              <div className={styles.errorMessage}>
                {errors.name}
              </div>
            )}
          </div>
          
          <div className={styles.inputGroup}>
            <PhoneInput
              country={'il'}
              value={formData.phone}
              onChange={handlePhoneChange}
              onlyCountries={['il', 'us', 'ru']}
              preferredCountries={['il']}
              placeholder={t('phone_placeholder', '+972-4-8536396')}
              containerClass={styles.phoneContainer}
              inputClass={`${styles.phoneInput} ${errors.phone ? styles.phoneInputError : ''}`}
              buttonClass={styles.phoneButton}
              dropdownClass={styles.phoneDropdown}
              searchClass={styles.phoneSearch}
            />
            {errors.phone && (
              <div className={styles.errorMessage}>
                {errors.phone}
              </div>
            )}
          </div>

          <div className={styles.agreementText}>
            <span>{t('by_clicking_continue', 'Нажимая кнопку "Продолжить" я принимаю условия')} </span>
            <a 
              href="#"
              onClick={(e) => { e.preventDefault(); handleUserAgreementClick(); }}
              className={styles.link}
            >
              {t('user_agreement', 'Пользовательского соглашения')}
            </a>
            <span> {t('and_consent', 'и даю свое согласие на обработку моих персональных данных на условиях, определенных')} </span>
            <a 
              href="#"
              onClick={(e) => { e.preventDefault(); handlePrivacyPolicyClick(); }}
              className={styles.link}
            >
              {t('privacy_policy', 'Политикой конфиденциальности')}
            </a>
            <span>.</span>
          </div>

          <button
            type="button"
            disabled={!isFormValid}
            onClick={handleContinue}
            className={`${styles.continueButton} ${!isFormValid ? styles.continueButtonDisabled : ''}`}
          >
            {t('continue', 'Продолжить')}
          </button>

          <div className={styles.loginPrompt}>
            <span>{t('already_client_question', 'Уже являетесь нашим клиентом?')} </span>
            <button 
              onClick={handleLoginClick}
              className={styles.loginLink}
            >
              {t('login_here', 'Войдите здесь')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhoneVerificationModalDark