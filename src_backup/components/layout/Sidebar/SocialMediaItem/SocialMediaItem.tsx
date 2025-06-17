import classNames from 'classnames/bind'

import styles from './socialMediaItem.module.scss'

interface PropTypes {
  src: string
  class: string
  title: string
  imgClass: string
  href: string
}

const cx = classNames.bind(styles)
// Компонент соцсетей
const SocialMediaItem = ({
  src,
  class: className,
  title,
  imgClass,
  href,
}: PropTypes) => {
  return (
    <div className={cx('contain')}>
      <div className={cx('wrap')}>
        <img src={src} alt="" className={imgClass} />
        <span className={className}>
          <a href={href}>{title}</a>
        </span>
      </div>
    </div>
  )
}

export default SocialMediaItem
