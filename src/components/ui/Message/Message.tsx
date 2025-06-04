import classNames from 'classnames/bind'
import React from 'react'

import { WarningCircleIcon } from '@assets/icons/WarningCircleICon'

import styles from './message.module.scss'

const cx = classNames.bind(styles)

interface PropTypes extends React.HTMLProps<HTMLDivElement> {
  children: React.ReactNode
}

const Message: React.FC<PropTypes> = ({ children, ...props }) => {
  return (
    <div className={cx('message')} {...props}>
      <div className={cx('message-icon')}>
        <WarningCircleIcon color="#FBE54D" size={18} />
      </div>
      <div className={cx('message-content')}>{children}</div>
    </div>
  )
}

export default Message
