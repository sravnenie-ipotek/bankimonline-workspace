import classNames from 'classnames/bind'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import SettingLinks from '../SetingLinks/SettingLinks'
import SettingDetails from '../SettingDetails/SettingDetails'
import { SettingPassword } from '../SettingPassword'
import styles from './topLayout.module.scss'

const cx = classNames.bind(styles)

const TopLayout: FC = () => {
  const { t } = useTranslation()

  return (
    <div className={cx(styles.root)}>
      <div className={cx(styles.title)}>{t('settings.title')}</div>
      <div className={cx(styles.wrapper)}>
        <SettingDetails />
        <SettingPassword />
        <SettingLinks />
      </div>
    </div>
  )
}

export default TopLayout
