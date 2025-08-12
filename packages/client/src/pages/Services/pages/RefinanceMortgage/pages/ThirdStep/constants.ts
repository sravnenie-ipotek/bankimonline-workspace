import * as Yup from 'yup'
import { getValidationErrorSync } from '@src/utils/validationHelpers'

// Helpers to normalize values coming from different dropdown sources
const isNoIncome = (value?: string): boolean => {
  if (!value) return false
  const v = value.toLowerCase()
  return (
    v === 'option_5' ||
    v === 'option_6' ||
    v === '5' ||
    v === '6' ||
    v.includes('unemployed') ||
    v.includes('no_income') ||
    v.includes('unpaid')
  )
}

const isNoAdditionalIncome = (value?: string): boolean => {
  if (!value) return false
  const v = value.toLowerCase()
  return v === 'option_1' || v === '1' || v.includes('no_additional') || v.includes('none')
}

const isNoObligations = (value?: string): boolean => {
  if (!value) return false
  const v = value.toLowerCase()
  return v === 'option_1' || v === '1' || v.includes('no_obligation') || v.includes('no_obligations') || v.includes('none')
}

// Dynamic validation schema that gets validation errors from database at runtime
export const getValidationSchema = () =>
  Yup.object().shape({
    mainSourceOfIncome: Yup.string()
      .required(getValidationErrorSync('error_select_answer', 'Please select an answer'))
      .test(
        'not-empty',
        getValidationErrorSync('error_select_answer', 'Please select an answer'),
        (value) => value !== null && value !== undefined && value !== ''
      ),

    monthlyIncome: Yup.number().when('mainSourceOfIncome', {
      is: (value: string) => !isNoIncome(value),
      then: (schema) => schema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      otherwise: (schema) => schema.notRequired(),
    }),

    // Accept both string (ISO) and number (timestamp) inputs
    startDate: Yup.mixed().when('mainSourceOfIncome', {
      is: (value: string) => !isNoIncome(value),
      then: (schema) => (schema as Yup.MixedSchema).required(getValidationErrorSync('error_date', 'Please enter a valid date')),
      otherwise: (schema) => schema.notRequired(),
    }),

    fieldOfActivity: Yup.string().when('mainSourceOfIncome', {
      is: (value: string) => value !== null && value !== undefined && value !== '' && !isNoIncome(value),
      then: (schema) => schema.required(getValidationErrorSync('error_select_field_of_activity', 'Please select field of activity')),
      otherwise: (schema) => schema.notRequired(),
    }),

    profession: Yup.string().when('mainSourceOfIncome', {
      is: (value: string) => !isNoIncome(value),
      then: (schema) => schema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      otherwise: (schema) => schema.notRequired(),
    }),

    companyName: Yup.string().when('mainSourceOfIncome', {
      is: (value: string) => !isNoIncome(value),
      then: (schema) => schema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      otherwise: (schema) => schema.notRequired(),
    }),

    additionalIncome: Yup.string().required(
      getValidationErrorSync('error_select_one_of_the_options', 'Please select one of the options'),
    ),

    additionalIncomeAmount: Yup.number().when('additionalIncome', {
      is: (value: string) => value !== null && value !== undefined && value !== '' && !isNoAdditionalIncome(value),
      then: (schema) => schema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      otherwise: (schema) => schema.notRequired(),
    }),

    obligation: Yup.string().required(
      getValidationErrorSync('error_select_one_of_the_options', 'Please select one of the options'),
    ),

    bank: Yup.string().when('obligation', {
      is: (value: string) => value !== null && value !== undefined && value !== '' && !isNoObligations(value),
      then: (schema) => schema.required(getValidationErrorSync('error_select_bank', 'Please select a bank')),
      otherwise: (schema) => schema.notRequired(),
    }),

    monthlyPaymentForAnotherBank: Yup.number().when('obligation', {
      is: (value: string) => value !== null && value !== undefined && value !== '' && !isNoObligations(value),
      then: (schema) => schema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      otherwise: (schema) => schema.notRequired(),
    }),

    endDate: Yup.mixed().when('obligation', {
      is: (value: string) => value !== null && value !== undefined && value !== '' && !isNoObligations(value),
      then: (schema) => (schema as Yup.MixedSchema).required(getValidationErrorSync('error_date', 'Please enter a valid date')),
      otherwise: (schema) => schema.notRequired(),
    }),
  })

// Keep backward compatibility
export const validationSchema = getValidationSchema()
