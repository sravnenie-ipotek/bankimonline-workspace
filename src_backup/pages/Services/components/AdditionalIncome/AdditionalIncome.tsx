import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import AddInc from '@components/ui/ContextButtons/AddInc/AddInc.tsx'
import { DropdownMenu } from '@components/ui/DropdownMenu'

import { FormTypes } from '../../types/formTypes'

const AdditionalIncome = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]

  const { values, setFieldValue, errors, setFieldTouched, touched } =
    useFormikContext<FormTypes>()

  const AdditionalIncomeOptions = [
    {
      value: 'option_1',
      label: t('calculate_mortgage_has_additional_option_1'),
    },
    {
      value: 'option_2',
      label: t('calculate_mortgage_has_additional_option_2'),
    },
    {
      value: 'option_3',
      label: t('calculate_mortgage_has_additional_option_3'),
    },
    {
      value: 'option_4',
      label: t('calculate_mortgage_has_additional_option_4'),
    },
    {
      value: 'option_5',
      label: t('calculate_mortgage_has_additional_option_5'),
    },
    {
      value: 'option_6',
      label: t('calculate_mortgage_has_additional_option_6'),
    },
    {
      value: 'option_7',
      label: t('calculate_mortgage_has_additional_option_7'),
    },
  ]

  return (
    <Column>
      <DropdownMenu
        title={t('calculate_mortgage_has_additional')}
        placeholder={t('calculate_mortgage_has_additional_ph')}
        data={AdditionalIncomeOptions}
        value={values.additionalIncome}
        onChange={(value) => setFieldValue('additionalIncome', value)}
        onBlur={() => setFieldTouched('additionalIncome')}
        error={touched.additionalIncome && errors.additionalIncome}
      />
      <AddInc />
    </Column>
  )
}

export default AdditionalIncome
