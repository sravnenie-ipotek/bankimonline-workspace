import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import SocialMediaItem from '../SocialMediaItem/SocialMediaItem.tsx'
import styles from './socialMedia.module.scss'

const cx = classNames.bind(styles)

// Компонент соцсетей
export default function SocialMedia() {
  const { t } = useTranslation()
  return (
    <div className={cx('social')}>
      <SocialMediaItem
        src={'/static/sidebar/iconinstagrami111-a5ij.svg'}
        imgClass={cx('icon')}
        title={t('social_instagram')}
        href={'https://instagram.com/erik_eitan2018'}
        class={cx('title')}
      />

      <SocialMediaItem
        src={'/static/sidebar/iconyoutubei111-z1oe.svg'}
        imgClass={cx('icon')}
        title={t('social_youtube')}
        href={'https://youtube.com/'}
        class={cx('title')}
      />

      <SocialMediaItem
        src={'/static/sidebar/iconfacebooki111-e0b.svg'}
        imgClass={cx('icon')}
        title={t('social_facebook')}
        href={
          'https://www.facebook.com/profile.php?id=100082843615194&mibextid=LQQJ4d'
        }
        class={cx('title')}
      />

      <SocialMediaItem
        src={'/static/sidebar/icontwitteri111-8tqw.svg'}
        imgClass={cx('icon')}
        title={t('social_twitter')}
        href={'https://twitter.com/'}
        class={cx('title')}
      />
    </div>
  )
}
