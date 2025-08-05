import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames/bind'

import { SuccessIcon } from '@assets/icons/SuccessIcon'

import styles from './paymentConfirmationModal.module.scss'

const cx = classNames.bind(styles)

interface PaymentConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
}

export const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (!isOpen) return null

  // Handle return to Personal Cabinet - Action #1
  const handleReturnToCabinet = () => {
    onClose()
    navigate('/personal-cabinet')
  }

  return (
    <div className={cx('modal-overlay')}>
      <div className={cx('modal-container')}>
        {/* Modal Header */}
        <div className={cx('modal-header')}>
          <button
            type="button"
            onClick={onClose}
            className={cx('close-button')}
            aria-label={t('close', 'Закрыть')}
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className={cx('modal-content')}>
          {/* Success Icon */}
          <div className={cx('success-icon-container')}>
            <SuccessIcon size={80} />
          </div>

          {/* Action #2: Payment Success Title */}
          <h2 className={cx('modal-title')}>
            {t('payment_success_title', 'Оплата прошла успешно.')}
          </h2>

          {/* Payment Success Description */}
          <p className={cx('modal-description')}>
            {t('payment_success_description', 
              'Теперь вам доступны названия банков и вы сможете оформить ипотеку или кредит на самых выгодных условиях.'
            )}
          </p>

          {/* Action #1: Return Button */}
          <button
            type="button"
            onClick={handleReturnToCabinet}
            className={cx('return-button')}
          >
            {t('return_to_cabinet', 'Вернуться')}
          </button>
        </div>
      </div>
    </div>
  )
} 