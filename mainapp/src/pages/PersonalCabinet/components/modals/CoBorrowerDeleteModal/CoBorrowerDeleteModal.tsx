import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@src/components/ui/Modal'
import styles from './coBorrowerDeleteModal.module.scss'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

interface CoBorrowerDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  coBorrowerName?: string
}

export const CoBorrowerDeleteModal: React.FC<CoBorrowerDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  coBorrowerName
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleConfirm = () => {
    // Action #2 - Confirm deletion
    onConfirm()
    onClose()
    // Navigate to page #43 (main questionnaire/anketa)
    navigate('/personal-cabinet')
  }

  const handleCancel = () => {
    // Action #3 - Cancel deletion
    onClose()
  }

  return (
    <Modal isVisible={isOpen} onCancel={handleCancel} className={cx('modal-container')}>
      <div className={cx('modal-content')}>
        {/* Action #1: Modal Header with Title */}
        <div className={cx('modal-header')}>
          <div className={cx('icon-container')}>
            <div className={cx('icon-circle')}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className={cx('delete-icon')}>
                <path 
                  d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          
          <h2 className={cx('modal-title')}>
            {t('delete_co_borrower_confirmation', 'Вы уверены, что хотите удалить созаемщика?')}
          </h2>
          
          {coBorrowerName && (
            <p className={cx('co-borrower-name')}>
              {coBorrowerName}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className={cx('button-group')}>
          {/* Action #2: Confirm Button */}
          <button
            type="button"
            className={cx('confirm-button')}
            onClick={handleConfirm}
          >
            {t('confirm', 'Подтвердить')}
          </button>

          {/* Action #3: Cancel Button */}
          <button
            type="button"
            className={cx('cancel-button')}
            onClick={handleCancel}
          >
            {t('cancel', 'Отменить')}
          </button>
        </div>
      </div>
    </Modal>
  )
} 