import classNames from 'classnames/bind'
import React from 'react'

import { NotificationIcon } from '@assets/icons'

import i18n from '../../../../../../../utils/i18n'
import styles from './notifications.module.scss'

const cx = classNames.bind(styles)

const Notifications: React.FC = () => {
  const isRussian = i18n.language === 'ru'

  return (
    <div className={cx(styles.notificationPlate)}>
      <div className={cx(styles.notificationWrapper)}>
        <NotificationIcon />
        <div
          className={cx(`${styles.notificationIcon}`, {
            'right-[-92%]': isRussian,
            'right-[100%]': !isRussian,
          })}
        >
          2
        </div>
      </div>
      {/* <Modal handleClose={() => setIsOpen(false)} isOpen={isOpen}>
			 {isDesktop && <NotificationMenu />}
			 </Modal>*/}
    </div>
  )
}

export default Notifications
