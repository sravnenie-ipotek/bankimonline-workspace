import { useTranslation } from 'react-i18next'

import { TextPage } from '@src/components/ui/TextPage'

const Refund = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]
  return <TextPage title={t('refund_title')} text={t('refund_text')} />
}

export default Refund
