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
    is: (value: string) => !['app.mortgage.step3.main_source_income_option_5', 'app.mortgage.step3.main_source_income_option_6'].includes(value),
    then: (schema) => schema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    otherwise: (schema) => schema.notRequired(),
  }),
  startDate: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) => !['app.mortgage.step3.main_source_income_option_5', 'app.mortgage.step3.main_source_income_option_6'].includes(value),
    then: (schema) => schema.required(getValidationErrorSync('error_date', 'Please enter a valid date')),
    otherwise: (schema) => schema.notRequired(),
  }),
  fieldOfActivity: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) =>
      value !== null && value !== undefined && value !== '' && !['app.mortgage.step3.main_source_income_option_5', 'app.mortgage.step3.main_source_income_option_6'].includes(value),
    then: (shema) =>
      shema.required(getValidationErrorSync('error_select_field_of_activity', 'Please select field of activity')),
    otherwise: (shema) => shema.notRequired(),
  }),
  profession: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) => !['app.mortgage.step3.main_source_income_option_5', 'app.mortgage.step3.main_source_income_option_6'].includes(value),
    then: (schema) => schema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    otherwise: (schema) => schema.notRequired(),
  }),
  companyName: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) => !['app.mortgage.step3.main_source_income_option_5', 'app.mortgage.step3.main_source_income_option_6'].includes(value),
    then: (schema) => schema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    otherwise: (schema) => schema.notRequired(),
  }),
  additionalIncome: Yup.string().required(
    getValidationErrorSync('error_select_one_of_the_options', 'Please select one of the options')
  ),
  additionalIncomeAmount: Yup.number().when('additionalIncome', {
    is: (value: string) =>
      value !== null && value !== undefined && value !== '' && value !== 'option_1' && value !== 'no_additional_income',
    then: (shema) => shema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    otherwise: (shema) => shema.notRequired(),
  }),
  obligation: Yup.string().required(
    getValidationErrorSync('error_select_one_of_the_options', 'Please select one of the options')
  ),
  bank: Yup.string().when('obligation', {
    is: (value: string) =>
      value !== null && value !== undefined && value !== '' && value !== 'no_obligations',
    then: (shema) => shema.required(getValidationErrorSync('error_select_bank', 'Please select a bank')),
    otherwise: (shema) => shema.notRequired(),
  }),
  monthlyPaymentForAnotherBank: Yup.number().when('obligation', {
    is: (value: string) =>
      value !== null && value !== undefined && value !== '' && value !== 'no_obligations',
    then: (shema) => shema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    otherwise: (shema) => shema.notRequired(),
  }),
  endDate: Yup.string().when('obligation', {
    is: (value: string) =>
      value !== null && value !== undefined && value !== '' && value !== 'no_obligations',
    then: (schema) => schema.required(getValidationErrorSync('error_date', 'Please enter a valid date')),
    otherwise: (schema) => schema.notRequired(),
  }),
})

// Keep backward compatibility
export const validationSchema = getValidationSchema()
