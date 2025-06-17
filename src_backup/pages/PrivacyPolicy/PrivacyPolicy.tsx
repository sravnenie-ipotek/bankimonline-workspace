import { useTranslation } from 'react-i18next'

import { TextPage } from '@src/components/ui/TextPage'

const PrivacyPolicy = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]
  return (
    <TextPage
      title={t('privacy_policy_title')}
      text={t('privacy_policy_text')}
    />
  )
}

export default PrivacyPolicy
