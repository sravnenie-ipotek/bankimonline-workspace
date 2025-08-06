import { useTranslation } from 'react-i18next'

import { TextPage } from '@src/components/ui/TextPage'

const Cookie = () => {
  const { t, i18n } = useTranslation()
  return <TextPage title={t('cookie_title')} text={t('cookie_text')} />
}

export default Cookie
