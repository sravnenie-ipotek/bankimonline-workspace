import classNames from 'classnames/bind'

import styles from './social.module.scss'

const cx = classNames.bind(styles)
export default function Social() {
  return (
    <div className={cx('social')}>
      <a
        href="https://instagram.com/erik_eitan2018"
        target="_blank"
        rel="noreferrer"
        aria-label="instagram"
      >
        <img className={'instagram'} alt="" src="/static/instagram.svg" />
      </a>
      <a
        href="https://youtube.com"
        target="_blank"
        rel="noreferrer"
        aria-label="youtube"
      >
        <img className={'youtube'} alt="" src="/static/youtube.svg" />
      </a>
      <a
        href="https://www.facebook.com/profile.php?id=100082843615194&mibextid=LQQJ4d"
        target="_blank"
        rel="noreferrer"
        aria-label="facebook"
      >
        <img className={'facebook'} alt="" src="/static/facebook.svg" />
      </a>

      <a
        aria-label="twitter"
        href="https://twitter.соm"
        target="_blank"
        rel="noreferrer"
      >
        <img className={'twitter'} alt="" src="/static/twitter.svg" />
      </a>

      <a
        aria-label="whatsapp"
        href="https://wa.me/972537162235"
        target="_blank"
        rel="noreferrer"
      >
        <img className={'whatsapp'} alt="" src="/static/iconwhatsapp1.svg" />
      </a>
    </div>
  )
}
