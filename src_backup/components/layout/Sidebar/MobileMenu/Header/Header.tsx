import classNames from 'classnames/bind'
import { FC } from 'react'
import { Link } from 'react-router-dom'

import styles from './Header.module.scss'

const cx = classNames.bind(styles)

interface HeaderProps {
  onClose: () => void
}

const Header: FC<HeaderProps> = ({ onClose }) => {
  return (
    <div className={cx('header')}>
      <Link to="/">
        <img src="/static/mobile-menu/logo.svg" alt="bankimonline" />
      </Link>
      <button type="button" onClick={onClose} />
    </div>
  )
}

export default Header
