import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'

import { FormTypes } from '../../types/formTypes'

const MainSourceOfIncome = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]

  const MainSourceOfIncomeOptions = [
    { value: 'option_1', label: t('calculate_mortgage_main_source_option_1') },
    { value: 'option_2', label: t('calculate_mortgage_main_source_option_2') },
    { value: 'option_3', label: t('calculate_mortgage_main_source_option_3') },
    { value: 'option_4', label: t('calculate_mortgage_main_source_option_4') },
    { value: 'option_5', label: t('calculate_mortgage_main_source_option_5') },
    { value: 'option_6', label: t('calculate_mortgage_main_source_option_6') },
    { value: 'option_7', label: t('calculate_mortgage_main_source_option_7') },
  ]

  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <DropdownMenu
        data={MainSourceOfIncomeOptions}
        title={t('calculate_mortgage_main_source')}
        placeholder={t('calculate_mortgage_main_source_ph')}
        value={values.mainSourceOfIncome}
        onChange={(value) => setFieldValue('mainSourceOfIncome', value)}
        onBlur={() => setFieldTouched('mainSourceOfIncome', true)}
        error={touched.mainSourceOfIncome && errors.mainSourceOfIncome}
      />
    </Column>
  )
}

export default MainSourceOfIncome
