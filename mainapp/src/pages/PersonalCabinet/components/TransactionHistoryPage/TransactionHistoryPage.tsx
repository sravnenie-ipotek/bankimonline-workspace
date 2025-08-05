import React, { useState } from 'react'
import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import styles from './transactionHistoryPage.module.scss'

const cx = classNames.bind(styles)

// Transaction data interface
interface Transaction {
  id: string
  service: string
  amount: string
  date: string
  time: string
  status: 'success' | 'failed'
  transactionId: string
}

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    service: 'Рассчитать ипотеку',
    amount: '1,999 ₪',
    date: '20.02.2023',
    time: '19:45',
    status: 'success',
    transactionId: '0912031200'
  },
  {
    id: '2',
    service: 'Рефинансировать Ипотеку',
    amount: '1,999 ₪',
    date: '20.02.2023',
    time: '19:45',
    status: 'failed',
    transactionId: '0912031200'
  },
  {
    id: '3',
    service: 'Рассчитать кредит',
    amount: '1,999 ₪',
    date: '20.02.2023',
    time: '19:45',
    status: 'success',
    transactionId: '0912031200'
  },
  {
    id: '4',
    service: 'Рассчитать кредит',
    amount: '1,999 ₪',
    date: '20.02.2023',
    time: '19:45',
    status: 'success',
    transactionId: '0912031200'
  }
]

// Icon components
const DownloadSimpleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1a.5.5 0 0 1 .5.5v6.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 8.293V1.5A.5.5 0 0 1 8 1z"/>
    <path d="M3 15a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6z"/>
  </svg>
)

