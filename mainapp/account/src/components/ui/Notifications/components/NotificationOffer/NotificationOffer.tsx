import classNames from 'classnames/bind'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@src/components/ui/Button'
import { useAppSelector } from '@src/hooks/store'
import { RootState } from '@src/store'

import { NotificationVariant } from '../Notification/Notification'
import {
  getDate,
  getTime,
  setBankIcon,
  setIcon,
} from '../Notification/Notification'
import { BankVariant } from '../Notification/Notification'
import styles from './NotificationOffer.module.scss'

export type OfferVariant =
  | 'mortage'
  | 'mortgageRefinancing'
  | 'loan'
  | 'loanRefinancing'

export type NotificationOfferProps = {
  variant: NotificationVariant
  offer?: OfferVariant
  bankName: BankVariant | BankVariant[]
  title: string
  body: string
  pathOffer?: string
  date: Date
  isBank: boolean
  isReaded: boolean
}

const cx = classNames.bind(styles)

const NotificationOffer: FC<NotificationOfferProps> = ({
  offer,
  bankName,
  date,
}) => {
  const { t } = useTranslation()
  const { currentFont } = useAppSelector((state: RootState) => state.language)

  const setBank = (bankName: BankVariant) => {
    switch (bankName) {
      case 'hapoalim':
        return t('bank.hapoalim')
      case 'leumi':
        return t('bank.leumi')
    }
  }

  const setBankQuantityName = (quantity: number) => {
    if (quantity === 1) {
      return t('notifications.bank_1')
    }
    if (quantity > 1 && quantity < 5) {
      return t('notifications.bank_2')
    }

    return t('notifications.bank_5')
  }

  const setOffer = (offer: OfferVariant) => {
    switch (offer) {
      case 'mortage':
        return t('notifications.mortage')
      case 'mortgageRefinancing':
        return t('notifications.mortgageRefinancing')
      case 'loan':
        return t('notifications.loan')
      case 'loanRefinancing':
        return t('notifications.loanRefinancing')
    }
  }

  return (
    <div className={cx('root')}>
      {bankName[0] && (
        <>
          <div className={cx('notification_icon')}>{setIcon('success')}</div>

          <div className={cx('notifications')}>
            <div className={cx('notification_title')}>
              {t('notifications.offerTitle')}
            </div>
            <div className={cx('notification_body')}>
              <div className={cx('notification_icon_container')}>
                <span>
                  {Array.isArray(bankName) && setBankIcon(bankName[0])}
                </span>
                {!!bankName[1] && (
                  <span
                    className={cx(
                      currentFont === 'font-he'
                        ? 'notification_body_icon_rtr'
                        : 'notification_body_icon_ltr'
                    )}
                  >
                    {Array.isArray(bankName) && setBankIcon(bankName[1])}
                  </span>
                )}
                {bankName.length > 2 && (
                  <span
                    className={cx(
                      'notification_body_icon_result',
                      currentFont === 'font-he'
                        ? 'notification_body_icon_result_rtr'
                        : 'notification_body_icon_result_ltr'
                    )}
                  >
                    +{bankName.length - 2}
                  </span>
                )}
              </div>
              <div className={cx('notification_body_info')}>
                <span>{Array.isArray(bankName) && setBank(bankName[0])}</span>
                {!!bankName[1] && (
                  <span>
                    , {Array.isArray(bankName) && setBank(bankName[1])}
                  </span>
                )}
                {bankName.length > 2 && (
                  <>
                    <span> {t('notifications.and')}</span>
                    <span>
                      &nbsp;
                      {bankName.length - 2}
                      &nbsp;
                      {setBankQuantityName(bankName.length - 2)}
                    </span>
                  </>
                )}
                <span>{t('notifications.offerYou')}</span>
                <span>
                  &nbsp;
                  {!!offer && setOffer(offer)}
                </span>
              </div>
            </div>
            <Button
              variant="notification_button"
              className={'notification_button__large'}
              to={'/'}
            >
              {t('button.viewOffers')}
            </Button>
            <div className={cx('notification_date')}>
              <span>{getDate(date)}</span>
              <span>{getTime(date)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationOffer
