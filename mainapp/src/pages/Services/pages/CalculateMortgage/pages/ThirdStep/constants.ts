import * as Yup from 'yup'
import { getValidationErrorSync } from '@src/utils/validationHelpers'

// Helper function to check if a value indicates "no income" or "unemployed"
const isNoIncomeValue = (value: string): boolean => {
  if (!value) return false
  const lowerValue = value.toLowerCase()
  return (
    lowerValue.includes('unemployed') ||
    lowerValue.includes('no_income') || 
    lowerValue.includes('no income') ||
    lowerValue.includes('option_5') ||
    lowerValue.includes('option_6') ||
    lowerValue === 'app.mortgage.step3.main_source_income_option_5' ||
    lowerValue === 'app.mortgage.step3.main_source_income_option_6'
  )
}

// Helper function to check if a value indicates "no additional income"
const isNoAdditionalIncomeValue = (value: string): boolean => {
  if (!value) return false
  const lowerValue = value.toLowerCase()
  return (
    lowerValue === 'option_1' ||
    lowerValue === '1' ||
    lowerValue.includes('no_additional') ||
    lowerValue.includes('no additional') ||
    lowerValue.includes('none')
  )
}

// Helper function to check if a value indicates "no obligation"
const isNoObligationValue = (value: string): boolean => {
  if (!value) return false
  const lowerValue = value.toLowerCase()
  return (
    lowerValue === 'option_1' ||
    lowerValue.includes('no_obligation') ||
    lowerValue.includes('no obligation') ||
    lowerValue.includes('none')
  )
}

// Validation schema for CalculateMortgage ThirdStep - Fixed validation logic for database-driven dropdowns
export const validationSchema = Yup.object().shape({
  mainSourceOfIncome: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')).test(
    'not-empty',
    getValidationErrorSync('error_select_answer', 'Please select an answer'),
    (value) => value !== null && value !== undefined && value !== ''
  ),
  monthlyIncome: Yup.number().when('mainSourceOfIncome', {
    is: (value: string) => !isNoIncomeValue(value), // Not unemployed or no income
    then: (schema) => schema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    otherwise: (schema) => schema.notRequired(),
  }),
  startDate: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) => !isNoIncomeValue(value), // Not unemployed or no income
    then: (schema) => schema.required(getValidationErrorSync('error_date', 'Please enter a valid date')),
    otherwise: (schema) => schema.notRequired(),
  }),
  fieldOfActivity: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) =>
      value !== null && value !== undefined && value !== '' && !isNoIncomeValue(value),
    then: (shema) =>
      shema.required(getValidationErrorSync('error_select_field_of_activity', 'Please select field of activity')),
    otherwise: (shema) => shema.notRequired(),
  }),
  profession: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) => !isNoIncomeValue(value), // Not unemployed or no income
    then: (schema) => schema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    otherwise: (schema) => schema.notRequired(),
  }),
  companyName: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) => !isNoIncomeValue(value), // Not unemployed or no income
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
