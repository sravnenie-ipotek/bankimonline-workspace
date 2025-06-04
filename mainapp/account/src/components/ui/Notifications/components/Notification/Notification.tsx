import classNames from 'classnames/bind'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { BankHapoalim } from '@assets/icons/Banks/BankHapoalim'
import { BankLeumi } from '@assets/icons/Banks/BankLeumi'
import { NotificationError } from '@assets/icons/Messages/NotificationError'
import { NotificationSuccess } from '@assets/icons/Messages/NotificationSuccess'
import { NotificationUser } from '@assets/icons/ProfileCard/NotificationUser'
import { Button } from '@src/components/ui/Button'

import styles from './Notification.module.scss'

export type NotificationVariant = 'success' | 'error' | 'info' | 'offer'
export type BankVariant = 'hapoalim' | 'leumi' | ''
export type NotificationProps = {
  variant: NotificationVariant
  bankName: BankVariant | BankVariant[]
  title: string
  body: string
  pathChat?: string
  pathError?: string
  pathOffer?: string
  date: Date
  isBank: boolean
  isReaded: boolean
}

const cx = classNames.bind(styles)

//Свитчер для иконки сообщения
export const setIcon = (variant: NotificationVariant) => {
  switch (variant) {
    case 'success':
      return <NotificationSuccess color="#46A08F" />
    case 'error':
      return <NotificationError color="#E76143" />
    case 'info':
      return <NotificationUser color="white" />
  }
}

//Свитчер для выставления иконки банка
export const setBankIcon = (bankName: BankVariant) => {
  switch (bankName) {
    case 'hapoalim':
      return <BankHapoalim />
    case 'leumi':
      return <BankLeumi />
  }
}

// Формула получения корректной даты
export const getDate = (date: Date) => {
  const day = date.getDay()
  const month = date.getMonth()
  const year = date.getFullYear()

  return `${day < 10 ? '0' + day : day}.${
    month < 10 ? '0' + month : month
  }.${year}`
}

//Формула получения корректного времени
export const getTime = (date: Date) => {
  const hours = date.getHours()
  const minutes = date.getMinutes()

  return `${hours < 10 ? '0' + hours : hours}:${
    minutes < 10 ? '0' + minutes : minutes
  }`
}

const Notification: FC<NotificationProps> = ({
  variant,
  bankName = 'hapoalim',
  title,
  body,
  pathChat,
  pathError,
  date,
  isReaded,
  isBank,
}) => {
  const { t } = useTranslation()

  //Свитчер для перевода имени банка
  const setBank = (bankName: BankVariant) => {
    switch (bankName) {
      case 'hapoalim':
        return t('bank.hapoalim')
      case 'leumi':
        return t('bank.leumi')
    }
  }

  return (
    <div className={cx('root', isReaded && 'notification_readed')}>
      <div
        className={cx('notification_icon', isReaded && 'notification_readed')}
      >
        {setIcon(variant)}
      </div>

      <div className={cx('notification', isReaded && 'notification_readed')}>
        <div className={cx('notification_title')}>
          {isBank && variant === 'error' ? (
            <>
              <div className={cx('notification_title')}>
                {!Array.isArray(bankName) && setBank(bankName)}
              </div>
              <br />
              <div className={cx('notification_title')}>{title}</div>
            </>
          ) : (
            <div className={cx('notification_title')}>{title}</div>
          )}
        </div>
        {(variant === 'success' || variant === 'info') && (
          <div className={cx('notification_body')}>{body}</div>
        )}
        {variant === 'error' && (
          <div className={cx('notification_body_error')}>
            <div>{!Array.isArray(bankName) && setBankIcon(bankName)}</div>
            <div className={cx('notification_body_error_message')}>
              {!Array.isArray(bankName) && setBank(bankName)}: {body}
            </div>
          </div>
        )}

        {(variant === 'info' || variant === 'error') && (
          <Button
            variant="notification_button"
            className={'notification_button__medium'}
            to={pathChat}
          >
            {t('button.goToChat')}
          </Button>
        )}
        {variant === 'error' && (
          <Button
            variant="notification_button"
            className={'notification_button__medium'}
            to={pathError}
          >
            {t('button.fixDocument')}
          </Button>
        )}
        <div className={cx('notification_date')}>
          <span>{getDate(date)}</span>
          <span>{getTime(date)}</span>
        </div>
      </div>
    </div>
  )
}

export default Notification
