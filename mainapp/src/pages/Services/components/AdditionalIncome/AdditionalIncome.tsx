import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import AddInc from '@components/ui/ContextButtons/AddInc/AddInc.tsx'
import { DropdownMenu } from '@components/ui/DropdownMenu'

import { FormTypes } from '../../types/formTypes'

const AdditionalIncome = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('mortgage_step3')

  const { values, setFieldValue, errors, setFieldTouched, touched } =
    useFormikContext<FormTypes>()

  const AdditionalIncomeOptions = [
    {
      value: 'option_1',
      label: getContent('calculate_mortgage_has_additional_option_1', 'calculate_mortgage_has_additional_option_1'),
    },
    {
      value: 'option_2',
      label: getContent('calculate_mortgage_has_additional_option_2', 'calculate_mortgage_has_additional_option_2'),
    },
    {
      value: 'option_3',
      label: getContent('calculate_mortgage_has_additional_option_3', 'calculate_mortgage_has_additional_option_3'),
    },
    {
      value: 'option_4',
      label: getContent('calculate_mortgage_has_additional_option_4', 'calculate_mortgage_has_additional_option_4'),
    },
    {
      value: 'option_5',
      label: getContent('calculate_mortgage_has_additional_option_5', 'calculate_mortgage_has_additional_option_5'),
    },
    {
      value: 'option_6',
      label: getContent('calculate_mortgage_has_additional_option_6', 'calculate_mortgage_has_additional_option_6'),
    },
    {
      value: 'option_7',
      label: getContent('calculate_mortgage_has_additional_option_7', 'calculate_mortgage_has_additional_option_7'),
    },
  ]

  return (
    <Column>
      <DropdownMenu
        title={getContent('calculate_mortgage_has_additional', 'calculate_mortgage_has_additional')}
        placeholder={getContent('calculate_mortgage_has_additional_ph', 'calculate_mortgage_has_additional_ph')}
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
