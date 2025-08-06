import React from 'react'
import { useTranslation } from 'react-i18next'

import TextPage from '@/components/ui/TextPage'

const Cookie: React.FC = () => {
  const { t } = useTranslation()
  
  return (
    <TextPage 
      title={t('cookie_title')} 
      text={t('cookie_text')} 
    />
  )
}

export default Cookie