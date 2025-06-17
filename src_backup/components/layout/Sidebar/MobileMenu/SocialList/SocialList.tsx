import classNames from 'classnames/bind'

import SocialItem from '@components/layout/Sidebar/MobileMenu/SocialItem/SocialItem.tsx'
import { SOCIAL_ITEM } from '@components/layout/Sidebar/MobileMenu/utils/constants.ts'

import styles from './SocialList.module.scss'

const cx = classNames.bind(styles)
const SocialList = () => {
  return (
    <ul className={cx('list')}>
      {SOCIAL_ITEM.map((item) => (
        <SocialItem
          key={item.id}
          href={item.href}
          src={item.src}
          alt={item.alt}
        />
      ))}
    </ul>
  )
}

export default SocialList
