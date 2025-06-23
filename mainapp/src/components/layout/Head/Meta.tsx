import React from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@src/hooks/store'

import './Header.module.scss'

// Компонент заголовка
const Meta: React.FC = () => {
  const { i18n } = useTranslation()
  i18n.language = i18n.language?.split('-')[0]
  
  const { direction, language } = useAppSelector((state) => state.language)

  useEffect(() => {
    // Set document direction based on language
    const dir = language === 'he' ? 'rtl' : 'ltr'
    document.documentElement.dir = dir
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.lang = language

    document.title = i18n.t('document_title')
  }, [i18n, language, direction])

  return <></>
}

export default Meta
