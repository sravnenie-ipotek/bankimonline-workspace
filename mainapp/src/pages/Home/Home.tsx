import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'

import HowItWorks from '@components/ui/HowItWorks'
import SkipCookie from '@components/ui/SkipCookie/SkipCookie.tsx'
import { Container } from '@src/components/ui/Container'
import { PartnersSwiper } from '@src/components/ui/Swiper'
import VideoPoster from '@src/components/ui/VideoPoster/VideoPoster'
import { useAppDispatch } from '@src/hooks/store'
import { setActiveModal } from '@src/pages/Services/slices/loginSlice'
import { openAuthModal } from '@src/pages/Services/slices/modalSlice'

import TopServices from '../../components/ui/TopServices/TopServices'
import styles from './home.module.scss'

const cx = classNames.bind(styles)

// Компонент главной страницы
const Home: React.FC = () => {
  const { t, i18n } = useTranslation()
  
  // TEST: Phone verification modal
  const dispatch = useAppDispatch()
  
  const handleTestPhoneModal = () => {
    dispatch(openAuthModal())
    dispatch(setActiveModal('phoneVerification'))
  }

  return (
    <>
      <div className={cx('home')}>
        <Container>
          <VideoPoster
            title={t('title_compare')}
            subtitle={t('compare_in_5minutes')}
            text={t('show_offers')}
          />
          {/* TEST BUTTON - Remove after testing */}
          <div style={{ margin: '20px 0', textAlign: 'center' }}>
            <button 
              onClick={handleTestPhoneModal}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              🧪 TEST: Open Phone Verification Modal (OS-97)
            </button>
          </div>
        </Container>
        <TopServices />
        <PartnersSwiper />
        <HowItWorks />
      </div>
      <SkipCookie />
    </>
  )
}

export default Home
