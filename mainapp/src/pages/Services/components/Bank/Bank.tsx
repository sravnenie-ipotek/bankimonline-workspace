import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Error } from '@components/ui/Error'

import { FormTypes } from '../../types/formTypes'

interface BankProps {
  screenLocation?: string
}

const Bank = ({ screenLocation = 'calculate_credit_3' }: BankProps) => {
  const { t, i18n } = useTranslation()
  const { getContent: getCommonContent } = useContentApi('common')
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  // Use obligation-specific content when in obligation context
  const isObligationContext = screenLocation === 'calculate_credit_3' && values.obligation
  
  // Since there's no bank dropdown data in database, use common translations
  const title = isObligationContext 
    ? getCommonContent('obligation_bank_title', 'Bank Lender')
    : getCommonContent('bank_title', 'Bank')
  
  const placeholder = isObligationContext
    ? getCommonContent('obligation_bank_placeholder', 'Select bank')
    : getCommonContent('bank_placeholder', 'Select bank')

  // Get bank options from database with Hebrew translations
  const bankOptions = [
    { value: '1', label: getCommonContent('bank_option_1', 'Bank Hapoalim') },
    { value: '2', label: getCommonContent('bank_option_2', 'Bank Leumi') },
    { value: '3', label: getCommonContent('bank_option_3', 'Bank Discount') },
    { value: '4', label: getCommonContent('bank_option_4', 'Bank Mizrahi') },
    { value: '5', label: getCommonContent('bank_option_5', 'Other Bank') }
  ]

  console.log('Bank options loaded:', bankOptions.length)

  return (
    <Column>
      <DropdownMenu
        title={title}
        placeholder={placeholder}
        data={bankOptions}
        value={values.bank}
        onChange={(value) => setFieldValue('bank', value)}
        onBlur={() => setFieldTouched('bank')}
        error={touched.bank && errors.bank}
        disabled={false}
      />
    </Column>
  )
}

export default Bank
