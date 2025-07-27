import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'

import { FormTypes } from '../../types/formTypes'

interface ObligationProps {
  screenLocation?: string
}

const Obligation = ({ screenLocation = 'mortgage_step3' }: ObligationProps) => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi(screenLocation)

  const { values, setFieldValue, touched, errors, setFieldTouched } =
    useFormikContext<FormTypes>()

  const DebtTypeOptions = [
    { value: 'option_1', label: getContent('calculate_mortgage_debt_types_option_1', 'calculate_mortgage_debt_types_option_1') },
    { value: 'option_2', label: getContent('calculate_mortgage_debt_types_option_2', 'calculate_mortgage_debt_types_option_2') },
    { value: 'option_3', label: getContent('calculate_mortgage_debt_types_option_3', 'calculate_mortgage_debt_types_option_3') },
    { value: 'option_4', label: getContent('calculate_mortgage_debt_types_option_4', 'calculate_mortgage_debt_types_option_4') },
    { value: 'option_5', label: getContent('calculate_mortgage_debt_types_option_5', 'calculate_mortgage_debt_types_option_5') },
  ]

  return (
    <Column>
      <DropdownMenu
        title={getContent('calculate_mortgage_debt_types', 'calculate_mortgage_debt_types')}
        data={DebtTypeOptions}
        placeholder={getContent('calculate_mortgage_debt_types_ph', 'calculate_mortgage_debt_types_ph')}
        value={values.obligation}
        onChange={(value) => setFieldValue('obligation', value)}
        onBlur={() => setFieldTouched('obligation')}
        error={touched.obligation && errors.obligation}
      />
    </Column>
  )
}

export default Obligation
