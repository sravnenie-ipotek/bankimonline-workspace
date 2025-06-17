import React from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import './Header.module.scss'

// Компонент заголовка
const Meta: React.FC = () => {
  const { i18n } = useTranslation()
  i18n.language = i18n.language?.split('-')[0]

  useEffect(() => {
    document.dir = i18n.dir()
    document.documentElement.lang = i18n.language

    document.title = i18n.t('document_title')
  }, [i18n, i18n.language])

  return <></>
}

export default Meta
