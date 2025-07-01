import React from 'react'
import ReactDOM from 'react-dom'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames/bind'

import styles from './cookiePolicyModal.module.scss'

const cx = classNames.bind(styles)

interface CookiePolicyModalProps {
  isOpen: boolean
  onClose: () => void
}

const CookiePolicyModal: React.FC<CookiePolicyModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation()

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const modalContent = (
    <div className={cx('modal-backdrop')} onClick={handleBackdropClick}>
      <div className={cx('modal-container')}>
        <div className={cx('modal-header')}>
          <h2 className={cx('modal-title')}>{t('cookie_policy_title')}</h2>
          <button className={cx('close-button')} onClick={onClose} aria-label={t('cookie_policy_close')}>
            <img src="/static/x.svg" width="24" height="24" alt="" />
          </button>
        </div>
        
        <div className={cx('modal-content')}>
          <div className={cx('section')}>
            <p className={cx('intro-text')}>{t('cookie_policy_intro')}</p>
          </div>

          <div className={cx('section')}>
            <h3 className={cx('section-title')}>{t('cookie_policy_what_are')}</h3>
            <p className={cx('section-text')}>{t('cookie_policy_what_are_text')}</p>
          </div>

          <div className={cx('section')}>
            <h3 className={cx('section-title')}>{t('cookie_policy_types')}</h3>
            
            <div className={cx('subsection')}>
              <h4 className={cx('subsection-title')}>{t('cookie_policy_essential')}</h4>
              <p className={cx('section-text')}>{t('cookie_policy_essential_text')}</p>
            </div>

            <div className={cx('subsection')}>
              <h4 className={cx('subsection-title')}>{t('cookie_policy_functional')}</h4>
              <p className={cx('section-text')}>{t('cookie_policy_functional_text')}</p>
            </div>

            <div className={cx('subsection')}>
              <h4 className={cx('subsection-title')}>{t('cookie_policy_analytics')}</h4>
              <p className={cx('section-text')}>{t('cookie_policy_analytics_text')}</p>
            </div>

            <div className={cx('subsection')}>
              <h4 className={cx('subsection-title')}>{t('cookie_policy_marketing')}</h4>
              <p className={cx('section-text')}>{t('cookie_policy_marketing_text')}</p>
            </div>
          </div>

          <div className={cx('section')}>
            <h3 className={cx('section-title')}>{t('cookie_policy_consent')}</h3>
            <p className={cx('section-text')}>{t('cookie_policy_consent_text')}</p>
          </div>

          <div className={cx('section')}>
            <h3 className={cx('section-title')}>{t('cookie_policy_personal_data')}</h3>
            <p className={cx('section-text')}>{t('cookie_policy_personal_data_text')}</p>
          </div>

          <div className={cx('section')}>
            <h3 className={cx('section-title')}>{t('cookie_policy_sharing')}</h3>
            <p className={cx('section-text')}>{t('cookie_policy_sharing_text')}</p>
          </div>

          <div className={cx('section')}>
            <h3 className={cx('section-title')}>{t('cookie_policy_management')}</h3>
            <p className={cx('section-text')}>{t('cookie_policy_management_text')}</p>
          </div>

          <div className={cx('section')}>
            <h3 className={cx('section-title')}>{t('cookie_policy_mobile')}</h3>
            <p className={cx('section-text')}>{t('cookie_policy_mobile_text')}</p>
          </div>

          <div className={cx('section')}>
            <h3 className={cx('section-title')}>{t('cookie_policy_logging')}</h3>
            <p className={cx('section-text')}>{t('cookie_policy_logging_text')}</p>
          </div>

          <div className={cx('section')}>
            <h3 className={cx('section-title')}>{t('cookie_policy_updates')}</h3>
            <p className={cx('section-text')}>{t('cookie_policy_updates_text')}</p>
          </div>

          <div className={cx('section')}>
            <h3 className={cx('section-title')}>{t('cookie_policy_contact')}</h3>
            <p className={cx('section-text')}>{t('cookie_policy_contact_text')}</p>
          </div>
        </div>
        
        <div className={cx('modal-footer')}>
          <button className={cx('close-footer-button')} onClick={onClose}>
            {t('cookie_policy_close')}
          </button>
        </div>
      </div>
    </div>
  )

  return ReactDOM.createPortal(modalContent, document.body)
}

export default CookiePolicyModal 