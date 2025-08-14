import * as Yup from 'yup'
import { getValidationErrorSync } from '@src/utils/validationHelpers'

// Helper function to check if a value indicates "no additional income"
const isNoAdditionalIncomeValue = (value: string): boolean => {
  if (!value) return false
  const lowerValue = value.toLowerCase()
  return (
    lowerValue === 'option_1' ||           // Legacy hardcoded value
    lowerValue === '1' ||                  // Alternative legacy value  
    lowerValue === 'no_additional_income' || // API semantic value
    lowerValue.includes('no_additional') || // Fuzzy matching
    lowerValue.includes('no additional') || // Fuzzy matching
    lowerValue.includes('none')            // Generic matching
  )
}

// Helper function to check if a value indicates "no obligations"
const isNoObligationValue = (value: string): boolean => {
  if (!value) return false
  const lowerValue = value.toLowerCase()
  return (
    lowerValue === 'option_1' ||           // Legacy hardcoded value
    lowerValue === '1' ||                  // Alternative legacy value
    lowerValue === 'no_obligations' ||     // API semantic value
    lowerValue.includes('no_obligation') || // Fuzzy matching
    lowerValue.includes('no obligation') || // Fuzzy matching
    lowerValue.includes('none')            // Generic matching
  )
}

// Helper function to check if income source requires employment fields
const requiresEmploymentFields = (value: string): boolean => {
  if (!value) return false
  const lowerValue = value.toLowerCase()
  // These are the API values that DON'T require employment fields
  const noFieldsRequired = [
    'unemployed',           // API value for unemployed
    'student',             // API value for student
    'unpaid_leave',        // API value for unpaid leave
    'other'               // API value for other (may not require all fields)
  ]
  return !noFieldsRequired.includes(lowerValue)
}

// Dynamic validation schema that gets validation errors from database at runtime
export const getValidationSchema = () => Yup.object().shape({
  mainSourceOfIncome: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')).test(
    'not-empty',
    getValidationErrorSync('error_select_answer', 'Please select an answer'),
    (value) => value !== null && value !== undefined && value !== ''
  ),
  monthlyIncome: Yup.number().when('mainSourceOfIncome', {
    is: (value: string) => requiresEmploymentFields(value),
    then: (schema) => schema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    otherwise: (schema) => schema.notRequired(),
  }),
  startDate: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) => requiresEmploymentFields(value),
    then: (schema) => schema.required(getValidationErrorSync('error_date', 'Please enter a valid date')),
    otherwise: (schema) => schema.notRequired(),
  }),
  fieldOfActivity: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) => value !== null && value !== undefined && value !== '' && requiresEmploymentFields(value),
    then: (shema) =>
      shema.required(getValidationErrorSync('error_select_field_of_activity', 'Please select field of activity')),
    otherwise: (shema) => shema.notRequired(),
  }),
  profession: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) => requiresEmploymentFields(value),
    then: (schema) => schema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    otherwise: (schema) => schema.notRequired(),
  }),
  companyName: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) => requiresEmploymentFields(value),
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
    is: (value: string) =>
      value !== null && value !== undefined && value !== '' && !isNoAdditionalIncomeValue(value),
    then: (shema) => shema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    otherwise: (shema) => shema.notRequired(),
  }),
  obligation: Yup.string().required(
    getValidationErrorSync('error_select_one_of_the_options', 'Please select one of the options')
  ),
  bank: Yup.string().when('obligation', {
    is: (value: string) =>
      value !== null && value !== undefined && value !== '' && !isNoObligationValue(value),
    then: (shema) => shema.required(getValidationErrorSync('error_select_bank', 'Please select a bank')),
    otherwise: (shema) => shema.notRequired(),
  }),
  monthlyPaymentForAnotherBank: Yup.number().when('obligation', {
    is: (value: string) =>
      value !== null && value !== undefined && value !== '' && !isNoObligationValue(value),
    then: (shema) => shema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    otherwise: (shema) => shema.notRequired(),
  }),
  endDate: Yup.string().when('obligation', {
    is: (value: string) =>
      value !== null && value !== undefined && value !== '' && !isNoObligationValue(value),
    then: (schema) => schema.required(getValidationErrorSync('error_date', 'Please enter a valid date')),
    otherwise: (schema) => schema.notRequired(),
  }),
})

// Keep backward compatibility
export const validationSchema = getValidationSchema()
