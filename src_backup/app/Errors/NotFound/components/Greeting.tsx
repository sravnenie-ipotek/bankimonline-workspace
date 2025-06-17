import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { ErrorType } from '@src/app/Errors/NotFound/types'

import '../NotFound.module.scss'
import styles from '../NotFound.module.scss'

const cx = classNames.bind(styles)
const Greeting: React.FC<ErrorType> = ({ type }) => {
  const { t } = useTranslation()
  return (
    <div className={cx('notfound-greeting')}>
      {type === 'NOT_FOUND' && <span>{t('not_found_greeting')}</span>}
      {type === 'FALLBACK' && <span>{t('not_found_greeting')}</span>}
    </div>
  )
}

export default Greeting
