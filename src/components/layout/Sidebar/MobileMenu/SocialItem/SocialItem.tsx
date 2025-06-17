import classNames from 'classnames/bind'
import { FC } from 'react'
import { Link } from 'react-router-dom'

import styles from './SocialItem.module.scss'

const cx = classNames.bind(styles)

interface SocialItemProps {
  href: string
  src: string
  alt: string
}

const SocialItem: FC<SocialItemProps> = ({ href, src, alt }) => {
  return (
    <div className={cx('items')}>
      <Link to={href}>
        <img src={src} alt={alt} />
      </Link>
    </div>
  )
}

export default SocialItem
