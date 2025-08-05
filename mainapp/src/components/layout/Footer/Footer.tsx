import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import Company from './Company/Company.tsx'
import Contacts from './Contacts/Contacts.tsx'
import Documents from './Documents/Documents.tsx'
import InfoBlock from './InfoBlock/InfoBlock.tsx'
import styles from './footer.module.scss'

const cx = classNames.bind(styles)

// Компонент футтера
export default function Footer() {
  const { t } = useTranslation()
  return (
    <div className={cx('footer')}>
      <div className={cx('wrapper')}>
        <div className={cx('footer-inner')}>
          <InfoBlock />
          <div className={cx('footer-right')}>
            <Company />
            <Contacts />
            <Documents />
          </div>
        </div>
        <div className={cx('copyright')}>
          <span>{t('footer_copyright')}</span>
        </div>
      </div>
    </div>
  )
}
