import { useTranslation } from 'react-i18next'

import { TextPage } from '@src/components/ui/TextPage'

const Refund = () => {
  const { t, i18n } = useTranslation()
  return <TextPage title={t('refund_title')} text={t('refund_text')} />
}

export default Refund
