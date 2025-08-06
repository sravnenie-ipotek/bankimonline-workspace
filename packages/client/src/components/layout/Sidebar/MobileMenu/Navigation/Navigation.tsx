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
import { useContentApi } from '@src/hooks/useContentApi'

import styles from './Navigation.module.scss'

const cx = classNames.bind(styles)

interface NavigationProps {
  onClose?: () => void
}

const Navigation: React.FC<NavigationProps> = ({ onClose }) => {
  const menuItems = useMenuItems()
  const menuBusinessItems = useBusinessMenuItems()
  const subMenuItems = useSubMenuItems()
  const businessSubMenuItems = useBusinessSubMenuItems()
  const { isOn, toggle } = useToggle(false)
  const { isOn: isOpenBusiness, toggle: toggleBusiness } = useToggle(false)
  const { loading } = useContentApi('sidebar')
  
  // Show loading state or skeleton while content is loading
  if (loading) {
    return (
      <nav className={cx('nav')}>
        <div className={cx('loading')}>Loading navigation...</div>
      </nav>
    )
  }
  
  return (
    <>
      <nav className={cx('nav')}>
        <MobileChangeLanguage />
        <NavigationList
          items={menuItems}
          title="sidebar_company"
          toggle={toggle}
          onClose={onClose}
        />
        <NavigationList
          items={menuBusinessItems}
          title="sidebar_business"
          toggle={toggleBusiness}
          onClose={onClose}
        />
      </nav>
      <NavigationSubMenu isOpen={isOn} onClose={toggle} items={subMenuItems} onCloseMenu={onClose} />
      <NavigationSubMenu
        isOpen={isOpenBusiness}
        onClose={toggleBusiness}
        items={businessSubMenuItems}
        onCloseMenu={onClose}
      />
    </>
  )
}

export default Navigation
