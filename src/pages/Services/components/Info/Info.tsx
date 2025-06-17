import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import { ShieldCheckIcon } from '@assets/icons/ShieldCheckIcon'

import styles from './info.module.scss'

const cx = classNames.bind(styles)

const Info = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]
  return (
    <div className={cx('info')}>
      <div>
        <ShieldCheckIcon size={24} />
      </div>
      <span className={cx('info-title')}>{t('third_persons')}</span>
    </div>
  )
}

export default Info
