import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@src/components/ui/Modal'
import StringInput from '@src/components/ui/StringInput/StringInput'
import styles from './addCardModal.module.scss'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

interface AddCardModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (cardData: CardFormData) => void
}

interface CardFormData {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
}

interface FormErrors {
  cardNumber?: string
  expiryDate?: string
  cvv?: string
  cardholderName?: string
}

export const AddCardModal: React.FC<AddCardModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { t } = useTranslation()

  const [formData, setFormData] = useState<CardFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Action #2: Card number formatting and validation
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const validateCardNumber = (cardNumber: string) => {
    const cleanNumber = cardNumber.replace(/\s/g, '')
    if (!cleanNumber) return t('card_number_required', 'Номер карты обязателен')
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return t('card_number_invalid', 'Номер карты должен содержать 13-19 цифр')
    }
    
    // Luhn algorithm validation
    let sum = 0
    let alternate = false
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let n = parseInt(cleanNumber.charAt(i), 10)
      if (alternate) {
        n *= 2
        if (n > 9) {
          n = (n % 10) + 1
        }
      }
      sum += n
      alternate = !alternate
    }
    
    if (sum % 10 !== 0) {
      return t('card_number_invalid_checksum', 'Неверный номер карты')
    }
    
    return ''
  }

  // Action #3: Expiry date formatting and validation
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const validateExpiryDate = (expiryDate: string) => {
    if (!expiryDate) return t('expiry_date_required', 'Срок действия обязателен')
    
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/
    if (!regex.test(expiryDate)) {
      return t('expiry_date_invalid_format', 'Формат: ММ/ГГ')
    }
    
    const [month, year] = expiryDate.split('/')
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear() % 100
    const currentMonth = currentDate.getMonth() + 1
    
    const expYear = parseInt(year, 10)
    const expMonth = parseInt(month, 10)
    
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return t('expiry_date_expired', 'Карта просрочена')
    }
    
    return ''
  }

  // Action #4: CVV validation
  const validateCVV = (cvv: string) => {
    if (!cvv) return t('cvv_required', 'CVV обязателен')
    if (!/^\d{3,4}$/.test(cvv)) {
      return t('cvv_invalid', 'CVV должен содержать 3-4 цифры')
    }
    return ''
  }

  // Action #5: Cardholder name validation
  const validateCardholderName = (name: string) => {
    if (!name.trim()) return t('cardholder_name_required', 'Имя владельца карты обязательно')
    if (name.trim().length < 2) {
      return t('cardholder_name_too_short', 'Имя должно содержать минимум 2 символа')
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return t('cardholder_name_invalid', 'Имя может содержать только буквы и пробелы')
    }
    return ''
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}
    
    newErrors.cardNumber = validateCardNumber(formData.cardNumber)
    newErrors.expiryDate = validateExpiryDate(formData.expiryDate)
    newErrors.cvv = validateCVV(formData.cvv)
    newErrors.cardholderName = validateCardholderName(formData.cardholderName)
    
    // Remove empty error messages
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key as keyof FormErrors]) {
        delete newErrors[key as keyof FormErrors]
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof CardFormData, value: string) => {
    let formattedValue = value
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value)
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value)
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4)
    } else if (field === 'cardholderName') {
      formattedValue = value.toUpperCase()
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleInputBlur = (field: keyof CardFormData) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }))
    
    // Validate single field on blur
    let error = ''
    if (field === 'cardNumber') {
      error = validateCardNumber(formData.cardNumber)
    } else if (field === 'expiryDate') {
      error = validateExpiryDate(formData.expiryDate)
    } else if (field === 'cvv') {
      error = validateCVV(formData.cvv)
    } else if (field === 'cardholderName') {
      error = validateCardholderName(formData.cardholderName)
    }
    
    if (error) {
      setErrors(prev => ({
        ...prev,
        [field]: error
      }))
    }
  }

  // Action #6: Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mark all fields as touched
    setTouched({
      cardNumber: true,
      expiryDate: true,
      cvv: true,
      cardholderName: true
    })
    
    if (validateForm()) {
      onSubmit(formData)
      handleClose()
    }
  }

  const handleClose = () => {
    setFormData({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    })
    setErrors({})
    setTouched({})
    onClose()
  }

  return (
    <Modal isVisible={isOpen} onCancel={handleClose} className={cx('modal-container')}>
      <div className={cx('modal-content')}>
        {/* Modal Header */}
        <div className={cx('modal-header')}>
          <h2 className={cx('modal-title')}>
            {t('add_card_title', 'Добавить карту')}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={cx('card-form')}>
          {/* Action #2: Card Number Input */}
          <div className={cx('form-field')}>
            <StringInput
              title={t('card_number', 'Номер карты')}
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={(value) => handleInputChange('cardNumber', value)}
              onBlur={() => handleInputBlur('cardNumber')}
              error={touched.cardNumber && errors.cardNumber}
              name="cardNumber"
              maxLength={19}
            />
          </div>

          {/* Actions #3 & #4: Expiry Date and CVV */}
          <div className={cx('form-row')}>
            <div className={cx('form-field', 'form-field--half')}>
              <StringInput
                title={t('expiry_date', 'Срок действия')}
                placeholder="ММ/ГГ"
                value={formData.expiryDate}
                onChange={(value) => handleInputChange('expiryDate', value)}
                onBlur={() => handleInputBlur('expiryDate')}
                error={touched.expiryDate && errors.expiryDate}
                name="expiryDate"
                maxLength={5}
              />
            </div>
            
            <div className={cx('form-field', 'form-field--half')}>
              <StringInput
                title={t('cvv', 'CVV')}
                placeholder="123"
                value={formData.cvv}
                onChange={(value) => handleInputChange('cvv', value)}
                onBlur={() => handleInputBlur('cvv')}
                error={touched.cvv && errors.cvv}
                name="cvv"
                maxLength={4}
                type="password"
              />
            </div>
          </div>

          {/* Action #5: Cardholder Name */}
          <div className={cx('form-field')}>
            <StringInput
              title={t('cardholder_name', 'Имя владельца карты')}
              placeholder={t('cardholder_name_placeholder', 'IVAN PETROV')}
              value={formData.cardholderName}
              onChange={(value) => handleInputChange('cardholderName', value)}
              onBlur={() => handleInputBlur('cardholderName')}
              error={touched.cardholderName && errors.cardholderName}
              name="cardholderName"
              maxLength={50}
            />
          </div>

          {/* Action Buttons */}
          <div className={cx('button-group')}>
            {/* Action #6: Submit Button */}
            <button
              type="submit"
              className={cx('submit-button')}
            >
              {t('add_card_submit', 'Добавить карту')}
            </button>

            {/* Action #1: Cancel Button */}
            <button
              type="button"
              className={cx('cancel-button')}
              onClick={handleClose}
            >
              {t('cancel', 'Отменить')}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default AddCardModal 