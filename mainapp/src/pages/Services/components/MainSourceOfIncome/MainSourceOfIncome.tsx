import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'
import { useDropdownData } from '@src/hooks/useDropdownData'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Error } from '@components/ui/Error'

import { FormTypes } from '../../types/formTypes'

interface MainSourceOfIncomeProps {
  screenLocation?: string
}

const MainSourceOfIncome = ({ screenLocation = 'mortgage_step3' }: MainSourceOfIncomeProps) => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi(screenLocation)
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  // Phase 4: Use database-driven dropdown data instead of hardcoded array
  const dropdownData = useDropdownData(screenLocation, 'main_source', 'full')

  // Phase 4: Handle loading and error states
  if (dropdownData.loading) {
    console.log('🔄 Loading main source of income dropdown options...')
  }

  if (dropdownData.error) {
    console.warn('❌ Main source of income dropdown error:', dropdownData.error)
  }

  return (
    <Column>
      <DropdownMenu
        data={dropdownData.options}
        title={dropdownData.label || getContent('calculate_mortgage_main_source', 'calculate_mortgage_main_source')}
        placeholder={dropdownData.placeholder || getContent('calculate_mortgage_main_source_ph', 'calculate_mortgage_main_source_ph')}
        value={values.mainSourceOfIncome}
        onChange={(value) => setFieldValue('mainSourceOfIncome', value)}
        onBlur={() => setFieldTouched('mainSourceOfIncome', true)}
        error={touched.mainSourceOfIncome && errors.mainSourceOfIncome}
        disabled={dropdownData.loading}
      />
      {dropdownData.error && (
        <Error error="Failed to load main source of income options. Please refresh the page." />
      )}
    </Column>
  )
}

export default MainSourceOfIncome
