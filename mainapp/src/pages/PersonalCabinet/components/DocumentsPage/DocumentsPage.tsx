import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames/bind'

import { PersonalCabinetLayout } from '../PersonalCabinetLayout/PersonalCabinetLayout'
import { DocumentUploadModal } from '../modals/DocumentUploadModal/DocumentUploadModal'
import { DocumentDeleteModal } from '../modals/DocumentDeleteModal/DocumentDeleteModal'
import { DocumentPreviewModal } from '../modals/DocumentPreviewModal/DocumentPreviewModal'
import { QRCodeUploadModal } from '../modals/QRCodeUploadModal/QRCodeUploadModal'
import { Button } from '@src/components/ui/ButtonUI'
import { Document } from '@src/assets/icons/Document'

import styles from './DocumentsPage.module.scss'

const cx = classNames.bind(styles)

interface UploadedDocument {
  id: string
  name: string
  type: string
  size: number
  uploadDate: Date
  url?: string
}

interface DocumentsPageProps {
  userName?: string
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ 
  userName = "דוד כהן" 
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<UploadedDocument | null>(null)
  const [documentToPreview, setDocumentToPreview] = useState<UploadedDocument | null>(null)
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([
    // Sample documents for demonstration
    {
      id: '1',
      name: 'Паспорт.pdf',
      type: 'application/pdf',
      size: 1024000,
      uploadDate: new Date('2024-01-15'),
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: '2',
      name: 'Справка о доходах.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 512000,
      uploadDate: new Date('2024-01-16'),
      url: 'https://file-examples.com/storage/fe68c9fa7b66d447a9c13c1/2017/10/file_example_DOC_100kB.doc'
    },
    {
      id: '3',
      name: 'Фото документа.jpg',
      type: 'image/jpeg',
      size: 256000,
      uploadDate: new Date('2024-01-17'),
      url: 'https://via.placeholder.com/800x600/2a2b31/ffffff?text=Sample+Document'
    }
  ])

  const handleOpenUploadModal = () => {
    setIsUploadModalOpen(true)
  }

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false)
  }

  const handleDocumentUpload = (file: File) => {
    console.log('Document uploaded:', file)
    
    // Add new document to the list
    const newDocument: UploadedDocument = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadDate: new Date(),
      url: URL.createObjectURL(file)
    }
    
    setUploadedDocuments(prev => [...prev, newDocument])
    setIsUploadModalOpen(false)
  }

  const handleDeleteDocument = (document: UploadedDocument) => {
    setDocumentToDelete(document)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (documentToDelete) {
      setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentToDelete.id))
      setDocumentToDelete(null)
    }
    setIsDeleteModalOpen(false)
  }

  const handleCancelDelete = () => {
    setDocumentToDelete(null)
    setIsDeleteModalOpen(false)
  }

  const handlePreviewDocument = (document: UploadedDocument) => {
    setDocumentToPreview(document)
    setIsPreviewModalOpen(true)
  }

  const handleClosePreview = () => {
    setDocumentToPreview(null)
    setIsPreviewModalOpen(false)
  }

  const handleOpenQRCodeModal = () => {
    setIsQRCodeModalOpen(true)
  }

  const handleCloseQRCodeModal = () => {
    setIsQRCodeModalOpen(false)
  }

  const handleQRCodeBack = () => {
    setIsQRCodeModalOpen(false)
    // Navigate back to documents page (current page)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleBack = () => {
    navigate('/personal-cabinet/credit-history')
  }

  const handleContinue = () => {
    // Navigate to next step after LK-131
    navigate('/personal-cabinet/programs')
  }

  return (
    <div className={cx('documents-page')}>
      <PersonalCabinetLayout>
        <div className={cx('content')}>
          <div className={cx('header')}>
            <h1 className={cx('user-name')}>{userName}</h1>
            <button 
              className={cx('back-to-cabinet')}
              onClick={() => navigate('/personal-cabinet')}
            >
              {t('back_to_personal_cabinet', 'Вернуться в личный кабинет')}
            </button>
          </div>

          <div className={cx('documents-container')}>
            <div className={cx('documents-header')}>
              <h2 className={cx('documents-title')}>
                {t('upload_documents', 'Загрузите документы')}
              </h2>
              <p className={cx('documents-subtitle')}>
                {t('upload_documents_subtitle', 'Загрузите необходимые документы для обработки вашей заявки')}
              </p>
            </div>

            <div className={cx('upload-section')}>
              <div className={cx('upload-card')}>
                <div className={cx('upload-icon')}>
                  <Document size={48} color="var(--lk-accent-primary)" />
                </div>
                <h3 className={cx('upload-title')}>
                  {t('upload_documents_title', 'Загрузить документы')}
                </h3>
                <p className={cx('upload-description')}>
                  {t('upload_documents_description', 'Выберите и загрузите необходимые документы')}
                </p>
                <div className={cx('upload-buttons')}>
                  <Button
                    variant="primary"
                    size="medium"
                    onClick={handleOpenUploadModal}
                    className={cx('upload-button')}
                  >
                    {t('upload_documents', 'Загрузите документы')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="medium"
                    onClick={handleOpenQRCodeModal}
                    className={cx('qr-button')}
                  >
                    {t('upload_via_qr', 'QR-код для мобильного')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Uploaded Documents List */}
            {uploadedDocuments.length > 0 && (
              <div className={cx('documents-list')}>
                <h3 className={cx('documents-list-title')}>
                  {t('uploaded_documents', 'Загруженные документы')}
                </h3>
                <div className={cx('documents-grid')}>
                  {uploadedDocuments.map((document) => (
                    <div key={document.id} className={cx('document-item')}>
                      <div className={cx('document-info')}>
                        <div className={cx('document-icon')}>
                          <Document size={24} color="var(--lk-accent-primary)" />
                        </div>
                        <div className={cx('document-details')}>
                          <p className={cx('document-name')}>{document.name}</p>
                          <p className={cx('document-meta')}>
                            {formatFileSize(document.size)} • {document.uploadDate.toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      <div className={cx('document-actions')}>
                        <button
                          className={cx('preview-button')}
                          onClick={() => handlePreviewDocument(document)}
                          title={t('preview_document', 'Просмотреть документ')}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path 
                              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" 
                              stroke="currentColor" 
                              strokeWidth="2"
                            />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                        <button
                          className={cx('delete-button')}
                          onClick={() => handleDeleteDocument(document)}
                          title={t('delete_document', 'Удалить документ')}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path 
                              d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={cx('navigation-buttons')}>
              <Button
                variant="secondary"
                size="medium"
                onClick={handleBack}
                className={cx('back-button')}
              >
                {t('button_back', 'Назад')}
              </Button>

              <Button
                variant="primary"
                size="medium"
                onClick={handleContinue}
                className={cx('continue-button')}
              >
                {t('button_continue', 'Продолжить')}
              </Button>
            </div>
          </div>
        </div>
      </PersonalCabinetLayout>

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={handleCloseUploadModal}
        onSave={handleDocumentUpload}
      />

      <DocumentDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        documentName={documentToDelete?.name}
      />

      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={handleClosePreview}
        document={documentToPreview ? {
          id: documentToPreview.id,
          name: documentToPreview.name,
          type: documentToPreview.type,
          url: documentToPreview.url || '',
          size: documentToPreview.size
        } : undefined}
      />

      <QRCodeUploadModal
        isOpen={isQRCodeModalOpen}
        onClose={handleCloseQRCodeModal}
        onBack={handleQRCodeBack}
      />
    </div>
  )
}

export default DocumentsPage 