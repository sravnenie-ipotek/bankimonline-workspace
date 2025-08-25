import React, { useEffect, useState } from 'react'
import { Logo } from '@assets/icons/Logo'
import Spinner from '@components/layout/Loader/Spinner'
import styles from './BrandedSplashScreen.module.scss'

interface BrandedSplashScreenProps {
  /**
   * Optional message to display below the logo
   */
  message?: string
  /**
   * Language for the loading message
   */
  language?: 'en' | 'he' | 'ru'
  /**
   * Whether to show the spinner animation
   */
  showSpinner?: boolean
}

/**
 * Professional branded loading screen for BANKIMONLINE
 * Displays the full logo with elegant animations and multi-language support
 */
const BrandedSplashScreen: React.FC<BrandedSplashScreenProps> = ({
  message,
  language = 'he', // Default to Hebrew as per i18n config
  showSpinner = true
}) => {
  const [dots, setDots] = useState('')
  
  // Animated dots effect for loading text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)
    
    return () => clearInterval(interval)
  }, [])
  
  // Multi-language loading messages (hardcoded, not i18n dependent)
  const getLoadingMessage = () => {
    if (message) return message
    
    const messages = {
      he: 'טוען את המערכת', // Loading the system
      en: 'Loading system',
      ru: 'Загружаем систему'
    }
    
    return messages[language] || messages.en
  }
  
  return (
    <div className={styles.splashContainer}>
      <div className={styles.contentWrapper}>
        {/* Main BANKIMONLINE Logo */}
        <div className={styles.logoContainer}>
          <div className={styles.logoWrapper}>
            <Logo size={180} />
          </div>
        </div>
        
        {/* Loading Spinner */}
        {showSpinner && (
          <div className={styles.spinnerContainer}>
            <Spinner />
          </div>
        )}
        
        {/* Loading Message */}
        <div className={styles.messageContainer}>
          <p className={styles.loadingMessage}>
            {getLoadingMessage()}{dots}
          </p>
        </div>
        
        {/* Subtle version indicator */}
        <div className={styles.versionIndicator}>
          <span>BANKIMONLINE</span>
        </div>
      </div>
      
      {/* Background Animation */}
      <div className={styles.backgroundAnimation}>
        <div className={styles.animatedShape1}></div>
        <div className={styles.animatedShape2}></div>
        <div className={styles.animatedShape3}></div>
      </div>
    </div>
  )
}

export default BrandedSplashScreen