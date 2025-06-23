import React from 'react'
import { useTranslation } from 'react-i18next'

import { Message } from '../../Message'

// Компонент  кнопки под полем ввода для заполнения формы кредита

const CreditContextButton: React.FC = () => {
  const { t, i18n } = useTranslation()

  return <Message>{t('calculate_mortgage_ctx')}</Message>
}
export default CreditContextButton
