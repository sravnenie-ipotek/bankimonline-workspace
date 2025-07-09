import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import styles from './lawyersFooter.module.scss'

const cx = classNames.bind(styles)

const LawyersFooter: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <footer className={cx('lawyers-footer')}>
      <div className={cx('footer-content')}>
        <div className={cx('footer-main')}>
          <div className={cx('footer-brand')}>
            <div className={cx('footer-logo')}>
              <img 
                src="/static/menu/techRealt.png" 
                alt="TechRealt Logo" 
                width="160" 
                height="33"
              />
            </div>
            <div className={cx('footer-social')}>
              <a 
                href="https://instagram.com/erik_eitan2018" 
                target="_blank"
                rel="noreferrer"
                className={cx('social-link')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path stroke="currentColor" strokeWidth="2" d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9zm4.64 6.26a6.5 6.5 0 1 1-9.28 0 6.5 6.5 0 0 1 9.28 0z"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank"
                rel="noreferrer"
                className={cx('social-link')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path stroke="currentColor" strokeWidth="2" d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816z"/>
                  <path stroke="currentColor" strokeWidth="2" d="m10 15.5 5.5-3.5L10 8.5v7z"/>
                </svg>
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=100082843615194&mibextid=LQQJ4d" 
                target="_blank"
                rel="noreferrer"
                className={cx('social-link')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path stroke="currentColor" strokeWidth="2" d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank"
                rel="noreferrer"
                className={cx('social-link')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path stroke="currentColor" strokeWidth="2" d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5 0-.278-.028-.556-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                </svg>
              </a>
              <a 
                href="https://wa.me/972537162235" 
                target="_blank"
                rel="noreferrer"
                className={cx('social-link')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path stroke="currentColor" strokeWidth="2" d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.029.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.19.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.029.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className={cx('footer-columns')}>
            <div className={cx('footer-column')}>
              <h3 className={cx('footer-column-title')}>{t('footer_company')}</h3>
              <div className={cx('footer-links')}>
                <a 
                  href="#" 
                  className={cx('footer-link')}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/about')
                  }}
                >
                  {t('footer_about')}
                </a>
                <a 
                  href="#" 
                  className={cx('footer-link')}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/contacts')
                  }}
                >
                  {t('footer_contacts')}
                </a>
                <a 
                  href="#" 
                  className={cx('footer-link')}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/vacancies')
                  }}
                >
                  {t('footer_vacancy')}
                </a>
                <a 
                  href="#" 
                  className={cx('footer-link')}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/cooperation')
                  }}
                >
                  {t('footer_partner')}
                </a>
              </div>
            </div>
            
            <div className={cx('footer-column')}>
              <h3 className={cx('footer-column-title')}>{t('footer_contacts')}</h3>
              <div className={cx('footer-contact-links')}>
                <div className={cx('footer-contact-item')}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path stroke="currentColor" strokeWidth="1.5" d="M1.5 3h13a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>
                    <path stroke="currentColor" strokeWidth="1.5" d="m1.5 4 6.5 4.5L14.5 4"/>
                  </svg>
                  <span>info@bankimonline.com</span>
                </div>
                <div className={cx('footer-contact-item')}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path stroke="currentColor" strokeWidth="1.5" d="M2 1.5h3.6a1 1 0 0 1 .95.68L7.4 4.5a1 1 0 0 1-.23 1.14l-1.27.93a10 10 0 0 0 4.53 4.53l.93-1.27a1 1 0 0 1 1.14-.23l2.32.85a1 1 0 0 1 .68.95V14a1 1 0 0 1-1.08 1A13.77 13.77 0 0 1 1 1.08 1 1 0 0 1 2 1.5z"/>
                  </svg>
                  <span>+972 04-623-2280</span>
                </div>
                <div className={cx('footer-contact-item')}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path stroke="currentColor" strokeWidth="1.5" d="M2 2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
                    <path stroke="currentColor" strokeWidth="1.5" d="M2 4l6 4 6-4"/>
                  </svg>
                  <span>{t('footer_writeus')}</span>
                </div>
              </div>
            </div>
            
            <div className={cx('footer-column')}>
              <h3 className={cx('footer-column-title')}>{t('footer_legal')}</h3>
              <div className={cx('footer-links')}>
                <a 
                  href="#" 
                  className={cx('footer-link')}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/terms')
                  }}
                >
                  {t('footer_legal_1')}
                </a>
                <a 
                  href="#" 
                  className={cx('footer-link')}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/privacy-policy')
                  }}
                >
                  {t('footer_legal_2')}
                </a>
                <a 
                  href="#" 
                  className={cx('footer-link')}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/cookie')
                  }}
                >
                  {t('footer_legal_3')}
                </a>
                <a 
                  href="#" 
                  className={cx('footer-link')}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/refund')
                  }}
                >
                  {t('footer_legal_4')}
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className={cx('footer-bottom')}>
          <div className={cx('footer-copyright')}>
            {t('footer_copyright')}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default LawyersFooter 