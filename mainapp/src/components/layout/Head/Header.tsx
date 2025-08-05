import classnames from 'classnames/bind'
import React from 'react'
import { useLocation } from 'react-router'

import LoginLanguage from '@components/layout/Head/LoginLanguage.tsx'
import Logo from '@components/layout/Head/Logo.tsx'
import { Container } from '@components/ui/Container'

import styles from './Header.module.scss'

const cx = classnames.bind(styles)

interface PropsTypes {
  hasLanguage?: boolean
  isMobile?: boolean
  onOpenMobileMenu?: () => void
}

const Header: React.FC<PropsTypes> = ({ onOpenMobileMenu, isMobile }) => {
  const location = useLocation()
  const pathMap = location.pathname.split('/')
  const isService = pathMap.includes('services')

  return (
    <div style={{ width: '100%', borderBottom: '1px solid #333535' }}>
      <Container
        style={{
          display: 'flex',
          height: '94px',
          alignItems: 'center',
          maxWidth: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '70.63rem',
            margin: '0 auto',
            padding: 0,
          }}
        >
          <Logo />
          <div className={cx('bottom')}>
            <LoginLanguage />
            {!isMobile && !isService && (
              <button
                type="button"
                onClick={() => {
                  onOpenMobileMenu?.()
                  console.log('click')
                }}
                className={cx('burger')}
              >
                <span>{''}</span>
              </button>
            )}
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Header
