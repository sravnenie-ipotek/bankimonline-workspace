import { useTranslation } from 'react-i18next'

import { Message } from '../../Message'

// Компонент  кнопки под полем ввода с текстом дохода
export default function IncomeContextButton() {
  const { t, i18n } = useTranslation()

  return <Message>{t('calculate_mortgage_step3_ctx')}</Message>
}
