import React, { useState } from 'react'
import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import styles from './changeNameModal.module.scss'

const cx = classNames.bind(styles)

interface ChangeNameModalProps {
  isOpen: boolean
  onClose: () => void
  currentName?: string
  onSuccess?: (name: string) => void
}

// Close Icon
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const ChangeNameModal: React.FC<ChangeNameModalProps> = ({
  isOpen,
  onClose,
  currentName = '',
  onSuccess
}) => {
  const { t } = useTranslation()
  const [fullName, setFullName] = useState(currentName)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const validateName = (name: string): string => {
    if (!name.trim()) {
      return t('name_required', 'Имя и фамилия обязательны')
    }
    
    const nameParts = name.trim().split(/\s+/)
    if (nameParts.length < 2) {
      return t('full_name_required', 'Введите имя и фамилию')
    }
    
    // Validation for Russian version: Cyrillic and Latin
    const russianPattern = /^[а-яё\s]+$/i
    const latinPattern = /^[a-z\s]+$/i
    const hebrewPattern = /^[\u0590-\u05FF\s]+$/i
    
    // Get current language from i18n or determine by content
    const isValidRussian = russianPattern.test(name) || latinPattern.test(name)
    const isValidHebrew = hebrewPattern.test(name) || latinPattern.test(name)
    
    if (!isValidRussian && !isValidHebrew) {
      return t('invalid_name_format', 'Используйте только буквы')
    }
    
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateName(fullName)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (onSuccess) {
        onSuccess(fullName.trim())
      }
      onClose()
    } catch (error) {
      console.error('Error changing name:', error)
      setError(t('change_name_error', 'Ошибка при изменении имени'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleClose = () => {
    setFullName(currentName)
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={cx('modal-backdrop')} onClick={handleBackdropClick}>
      <div className={cx('modal-container')}>
        <div className={cx('modal-content')}>
          {/* Header */}
          <div className={cx('modal-header')}>
            <h2 className={cx('modal-title')}>
              {t('change_name_title', 'Изменить Фамилию Имя')}
            </h2>
            <button 
              className={cx('close-button')}
              onClick={handleClose}
              type="button"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={cx('modal-form')}>
            <div className={cx('input-group')}>
              <label className={cx('field-label')}>
                {t('full_name_label', 'Фамилия Имя')}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  if (error) setError('')
                }}
                className={cx('name-input', { 'error': !!error })}
                placeholder={t('enter_full_name', 'Введите Фамилию Имя')}
                required
                autoFocus
              />
              {error && (
                <div className={cx('error-message')}>
                  {error}
                </div>
              )}
            </div>

            <div className={cx('button-group')}>
              <button
                type="submit"
                className={cx('save-button')}
                disabled={!fullName.trim() || isLoading}
              >
                {isLoading ? t('loading', 'Загрузка...') : t('save', 'Сохранить')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 