import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { CaretDownIcon } from '@assets/icons/CaretDownIcon'
import { useAppSelector } from '@src/hooks/store'
import useDisclosure from '@src/hooks/useDisclosure'

// Компонент информации о компании
import styles from './company.module.scss'

const cx = classNames.bind(styles)

const Company = () => {
  const { t } = useTranslation()
  const [opened, { open, close }] = useDisclosure(false)
  const windowSize = useAppSelector((state) => state.windowSize.width)
  const navigate = useNavigate()

  return (
    <>
      {windowSize > 1024 && (
        <div className={cx('company')}>
          <div className={cx('company-title')}>{t('footer_company')}</div>
          <div className={cx('company-items')}>
            <a onClick={() => navigate('/contacts')} className={cx('company-items__text')}>{t('footer_contacts')}</a>
            <a
              onClick={() => navigate('/about')}
              className={cx('company-items__text')}
            >
              {t('footer_about')}
            </a>
            <a onClick={() => navigate('/vacancies')} className={cx('company-items__text')}>{t('footer_vacancy')}</a>
            <a onClick={() => navigate('/cooperation')} className={cx('company-items__text')}>{t('footer_partner')}</a>
          </div>
        </div>
      )}
      {windowSize <= 1024 && (
        <div className={cx('company', 'accordion-company')}>
          <div
            onClick={opened ? close : open}
            className={cx('company-title', 'accordion-title')}
          >
            {t('footer_company')}
            <div
              className={cx('caret-down', `${opened && 'caret-down-opened'}`)}
            >
              <CaretDownIcon />
            </div>
          </div>
          <div
            className={cx('company-items', 'accordion-items', {
              opened: opened,
            })}
          >
            <a onClick={() => navigate('/about')}>{t('footer_about')}</a>
            <a onClick={() => navigate('/contacts')}>{t('footer_contacts')}</a>
            <a onClick={() => navigate('/vacancies')}>{t('footer_vacancy')}</a>
            <a onClick={() => navigate('/cooperation')}>{t('footer_partner')}</a>
          </div>
        </div>
      )}
    </>
  )
}

export default Company
