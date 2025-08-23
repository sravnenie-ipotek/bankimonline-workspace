import classnames from 'classnames/bind'
import React from 'react'
import { useLocation } from 'react-router'

import LoginLanguage from './LoginLanguage.tsx'
import Logo from './Logo.tsx'
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
  const isHomePage = location.pathname === '/' || location.pathname === ''
  
  // FIXED: Always show burger menu on mobile, regardless of page
  // On desktop: show on homepage or non-service pages
  const shouldShowBurger = isMobile || isHomePage || !isService

  return (
    <div style={{ width: '100%', borderBottom: '1px solid #333535' }}>
      <Container
        style={{
          display: 'flex',
          height: '94px',
          alignItems: 'center',
          maxWidth: isMobile ? '100%' : 'auto',  // MOBILE FIX: Full width on mobile
          padding: isMobile ? '0 16px' : '0 20px',  // MOBILE FIX: Adequate edge padding for burger menu
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            maxWidth: isMobile ? 'none' : '70.63rem',  // MOBILE FIX: No max width on mobile
            margin: '0 auto',
          }}
        >
          <Logo />
          <div className={cx('bottom')}>
            <LoginLanguage />
            {shouldShowBurger && (
              <button
                type="button"
                onClick={() => {
                  onOpenMobileMenu?.()
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
