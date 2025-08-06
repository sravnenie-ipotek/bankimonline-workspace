import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@src/components/ui/Modal'
import styles from './documentPreviewModal.module.scss'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

interface DocumentPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  document?: {
    id: string
    name: string
    type: string
    url: string
    size: number
  }
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document
}) => {
  const { t } = useTranslation()
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  const handleClose = () => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
    onClose()
  }

  // Action 1: Zoom In
  const handleZoomIn = () => {
    if (zoomLevel < 3) {
      setZoomLevel(prev => Math.min(prev + 0.25, 3))
    }
  }

  // Action 2: Zoom Out
  const handleZoomOut = () => {
    if (zoomLevel > 0.5) {
      setZoomLevel(prev => Math.max(prev - 0.25, 0.5))
    }
  }

  // Action 3: Download Document
  const handleDownload = () => {
    if (document) {
      const link = document.createElement('a')
      link.href = document.url
      link.download = document.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Action 4: Document Click for Zoom Toggle
  const handleDocumentClick = () => {
    if (zoomLevel === 1) {
      setZoomLevel(1.5)
    } else {
      setZoomLevel(1)
      setPanOffset({ x: 0, y: 0 })
    }
  }

  // Pan functionality for zoomed documents
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && zoomLevel > 1) {
      const deltaX = e.clientX - panStart.x
      const deltaY = e.clientY - panStart.y
      
      setPanOffset(prev => ({
        x: prev.x + deltaX / zoomLevel,
        y: prev.y + deltaY / zoomLevel
      }))
      
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const isImage = document?.type.startsWith('image/')
  const isPDF = document?.type === 'application/pdf'

  if (!document) return null

  return (
    <Modal isVisible={isOpen} onCancel={handleClose} className={cx('modal-container')}>
      <div className={cx('modal-content')}>
        {/* Action 5: Close Button */}
        <div className={cx('modal-header')}>
          <button
            type="button"
            className={cx('close-button')}
            onClick={handleClose}
            title={t('close', 'Закрыть')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path 
                d="M18 6L6 18M6 6l12 12" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Action 4: Document Preview Area */}
        <div 
          className={cx('document-container')}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            className={cx('document-viewer')}
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              cursor: zoomLevel > 1 ? (isPanning ? 'grabbing' : 'grab') : 'pointer'
            }}
            onClick={handleDocumentClick}
          >
            {isImage ? (
              <img 
                src={document.url} 
                alt={document.name}
                className={cx('document-image')}
                draggable={false}
              />
            ) : isPDF ? (
              <iframe
                src={document.url}
                className={cx('document-pdf')}
                title={document.name}
              />
            ) : (
              <div className={cx('document-placeholder')}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  />
                  <path 
                    d="M14 2v6h6M16 13H8M16 17H8M10 9H8" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  />
                </svg>
                <p>{document.name}</p>
                <p>{t('preview_not_available', 'Предварительный просмотр недоступен')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Control Bar */}
        <div className={cx('controls-bar')}>
          {/* Zoom Controls */}
          <div className={cx('zoom-controls')}>
            {/* Action 1: Zoom In */}
            <button
              type="button"
              className={cx('zoom-button')}
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              title={t('zoom_in', 'Увеличить')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="2"/>
                <line x1="11" y1="8" x2="11" y2="14" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>

            {/* Action 2: Zoom Out */}
            <button
              type="button"
              className={cx('zoom-button')}
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              title={t('zoom_out', 'Уменьшить')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>

          {/* Action 3: Download Button */}
          <button
            type="button"
            className={cx('download-button')}
            onClick={handleDownload}
            title={t('download', 'Скачать')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path 
                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <span>{t('download', 'Скачать')}</span>
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default DocumentPreviewModal 