import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import classNames from 'classnames/bind'
import styles from './mobileDocumentUploadPage.module.scss'

const cx = classNames.bind(styles)

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  url: string
}

export const MobileDocumentUploadPage: React.FC = () => {
  const { t } = useTranslation()
  const { uploadId } = useParams<{ uploadId: string }>()
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string => {
    const maxSize = 10 * 1024 * 1024 // 10MB
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

  // Action #1: Mobile Upload Interface
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError('')

    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Add to uploaded files
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        url: URL.createObjectURL(selectedFile)
      }
      
      setUploadedFiles(prev => [...prev, newFile])
      setSelectedFile(null)
      setPreviewUrl('')
      
      // Show success message
      alert(t('upload_success', 'Документ успешно загружен!'))
      
    } catch (err) {
      setError(t('upload_error', 'Ошибка при загрузке документа'))
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  return (
    <div className={cx('mobile-upload-page')}>
      <div className={cx('container')}>
        {/* Action #2: Page Title */}
        <div className={cx('header')}>
          <h1 className={cx('title')}>
            {t('upload_document_mobile', 'Загрузите документ')}
          </h1>
        </div>

        <div className={cx('content')}>
          {/* Action #1: Upload Interface */}
          <div className={cx('upload-section')}>
            <div 
              className={cx('upload-area')}
              onClick={handleUploadClick}
            >
              <div className={cx('upload-icon')}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className={cx('upload-text')}>
                {t('upload_from_phone', 'Загрузить из телефона')}
              </p>
            </div>
          </div>

          {/* File Preview */}
          {selectedFile && (
            <div className={cx('preview-section')}>
              <div className={cx('preview-container')}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className={cx('preview-image')} />
                ) : (
                  <div className={cx('file-icon')}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className={cx('file-info')}>
                <p className={cx('file-name')}>{selectedFile.name}</p>
                <p className={cx('file-size')}>{formatFileSize(selectedFile.size)}</p>
              </div>
              <button 
                className={cx('upload-button')}
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading 
                  ? t('uploading', 'Загружается...') 
                  : t('upload', 'Загрузить')
                }
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={cx('error-message')}>
              {error}
            </div>
          )}

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className={cx('uploaded-files')}>
              <h3 className={cx('uploaded-files-title')}>
                {t('uploaded_files', 'Загруженные файлы')}
              </h3>
              {uploadedFiles.map((file) => (
                <div key={file.id} className={cx('uploaded-file-item')}>
                  <div className={cx('file-icon')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className={cx('file-details')}>
                    <p className={cx('file-name')}>{file.name}</p>
                    <p className={cx('file-size')}>{formatFileSize(file.size)}</p>
                  </div>
                  <div className={cx('file-status')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          capture={isMobile ? "environment" : undefined}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )
} 