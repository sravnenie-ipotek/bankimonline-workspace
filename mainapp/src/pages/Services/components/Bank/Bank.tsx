import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'

import { FormTypes } from '../../types/formTypes'

const Bank = () => {
  const { t, i18n } = useTranslation()

  const BankSelectOptions = [
    { value: 'hapoalim', label: 'Bank Hapoalim' },
    { value: 'leumi', label: 'Leumi Bank' },
    { value: 'discount', label: 'Discount Bank' },
    { value: 'massad', label: 'Massad Bank' },
    { value: 'israel', label: 'Bank of Israel' },
  ]

  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()
  return (
    <Column>
      <DropdownMenu
        title={t('calculate_mortgage_bank')}
        placeholder={t('calculate_mortgage_bank')}
        data={BankSelectOptions}
        value={values.bank}
        onChange={(value) => setFieldValue('bank', value)}
        onBlur={() => setFieldTouched('bank')}
        error={touched.bank && errors.bank}
      />
    </Column>
  )
}

export default Bank
