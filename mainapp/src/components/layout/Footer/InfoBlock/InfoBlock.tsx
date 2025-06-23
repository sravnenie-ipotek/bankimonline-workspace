import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import Logo from '../Logo/Logo.tsx'
import Social from '../Social/Social.tsx'
import styles from './infoBlock.module.scss'

const cx = classNames.bind(styles)

// Компонет блока с информацией
export default function InfoBlock() {
  const { i18n } = useTranslation()

  return (
    <div className={cx('footer-info')}>
      <Logo />
      <Social />
    </div>
  )
}
