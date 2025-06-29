import classNames from 'classnames/bind'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { Outlet } from 'react-router-dom'

import Header from '@components/layout/Head/Header.tsx'
import MobileMenu from '@components/layout/Sidebar/MobileMenu/MobileMenu.tsx'
import { SidebarClosed } from '@components/layout/Sidebar/SideberClosed'
import { useToggle } from '@src/hooks/useToggle.ts'
import { usePersistentToggle } from '@src/hooks/usePersistentToggle.ts'
import { useWindowResize } from '@src/hooks/useWindowResize.ts'
import { AuthModal } from '@src/pages/AuthModal'

import Footer from './Footer/Footer'
import styles from './layout.module.scss'

const cx = classNames.bind(styles)

const Layout: React.FC = () => {
  const location = useLocation()
  const pathMap = location.pathname.split('/')
  const isService = pathMap.includes('services')
  const { i18n } = useTranslation()
  const { isOn: isOpen, toggle: toggleOpen } = usePersistentToggle('sidebar-open', false)
  const { isDesktop } = useWindowResize()
  const {
    isOn: isSubMenuOpen,
    toggle: toggleSubMenu,
    set: setSubMenu,
  } = useToggle(false)
  const {
    isOn: isBusinessSubMenuOpen,
    toggle: toggleBusinessSubMenu,
    set: setBusinessSubMenu,
  } = useToggle(false)
  const { isOn: isOpenMobileMenu, toggle: toggleMobileMenu } = useToggle(false)

  useEffect(() => {
    if (isOpenMobileMenu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [isOpenMobileMenu])

  return (
    <>
      <Header isMobile={isDesktop} onOpenMobileMenu={toggleMobileMenu} />
      {isOpen && (
        <div
          onClick={() => {
            toggleOpen()
            setSubMenu(false)
            setBusinessSubMenu(false)
          }}
          className={cx('nav_hover')}
        ></div>
      )}
      {!isService && !isDesktop && (
        <MobileMenu onClick={toggleMobileMenu} isOpen={isOpenMobileMenu} />
      )}
      {!isService && isDesktop && (
        <SidebarClosed
          onClick={toggleOpen}
          isOpen={isOpen}
          isSubMenuOpen={isSubMenuOpen}
          setSubMenu={setSubMenu}
          isBusinessSubMenuOpen={isBusinessSubMenuOpen}
          setBusinessSubMenu={setBusinessSubMenu}
          toggleSubMenu={toggleSubMenu}
          toggleBusinessSubMenu={toggleBusinessSubMenu}
        />
      )}
      <main>
        <Outlet />
      </main>
      {!isService && <Footer />}
      <AuthModal />
    </>
  )
}

export default Layout
