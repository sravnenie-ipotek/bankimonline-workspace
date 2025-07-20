import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'

import { FormTypes } from '../../types/formTypes'

const MainSourceOfIncome = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('mortgage_step3')

  const MainSourceOfIncomeOptions = [
    { value: 'option_1', label: getContent('calculate_mortgage_main_source_option_1', 'calculate_mortgage_main_source_option_1') },
    { value: 'option_2', label: getContent('calculate_mortgage_main_source_option_2', 'calculate_mortgage_main_source_option_2') },
    { value: 'option_3', label: getContent('calculate_mortgage_main_source_option_3', 'calculate_mortgage_main_source_option_3') },
    { value: 'option_4', label: getContent('calculate_mortgage_main_source_option_4', 'calculate_mortgage_main_source_option_4') },
    { value: 'option_5', label: getContent('calculate_mortgage_main_source_option_5', 'calculate_mortgage_main_source_option_5') },
    { value: 'option_6', label: getContent('calculate_mortgage_main_source_option_6', 'calculate_mortgage_main_source_option_6') },
    { value: 'option_7', label: getContent('calculate_mortgage_main_source_option_7', 'calculate_mortgage_main_source_option_7') },
  ]

  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <DropdownMenu
        data={MainSourceOfIncomeOptions}
        title={getContent('calculate_mortgage_main_source', 'calculate_mortgage_main_source')}
        placeholder={getContent('calculate_mortgage_main_source_ph', 'calculate_mortgage_main_source_ph')}
        value={values.mainSourceOfIncome}
        onChange={(value) => setFieldValue('mainSourceOfIncome', value)}
        onBlur={() => setFieldTouched('mainSourceOfIncome', true)}
        error={touched.mainSourceOfIncome && errors.mainSourceOfIncome}
      />
    </Column>
  )
}

export default MainSourceOfIncome
