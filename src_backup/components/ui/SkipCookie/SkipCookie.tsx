import classNames from 'classnames/bind'
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { useTranslation } from 'react-i18next'

import { Button } from '@components/ui/ButtonUI'

import styles from './skipCookie.module.scss'

const cx = classNames.bind(styles)
const SkipCookie: React.FC = () => {
  const { t } = useTranslation()
  const [isCookieVisible, setCookieVisible] = useState(false)

  // при загрузке проверяет соглашен ли пользователь с куками
  useEffect(() => {
    const cookieValue = localStorage.getItem('cookie')
    console.log(cookieValue)
    if (cookieValue === '1') {
      setCookieVisible(false)
    } else {
      setCookieVisible(true)
    }
  }, [])

  // скрывает уведомление о куках
  const handleSkipCookie = () => {
    setCookieVisible(false)
  }

  // соглашается с куками
  const handleCookie = () => {
    setCookieVisible(false)
    localStorage.setItem('cookie', '1')
  }

  if (!isCookieVisible) {
    return null
  }

  const cookieElement = (
    <div className={cx('cookie-holder')}>
      <div className={cx('cookie')}>
        <img src="/static/cookie.svg" width="52" height="52" alt="" />
        <span className={cx('cookie-text')}>{t('cookie')}</span>
        <span className={cx('accept_btn')}>
          <Button
            variant={'primary'}
            size={'medium'}
            className={cx('cookie_accept')}
            onClick={handleCookie}
          >
            {t('accept_cookie')}
          </Button>
        </span>
        <span>
          <img
            src="/static/x.svg"
            width="32"
            height="32"
            className={cx('cookie-close')}
            style={{ cursor: 'pointer' }}
            onClick={handleSkipCookie}
            alt=""
          />
        </span>
      </div>
    </div>
  )

  return ReactDOM.createPortal(cookieElement, document.body)
}

export default SkipCookie
