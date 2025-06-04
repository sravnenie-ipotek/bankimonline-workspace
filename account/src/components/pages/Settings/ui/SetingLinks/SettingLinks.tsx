import classNames from 'classnames/bind'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import styles from './settingLinks.module.scss'

const cx = classNames.bind(styles)

const links = [
  {
    link: 'userAgreement',
    path: '/',
  },
  {
    link: 'privacyPolicy',
    path: '/',
  },
  {
    link: 'cookie',
    path: '/',
  },
  {
    link: 'refundPolicy',
    path: '/',
  },
]

const SettingLinks: FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const onClick = (index: number) => () => {
    navigate(links[index].path)
  }

  return (
    <div className={cx(styles.root)}>
      {links.map((item, index) => (
        <span key={index} onClick={onClick(index)} className={cx(styles.item)}>
          {t(`settings.${item.link}`)}
        </span>
      ))}
    </div>
  )
}

export default SettingLinks
