import classNames from 'classnames/bind'
import { FC } from 'react'

import Header from '@components/layout/Sidebar/MobileMenu/Header/Header.tsx'
import MobileCurrencySelector from '@components/layout/Sidebar/MobileMenu/MobileCurrencySelector/MobileCurrencySelector.tsx'
import Navigation from '@components/layout/Sidebar/MobileMenu/Navigation/Navigation.tsx'
import SocialList from '@components/layout/Sidebar/MobileMenu/SocialList/SocialList.tsx'

import styles from './MobileMenu.module.scss'

const cx = classNames.bind(styles)

interface MobileMenuProps {
  onClick: () => void
  isOpen: boolean
}

const MobileMenu: FC<MobileMenuProps> = ({ isOpen, onClick }) => {
  return (
    <div
      className={cx('container', {
        container_open: isOpen,
      })}
    >
      <Header onClose={onClick} />
      <div className={cx('body')}>
        <Navigation onClose={onClick} />
        <MobileCurrencySelector />
      </div>
      <SocialList />
    </div>
  )
}

export default MobileMenu
