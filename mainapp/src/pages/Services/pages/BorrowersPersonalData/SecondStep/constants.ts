import * as Yup from 'yup'
import { getValidationError } from '@src/utils/validationHelpers'

export const validationSchema = Yup.object().shape({
  mainSourceOfIncome: Yup.string().required(getValidationError('error_select_answer', 'Please select an answer')),
  monthlyIncome: Yup.number().when('mainSourceOfIncome', {
    is: (value: string) => !['option_5', 'option_6'].includes(value), // Not unemployed or no income
    then: (schema) => schema.required(getValidationError('error_fill_field', 'Please fill this field')),
    otherwise: (schema) => schema.notRequired(),
  }),
  startDate: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) => !['option_5', 'option_6'].includes(value), // Not unemployed or no income
    then: (schema) => schema.required(getValidationError('error_date', 'Please enter a valid date')),
    otherwise: (schema) => schema.notRequired(),
  }),
  fieldOfActivity: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) =>
      value !== null && value !== undefined && value !== '' && !['option_5', 'option_6'].includes(value),
    then: (shema) =>
      shema.required(getValidationError('error_select_field_of_activity', 'Please select field of activity')),
    otherwise: (shema) => shema.notRequired(),
  }),
  profession: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) => !['option_5', 'option_6'].includes(value), // Not unemployed or no income
    then: (schema) => schema.required(getValidationError('error_fill_field', 'Please fill this field')),
    otherwise: (schema) => schema.notRequired(),
  }),
  companyName: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) => !['option_5', 'option_6'].includes(value), // Not unemployed or no income
    then: (schema) => schema.required(getValidationError('error_fill_field', 'Please fill this field')),
    otherwise: (schema) => schema.notRequired(),
  }),
  additionalIncome: Yup.string().required(
    getValidationError('error_select_one_of_the_options', 'Please select one of the options')
  ),
  additionalIncomeAmount: Yup.number().when('additionalIncome', {
    is: (value: string) =>
      value !== null && value !== undefined && value !== '' && value !== 'option_1',
    then: (shema) => shema.required(getValidationError('error_fill_field', 'Please fill this field')),
    otherwise: (shema) => shema.notRequired(),
  }),
  obligation: Yup.string().required(
    getValidationError('error_select_one_of_the_options', 'Please select one of the options')
  ),
  bank: Yup.string().when('obligation', {
    is: (value: string) =>
      value !== null && value !== undefined && value !== '' && value !== 'option_1',
    then: (shema) => shema.required(getValidationError('error_select_bank', 'Please select a bank')),
    otherwise: (shema) => shema.notRequired(),
  }),
  monthlyPaymentForAnotherBank: Yup.number().when('obligation', {
    is: (value: string) =>
      value !== null && value !== undefined && value !== '' && value !== 'option_1',
    then: (shema) => shema.required(getValidationError('error_fill_field', 'Please fill this field')),
    otherwise: (shema) => shema.notRequired(),
  }),
  endDate: Yup.string().when('obligation', {
    is: (value: string) =>
      value !== null && value !== undefined && value !== '' && value !== 'option_1',
    then: (schema) => schema.required(getValidationError('error_date', 'Please enter a valid date')),
    otherwise: (schema) => schema.notRequired(),
  }),
})
