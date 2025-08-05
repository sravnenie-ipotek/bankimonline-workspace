import React from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@src/components/ui/Modal'
import styles from './cardDeleteModal.module.scss'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

interface CardDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  cardNumber?: string
}

export const CardDeleteModal: React.FC<CardDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  cardNumber
}) => {
  const { t } = useTranslation()

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <Modal isVisible={isOpen} onCancel={handleCancel} className={cx('modal-container')}>
      <div className={cx('modal-content')}>
        {/* Action 3: Modal Header with Title and Card Info */}
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
            {t('delete_card_confirmation', 'Вы уверены, что хотите удалить карту?')}
          </h2>
          
          {cardNumber && (
            <p className={cx('card-number')}>
              {cardNumber}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className={cx('button-group')}>
          {/* Action 1: Confirm Delete Button */}
          <button
            type="button"
            className={cx('confirm-button')}
            onClick={handleConfirm}
          >
            {t('confirm_delete', 'Подтвердить')}
          </button>

          {/* Action 2: Cancel Button */}
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

export default CardDeleteModal 