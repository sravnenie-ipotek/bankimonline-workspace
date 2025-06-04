import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { Link } from 'react-router-dom'

import { Logo } from '@assets/icons/Logo.tsx'
import { MenuItem } from '@layout/components/Sidebar/components'
import useMenuItemsTop from '@layout/components/Sidebar/hooks/useMenuItemsTop'
import { useAppSelector } from '@src/hooks/store'
import useRoute from '@src/hooks/useRoute'
import { RootState } from '@src/store'

import useMenuItemsBottom from './hooks/useMenuItemsBottom'
import styles from './sidebar.module.scss'

const cx = classNames.bind(styles)
const Sidebar: React.FC = () => {
  const menuItemsTop = useMenuItemsTop()
  const menuItemsBottom = useMenuItemsBottom()
  const { t } = useTranslation()
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  //получение текущего роута
  const location = useLocation()
  const pathSegments = location.pathname.split('/')
  const nowPath = '/' + pathSegments[pathSegments.length - 1]

  const { nav } = useRoute()

  return (
    <div className={cx(styles.sidebarPlate)}>
      <Link to={nav('home')} className={cx(styles.sidebarLogoPlate)}>
        <Logo />
      </Link>
      <nav
        className={cx(
          isRussian
            ? styles.sidebarPlateNavPlateLeft
            : styles.sidebarPlateNavPlateRight
        )}
      >
        {menuItemsTop.map((item, index) => (
          <MenuItem
            key={index}
            title={t(item.title)}
            path={item.path}
            icon={item.icon}
            isSelect={nowPath === item.path ? true : false}
          />
        ))}
        <div className={cx(styles.sidebarLine)}></div>
        {menuItemsBottom.map((item, index) => (
          <MenuItem
            key={index}
            title={t(item.title)}
            path={item.path}
            icon={item.icon}
            isSelect={nowPath === item.path ? true : false}
          />
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
