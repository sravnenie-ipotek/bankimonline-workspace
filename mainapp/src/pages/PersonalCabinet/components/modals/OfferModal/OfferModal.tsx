import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames/bind'

import styles from './offerModal.module.scss'

const cx = classNames.bind(styles)

interface OfferModalProps {
  isOpen: boolean
  onClose: () => void
  amount?: number
}

export const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  onClose,
  amount = 1999
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (!isOpen) return null

  // Action #1: Close modal - navigates to Program Selection page #34
  const handleClose = () => {
    onClose()
    navigate('/services') // Program Selection page
  }

  // Action #4: Pay button - navigates to Payment page #36
  const handlePay = () => {
    onClose()
    // Open PaymentModal instead of navigating
    // This will be handled by PersonalCabinet modal management
    navigate('/personal-cabinet', { 
      state: { showPaymentModal: true, paymentAmount: amount }
    })
  }

  // Action #5: Back button - navigates to Documents page #31
  const handleBack = () => {
    onClose()
    // Navigate to Documents page (would be part of Services flow)
    navigate('/services/documents')
  }

  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  return (
    <div className={cx('modal-overlay')} onClick={handleBackdropClick}>
      <div className={cx('modal-container')}>
        {/* Action #1: Close Button */}
        <div className={cx('modal-header')}>
          <button
            type="button"
            onClick={handleClose}
            className={cx('close-button')}
            aria-label={t('close', 'Закрыть')}
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className={cx('modal-content')}>
          {/* Action #6: Modal Title */}
          <h2 className={cx('modal-title')}>
            {t('offer_modal_title', 'Лучшие предложение от всех банков')}
          </h2>

          {/* Action #6: Motivational Text */}
          <p className={cx('modal-description')}>
            {t('offer_modal_description', 
              'Получите доступ к персональным предложениям от ведущих банков Израиля. Сравните условия и выберите лучший вариант для себя.'
            )}
          </p>

          {/* Action #2: Service Price Display */}
          <div className={cx('price-container')}>
            <div className={cx('price-label')}>
              {t('offer_price_label', 'Всего за')}
            </div>
            <div className={cx('price-amount')}>
              {amount.toLocaleString()} ₪
            </div>
          </div>

          {/* Action #3: Our Offer to Client */}
          <div className={cx('offer-highlights')}>
            <div className={cx('offer-item')}>
              <span className={cx('offer-icon')}>✓</span>
              <span>{t('offer_highlight_1', 'Персональные предложения от 15+ банков')}</span>
            </div>
            <div className={cx('offer-item')}>
              <span className={cx('offer-icon')}>✓</span>
              <span>{t('offer_highlight_2', 'Сравнение условий в реальном времени')}</span>
            </div>
            <div className={cx('offer-item')}>
              <span className={cx('offer-icon')}>✓</span>
              <span>{t('offer_highlight_3', 'Экономия до 50,000 ₪ на процентах')}</span>
            </div>
            <div className={cx('offer-item')}>
              <span className={cx('offer-icon')}>✓</span>
              <span>{t('offer_highlight_4', 'Гарантия лучшей ставки')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={cx('modal-actions')}>
            {/* Action #5: Back Button */}
            <button
              type="button"
              onClick={handleBack}
              className={cx('back-button')}
            >
              {t('back', 'Назад')}
            </button>

            {/* Action #4: Pay Button */}
            <button
              type="button"
              onClick={handlePay}
              className={cx('pay-button')}
            >
              {t('pay_button', 'Заплатить')}
            </button>
          </div>
        </div>

        {/* Background Blur Effect - Shows blurred bank offers behind */}
        <div className={cx('background-blur')}>
          <div className={cx('blur-overlay')}></div>
        </div>
      </div>
    </div>
  )
} 