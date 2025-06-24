import React, { useState } from 'react'
import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'

import styles from './paymentsPage.module.scss'

const cx = classNames.bind(styles)

// Tab types
type TabType = 'cards' | 'history'

// Mock card data
interface CardData {
  id: string
  number: string
  name: string
  type: 'visa' | 'mastercard'
  selected: boolean
}

const mockCards: CardData[] = [
  {
    id: '1',
    number: '**** **** **** 2345',
    name: 'Александр Пушкин',
    type: 'visa',
    selected: true
  }
]

// Icon components
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
  </svg>
)

const DotsThreeVerticalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM8 6.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM8 11a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/>
  </svg>
)

const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
  </svg>
)

const ContactlessIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M6.5 8.5c0-1.933 1.567-3.5 3.5-3.5s3.5 1.567 3.5 3.5S11.933 12 10 12s-3.5-1.567-3.5-3.5zm1 0c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5S11.38 6 10 6s-2.5 1.12-2.5 2.5z"/>
    <path d="M4 8.5c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6zm1 0c0 2.761 2.239 5 5 5s5-2.239 5-5-2.239-5-5-5-5 2.239-5 5z"/>
  </svg>
)

export const PaymentsPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<TabType>('cards')
  const [cards, setCards] = useState<CardData[]>(mockCards)
  const [showCardMenu, setShowCardMenu] = useState<string | null>(null)

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    if (tab === 'history') {
      navigate('/payments/history')
    } else {
      navigate('/payments')
    }
  }

  const handleCardSelection = (cardId: string) => {
    setCards(cards.map(card => ({
      ...card,
      selected: card.id === cardId
    })))
  }

  const handleCardMenuToggle = (cardId: string) => {
    setShowCardMenu(showCardMenu === cardId ? null : cardId)
  }

  const handleDeleteCard = (cardId: string) => {
    setCards(cards.filter(card => card.id !== cardId))
    setShowCardMenu(null)
  }

  const handleAddCard = () => {
    // Handle add card functionality
    console.log('Add card clicked')
  }

  return (
    <div className={cx('payments-page')}>
      {/* Page Title */}
      <div className={cx('page-title')}>
        <h1 className={cx('title-text')}>
          {t('payments_title', 'Платежи')}
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className={cx('tab-navigation')}>
        <button
          className={cx('tab-button', { 'tab-button--active': activeTab === 'cards' })}
          onClick={() => handleTabChange('cards')}
        >
          {t('cards_tab', 'Карты')}
        </button>
        <button
          className={cx('tab-button', { 'tab-button--active': activeTab === 'history' })}
          onClick={() => handleTabChange('history')}
        >
          {t('transaction_history_tab', 'История транзакций')}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'cards' && (
        <div className={cx('cards-content')}>
          {/* Cards Subtitle */}
          <div className={cx('section-title')}>
            <h2 className={cx('section-title-text')}>
              {t('cards_title', 'Карты')}
            </h2>
          </div>

          {/* Cards Display */}
          <div className={cx('cards-container')}>
            {cards.map((card) => (
              <div key={card.id} className={cx('card-item')}>
                {/* Credit Card */}
                <div className={cx('credit-card')}>
                  <div className={cx('card-background')}>
                    {/* Card Content */}
                    <div className={cx('card-content')}>
                      {/* Card Number */}
                      <div className={cx('card-number')}>
                        {card.number}
                      </div>

                      {/* Card Holder Name */}
                      <div className={cx('card-holder')}>
                        {card.name}
                      </div>

                      {/* Card Brand and Contactless */}
                      <div className={cx('card-icons')}>
                        <div className={cx('card-brand')}>
                          {card.type === 'visa' && (
                            <span className={cx('visa-logo')}>VISA</span>
                          )}
                        </div>
                        <div className={cx('contactless-icon')}>
                          <ContactlessIcon />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className={cx('card-actions')}>
                  {/* Select Card Checkbox */}
                  <div className={cx('card-select')}>
                    <button
                      className={cx('select-checkbox', { 'select-checkbox--checked': card.selected })}
                      onClick={() => handleCardSelection(card.id)}
                    >
                      {card.selected && <CheckIcon />}
                    </button>
                    <span className={cx('select-label')}>
                      {t('select_card', 'Выбрать карту')}
                    </span>
                  </div>

                  {/* Card Menu */}
                  <div className={cx('card-menu-container')}>
                    <button
                      className={cx('card-menu-button')}
                      onClick={() => handleCardMenuToggle(card.id)}
                    >
                      <DotsThreeVerticalIcon />
                    </button>

                    {showCardMenu === card.id && (
                      <div className={cx('card-menu-dropdown')}>
                        <button
                          className={cx('menu-item', 'menu-item--delete')}
                          onClick={() => handleDeleteCard(card.id)}
                        >
                          {t('delete_card', 'Удалить карту')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add Card Button */}
            <div className={cx('add-card-container')}>
              <button
                className={cx('add-card-button')}
                onClick={handleAddCard}
              >
                <div className={cx('add-card-icon')}>
                  <WarningIcon />
                </div>
                <span className={cx('add-card-text')}>
                  {t('add_card', 'Добавить карту')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className={cx('history-content')}>
          {/* Transaction History will be implemented in separate component */}
          <div className={cx('history-placeholder')}>
            <p>{t('transaction_history_placeholder', 'История транзакций будет загружена здесь')}</p>
          </div>
        </div>
      )}
    </div>
  )
} 