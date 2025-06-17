import classNames from 'classnames/bind'
import { FC } from 'react'
import { Link } from 'react-router-dom'

import Header from '@components/layout/Sidebar/MobileMenu/Header/Header.tsx'
import { IMenuItem } from '@components/layout/Sidebar/types/menuItem.ts'

import styles from './NavigationSubMenu.module.scss'

const cx = classNames.bind(styles)

interface NavigationSubMenuProps {
  items: IMenuItem[]
  isOpen: boolean
  onClose: () => void
}

const NavigationSubMenu: FC<NavigationSubMenuProps> = ({
  items,
  isOpen,
  onClose,
}) => {
  return (
    <>
      <nav
        className={cx('nav', {
          nav_open: isOpen,
        })}
      >
        <Header onClose={onClose} />
        <ul className={cx('list')}>
          {items.map((item) => (
            <li key={item.title} className={cx('item')}>
              <Link to={item.path!}>{item.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}

export default NavigationSubMenu
