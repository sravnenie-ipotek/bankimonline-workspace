import classNames from 'classnames/bind'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { User } from '@assets/icons/User'
import { useAppSelector } from '@src/hooks/store'
// import { useAppSelector } from '@src/hooks/store'
import { RootState } from '@src/store'

import { SettingDropdown } from '../SettingDropdown'
import styles from './settingDetails.module.scss'

const cx = classNames.bind(styles)

const SettingDetails: FC = () => {
  const userData = useAppSelector((state: RootState) => state.settingsUser)
  const { name, phone, email, iconPath } = userData
  const { t } = useTranslation()

  // const language = useAppSelector((state: RootState) => state.language)

  return (
    <div className={cx(styles.root)}>
      <div className={cx(styles.details_header)}>
        <div className={cx(styles.details_header_title)}>
          {t('settings.profileDetails')}
        </div>
        <SettingDropdown />
      </div>
      <div className={cx(styles.details_body)}>
        <div className={cx(styles.details_body_card)}>
          <div className={cx(styles.details_avatar)}>
            {iconPath ? (
              <img
                width={'64px'}
                height={'64px'}
                src={iconPath}
                alt="userAvatar"
              />
            ) : (
              <User size={42} />
            )}
          </div>
          <div className={cx(styles.details_contact)}>
            <div className={cx(styles.contact_title)}>{t('settings.name')}</div>
            <div className={cx(styles.contact_value)}>{name}</div>
          </div>
        </div>
        <div className={cx(styles.details_contact)}>
          <div className={cx(styles.contact_title)}>{t('settings.phone')}</div>
          {/* Неправельный реверс на иврите */}
          <div
            className={cx(
              styles.contact_value

              // language.currentFont != 'font-ru' && styles.rtr
            )}
            dir="ltr"
          >
            {phone}
          </div>
        </div>
        <div className={cx(styles.details_contact)}>
          <div className={cx(styles.contact_title)}>{t('settings.email')}</div>
          <div className={cx(styles.contact_value)}>{email}</div>
        </div>
      </div>
    </div>
  )
}

export default SettingDetails