export const TransactionHistoryPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [transactions] = useState<Transaction[]>(mockTransactions)

  const handleDownloadReceipt = (transactionId: string) => {
    // Handle receipt download
    console.log('Download receipt for transaction:', transactionId)
  }

  const getStatusText = (status: 'success' | 'failed') => {
    return status === 'success' 
      ? t('transaction_success', 'Успех')
      : t('transaction_failed', 'Провал')
  }

  const getStatusClass = (status: 'success' | 'failed') => {
    return status === 'success' ? 'status--success' : 'status--failed'
  }

  // For demo purposes, you can toggle this to test empty state
  const showEmptyState = false // Set to true to test empty state
  const displayTransactions = showEmptyState ? [] : transactions

  return (
    <div className={cx('transaction-history-page')}>
      {/* Page Title */}
      <div className={cx('page-title')}>
        <h1 className={cx('title-text')}>
          {t('payments_title', 'Платежи')}
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className={cx('tab-navigation')}>
        <button 
          className={cx('tab-button')}
          onClick={() => navigate('/payments')}
        >
          {t('cards_tab', 'Карты')}
        </button>
        <button className={cx('tab-button', 'tab-button--active')}>
          {t('transaction_history_tab', 'История транзакций')}
        </button>
      </div>

      {/* Section Title */}
      <div className={cx('section-title')}>
        <h2 className={cx('section-title-text')}>
          {t('transaction_history_title', 'История транзакций')}
        </h2>
      </div>

      {/* Transaction Table or Empty State */}
      {displayTransactions.length > 0 ? (
        <div className={cx('table-container')}>
          <table className={cx('transaction-table')}>
            {/* Table Header */}
            <thead className={cx('table-header')}>
              <tr>
                <th className={cx('header-cell', 'header-service')}>
                  {t('table_service', 'Услуга')}
                </th>
                <th className={cx('header-cell', 'header-amount')}>
                  {t('table_amount', 'Сумма')}
                </th>
                <th className={cx('header-cell', 'header-date')}>
                  {t('table_date', 'Дата')}
                </th>
                <th className={cx('header-cell', 'header-status')}>
                  {t('table_status', 'Статус')}
                </th>
                <th className={cx('header-cell', 'header-transaction-id')}>
                  {t('table_transaction_id', 'ID транзакции')}
                </th>
                <th className={cx('header-cell', 'header-actions')}>
                  {/* Actions column - no header text */}
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className={cx('table-body')}>
              {displayTransactions.map((transaction) => (
                <tr key={transaction.id} className={cx('table-row')}>
                  {/* Service */}
                  <td className={cx('table-cell', 'cell-service')}>
                    <span className={cx('service-name')}>
                      {transaction.service}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className={cx('table-cell', 'cell-amount')}>
                    <span className={cx('amount-value')}>
                      {transaction.amount}
                    </span>
                  </td>

                  {/* Date */}
                  <td className={cx('table-cell', 'cell-date')}>
                    <div className={cx('date-container')}>
                      <span className={cx('date-value')}>
                        {transaction.date}
                      </span>
                      <span className={cx('time-value')}>
                        {transaction.time}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className={cx('table-cell', 'cell-status')}>
                    <span className={cx('status', getStatusClass(transaction.status))}>
                      {getStatusText(transaction.status)}
                    </span>
                  </td>

                  {/* Transaction ID */}
                  <td className={cx('table-cell', 'cell-transaction-id')}>
                    <span className={cx('transaction-id')}>
                      {transaction.transactionId}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className={cx('table-cell', 'cell-actions')}>
                    <button
                      className={cx('download-button')}
                      onClick={() => handleDownloadReceipt(transaction.transactionId)}
                    >
                      <div className={cx('download-icon')}>
                        <DownloadSimpleIcon />
                      </div>
                      <span className={cx('download-text')}>
                        {t('download_receipt', 'Скачать чек')}
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div className={cx('empty-state-container')}>
          {/* Skeleton Table */}
          <div className={cx('table-container')}>
            <table className={cx('transaction-table')}>
              {/* Table Header */}
              <thead className={cx('table-header')}>
                <tr>
                  <th className={cx('header-cell', 'header-service')}>
                    {t('table_service', 'Услуга')}
                  </th>
                  <th className={cx('header-cell', 'header-amount')}>
                    {t('table_amount', 'Сумма')}
                  </th>
                  <th className={cx('header-cell', 'header-date')}>
                    {t('table_date', 'Дата')}
                  </th>
                  <th className={cx('header-cell', 'header-status')}>
                    {t('table_status', 'Статус')}
                  </th>
                  <th className={cx('header-cell', 'header-transaction-id')}>
                    {t('table_transaction_id', 'ID транзакции')}
                  </th>
                  <th className={cx('header-cell', 'header-actions')}>
                    {/* Actions column - no header text */}
                  </th>
                </tr>
              </thead>

              {/* Skeleton Rows */}
              <tbody className={cx('table-body')}>
                {[1, 2, 3].map((skeletonRow) => (
                  <tr key={`skeleton-${skeletonRow}`} className={cx('table-row', 'skeleton-row')}>
                    <td className={cx('table-cell')}>
                      <div className={cx('skeleton-placeholder', 'skeleton-service')} />
                    </td>
                    <td className={cx('table-cell')}>
                      <div className={cx('skeleton-placeholder', 'skeleton-amount')} />
                    </td>
                    <td className={cx('table-cell')}>
                      <div className={cx('skeleton-placeholder', 'skeleton-date')} />
                    </td>
                    <td className={cx('table-cell')}>
                      <div className={cx('skeleton-placeholder', 'skeleton-status')} />
                    </td>
                    <td className={cx('table-cell')}>
                      <div className={cx('skeleton-placeholder', 'skeleton-transaction-id')} />
                    </td>
                    <td className={cx('table-cell')}>
                      <div className={cx('skeleton-placeholder', 'skeleton-actions')} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State Message */}
          <div className={cx('empty-state-message')}>
            <h3 className={cx('empty-state-title')}>
              {t('empty_state_title', 'Здесь пока ничего нет')}
            </h3>
            <p className={cx('empty-state-description')}>
              {t('empty_state_description', 'Здесь вы сможете посмотреть историю транзакций')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 