import classNames from 'classnames/bind'
import React from 'react'

import { WarningCircleIcon } from '../../../assets/icons/WarningCircleICon'
import styles from './alertWarning.module.scss'

const cx = classNames.bind(styles)

type TypeProps = {
  text?: string
  filled?: boolean
  icon?: React.ReactNode
  children?: React.ReactNode
}
const AlertWarning: React.FC<TypeProps> = ({
  children,
  filled,
  icon,
  text,
}: TypeProps) => {
  return (
    <div className={cx('alert-warning', { filled: filled })}>
      <div className={cx('alert-warning__icon')}>
        {icon ? icon : <WarningCircleIcon />}
      </div>
      <span className={cx('alert-warning__text')}>
        {children ? children : text}
      </span>
    </div>
  )
}

export default AlertWarning
