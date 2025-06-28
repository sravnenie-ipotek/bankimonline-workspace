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
import TranslationDebug from '../../components/debug/TranslationDebug'
import styles from './home.module.scss'

const cx = classNames.bind(styles)

/**
 * OS-94: Главная страница / Стр. 1 Действий 34
 * Main page component with 34 user actions
 * 
 * ПОЛНЫЙ СПИСОК ДЕЙСТВИЙ:
 * 
 * НАВИГАЦИЯ И МЕНЮ:
 * #1  - Войти в личный кабинет (Login to personal cabinet)
 * #2  - Открыть боковое меню (Open side menu) 
 * #3  - Навигация по меню (Menu navigation)
 * #6  - Боковая навигация (Side navigation)
 * #32 - Выбор страны (Country selection)
 * #33 - Языковые настройки (Language settings)
 * 
 * МЕДИА И ИНТЕРФЕЙС:
 * #4  - Включить/выключить звук (Toggle music)
 * #5  - Полноэкранный режим (Fullscreen mode)
 * 
 * ОСНОВНЫЕ УСЛУГИ:
 * #7  - Рассчитать ипотеку (Calculate mortgage)
 * #8  - Рефинансирование ипотеки (Refinance mortgage)
 * #9  - Рассчитать кредит (Calculate credit) 
 * #10 - Рефинансирование кредита (Refinance credit)
 * 
 * ПАРТНЕРЫ:
 * #11 - Партнеры - следующий (Partners - next)
 * #34 - Партнеры - предыдущий (Partners - previous)
 * 
 * КАК ЭТО РАБОТАЕТ:
 * #12 - Как это работает - шаг 1 (How it works - step 1)
 * #30 - Как это работает - шаг 2 (How it works - step 2)
 * #31 - Как это работает - шаг 3 (How it works - step 3)
 * 
 * КУКИ И УВЕДОМЛЕНИЯ:
 * #13 - Принять куки (Accept cookies)
 * #18 - Закрыть куки (Close cookies) 
 * #24 - Использование куки (Cookie usage info)
 * 
 * ФУТЕР - КОМПАНИЯ:
 * #14 - Контакты в футере (Footer contacts)
 * #15 - О нас в футере (About us in footer)
 * #16 - Вакансии в футере (Vacancies in footer)
 * #17 - Сотрудничество в футере (Cooperation in footer)
 * 
 * ФУТЕР - КОНТАКТЫ:
 * #19 - Email контакт (Email contact)
 * #20 - Телефон контакт (Phone contact)
 * #21 - WhatsApp контакт (WhatsApp contact)
 * 
 * ФУТЕР - ПРАВОВЫЕ ДОКУМЕНТЫ:
 * #22 - Пользовательское соглашение (User agreement)
 * #23 - Политика конфиденциальности (Privacy policy)
 * #25 - Политика возврата (Refund policy)
 * 
 * СОЦИАЛЬНЫЕ СЕТИ:
 * #26 - Instagram
 * #27 - YouTube  
 * #28 - Facebook
 * #29 - Twitter
 * 
 * ПРИМЕЧАНИЕ: Некоторые действия (#2, #3, #6, #14-#29, #32, #33) 
 * обрабатываются в компонентах Header и Footer, которые не видны в этом файле,
 * но функции-обработчики подготовлены для передачи в эти компоненты.
 */
