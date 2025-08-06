import React from 'react'
import { useTranslation } from 'react-i18next'

import { Message } from '../../Message'

const AddInc: React.FC = () => {
  const { t, i18n } = useTranslation()

  return <Message>{t('add_inc')}</Message>
}

export default AddInc
