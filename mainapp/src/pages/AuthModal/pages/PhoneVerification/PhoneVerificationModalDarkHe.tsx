import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { useAppDispatch } from '@src/hooks/store'
import { setActiveModal } from '@src/pages/Services/slices/loginSlice'
import styles from './phoneVerificationModalDarkHe.module.scss'

interface FormData {
  name: string
  phone: string
}

interface FormErrors {
  name?: string
  phone?: string
}

interface PhoneVerificationModalDarkHeProps {
  onClose?: () => void
  onSuccess?: () => void
}

const PhoneVerificationModalDarkHe: React.FC<PhoneVerificationModalDarkHeProps> = ({ onClose, onSuccess }) => {
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
      return t('name_required')
    }
    if (!/^[a-zA-Zא-ת\s]+$/.test(name)) {
      return t('name_letters_only')
    }
    if (name.trim().length < 2) {
      return t('name_min_length')
    }
    return undefined
  }

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) {
      return t('phone_required')
    }
    if (phone.length < 10) {
      return t('phone_invalid')
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
      setErrors({ phone: t('sms_send_error') })
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
    <div className={styles.modalContainer} dir="rtl">
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={handleClose} aria-label={t('close')}>
          ×
        </button>

        <h2 className={styles.title}>
          {t('enter_phone_number_login')}
        </h2>
        
        <p className={styles.subtitle}>
          {t('confirm_phone_number_login')}
        </p>

        <div className={styles.formContainer}>
          <div className={styles.inputGroup}>
            <input 
              type="text" 
              placeholder={t('name_placeholder')}
              value={formData.name}
              onChange={handleNameChange}
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              dir="rtl"
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
              placeholder={t('phone_placeholder')}
              containerClass={styles.phoneContainer}
              inputClass={`${styles.phoneInput} ${errors.phone ? styles.phoneInputError : ''}`}
              buttonClass={styles.phoneButton}
              dropdownClass={styles.phoneDropdown}
              searchClass={styles.phoneSearch}
              disableSearchIcon={true}
              enableSearch={false}
            />
            {errors.phone && (
              <div className={styles.errorMessage}>
                {errors.phone}
              </div>
            )}
          </div>

          <div className={styles.agreementText}>
            <span>{t('agreement_text_start')} </span>
            <a 
              href="#"
              onClick={(e) => { e.preventDefault(); handleUserAgreementClick(); }}
              className={styles.link}
            >
              {t('user_agreement')}
            </a>
            <span> {t('and')} </span>
            <a 
              href="#"
              onClick={(e) => { e.preventDefault(); handlePrivacyPolicyClick(); }}
              className={styles.link}
            >
              {t('privacy_policy')}
            </a>
            <span>.</span>
          </div>

          <button
            type="button"
            disabled={!isFormValid}
            onClick={handleContinue}
            className={`${styles.continueButton} ${!isFormValid ? styles.continueButtonDisabled : ''}`}
          >
            {t('continue')}
          </button>

          <div className={styles.loginPrompt}>
            <span>{t('already_client')} </span>
            <button 
              onClick={handleLoginClick}
              className={styles.loginLink}
            >
              {t('login_here')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhoneVerificationModalDarkHe 