import classNames from 'classnames/bind'
import { lazy, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import 'react-toastify/dist/ReactToastify.css'

import { Dialog } from '@components/layout/Dialog/Dialog'
import BrandedSplashScreen from '@components/ui/BrandedSplashScreen/BrandedSplashScreen'
import { ErrorBoundary } from '@src/app/Errors/ErrorBoundary'
import { useAppDispatch, useAppSelector } from '@src/hooks/store.ts'
import { initializeUserData, setIsLogin } from '@src/pages/Services/slices/loginSlice'
import { updateWindowSize } from '@src/store/slices/windowSizeSlice.ts'
import { initializeValidationLanguageListener } from '@src/utils/validationHelpers'
import '@src/utils/yupLocale'

import { RootState } from '../store'
import { debounce } from '../utils/helpers/debounce.ts'
import './App.css'
import '@src/styles/rtl.css'
import styles from './app.module.scss'

const cx = classNames.bind(styles)

const MainRoutes = lazy(() =>
  import('./AppRoutes').then((module) => ({
    default: module.MainRoutes,
  }))
)

const App = () => {
  const { currentFont, direction, language } = useAppSelector(
    (state: RootState) => state.language
  )

  const { i18n } = useTranslation()
  const [translationsLoaded, setTranslationsLoaded] = useState(false)
  const dispatch = useAppDispatch()

  useEffect(() => {
    /*
      Проверка - авторизован ли пользователь
    */

    // const token = localStorage.getItem('ACCESS_TOKEN')
    // if (!token) {
    //   window.location.href = 'https://dev2.bankimonline.com'
    // }

    // Load user data from localStorage into Redux store
    const storedUserData = localStorage.getItem('USER_DATA')
    
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData)
        const loginData = {
          nameSurname: userData.name || userData.nameSurname,
          phoneNumber: userData.mobile_number || userData.phoneNumber
        }
        
        // Update login data in Redux with stored user data
        dispatch(initializeUserData(loginData))
        dispatch(setIsLogin()) // Set user as logged in
      } catch (error) {
        console.error('App.tsx - Error loading user data from localStorage:', error)
      }
    } else {
      }

    // Initialize translations and wait for them to load
    const initializeTranslations = async () => {
      try {
        // Simplified translation loading - fail fast to prevent infinite loading
        const loadingTimeout = setTimeout(() => {
          console.warn('⚠️ Translation loading timeout, continuing anyway')
          setTranslationsLoaded(true)
        }, 1000) // 1 second timeout
        
        try {
          // Wait for i18n to be ready
          if (!i18n.isInitialized) {
            await Promise.race([
              new Promise((resolve) => {
                i18n.on('initialized', resolve)
              }),
              new Promise((resolve) => setTimeout(resolve, 1000))
            ])
          }
          
          // Change language with timeout
          await Promise.race([
            i18n.changeLanguage(language),
            new Promise((resolve) => setTimeout(resolve, 1000))
          ])
          
          clearTimeout(loadingTimeout)
          setTranslationsLoaded(true)
          document.documentElement.setAttribute('dir', direction)
          document.documentElement.setAttribute('lang', language)
          // Initialize validation language listener
          initializeValidationLanguageListener()
        } catch (innerError) {
          clearTimeout(loadingTimeout)
          console.warn('⚠️ Translation loading failed:', innerError)
          setTranslationsLoaded(true)
        }
      } catch (error) {
        console.error('❌ Error loading translations:', error)
        setTranslationsLoaded(true) // Always continue to prevent infinite loading
      }
    }

    initializeTranslations()
  }, [language, i18n, direction, dispatch])

  useEffect(() => {
    const handleResize = debounce(() => {
      dispatch(
        updateWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      )
    })

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [dispatch])

  // Show branded loading screen until translations are loaded
  if (!translationsLoaded) {
    return <BrandedSplashScreen language={language} />
  }

  return (
    <section
      className={cx(`${currentFont} ${direction}`, 'app')}
      dir={direction}
    >
      <ErrorBoundary>
        <MainRoutes />
        <Dialog />
      </ErrorBoundary>
    </section>
  )
}

export default App
