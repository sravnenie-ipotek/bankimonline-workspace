import React from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'react-qr-code'
import { Modal } from '@src/components/ui/Modal'
import styles from './qrCodeUploadModal.module.scss'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

interface QRCodeUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onBack: () => void
}

export const QRCodeUploadModal: React.FC<QRCodeUploadModalProps> = ({
  isOpen,
  onClose,
  onBack
}) => {
  const { t } = useTranslation()

  // Generate unique URL for mobile document upload
  // In production, this would come from backend API
  const uploadUrl = `${window.location.origin}/mobile-upload/${Date.now()}`

  return (
    <Modal isVisible={isOpen} onCancel={onClose} className={cx('modal-container')}>
      <div className={cx('modal-content')}>
        {/* Action #5: Close Button */}
        <div className={cx('modal-header')}>
          <button className={cx('close-button')} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className={cx('modal-body')}>
          {/* Action #4: Modal Title */}
          <h2 className={cx('modal-title')}>
            {t('qr_upload_title', 'Сканируйте QR, чтобы загрузить фото через телефона')}
          </h2>

          {/* Action #3: Description Text */}
          <p className={cx('modal-description')}>
            {t('qr_upload_description', 'Отсканируйте этот QR-код, чтобы загрузить фото через мобильное устройство')}
          </p>

          {/* Action #1: QR Code Display */}
          <div className={cx('qr-code-container')}>
            <div className={cx('qr-code-wrapper')}>
              <QRCode
                value={uploadUrl}
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox="0 0 256 256"
                bgColor="#ffffff"
                fgColor="#000000"
                level="M"
              />
            </div>
          </div>

          {/* Action #2: Back Button */}
          <div className={cx('button-group')}>
            <button
              type="button"
              className={cx('back-button')}
              onClick={onBack}
            >
              {t('back', 'Назад')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
} 