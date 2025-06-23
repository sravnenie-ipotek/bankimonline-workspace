import React from 'react'
import { useTranslation } from 'react-i18next'

import { TextPage } from '@src/components/ui/TextPage'

const Terms: React.FC = () => {
  const { t, i18n } = useTranslation()
  return <TextPage title={t('terms_title')} text={t('terms_text')} />
}

export default Terms
