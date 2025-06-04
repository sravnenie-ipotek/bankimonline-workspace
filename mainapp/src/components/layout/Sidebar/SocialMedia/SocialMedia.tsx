import classNames from 'classnames/bind'

import SocialMediaItem from '../SocialMediaItem/SocialMediaItem.tsx'
import styles from './socialMedia.module.scss'

const cx = classNames.bind(styles)

// Компонент соцсетей
export default function SocialMedia() {
  return (
    <div className={cx('social')}>
      <SocialMediaItem
        src={'/static/sidebar/iconinstagrami111-a5ij.svg'}
        imgClass={cx('icon')}
        title={'INSTAGRAM'}
        href={'https://instagram.com/erik_eitan2018'}
        class={cx('title')}
      />

      <SocialMediaItem
        src={'/static/sidebar/iconyoutubei111-z1oe.svg'}
        imgClass={cx('icon')}
        title={'YOUTUBE'}
        href={'https://youtube.com/'}
        class={cx('title')}
      />

      <SocialMediaItem
        src={'/static/sidebar/iconfacebooki111-e0b.svg'}
        imgClass={cx('icon')}
        title={'FACEBOOK'}
        href={
          'https://www.facebook.com/profile.php?id=100082843615194&mibextid=LQQJ4d'
        }
        class={cx('title')}
      />

      <SocialMediaItem
        src={'/static/sidebar/icontwitteri111-8tqw.svg'}
        imgClass={cx('icon')}
        title={'TWITTER'}
        href={'https://twitter.com/'}
        class={cx('title')}
      />
    </div>
  )
}
