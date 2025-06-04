import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { IdentificationIcon, Payment, Settings } from '@assets/icons'

import NotificationMenuItem from './NotificationInfoMenuItem/notificationMenuItem.tsx'
import styles from './notificationMenu.module.scss'

const cx = classNames.bind(styles)

const NotificationMenu: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className={cx(styles.modalContent)}>
      <div className={cx(styles.notificationMenuWrapper)}>
        <NotificationMenuItem
          icon={IdentificationIcon}
          title={t('Анкета')}
          path={'/'}
        />
        <NotificationMenuItem
          icon={Settings}
          title={t('Настройки')}
          path={'/'}
        />
        <NotificationMenuItem icon={Payment} title={t('Платежи')} path={'/'} />

        <NotificationMenuItem
          icon={IdentificationIcon}
          title={t('Анкета')}
          path={'/'}
        />
        <NotificationMenuItem
          icon={Settings}
          title={t('Настройки')}
          path={'/'}
        />
        <NotificationMenuItem icon={Payment} title={t('Платежи')} path={'/'} />
      </div>
    </div>
  )
}

export default NotificationMenu
