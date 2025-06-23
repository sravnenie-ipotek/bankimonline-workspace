import { useTranslation } from 'react-i18next'

import { TextPage } from '@src/components/ui/TextPage'

const PrivacyPolicy = () => {
  const { t, i18n } = useTranslation()
  return (
    <TextPage
      title={t('privacy_policy_title')}
      text={t('privacy_policy_text')}
    />
  )
}

export default PrivacyPolicy
