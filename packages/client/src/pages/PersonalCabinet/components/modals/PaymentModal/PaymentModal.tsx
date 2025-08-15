import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames/bind'

import styles from './paymentModal.module.scss'

const cx = classNames.bind(styles)

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount?: number
}

interface CardData {
  id: string
  number: string
  name: string
  type: 'visa' | 'mastercard'
  selected: boolean
}

// Mock card data - in real app would come from PaymentsPage state
const mockCards: CardData[] = [
  {
    id: '1',
    number: '**** **** **** 2345',
    name: 'Срок действия: 14/28',
    type: 'visa',
    selected: true
  }
]

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount = 1999
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  const [selectedCard, setSelectedCard] = useState<string>('1')
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [showAddCardModal, setShowAddCardModal] = useState(false)

  if (!isOpen) return null

  // Handle payment submission - Action #6
  const handlePayment = () => {
    if (!selectedCard || !privacyAgreed || !termsAgreed) {
      return
    }

    // Process payment (mock)
    // Close modal and navigate to payment confirmation
    onClose()
    navigate('/personal-cabinet', { 
      state: { showPaymentConfirmation: true } 
    })
  }

  // Handle add card - Action #3
  const handleAddCard = () => {
    setShowAddCardModal(true)
  }

  // Handle back - Action #7
  const handleBack = () => {
    onClose()
  }

  // Handle privacy policy link
  const handlePrivacyPolicyClick = () => {
    navigate('/privacy-policy')
  }

  // Handle terms link
  const handleTermsClick = () => {
    navigate('/terms')
  }

  const isFormValid = selectedCard && privacyAgreed && termsAgreed

  return (
    <div className={cx('modal-overlay')}>
      <div className={cx('modal-container')}>
        {/* Action #1: Close Button */}
        <div className={cx('modal-header')}>
          <h2 className={cx('modal-title')}>
            {t('payment_modal_title', 'Оплата')}
          </h2>
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
          {/* Payment Description */}
          <p className={cx('payment-description')}>
            {t('payment_description', 'Оплатите услуги Bankinonline и получайте лучшие индивидуальные предложения от банков.')}
          </p>

          {/* Action #2: Payment Method Selection */}
          <div className={cx('payment-method-section')}>
            <h3 className={cx('section-title')}>
              {t('payment_method_title', 'Метод оплаты')}
            </h3>

            <div className={cx('card-selection')}>
              {mockCards.map((card) => (
                <div key={card.id} className={cx('card-option')}>
                  <div 
                    className={cx('card-container', { 'card-container--selected': selectedCard === card.id })}
                    onClick={() => setSelectedCard(card.id)}
                  >
                    {/* Visa Logo */}
                    <div className={cx('visa-logo')}>
                      <span>VISA</span>
                    </div>

                    {/* Card Info */}
                    <div className={cx('card-info')}>
                      <div className={cx('card-number')}>{card.number}</div>
                      <div className={cx('card-expiry')}>{card.name}</div>
                    </div>

                    {/* Selection Indicator */}
                    <div className={cx('selection-indicator', { 'selection-indicator--selected': selectedCard === card.id })}>
                      {selectedCard === card.id && (
                        <div className={cx('checkmark')}>✓</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Action #3: Add Card Button */}
              <button
                type="button"
                onClick={handleAddCard}
                className={cx('add-card-button')}
              >
                <span className={cx('plus-icon')}>+</span>
                {t('add_card', 'Добавить карту')}
              </button>
            </div>
          </div>

          {/* Agreement Checkboxes */}
          <div className={cx('agreement-section')}>
            {/* Action #4: Privacy Policy Agreement */}
            <div className={cx('checkbox-group')}>
              <label className={cx('checkbox-label')}>
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  className={cx('checkbox-input')}
                />
                <span className={cx('checkbox-custom')}></span>
                <span className={cx('checkbox-text')}>
                  {t('privacy_agreement_start', 'Я согласен с условиями обработки и использования моих персональных данных, определенными')}{' '}
                  <span 
                    className={cx('agreement-link')}
                    onClick={handlePrivacyPolicyClick}
                  >
                    {t('privacy_policy', 'Политикой конфиденциальности')}
                  </span>
                </span>
              </label>
            </div>

            {/* Action #5: Terms Agreement */}
            <div className={cx('checkbox-group')}>
              <label className={cx('checkbox-label')}>
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className={cx('checkbox-input')}
                />
                <span className={cx('checkbox-custom')}></span>
                <span className={cx('checkbox-text')}>
                  {t('terms_agreement_text', 'Мне известно, что если я предоставил неверные и / или ошибочные данные, а также данные, которые невозможно подтвердить соответствующими документами, у банка есть полное право отозвать сделанное ранее предложение по ипотечной или кредитной программе.')}
                </span>
              </label>
            </div>
          </div>

          {/* Payment Total */}
          <div className={cx('payment-total')}>
            <span className={cx('total-label')}>
              {t('total_payment', 'Итого к оплате')}
            </span>
            <span className={cx('total-amount')}>
              {amount.toLocaleString('ru-RU')} ₪
            </span>
          </div>

          {/* Action Buttons */}
          <div className={cx('button-group')}>
            {/* Action #7: Back Button */}
            <button
              type="button"
              onClick={handleBack}
              className={cx('back-button')}
            >
              {t('button_back', 'Назад')}
            </button>

            {/* Action #6: Payment Button */}
            <button
              type="button"
              onClick={handlePayment}
              disabled={!isFormValid}
              className={cx('payment-button', { 'payment-button--disabled': !isFormValid })}
            >
              {t('payment_button', 'Оплатить')} {amount.toLocaleString('ru-RU')} ₪
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 