const Home: React.FC = () => {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  
  // ============================================
  // OS-94 ДЕЙСТВИЯ (ACTIONS) - 34 TOTAL
  // ============================================
  
  // Действие #1: Войти в личный кабинет (Login to personal cabinet)
  const handleAction1_Login = () => {
    console.log('OS-94 Действие #1: Войти в личный кабинет')
    dispatch(openAuthModal())
  }
  
  // Действие #2: Открыть боковое меню (Open side menu)
  const handleAction2_SideMenu = () => {
    console.log('OS-94 Действие #2: Открыть боковое меню')
  }
  
  // Действие #3: Навигация по меню (Menu navigation)
  const handleAction3_MenuNav = () => {
    console.log('OS-94 Действие #3: Навигация по меню')
  }
  
  // Действие #4: Включить/выключить звук (Toggle music)
  const handleAction4_ToggleMusic = () => {
    console.log('OS-94 Действие #4: Включить/выключить звук')
  }
  
  // Действие #5: Полноэкранный режим (Fullscreen mode)
  const handleAction5_Fullscreen = () => {
    console.log('OS-94 Действие #5: Полноэкранный режим')
  }
  
  // Действие #6: Боковая навигация (Side navigation)
  const handleAction6_SideNav = () => {
    console.log('OS-94 Действие #6: Боковая навигация')
  }
  
  // Действие #7: Рассчитать ипотеку (Calculate mortgage)
  const handleAction7_MortgageCalc = () => {
    console.log('OS-94 Действие #7: Рассчитать ипотеку')
  }
  
  // Действие #8: Рефинансирование ипотеки (Refinance mortgage)
  const handleAction8_RefinanceMortgage = () => {
    console.log('OS-94 Действие #8: Рефинансирование ипотеки')
  }
  
  // Действие #9: Рассчитать кредит (Calculate credit)
  const handleAction9_CreditCalc = () => {
    console.log('OS-94 Действие #9: Рассчитать кредит')
  }
  
  // Действие #10: Рефинансирование кредита (Refinance credit)
  const handleAction10_RefinanceCredit = () => {
    console.log('OS-94 Действие #10: Рефинансирование кредита')
  }
  
  // Действие #11: Партнеры - следующий (Partners - next)
  const handleAction11_PartnersNext = () => {
    console.log('OS-94 Действие #11: Партнеры - следующий')
  }
  
  // Действие #12: Как это работает - шаг 1 (How it works - step 1)
  const handleAction12_Step1 = () => {
    console.log('OS-94 Действие #12: Как это работает - шаг 1')
  }
  
  // Действие #13: Принять куки (Accept cookies)
  const handleAction13_AcceptCookies = () => {
    console.log('OS-94 Действие #13: Принять куки')
  }
  
  // Действие #14: Контакты в футере (Footer contacts)
  const handleAction14_FooterContacts = () => {
    console.log('OS-94 Действие #14: Контакты в футере')
  }
  
  // Действие #15: О нас в футере (About us in footer)
  const handleAction15_AboutUs = () => {
    console.log('OS-94 Действие #15: О нас в футере')
  }
  
  // Действие #16: Вакансии в футере (Vacancies in footer)
  const handleAction16_Vacancies = () => {
    console.log('OS-94 Действие #16: Вакансии в футере')
  }
  
  // Действие #17: Сотрудничество в футере (Cooperation in footer)
  const handleAction17_Cooperation = () => {
    console.log('OS-94 Действие #17: Сотрудничество в футере')
  }
  
  // Действие #18: Закрыть куки (Close cookies)
  const handleAction18_CloseCookies = () => {
    console.log('OS-94 Действие #18: Закрыть куки')
  }
  
  // Действие #19: Email контакт (Email contact)
  const handleAction19_EmailContact = () => {
    console.log('OS-94 Действие #19: Email контакт')
    window.location.href = 'mailto:info@bankimonline.com'
  }
  
  // Действие #20: Телефон контакт (Phone contact)
  const handleAction20_PhoneContact = () => {
    console.log('OS-94 Действие #20: Телефон контакт')
    window.location.href = 'tel:+97246232280'
  }
  
  // Действие #21: WhatsApp контакт (WhatsApp contact)
  const handleAction21_WhatsAppContact = () => {
    console.log('OS-94 Действие #21: WhatsApp контакт')
  }
  
  // Действие #22: Пользовательское соглашение (User agreement)
  const handleAction22_UserAgreement = () => {
    console.log('OS-94 Действие #22: Пользовательское соглашение')
  }
  
  // Действие #23: Политика конфиденциальности (Privacy policy)
  const handleAction23_PrivacyPolicy = () => {
    console.log('OS-94 Действие #23: Политика конфиденциальности')
  }
  
  // Действие #24: Использование куки (Cookie usage)
  const handleAction24_CookieUsage = () => {
    console.log('OS-94 Действие #24: Использование куки')
  }
  
  // Действие #25: Политика возврата (Refund policy)
  const handleAction25_RefundPolicy = () => {
    console.log('OS-94 Действие #25: Политика возврата')
  }
  
  // Действие #26: Instagram (Instagram social)
  const handleAction26_Instagram = () => {
    console.log('OS-94 Действие #26: Instagram')
    window.open('https://instagram.com/bankimonline', '_blank')
  }
  
  // Действие #27: YouTube (YouTube social)
  const handleAction27_YouTube = () => {
    console.log('OS-94 Действие #27: YouTube')
    window.open('https://youtube.com/bankimonline', '_blank')
  }
  
  // Действие #28: Facebook (Facebook social)
  const handleAction28_Facebook = () => {
    console.log('OS-94 Действие #28: Facebook')
    window.open('https://facebook.com/bankimonline', '_blank')
  }
  
  // Действие #29: Twitter (Twitter social)
  const handleAction29_Twitter = () => {
    console.log('OS-94 Действие #29: Twitter')
    window.open('https://twitter.com/bankimonline', '_blank')
  }
  
  // Действие #30: Как это работает - шаг 2 (How it works - step 2)
  const handleAction30_Step2 = () => {
    console.log('OS-94 Действие #30: Как это работает - шаг 2')
  }
  
  // Действие #31: Как это работает - шаг 3 (How it works - step 3)
  const handleAction31_Step3 = () => {
    console.log('OS-94 Действие #31: Как это работает - шаг 3')
  }
  
  // Действие #32: Выбор страны (Country selection)
  const handleAction32_CountrySelect = () => {
    console.log('OS-94 Действие #32: Выбор страны')
  }
  
  // Действие #33: Языковые настройки (Language settings)
  const handleAction33_LanguageSettings = () => {
    console.log('OS-94 Действие #33: Языковые настройки')
  }
  
  // Действие #34: Партнеры - предыдущий (Partners - previous)
  const handleAction34_PartnersPrev = () => {
    console.log('OS-94 Действие #34: Партнеры - предыдущий')
  }
  
  // TEST: Phone verification modal (для связи с OS-97)
  const handleTestPhoneModal = () => {
    dispatch(openAuthModal())
    dispatch(setActiveModal('phoneVerification'))
  }

  // ============================================
  // РАЗМЕЩЕНИЕ ДЕЙСТВИЙ В КОМПОНЕНТАХ:
  // ============================================
  // 
  // VideoPoster: #1 (Login), #4 (Music), #5 (Fullscreen)
  // TopServices: #7 (Mortgage), #8 (Refi Mortgage), #9 (Credit), #10 (Refi Credit)  
  // PartnersSwiper: #11 (Next), #34 (Previous)
  // HowItWorks: #12 (Step1), #30 (Step2), #31 (Step3)
  // SkipCookie: #13 (Accept), #18 (Close), #24 (Info)
  //
  // Header (не показан): #2 (Menu), #3 (Nav), #6 (SideNav), #32 (Country), #33 (Language)
  // Footer (не показан): #14-#17 (Company), #19-#21 (Contacts), #22-#23,#25 (Legal), #26-#29 (Social)

  return (
    <>
      <TranslationDebug />
      <div className={cx('home')}>
        <Container>
          {/* 
            ДЕЙСТВИЕ #1: Login button in header (handled by VideoPoster component)
            ДЕЙСТВИЕ #4: Music toggle in video player
            ДЕЙСТВИЕ #5: Fullscreen mode in video player
            TODO: Add onLoginClick, onMusicToggle, onFullscreen props to VideoPoster component
          */}
          <VideoPoster
            title={t('title_compare')}
            subtitle={t('compare_in_5minutes')}
            text={t('show_offers')}
          />
          
          {/* TEST BUTTON - Links to OS-97 (Phone verification) */}
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
        
        {/* 
          ДЕЙСТВИЕ #7: Рассчитать ипотеку
          ДЕЙСТВИЕ #8: Рефинансирование ипотеки  
          ДЕЙСТВИЕ #9: Рассчитать кредит
          ДЕЙСТВИЕ #10: Рефинансирование кредита
          TODO: Add callback props to TopServices component
        */}
        <TopServices />
        
        {/* 
          ДЕЙСТВИЕ #11: Партнеры - следующий
          ДЕЙСТВИЕ #34: Партнеры - предыдущий 
          TODO: Add onNext, onPrev props to PartnersSwiper component
        */}
        <PartnersSwiper />
        
        {/* 
          ДЕЙСТВИЕ #12: Как это работает - шаг 1
          ДЕЙСТВИЕ #30: Как это работает - шаг 2
          ДЕЙСТВИЕ #31: Как это работает - шаг 3
          TODO: Add step click handlers to HowItWorks component
        */}
        <HowItWorks />
      </div>
      
      {/* 
        ДЕЙСТВИЕ #13: Принять куки
        ДЕЙСТВИЕ #18: Закрыть куки
        ДЕЙСТВИЕ #24: Использование куки (ссылка в тексте)
        TODO: Add callback props to SkipCookie component
      */}
      <SkipCookie />
    </>
  )
}

export default Home
