import classNames from 'classnames/bind'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import styles from './SocialItem.module.scss'

const cx = classNames.bind(styles)

interface SocialItemProps {
  href: string
  src: string
  alt: string
}

const SocialItem: FC<SocialItemProps> = ({ href, src, alt }) => {
  const { t } = useTranslation()
  
  return (
    <div className={cx('items')}>
      <Link to={href}>
        <img src={src} alt={t(alt)} />
      </Link>
    </div>
  )
}

export default SocialItem
