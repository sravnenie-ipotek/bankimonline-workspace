import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

import { ShieldCheckIcon } from '@assets/icons/ShieldCheckIcon'

import styles from './info.module.scss'

const cx = classNames.bind(styles)

const Info = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('mortgage_step2')
  
  return (
    <div className={cx('info')}>
      <div>
        <ShieldCheckIcon size={24} />
      </div>
      <span className={cx('info-title')}>{getContent('third_persons', 'third_persons')}</span>
    </div>
  )
}

export default Info
