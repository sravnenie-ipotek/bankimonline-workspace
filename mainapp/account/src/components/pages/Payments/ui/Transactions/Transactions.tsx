import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { NoDataTable } from '@assets/icons/NoDataTable'
import { Save } from '@assets/icons/Save'
import { Table } from '@src/components/ui/Table'
import { useAppSelector } from '@src/hooks/store'
import useTheme from '@src/hooks/useTheme'
import { useWindowResize } from '@src/hooks/useWindowResize'
import { RootState } from '@src/store'

import { MobileInfoPlate } from './mobileInfoPlate'
import styles from './transactions.module.scss'

const cx = classNames.bind(styles)

interface TransactionsProps {
  data: Record<
    string,
    {
      id: string
      service: string
      sum: number
      date: string
      status: boolean
      check?: string
    }
  >
}

function formatDate(inputDate: string) {
  const date = new Date(inputDate)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()

  return `${day}.${month}.${year}`
}

function formatTime(inputTime: string) {
  const date = new Date(inputTime)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return `${hours}:${minutes}`
}

const Transactions: React.FC<TransactionsProps> = ({ data }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const noDataIconColor = theme?.colors?.base.stroke

  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'
  const { isMobile } = useWindowResize()

  const TableData: {
    titles: string[]
    rows: React.ReactNode[][]
  } = {
    titles: isMobile
      ? [
          t('payments.transactions.service'),
          t('payments.transactions.sum'),
          t('payments.transactions.date'),
          t('payments.transactions.status'),
          '',
        ]
      : [
          t('payments.transactions.service'),
          t('payments.transactions.sum'),
          t('payments.transactions.date'),
          t('payments.transactions.status'),
          t('payments.transactions.id'),
          '',
        ],
    rows: [],
  }
  //заполнение данных таблицы
  if (data) {
    for (const transactionKey in data) {
      const transaction = data[transactionKey]
      const rowData = isMobile
        ? [
            <p
              key={0}
              className={cx(
                styles.transactionsService,
                styles.transactionsServiceBlock
              )}
            >
              {transaction.service}
            </p>,
            <p
              key={1}
              className={cx(styles.transactionsService, 'whitespace-nowrap')}
            >
              {`${transaction.sum.toLocaleString('en-US')} ₪`}
            </p>,
            <div key={2} className="flex flex-col">
              <p className={cx(styles.transactionsDate)}>
                {formatDate(transaction.date)}
              </p>
              <p className={cx(styles.transactionsTime)}>
                {formatTime(transaction.date)}
              </p>
            </div>,
            transaction.status ? (
              <p className={cx(styles.transactionsSuccess)}>
                {t('payments.transactions.success')}
              </p>
            ) : (
              <p className={cx(styles.transactionsFailed)}>
                {t('payments.transactions.failed')}
              </p>
            ),
            <div className={cx(styles.mobileTableDotsPlate)} key={5}>
              <MobileInfoPlate transaction={transaction} />
            </div>,
          ]
        : [
            <p
              key={0}
              className={cx(
                styles.transactionsService,
                styles.transactionsServiceBlock
              )}
            >
              {transaction.service}
            </p>,
            <p
              key={1}
              className={cx(styles.transactionsService, 'whitespace-nowrap')}
            >
              {`${transaction.sum.toLocaleString('en-US')} ₪`}
            </p>,
            <div key={2} className="flex flex-col">
              <p className={cx(styles.transactionsDate)}>
                {formatDate(transaction.date)}
              </p>
              <p className={cx(styles.transactionsTime)}>
                {formatTime(transaction.date)}
              </p>
            </div>,
            transaction.status ? (
              <p className={cx(styles.transactionsSuccess)}>
                {t('payments.transactions.success')}
              </p>
            ) : (
              <p className={cx(styles.transactionsFailed)}>
                {t('payments.transactions.failed')}
              </p>
            ),
            <p key={5} className={cx(styles.transactionsID)}>
              {transaction.id}
            </p>,
            transaction.check && (
              <p className={cx(styles.transactionsDownload)}>
                <div className="w-fit">
                  <Save size={20} />
                </div>
                <span className={isRussian ? 'ml-[12px]' : 'mr-[12px]'}>
                  {t('payments.transactions.download')}
                </span>
              </p>
            ),
          ]
      TableData.rows.push(rowData)
    }
  }

  return (
    <div className="w-full flex flex-col">
      {Object.keys(data).length > 0 ? (
        <>
          <p className={cx(styles.transactionsTitle)}>
            {t('payments.transactions.title')}
          </p>
          <Table data={TableData} />
        </>
      ) : (
        <>
          <p className={cx(styles.transactionsTitleNo)}>
            {t('payments.transactions.title')}
          </p>
          <div className={cx(styles.noDataPlate)}>
            <div className="flex w-full justify-center">
              <NoDataTable color={noDataIconColor} />
            </div>
            <p className={cx(styles.noDataTitle)}>
              {t('payments.transactions.nonCardTitle')}
            </p>
            <p className={cx(styles.noDataText)}>
              {t('payments.transactions.nonCardText')}
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default Transactions
