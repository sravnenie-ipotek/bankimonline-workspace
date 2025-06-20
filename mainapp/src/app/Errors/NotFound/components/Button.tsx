import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import styles from '../NotFound.module.scss'

const cx = classNames.bind(styles)
const Button: React.FC = () => {
  const { t } = useTranslation()
  
  // Fallback for when router context is not available
  const handleClick = () => {
    try {
      window.location.href = '/'
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }
  
  try {
    return (
      <Link to={'/'}>
        <button className={cx(`button-container`)}>
          <p>{t('not_found_back_home')}</p>
        </button>
      </Link>
    )
  } catch (error) {
    // Fallback if Link fails
    return (
      <button className={cx(`button-container`)} onClick={handleClick}>
        <p>{t('not_found_back_home')}</p>
      </button>
    )
  }
}

export default Button
