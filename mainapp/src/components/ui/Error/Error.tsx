import classNames from 'classnames/bind'
import React from 'react'

import { WarningOctagonIcon } from '@assets/icons/warningOctagonIcon'

import styles from './error.module.scss'

const cx = classNames.bind(styles)

type TypeProps = {
  error?: boolean | string
}
const Error: React.FC<TypeProps> = ({ error }) => {
  return (
    <div className={cx('error')}>
      <WarningOctagonIcon />
      <p className={cx('error-title')}>
        {typeof error === 'string' ? error : 'An error occurred'}
      </p>
    </div>
  )
}

export default Error
