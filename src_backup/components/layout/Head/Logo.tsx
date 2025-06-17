import classNames from 'classnames/bind'
import React from 'react'
import { useNavigate } from 'react-router'

import styles from './Header.module.scss'

const cx = classNames.bind(styles)

// Компонент логотипа
const Logo: React.FC = () => {
  const navigate = useNavigate()
  return (
    <a className={cx('logo')} onClick={() => navigate('/')}>
      <img alt="" src="/static/primary-logo05-1.svg" className={'logo'} />
    </a>
  )
}

export default Logo
