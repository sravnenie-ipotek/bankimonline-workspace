import React from 'react'
import { useTranslation } from 'react-i18next'

import { TextPage } from '@src/components/ui/TextPage'
import { useContentApi } from '@src/hooks/useContentApi'

const PrivacyPolicy = () => {
  const { t } = useTranslation()
  const { getContent } = useContentApi('privacy_policy')

  return (
    <TextPage 
      title={getContent('app.privacy_policy.title', t('privacy_policy_title'))}
      text={getContent('app.privacy_policy.full_content', t('privacy_policy_full_text'))}
      htmlContent={true}
    />
  )
}

export default PrivacyPolicy