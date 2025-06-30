import classNames from 'classnames/bind'

import MobileChangeLanguage from '@components/layout/Sidebar/MobileMenu/MobileChangeLanguage/MobileChangeLanguage.tsx'
import NavigationList from '@components/layout/Sidebar/MobileMenu/Navigation/NavigationList/NavigationList.tsx'
import NavigationSubMenu from '@components/layout/Sidebar/MobileMenu/Navigation/NavigationSubMenu/NavigationSubMenu.tsx'
import {
  useBusinessMenuItems,
  useMenuItems,
} from '@components/layout/Sidebar/hooks/sidebar.ts'
import {
  useBusinessSubMenuItems,
  useSubMenuItems,
} from '@components/layout/Sidebar/hooks/subMenu.ts'
import { useToggle } from '@src/hooks/useToggle.ts'

import styles from './Navigation.module.scss'

const cx = classNames.bind(styles)

const Navigation = () => {
  const menuItems = useMenuItems()
  const menuBusinessItems = useBusinessMenuItems()
  const subMenuItems = useSubMenuItems()
  const businessSubMenuItems = useBusinessSubMenuItems()
  const { isOn, toggle } = useToggle(false)
  const { isOn: isOpenBusiness, toggle: toggleBusiness } = useToggle(false)
  return (
    <>
      <nav className={cx('nav')}>
        <MobileChangeLanguage />
        <NavigationList
          items={menuItems}
          title="sidebar_company"
          toggle={toggle}
        />
        <NavigationList
          items={menuBusinessItems}
          title="sidebar_business"
          toggle={toggleBusiness}
        />
      </nav>
      <NavigationSubMenu isOpen={isOn} onClose={toggle} items={subMenuItems} />
      <NavigationSubMenu
        isOpen={isOpenBusiness}
        onClose={toggleBusiness}
        items={businessSubMenuItems}
      />
    </>
  )
}

export default Navigation
