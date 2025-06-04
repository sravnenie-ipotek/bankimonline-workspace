import classNames from 'classnames/bind'
import { FC } from 'react'

import { Bell } from '@assets/icons/Bell'

import styles from './NotificationIndicator.module.scss'

const cx = classNames.bind(styles)

type NotificationIndicatorProps = {
  value: number | undefined
}

const NotificationIndicator: FC<NotificationIndicatorProps> = ({ value }) => {
  return (
    <div className={cx('root')}>
      <Bell size={24} />
      {!!value && (
        <div className={cx('label')}>
          <span className={cx('label_value')}>{value}</span>
        </div>
      )}
    </div>
  )
}

export default NotificationIndicator
