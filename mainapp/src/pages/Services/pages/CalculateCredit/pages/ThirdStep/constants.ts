import * as Yup from 'yup'
import { getValidationErrorSync } from '@src/utils/validationHelpers'

// Dynamic validation schema that gets validation errors from database at runtime
export const getValidationSchema = () => Yup.object().shape({
  mainSourceOfIncome: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')).test(
    'not-empty',
    getValidationErrorSync('error_select_answer', 'Please select an answer'),
    (value) => value !== null && value !== undefined && value !== ''
  ),
  monthlyIncome: Yup.number().when('mainSourceOfIncome', {
    is: (value: string) => !['5', '6'].includes(value), // Not student or unemployed (API values)
    then: (schema) => schema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    otherwise: (schema) => schema.notRequired(),
  }),
  startDate: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) => !['5', '6'].includes(value), // Not student or unemployed (API values)
    then: (schema) => schema.required(getValidationErrorSync('error_date', 'Please enter a valid date')),
    otherwise: (schema) => schema.notRequired(),
  }),
  fieldOfActivity: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) =>
      value !== null && value !== undefined && value !== '' && !['5', '6'].includes(value),
    then: (shema) =>
      shema.required(getValidationErrorSync('error_select_field_of_activity', 'Please select field of activity')),
    otherwise: (shema) => shema.notRequired(),
  }),
  profession: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) => !['5', '6'].includes(value), // Not student or unemployed (API values)
    then: (schema) => schema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    otherwise: (schema) => schema.notRequired(),
  }),
  companyName: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) => !['5', '6'].includes(value), // Not student or unemployed (API values)
    then: (schema) => schema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    otherwise: (schema) => schema.notRequired(),
  }),
  additionalIncome: Yup.string().required(
    getValidationErrorSync('error_select_one_of_the_options', 'Please select one of the options')
  ).test(
    'not-empty',
    getValidationErrorSync('error_select_one_of_the_options', 'Please select one of the options'),
    (value) => value !== null && value !== undefined && value !== ''
  ),
  additionalIncomeAmount: Yup.number().when('additionalIncome', {
    is: (value: string) => {
      if (!value) return false
      const lowerValue = value.toLowerCase()
      
      // Return true if additional income is required (has additional income)
      // Return false if no additional income (field not required)
      const isNoAdditionalIncome = (
        // English patterns
        value === 'no_additional_income' ||
        value === 'option_1' ||
        value === '1' ||
        lowerValue.includes('no_additional') ||
        lowerValue.includes('none') ||
        
        // Hebrew patterns - CRITICAL FIX for Hebrew interface
        value.includes('אין הכנסות נוספות') ||
        value.includes('אין הכנסות') ||
        value.includes('ללא הכנסות נוספות') ||
        value.includes('ללא הכנסות') ||
        lowerValue.includes('ein')
      )
      
      return !isNoAdditionalIncome // Require amount if NOT "no additional income"
    },
    then: (shema) => shema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    otherwise: (shema) => shema.notRequired().nullable(),
  }),
  obligation: Yup.string().required(
    getValidationErrorSync('error_select_one_of_the_options', 'Please select one of the options')
  ),
  bank: Yup.string().when('obligation', {
    is: (value: string) => {
      if (!value) return false
      const lowerValue = value.toLowerCase()
      
      // Return true if bank selection is required (has obligations)
      // Return false if no obligations (field not required)
      const isNoObligations = (
        // English patterns
        value === 'no_obligations' ||
        value === 'option_5' ||
        value === '5' ||
        value === 'option_1' ||
        value === '1' ||
        lowerValue.includes('no_obligation') ||
        lowerValue.includes('none') ||
        
        // Hebrew patterns - CRITICAL FIX for Hebrew interface
        value.includes('אין התחייבות') ||
        value.includes('אין חובות') ||
        value.includes('ללא התחייבות') ||
        value.includes('ללא חובות') ||
        lowerValue.includes('ein')
      )
      
      return !isNoObligations // Require bank if NOT "no obligations"
    },
    then: (shema) => shema.required(getValidationErrorSync('error_select_bank', 'Please select a bank')),
    otherwise: (shema) => shema.notRequired().nullable(),
  }),
  monthlyPaymentForAnotherBank: Yup.number().when('obligation', {
    is: (value: string) => {
      if (!value) return false
      const lowerValue = value.toLowerCase()
      
      const isNoObligations = (
        // English patterns
        value === 'no_obligations' ||
        value === 'option_5' ||
        value === '5' ||
        value === 'option_1' ||
        value === '1' ||
        lowerValue.includes('no_obligation') ||
        lowerValue.includes('none') ||
        
        // Hebrew patterns - CRITICAL FIX for Hebrew interface
        value.includes('אין התחייבות') ||
        value.includes('אין חובות') ||
        value.includes('ללא התחייבות') ||
        value.includes('ללא חובות') ||
        lowerValue.includes('ein')
      )
      
      return !isNoObligations // Require payment if NOT "no obligations"
    },
    then: (shema) => shema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    otherwise: (shema) => shema.notRequired().nullable(),
  }),
  endDate: Yup.string().when('obligation', {
    is: (value: string) => {
      if (!value) return false
      const lowerValue = value.toLowerCase()
      
      const isNoObligations = (
        // English patterns
        value === 'no_obligations' ||
        value === 'option_5' ||
        value === '5' ||
        value === 'option_1' ||
        value === '1' ||
        lowerValue.includes('no_obligation') ||
        lowerValue.includes('none') ||
        
        // Hebrew patterns - CRITICAL FIX for Hebrew interface
        value.includes('אין התחייבות') ||
        value.includes('אין חובות') ||
        value.includes('ללא התחייבות') ||
        value.includes('ללא חובות') ||
        lowerValue.includes('ein')
      )
      
      return !isNoObligations // Require date if NOT "no obligations"
    },
    then: (schema) => schema.required(getValidationErrorSync('error_date', 'Please enter a valid date')),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
})

// Keep backward compatibility
export const validationSchema = getValidationSchema()
