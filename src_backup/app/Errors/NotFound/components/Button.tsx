import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import styles from '../NotFound.module.scss'

const cx = classNames.bind(styles)
const Button: React.FC = () => {
  const { t } = useTranslation()
  return (
    <Link to={'/'}>
      <button className={cx(`button-container`)}>
        <p>{t('not_found_back_home')}</p>
      </button>
    </Link>
  )
}

export default Button
