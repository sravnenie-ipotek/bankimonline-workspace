import classNames from 'classnames/bind'
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { useTranslation } from 'react-i18next'

import { Button } from '@components/ui/ButtonUI'
import { useContentApi } from '@hooks/useContentApi'

import styles from './skipCookie.module.scss'

const cx = classNames.bind(styles)

type SkipCookieProps = {
  onAccept?: () => void    // Действие #13: Accept cookies
  onClose?: () => void     // Действие #18: Close cookies
  onInfo?: () => void      // Действие #24: Cookie info (if needed)
}

const SkipCookie: React.FC<SkipCookieProps> = ({ onAccept, onClose, onInfo }) => {
  const { t } = useTranslation()
  const { getContent } = useContentApi('global_components')
  const [isCookieVisible, setCookieVisible] = useState(false)

  // при загрузке проверяет соглашен ли пользователь с куками
  useEffect(() => {
    const cookieValue = localStorage.getItem('cookie')
    if (cookieValue === '1') {
      setCookieVisible(false)
    } else {
      setCookieVisible(true)
    }
  }, [])

  // скрывает уведомление о куках
  const handleSkipCookie = () => {
    if (onClose) {
      onClose() // Call parent callback (Действие #18)
    }
    setCookieVisible(false)
  }

  // соглашается с куками
  const handleCookie = () => {
    if (onAccept) {
      onAccept() // Call parent callback (Действие #13)
    }
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
        <div className={cx('cookie-text')}>
          <span>
            {getContent('shared_component_cookie_message', 'cookie_message')}
          </span>
          <span 
            className={cx('cookie-learn-more')}
            onClick={onInfo}
            style={{ cursor: 'pointer', textDecoration: 'underline', color: '#F5D547' }}
          >
            {getContent('shared_component_cookie_learn_more_link', 'cookie_learn_more')}
          </span>
        </div>
        <span className={cx('accept_btn')}>
          <Button
            variant={'primary'}
            size={'medium'}
            className={cx('cookie_accept')}
            onClick={handleCookie}
          >
            {getContent('shared_component_cookie_accept_button', 'cookie_accept')}
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
