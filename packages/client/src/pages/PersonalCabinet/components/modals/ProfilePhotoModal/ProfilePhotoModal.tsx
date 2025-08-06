import React, { useState } from 'react'
import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import styles from './profilePhotoModal.module.scss'

const cx = classNames.bind(styles)

interface ProfilePhotoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (photo: File) => void
}

// Close Icon
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (onSuccess) {
        onSuccess(selectedFile)
      }
      onClose()
    } catch (error) {
      console.error('Error uploading photo:', error)
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
          {/* Header */}
          <div className={cx('modal-header')}>
            <h2 className={cx('modal-title')}>
              {t('upload_profile_photo', 'Загрузить фото профиля')}
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
            <div className={cx('upload-section')}>
              {previewUrl ? (
                <div className={cx('preview-container')}>
                  <img src={previewUrl} alt="Preview" className={cx('preview-image')} />
                </div>
              ) : (
                <div className={cx('upload-placeholder')}>
                  <span>{t('no_photo_selected', 'Фото не выбрано')}</span>
                </div>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className={cx('file-input')}
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className={cx('upload-button')}>
                {t('select_photo', 'Выбрать фото')}
              </label>
            </div>

            <div className={cx('button-group')}>
              <button
                type="submit"
                className={cx('continue-button')}
                disabled={!selectedFile || isLoading}
              >
                {isLoading ? t('loading', 'Загрузка...') : t('upload', 'Загрузить')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 