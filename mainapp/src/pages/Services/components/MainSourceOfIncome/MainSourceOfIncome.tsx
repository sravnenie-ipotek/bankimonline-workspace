import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { useContentApi } from '@src/hooks/useContentApi'
import { useDropdownData } from '@src/hooks/useDropdownData'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Error } from '@components/ui/Error'

import { FormTypes } from '../../types/formTypes'

interface MainSourceOfIncomeProps {
  screenLocation?: string
}

const MainSourceOfIncome = ({ screenLocation }: MainSourceOfIncomeProps) => {
  const location = useLocation()
  const resolvedScreenLocation = screenLocation
    ? screenLocation
    : location.pathname.includes('calculate-mortgage')
    ? 'mortgage_step3'
    : location.pathname.includes('refinance-mortgage')
    ? 'refinance_step3'
    : location.pathname.includes('other-borrowers')
    ? 'other_borrowers_step2'
    : 'credit_step3'
    
  // Debug logging for validation
  const { t } = useTranslation()
  const { getContent } = useContentApi(resolvedScreenLocation)
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  // ✅ UPDATED: Follow systemTranslationLogic.md - use database-first approach for all contexts
  // Use 'main_source_income' field name to match API key (credit_step3_main_source_income)
  const dropdownData = useDropdownData(resolvedScreenLocation, 'main_source', 'full') as {
    options: Array<{value: string; label: string}>;
    placeholder?: string;
    label?: string;
    loading: boolean;
    error: Error | null;
  }

  // Debug dropdown data
  ,
    errors: errors.mainSourceOfIncome,
    touched: touched.mainSourceOfIncome,
    errorShowing: touched.mainSourceOfIncome && errors.mainSourceOfIncome
  })

  const handleValueChange = (value: string) => {
    })
    
    // Prefer validating immediately on selection to clear initial required error
    setFieldValue('mainSourceOfIncome', value, true)

    // Mark as touched without triggering another validation cycle
    setFieldTouched('mainSourceOfIncome', true, false)
  }

  // CRITICAL FIX: Custom error display logic to prevent validation errors on valid selections
  const shouldShowValidationError = (() => {
    // If field is not touched, don't show error
    if (!touched.mainSourceOfIncome) return false
    
    // If no error from Formik, don't show error
    if (!errors.mainSourceOfIncome) return false
    
    // CRITICAL: If we have a valid non-empty value, don't show validation errors
    // This addresses the race condition where Formik validation overrides our manual clear
    const hasValidValue = values.mainSourceOfIncome && 
                         values.mainSourceOfIncome !== '' && 
                         values.mainSourceOfIncome !== null && 
                         values.mainSourceOfIncome !== undefined
    
    if (hasValidValue) {
      return false
    }
    
    // For empty/invalid values, show the error normally
    return true
  })()

  return (
    <Column>
      <DropdownMenu
        data={dropdownData.options}
        title={dropdownData.label || getContent('calculate_credit_main_source', 'מקור הכנסה עיקרי')}
        placeholder={dropdownData.placeholder || getContent('calculate_credit_main_source_ph', 'בחר מקור הכנסה עיקרי')}
        value={values.mainSourceOfIncome || ''}
        onChange={handleValueChange}
        onBlur={() => setFieldTouched('mainSourceOfIncome', true, true)}
        error={shouldShowValidationError ? errors.mainSourceOfIncome : false}
        disabled={dropdownData.loading}
      />
      {dropdownData.error && (
        <Error error={getContent('error_dropdown_load_failed', 'טעינת אפשרויות מקור ההכנסה נכשלה. אנא רענן את הדף.')} />
      )}
    </Column>
  )
}

export default MainSourceOfIncome
