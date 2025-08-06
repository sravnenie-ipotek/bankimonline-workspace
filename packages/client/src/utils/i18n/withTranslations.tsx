import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface WithTranslationsProps {
  children: React.ReactNode
}

/**
 * HOC to ensure translations are loaded before rendering children
 */
export const WithTranslations: React.FC<WithTranslationsProps> = ({ children }) => {
  const { i18n, ready } = useTranslation()
  const [translationsReady, setTranslationsReady] = useState(false)

  useEffect(() => {
    const checkTranslations = async () => {
      if (ready && i18n.isInitialized) {
        // Test if translations are actually loaded
        const testKey = i18n.t('fill_form')
        if (testKey && testKey !== 'fill_form') {
          setTranslationsReady(true)
          console.log('✅ WithTranslations: Translations ready')
        } else {
          console.log('⚠️ WithTranslations: Waiting for translations...')
          // Retry after a short delay
          setTimeout(checkTranslations, 100)
        }
      }
    }

    checkTranslations()
  }, [ready, i18n, i18n.language])

  if (!translationsReady) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        color: '#666'
      }}>
        Loading...
      </div>
    )
  }

  return <>{children}</>
}

export default WithTranslations