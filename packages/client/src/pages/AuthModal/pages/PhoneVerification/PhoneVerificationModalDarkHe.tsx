import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { useAppDispatch } from '@src/hooks/store'
import { setActiveModal, initializeUserData, setIsLogin } from '@src/pages/Services/slices/loginSlice'
import { useContentApi } from '@src/hooks/useContentApi'
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
  const { getContent } = useContentApi('sms_verification')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const validateName = (name: string): string | undefined => {
    // Debug log
    
    if (!name.trim()) {
      // Debug log
      return t('name_required')
    }
    if (!/^[א-ת\s]+$/.test(name)) {
      // Debug log
      return t('name_letters_only')
    }
    if (name.trim().length < 2) {
      return t('name_min_length')
    }
    // Debug log
    return undefined
  }

  const validatePhone = (phone: string): string | undefined => {
    // Debug log
    
    if (!phone.trim()) {
      return t('phone_required')
    }
    
    // Israeli phone number validation: must be +972 followed by 9 digits
    // The react-phone-input-2 returns phone in format like "972544123456"
    if (!phone.startsWith('972')) {
      // Debug log
      return t('phone_format_israel_error')
    }
    
    // Remove country code and check if we have exactly 9 more digits
    const phoneWithoutCountryCode = phone.substring(3)
    // Debug log
    
    if (phoneWithoutCountryCode.length !== 9 || !/^\d{9}$/.test(phoneWithoutCountryCode)) {
      // Debug log
      return t('phone_format_israel_error')
    }
    
    return undefined
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({ ...prev, name }))
    
    // Always validate on every keystroke for real-time validation
    const nameError = validateName(name)
    setErrors(prev => ({ ...prev, name: nameError }))
  }

  const handlePhoneChange = (phone: string) => {
    // Debug log
    setFormData(prev => ({ ...prev, phone }))
    
    // Always validate on phone change for real-time validation
    const phoneError = validatePhone(phone)
    setErrors(prev => ({ ...prev, phone: phoneError }))
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
      // Format phone number with + prefix if needed
      let phoneNumber = formData.phone
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+' + phoneNumber
      }
      
      // Create user data object matching expected structure
      const userData = {
        name: formData.name,
        nameSurname: formData.name, // Also include nameSurname for compatibility
        mobile_number: phoneNumber,
        phoneNumber: phoneNumber, // Also include phoneNumber for compatibility
        timestamp: new Date().toISOString()
      }
      
      // Save data to localStorage with USER_DATA key (same as registration flow)
      localStorage.setItem('USER_DATA', JSON.stringify(userData))
      
      // Verify localStorage save
      const savedData = localStorage.getItem('USER_DATA')
      // Update Redux state with user data
      const loginData = {
        nameSurname: formData.name,
        phoneNumber: phoneNumber
      }
      
      dispatch(initializeUserData(loginData))
      dispatch(setIsLogin()) // Mark user as logged in

      // Use onSuccess callback if provided (for mortgage flow), otherwise use default flow
      if (onSuccess) {
        onSuccess()
      } else {
        // Navigate to SMS verification (default flow)
        dispatch(setActiveModal('codeSignUp'))
      }
    } catch (error) {
      console.error('🔴 Hebrew Modal - Error saving data:', error)
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
        <button className={styles.closeButton} onClick={handleClose} aria-label={getContent('sms_modal_close', 'close')}>
          ×
        </button>

        <h2 className={styles.title}>
          {getContent('sms_modal_title', 'enter_phone_number_login')}
        </h2>
        
        <p className={styles.subtitle}>
          {getContent('sms_modal_subtitle', 'confirm_phone_number_login')}
        </p>

        <div className={styles.formContainer}>
          <div className={styles.inputGroup}>
            <input 
              type="text" 
              placeholder={getContent('sms_modal_name_placeholder', 'name_placeholder')}
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
              placeholder={getContent('sms_modal_phone_placeholder', 'phone_placeholder')}
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
            <span>{getContent('sms_modal_agreement_start', 'agreement_text_start')} </span>
            <a 
              href="#"
              onClick={(e) => { e.preventDefault(); handleUserAgreementClick(); }}
              className={styles.link}
            >
              {getContent('sms_modal_user_agreement', 'user_agreement')}
            </a>
            <span> {getContent('sms_modal_and_text', 'and')} </span>
            <a 
              href="#"
              onClick={(e) => { e.preventDefault(); handlePrivacyPolicyClick(); }}
              className={styles.link}
            >
              {getContent('sms_modal_privacy_policy', 'privacy_policy')}
            </a>
            <span>.</span>
          </div>

          <button
            type="button"
            disabled={!isFormValid}
            onClick={handleContinue}
            className={`${styles.continueButton} ${!isFormValid ? styles.continueButtonDisabled : ''}`}
          >
            {getContent('sms_modal_continue_button', 'continue')}
          </button>

          <div className={styles.loginPrompt}>
            <span>{getContent('sms_modal_already_client', 'already_client')} </span>
            <button 
              onClick={handleLoginClick}
              className={styles.loginLink}
            >
              {getContent('sms_modal_login_here', 'login_here')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhoneVerificationModalDarkHe 