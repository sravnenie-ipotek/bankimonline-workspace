import React from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames/bind'
import { PersonalCabinetLayout } from '../PersonalCabinetLayout/PersonalCabinetLayout'
import styles from './NotificationsPage.module.scss'

const cx = classNames.bind(styles)

export const NotificationsPage: React.FC = () => {
  const { t } = useTranslation()

  return (
    <PersonalCabinetLayout>
      <div className={cx('notifications-page')}>
        <h1>{t('notifications', 'Уведомления')}</h1>
        <div className={cx('content')}>
          <p>{t('no_notifications', 'У вас пока нет уведомлений')}</p>
        </div>
      </div>
    </PersonalCabinetLayout>
  )
}

export default NotificationsPage 