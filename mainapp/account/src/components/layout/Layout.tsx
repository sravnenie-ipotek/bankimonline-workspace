import classNames from 'classnames/bind'
import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'

import { Header, Sidebar } from '@layout/components'
import { useWindowResize } from '@src/hooks/useWindowResize'

import { SlideBarMobilePlate } from './components/Sidebar/components/SlideBarMobilePlate'
import styles from './layout.module.scss'

const cx = classNames.bind(styles)
const Layout: React.FC = () => {
  const { isMaketMobile } = useWindowResize()

  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)

  //управление скроллом
  useEffect(() => {
    mobileMenuVisible
      ? (document.body.style.overflow = 'hidden')
      : (document.body.style.overflow = 'auto')
  }, [mobileMenuVisible])

  //если разрешение не для мобильного сайдбара: скрываем его
  useEffect(() => {
    !isMaketMobile && setMobileMenuVisible(false)
  }, [isMaketMobile])

  return (
    <div className={cx(styles.mainPlate)}>
      {!isMaketMobile ? (
        <Sidebar />
      ) : (
        <SlideBarMobilePlate
          mobileMenuVisible={mobileMenuVisible}
          setMobileMenuVisible={setMobileMenuVisible}
        >
          <Sidebar />
        </SlideBarMobilePlate>
      )}
      <div className="flex flex-col w-full">
        <Header setMobileMenuVisible={setMobileMenuVisible} />
        <main className={cx(styles.layout)}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
