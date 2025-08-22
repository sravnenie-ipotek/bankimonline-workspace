import React from 'react'
import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { useContentApi } from '@src/hooks/useContentApi'
import { useDropdownData } from '@src/hooks/useDropdownData'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Error } from '@components/ui/Error'

import { FormTypes } from '../../types/formTypes'

interface ObligationProps {
  screenLocation?: string
}

const Obligation = ({ screenLocation }: ObligationProps) => {
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
  const { t } = useTranslation()
  const { getContent } = useContentApi(resolvedScreenLocation)
  const { values, setFieldValue, touched, errors, setFieldTouched, setFieldError } =
    useFormikContext<FormTypes>()

  // Helper function to check if a value indicates "no obligation"
  const checkIfNoObligationValue = (value: string): boolean => {
    if (!value) return false
    const lowerValue = value.toLowerCase()
    return (
      // English patterns
      lowerValue === 'option_1' ||
      lowerValue === 'no_obligations' ||           // Database value (plural)
      lowerValue.includes('no_obligation') ||      // Legacy patterns
      lowerValue.includes('no obligation') ||
      lowerValue.includes('no financial obligation') ||
      lowerValue.includes('none') ||
      
      // Hebrew patterns - ENHANCED for UI validation fix
      value.includes('אין התחייבות') ||             // "No obligation" in Hebrew
      value.includes('אין התחייבויות') ||           // "No obligations" (plural) in Hebrew - CRITICAL FIX
      value.includes('אין חובות') ||                // "No debts" in Hebrew  
      value.includes('ללא התחייבות') ||              // "Without obligation" in Hebrew
      value.includes('ללא התחייבויות') ||            // "Without obligations" (plural) in Hebrew
      value.includes('ללא חובות') ||                // "Without debts" in Hebrew

      lowerValue.includes('ein') ||                 // Hebrew romanized
      lowerValue.includes('לא') ||                  // "No" in Hebrew
      
      // Numeric patterns for database values
      lowerValue === '1' ||                         // Often first option
      lowerValue === '5' ||                         // Sometimes last option
      lowerValue.startsWith('option_') && (lowerValue.endsWith('1') || lowerValue.endsWith('5'))
    )
  }

  // Phase 4: Use database-driven dropdown data instead of hardcoded array
  // FIXED: Use 'obligations' to match API-generated key (credit_step3_obligations)
  const dropdownData = useDropdownData(resolvedScreenLocation, 'obligations', 'full')

  // Handle both DropdownData object and DropdownOption[] array
  const isDropdownDataObject = 'loading' in dropdownData
  const rawDropdownOptions = isDropdownDataObject ? dropdownData.options : dropdownData
  const isLoading = isDropdownDataObject ? dropdownData.loading : false
  const hasError = isDropdownDataObject ? dropdownData.error : null
  const dropdownLabel = isDropdownDataObject ? dropdownData.label : null
  const dropdownPlaceholder = isDropdownDataObject ? dropdownData.placeholder : null

  // CRITICAL FIX: Deduplicate dropdown options to prevent duplicate "אין התחייבויות כספיות"
  const dropdownOptions = React.useMemo(() => {
    if (!rawDropdownOptions || !Array.isArray(rawDropdownOptions)) {
      return rawDropdownOptions
    }

    // Create a map to track seen labels (both Hebrew and English)
    const seenLabels = new Set()
    const uniqueOptions = []

    rawDropdownOptions.forEach(option => {
      const label = option.label || option.text || option.value || ''
      const value = option.value || ''
      
      // Create a normalized key for deduplication
      const normalizedLabel = label.toLowerCase().trim()
      
      // Check if we've seen this label before
      if (!seenLabels.has(normalizedLabel) && !seenLabels.has(value.toLowerCase())) {
        seenLabels.add(normalizedLabel)
        seenLabels.add(value.toLowerCase())
        uniqueOptions.push(option)
      } else {
        console.log(`🔄 Removing duplicate option: "${label}" (value: "${value}")`)
      }
    })

    if (uniqueOptions.length !== rawDropdownOptions.length) {
      console.log(`✅ Deduplicated obligations: ${rawDropdownOptions.length} → ${uniqueOptions.length} options`)
    }

    return uniqueOptions
  }, [rawDropdownOptions])

  // Phase 4: Handle loading and error states
  if (isLoading) {
    }

  if (hasError) {
    console.warn('❌ Obligations dropdown error:', hasError)
  }

  // Debug obligation values
  console.log('Obligation debug:', {
    errors: errors.obligation,
    touched: touched.obligation
  })

  const handleValueChange = (value: string) => {
    console.log('Obligation value changed:', {
      value,
      willShowBankFields: !checkIfNoObligationValue(value),
      isNoObligationValue: checkIfNoObligationValue(value)
    })
    
    // Set the obligation value
    setFieldValue('obligation', value)
    setFieldTouched('obligation', true)
    
    // CRITICAL FIX: Clear dependent fields AND their validation state when "no_obligations" is selected
    if (checkIfNoObligationValue(value)) {
      // Clear field values
      setFieldValue('bank', '')
      setFieldValue('monthlyPaymentForAnotherBank', null)
      setFieldValue('endDate', '')
      
      // CRITICAL: Clear touched state to prevent validation errors
      setFieldTouched('bank', false)
      setFieldTouched('monthlyPaymentForAnotherBank', false)
      setFieldTouched('endDate', false)
      
      // CRITICAL: Clear any existing validation errors for all related fields
      setFieldError('bank', undefined)
      setFieldError('monthlyPaymentForAnotherBank', undefined)
      setFieldError('endDate', undefined)
      
      // NEW FIX: Also clear the obligation field validation error since a valid "no obligations" option was selected
      setFieldError('obligation', undefined)
      
      console.log('✅ Cleared all dependent fields and validation state for "no obligations"')
    }
  }

  // Simplified error display: Let Formik handle validation naturally
  const shouldShowError = touched.obligation && errors.obligation

  return (
    <Column>
      <DropdownMenu
        title={dropdownLabel || getContent('calculate_credit_existing_debts', 'חובות קיימים')}
        data={dropdownOptions}
        placeholder={dropdownPlaceholder || getContent('calculate_credit_existing_debts_ph', 'האם יש לך חובות או התחייבויות קיימים?')}
        value={values.obligation}
        onChange={handleValueChange}
        onBlur={() => setFieldTouched('obligation', true)}
        error={shouldShowError}
        disabled={isLoading}
      />
      {hasError && (
        <Error error={getContent('error_dropdown_load_failed', 'טעינת אפשרויות החובות נכשלה. אנא רענן את הדף.')} />
      )}
    </Column>
  )
}

export default Obligation
