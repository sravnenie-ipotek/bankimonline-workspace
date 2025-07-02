import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'

import styles from '../NotFound.module.scss'

const cx = classNames.bind(styles)

const Button: React.FC = () => {
  const { t } = useTranslation()
  
  // Simple navigation using window.location for error pages
  const handleClick = () => {
    window.location.href = '/'
  }
  
  return (
    <button className={cx(`button-container`)} onClick={handleClick}>
      <p>{t('not_found_back_home')}</p>
    </button>
  )
}

export default Button
