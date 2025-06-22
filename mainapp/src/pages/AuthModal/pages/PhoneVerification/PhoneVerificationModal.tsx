import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { useAppDispatch } from '@src/hooks/store'
import { setActiveModal } from '@src/pages/Services/slices/loginSlice'

interface FormData {
  name: string
  phone: string
}

interface FormErrors {
  name?: string
  phone?: string
}

const PhoneVerificationModal = () => {
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
      return 'Имя и фамилия обязательны'
    }
    if (!/^[a-zA-Zа-яА-Я\u0590-\u05FF\s]+$/.test(name)) {
      return 'Используйте только буквы и пробелы'
    }
    if (name.trim().length < 2) {
      return 'Минимум 2 символа'
    }
    return undefined
  }

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) {
      return 'Номер телефона обязателен'
    }
    if (!/^\+?[\d\s-()]+$/.test(phone)) {
      return 'Введите корректный номер телефона'
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
      // Mock SMS sending
      console.log('Sending SMS to:', formData.phone)
      console.log('User data:', formData)
      
      // Save data to localStorage for development
      localStorage.setItem('phoneVerificationData', JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        timestamp: new Date().toISOString()
      }))

      // Navigate to SMS verification
      dispatch(setActiveModal('codeSignUp'))
    } catch (error) {
      console.error('Error sending SMS:', error)
    }
  }

  const handleLoginClick = () => {
    dispatch(setActiveModal('auth'))
  }

  const handleUserAgreementClick = () => {
    navigate('/terms')
  }

  const handlePrivacyPolicyClick = () => {
    navigate('/privacy-policy')
  }

  const isFormValid = !validateName(formData.name) && !validatePhone(formData.phone)

  return (
    <div style={{ padding: '32px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#161616', marginBottom: '16px' }}>
          {t('enter_phone_number_login', 'Введите свой номер телефона, чтобы получить предложения от банков')}
        </h2>
        <p style={{ fontSize: '16px', color: '#666666', lineHeight: '1.5', margin: '0' }}>
          {t('confirm_phone_number_login', 'Подтвердите свой номер телефона, чтобы мы смогли прислать SMS с решением от банков. Мы гарантируем безопасность и сохранность ваших данных.')}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <input 
            type="text" 
            placeholder="Имя Фамилия"
            value={formData.name}
            onChange={handleNameChange}
            style={{ 
              width: '100%',
              padding: '12px', 
              border: errors.name ? '1px solid #dc3545' : '1px solid #ccc', 
              borderRadius: '4px',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box'
            }} 
          />
          {errors.name && (
            <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
              {errors.name}
            </div>
          )}
        </div>
        
        <div>
          <PhoneInput
            country={'il'}
            value={formData.phone}
            onChange={handlePhoneChange}
            onlyCountries={['il', 'us', 'ru']}
            preferredCountries={['il', 'us', 'ru']}
            placeholder="Номер телефона"
            inputStyle={{
              width: '100%',
              padding: '12px 12px 12px 58px',
              border: errors.phone ? '1px solid #dc3545' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px',
              outline: 'none'
            }}
          />
          {errors.phone && (
            <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
              {errors.phone}
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={!isFormValid}
          onClick={handleContinue}
          style={{
            width: '100%',
            height: '48px',
            fontSize: '16px',
            fontWeight: '600',
            backgroundColor: isFormValid ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isFormValid ? 'pointer' : 'not-allowed',
            marginTop: '8px',
            transition: 'background-color 0.2s'
          }}
        >
          {t('continue', 'Продолжить')}
        </button>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#666666', lineHeight: '1.4', margin: '0' }}>
            Нажимая кнопку "Продолжить" я принимаю условия{' '}
            <span 
              style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}
              onClick={handleUserAgreementClick}
            >
              Пользовательского соглашения
            </span>
            {' '}и{' '}
            <span 
              style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}
              onClick={handlePrivacyPolicyClick}
            >
              Политики конфиденциальности
            </span>
          </p>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#666666' }}>
          <span>Уже являетесь нашим клиентом? </span>
          <span 
            style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer', marginLeft: '4px' }}
            onClick={handleLoginClick}
          >
            Войдите здесь
          </span>
        </div>
      </div>
    </div>
  )
}

export default PhoneVerificationModal 