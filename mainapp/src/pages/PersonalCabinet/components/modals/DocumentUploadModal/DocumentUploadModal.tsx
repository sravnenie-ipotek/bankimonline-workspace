import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@src/components/ui/Modal'
import styles from './documentUploadModal.module.scss'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

interface DocumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (file: File) => void
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const { t } = useTranslation()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string => {
    const maxSize = 10 * 1024 * 1024 // 10MB for documents
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      return t('document_type_error', 'Поддерживаются только PDF, изображения и документы Word')
    }

    if (file.size > maxSize) {
      return t('document_size_error', 'Размер файла не должен превышать 10 МБ')
    }

    return ''
  }

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setSelectedFile(file)
    
    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl('')
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleComputerUpload = () => {
    fileInputRef.current?.click()
  }

  const handleSave = () => {
    if (selectedFile) {
      onSave(selectedFile)
      handleClose()
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setError('')
    setIsDragging(false)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    onClose()
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2"/>
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    } else if (fileType.includes('word')) {
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2"/>
          <path d="M14 2v6h6M9 13l2 2 4-4" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    } else {
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  }

  return (
    <Modal isVisible={isOpen} onCancel={handleClose} className={cx('modal-container')}>
      <div className={cx('modal-content')}>
        {/* Action 1: Modal Header with Title */}
        <div className={cx('modal-header')}>
          <h2 className={cx('modal-title')}>
            {t('upload_document_modal_title', 'Загрузите документ')}
          </h2>
          {/* Action 2: Close Button */}
          <button className={cx('close-button')} onClick={handleClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Action 3: Upload Section with Drag and Drop Area */}
        <div className={cx('upload-section')}>
          {!selectedFile ? (
            <div 
              className={cx('upload-area', { 'dragging': isDragging })}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className={cx('upload-icon')}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={cx('upload-text')}>
                <p className={cx('drag-text')}>
                  {t('drag_drop_document', 'Перетащите документ сюда')}
                </p>
                <p className={cx('or-text')}>{t('or', 'или')}</p>
                <button 
                  type="button" 
                  className={cx('computer-button')}
                  onClick={handleComputerUpload}
                >
                  {t('choose_from_computer', 'Выберите с компьютера')}
                </button>
              </div>
              <div className={cx('supported-formats')}>
                <p>{t('supported_formats', 'Поддерживаемые форматы: PDF, JPG, PNG, DOC, DOCX')}</p>
                <p>{t('max_file_size', 'Максимальный размер: 10 МБ')}</p>
              </div>
            </div>
          ) : (
            <div className={cx('preview-section')}>
              <div className={cx('preview-container')}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className={cx('preview-image')} />
                ) : (
                  <div className={cx('file-icon')}>
                    {getFileIcon(selectedFile.type)}
                  </div>
                )}
              </div>
              <div className={cx('file-info')}>
                <p className={cx('file-name')}>{selectedFile.name}</p>
                <p className={cx('file-size')}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} {t('mb', 'МБ')}
                </p>
              </div>
              <button 
                className={cx('change-file-button')}
                onClick={() => {
                  setSelectedFile(null)
                  setPreviewUrl('')
                  setError('')
                }}
              >
                {t('change_file', 'Изменить файл')}
              </button>
            </div>
          )}

          {error && (
            <div className={cx('error-message')}>
              {error}
            </div>
          )}
        </div>

        {/* Action 4: Upload Button */}
        <div className={cx('button-group')}>
          <button
            type="button"
            className={cx('upload-button')}
            disabled={!selectedFile}
            onClick={handleSave}
          >
            {t('upload_document', 'Загрузить документ')}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
      </div>
    </Modal>
  )
}

export default DocumentUploadModal 