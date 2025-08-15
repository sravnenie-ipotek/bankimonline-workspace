import classNames from 'classnames/bind'
import React from 'react'
import { useNavigate } from 'react-router'

import { useServerMode } from '@src/hooks/useServerMode'
import styles from './Header.module.scss'

const cx = classNames.bind(styles)

// Компонент логотипа - WORKING SERVER MODE DETECTION
const Logo: React.FC = () => {
  const navigate = useNavigate()
  const { serverMode, loading } = useServerMode()

  return (
    <div className={cx('logo-container')}>
      <a className={cx('logo')} onClick={() => navigate('/')}>
        <img alt="" src="/static/primary-logo05-1.svg" className={'logo'} />
      </a>
      {/* Dynamic server mode badge */}
      {!loading && serverMode?.warning && (
        <div className={cx('server-mode-badge')}>
          <span className={cx('server-mode-text')}>
            {serverMode.mode === 'legacy' ? 'MONOREPO' : 'PACKAGES'}
          </span>
        </div>
      )}
    </div>
  )
}

export default Logo
