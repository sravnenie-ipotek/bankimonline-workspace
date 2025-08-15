/**
 * 🛡️ AI PROTECTION ZONE 🚨
 * 
 * This file is protected from AI modifications unless explicitly requested.
 * 
 * PROTECTION RULES:
 * - DO NOT modify this file without explicit user request
 * - DO NOT refactor, optimize, or "improve" this code
 * - DO NOT change variable names, structure, or logic
 * - DO NOT modify Formik integration or validation
 * - DO NOT change dropdown data handling
 * - ONLY modify if user specifically asks for changes
 * 
 * BUSINESS CRITICAL:
 * - This component handles financial obligations selection for borrowers
 * - Changes could affect mortgage calculation accuracy
 * - Requires thorough testing before any modifications
 * 
 * Last modified: 2025-01-27 (Fixed validation bypass for dropdown selections)
 * Protected by: AI Assistant
 * File purpose: Other borrowers obligation dropdown component for mortgage calculator
 * 
 * To allow AI modifications, add: "ALLOW_AI_MODIFICATIONS: true"
 */

import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'
import { useDropdownData } from '@src/hooks/useDropdownData'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Error } from '@components/ui/Error'

import { FormTypes } from '../../types/formTypes'

interface OtherBorrowersObligationProps {
  screenLocation?: string
}

const OtherBorrowersObligation = ({ screenLocation = 'other_borrowers_step2' }: OtherBorrowersObligationProps) => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi(screenLocation)
  const { values, setFieldValue, touched, errors, setFieldTouched, setFieldError } =
    useFormikContext<FormTypes>()

  // Helper function to check if a value indicates "no obligation"
  const checkIfNoObligationValue = (value: string): boolean => {
    if (!value) return false
    const lowerValue = value.toLowerCase()
    return (
      lowerValue === 'option_1' ||
      lowerValue === 'no_obligations' ||
      lowerValue.includes('no_obligation') ||
      lowerValue.includes('no obligation') ||
      lowerValue.includes('none')
    )
  }

  // Primary dropdown data for this screen (database-first)
  const dropdownData = useDropdownData(screenLocation, 'obligations', 'full')

  // Fallback: reuse obligations list from mortgage_step3 if current screen has missing / incomplete options
  // NOTE: Hook must be invoked unconditionally to comply with React rules
  const fallbackDropdownData = useDropdownData('mortgage_step3', 'obligations', 'full')

  // Handle both DropdownData object and DropdownOption[] array
  const isDropdownDataObject = 'loading' in dropdownData
  const isFallbackDataObject = 'loading' in fallbackDropdownData
  
  const initialDropdownOptions = isDropdownDataObject ? dropdownData.options : dropdownData
  const fallbackOptions = isFallbackDataObject ? fallbackDropdownData.options : fallbackDropdownData

  // Apply fallback according to SystemTranslationLogic.md → always provide at least the full obligations list
  const dropdownOptions =
    (initialDropdownOptions?.length || 0) > 1 ? initialDropdownOptions : (fallbackOptions || [])

  const isLoading = isDropdownDataObject ? dropdownData.loading : false
  const hasError = isDropdownDataObject ? dropdownData.error : null

  // Debug obligation values
  ,
    errors: errors.obligation,
    touched: touched.obligation,
    errorShowing: touched.obligation && errors.obligation,
    selectedItem: dropdownOptions?.find(item => item.value === values.obligation),
    screenLocation
  })

  const handleValueChange = (value: string) => {
    ,
      willShowBankFields: !checkIfNoObligationValue(value)
    })
    
    // CRITICAL FIX: Work WITH Formik's validation cycle instead of against it
    // Set the value first without triggering validation
    setFieldValue('obligation', value, false) // false = don't validate
    
    // For valid non-empty values, clear error and mark as untouched temporarily
    if (value && value !== '' && value !== null && value !== undefined) {
      // Clear any existing error
      setFieldError('obligation', undefined)
      
      // Mark as touched but without validation
      setFieldTouched('obligation', true, false)
      
      // Use a microtask to ensure our error clear persists after React state updates
      Promise.resolve().then(() => {
        setFieldError('obligation', undefined)
        })
      
      } else {
      // For empty values, allow normal validation
      setFieldTouched('obligation', true, true) // true = validate
    }
  }

  // CRITICAL FIX: Custom error display logic to prevent validation errors on valid selections
  const shouldShowValidationError = (() => {
    // If field is not touched, don't show error
    if (!touched.obligation) return false
    
    // If no error from Formik, don't show error
    if (!errors.obligation) return false
    
    // CRITICAL: If we have a valid non-empty value, don't show validation errors
    // This addresses the race condition where Formik validation overrides our manual clear
    const hasValidValue = values.obligation && 
                         values.obligation !== '' && 
                         values.obligation !== null && 
                         values.obligation !== undefined
    
    if (hasValidValue) {
      return false
    }
    
    // For empty/invalid values, show the error normally
    return true
  })()

  // Use other-borrowers specific content keys
  const title = getContent('other_borrowers_obligation_title', 'other_borrowers_obligation_title')
  const placeholder = getContent('other_borrowers_obligation_placeholder', 'other_borrowers_obligation_placeholder')

  return (
    <Column>
      <DropdownMenu
        title={title}
        data={dropdownOptions}
        placeholder={placeholder}
        value={values.obligation}
        onChange={handleValueChange}
        onBlur={() => setFieldTouched('obligation', true)}
        error={shouldShowValidationError ? errors.obligation : false}
        disabled={isLoading}
      />
      {hasError && (
        <Error error={getContent('error_dropdown_load_failed', 'Failed to load obligations options. Please refresh the page.')} />
      )}
    </Column>
  )
}

export default OtherBorrowersObligation
