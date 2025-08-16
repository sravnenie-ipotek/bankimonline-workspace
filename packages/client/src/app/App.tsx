import classNames from 'classnames/bind'
import { lazy, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import 'react-toastify/dist/ReactToastify.css'

import { Dialog } from '@components/layout/Dialog/Dialog'
import { ErrorBoundary } from '@src/app/Errors/ErrorBoundary'
import { useAppDispatch, useAppSelector } from '@src/hooks/store.ts'
import { initializeUserData, setIsLogin } from '@src/pages/Services/slices/loginSlice'
import { updateWindowSize } from '@src/store/slices/windowSizeSlice.ts'
import { initializeValidationLanguageListener } from '@src/utils/validationHelpers'
import '@src/utils/yupLocale'

import { RootState } from '../store'
import { debounce } from '../utils/helpers/debounce.ts'
import './App.css'
import styles from './app.module.scss'

const cx = classNames.bind(styles)

const MainRoutes = lazy(() =>
  import('./AppRoutes/MainRoutes').then((module) => ({
    default: module.default,
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
        // Wait for i18n to be initialized first
        if (!i18n.isInitialized) {
          await new Promise((resolve) => {
            i18n.on('initialized', resolve)
          })
        }
        
        // Change language and wait for resources to load
        await i18n.changeLanguage(language)
        
        // Verify translations are actually loaded
        const testTranslation = i18n.t('fill_form', { lng: language })
        if (testTranslation === 'fill_form') {
          // Try to reload resources
          await i18n.reloadResources(language)
          await new Promise(resolve => setTimeout(resolve, 500)) // Wait a bit more
        }
        
        setTranslationsLoaded(true)
        document.documentElement.setAttribute('dir', direction)
        document.documentElement.setAttribute('lang', language)
        // Initialize validation language listener
        initializeValidationLanguageListener()
        } catch (error) {
        console.error('❌ Error loading translations:', error)
        setTranslationsLoaded(true) // Continue anyway
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

  // Show loading state until translations are loaded
  if (!translationsLoaded) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#161616',
        color: '#FBE54D'
      }}>
        <div>Loading translations...</div>
      </div>
    )
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
