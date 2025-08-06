import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from './store'

export const useLanguageSync = () => {
  const { i18n } = useTranslation()
  const currentLanguage = useAppSelector((state) => state.language.language)

  useEffect(() => {
    // Only change language if it's different from current
    if (i18n.language !== currentLanguage) {
      i18n.changeLanguage(currentLanguage)
    }
  }, [currentLanguage, i18n])

  return currentLanguage
} 