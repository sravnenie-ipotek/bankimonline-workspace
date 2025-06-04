import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import SocialMedia from '@components/layout/Sidebar/SocialMedia/SocialMedia.tsx'
import SubSidebar from '@components/layout/Sidebar/SubSidebar/SubSidebar.tsx'
import {
  useBusinessMenuItems,
  useMenuItems,
} from '@components/layout/Sidebar/hooks/sidebar.ts'
import {
  useBusinessSubMenuItems,
  useSubMenuItems,
} from '@components/layout/Sidebar/hooks/subMenu.ts'

import styles from './sidebarClose.module.scss'

const cx = classNames.bind(styles)

interface PropTypes {
  onClick: () => void
  isOpen: boolean
  isSubMenuOpen?: boolean
  isBusinessSubMenuOpen?: boolean
  setSubMenu?: (state: boolean) => void
  setBusinessSubMenu?: (state: boolean) => void
  toggleSubMenu?: () => void
  toggleBusinessSubMenu?: () => void
}

const SidebarClosed: React.FC<PropTypes> = ({
  onClick,
  isOpen,
  isSubMenuOpen,
  setBusinessSubMenu,
  setSubMenu,
  isBusinessSubMenuOpen,
  toggleBusinessSubMenu,
  toggleSubMenu,
}) => {
  const menuItems = useMenuItems()
  const menuBusinessItems = useBusinessMenuItems()

  const { t } = useTranslation()
  const subMenuItems = useSubMenuItems()
  const businessSubMenuItems = useBusinessSubMenuItems()
  const isSubMenusOpen = isSubMenuOpen || isBusinessSubMenuOpen

  const handleCloseMenus = () => {
    onClick()
    setSubMenu?.(false)
    setBusinessSubMenu?.(false)
  }

  return (
    <>
      <div className={cx('nav_container', { nav_container_expanded: isOpen })}>
        <div className={cx('whiteLine')}></div>
        {!isSubMenusOpen && (
          <div
            className={cx('box', { box_expanded: isOpen })}
            onClick={handleCloseMenus}
          >
            <button
              type="button"
              className={cx('burger_icon', {
                burger_icon_open: isOpen,
              })}
            >
              {''}
              <span />
            </button>
          </div>
        )}
        <nav>
          <section className={cx('nav_wrapper')}>
            <ul className={cx('nav_inner')}>
              <h3 className={cx('title')}>{t('sidebar_company')}</h3>
              {menuItems.slice(0, 1).map((item) => (
                <li
                  onClick={() => {
                    toggleSubMenu?.()
                    setBusinessSubMenu?.(false)
                  }}
                  key={item.title}
                  className={cx('menu_item')}
                >
                  {item.title}
                </li>
              ))}
              {menuItems.slice(1).map((item) => (
                <li key={item.title} className={cx('menu_item')}>
                  <Link to={item.path!} onClick={handleCloseMenus}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className={cx('nav_inner')}>
              <h3 className={cx('title')}>{t('sidebar_business')}</h3>
              {menuBusinessItems.slice(0, 1).map((item) => (
                <li
                  onClick={() => {
                    setSubMenu?.(false)
                    toggleBusinessSubMenu?.()
                  }}
                  key={item.title}
                  className={cx('menu_item')}
                >
                  {item.title}
                </li>
              ))}
              {menuBusinessItems.slice(1).map((item) => (
                <li key={item.title} className={cx('menu_item')}>
                  <Link to={item.path!} onClick={handleCloseMenus}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </nav>
        <SubSidebar
          items={subMenuItems}
          isOpen={isSubMenuOpen}
          isOpenMainMenu={isOpen}
          onCloseMainMenu={onClick}
        />
        <SubSidebar
          items={businessSubMenuItems}
          isOpen={isBusinessSubMenuOpen}
          isOpenMainMenu={isOpen}
          onCloseMainMenu={onClick}
        />
        <SocialMedia />
      </div>
    </>
  )
}

export default SidebarClosed
