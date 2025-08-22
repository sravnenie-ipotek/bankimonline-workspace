import * as Yup from 'yup'
import { getValidationErrorSync } from '@src/utils/validationHelpers'

export const validationSchema = Yup.object().shape({
  mainSourceOfIncome: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')).test(
    'not-empty',
    getValidationErrorSync('error_select_answer', 'Please select an answer'),
    (value) => value !== null && value !== undefined && value !== ''
  ),
  monthlyIncome: Yup.number().when('mainSourceOfIncome', {
    is: (value: string) => !['app.mortgage.step3.main_source_income_option_5', 'app.mortgage.step3.main_source_income_option_6'].includes(value), // Not unemployed or no income
    then: (schema) => schema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    otherwise: (schema) => schema.notRequired(),
  }),
  startDate: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) => !['app.mortgage.step3.main_source_income_option_5', 'app.mortgage.step3.main_source_income_option_6'].includes(value), // Not unemployed or no income
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
    is: (value: string) => !['app.mortgage.step3.main_source_income_option_5', 'app.mortgage.step3.main_source_income_option_6'].includes(value), // Not unemployed or no income
    then: (schema) => schema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    otherwise: (schema) => schema.notRequired(),
  }),
  companyName: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) => !['app.mortgage.step3.main_source_income_option_5', 'app.mortgage.step3.main_source_income_option_6'].includes(value), // Not unemployed or no income
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
      if (!value || value === null || value === undefined || value === '') return false;
      // Check for "no additional income" patterns from API
      return !['option_1', 'no_additional_income', '1'].includes(value) && 
             !value.includes('אין הכנסות נוספות') && 
             !value.includes('no_additional');
    },
    then: (shema) => shema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    otherwise: (shema) => shema.notRequired(),
  }),
  obligation: Yup.string().required(
    getValidationErrorSync('error_select_one_of_the_options', 'Please select one of the options')
  ).test(
    'not-empty',
    getValidationErrorSync('error_select_one_of_the_options', 'Please select one of the options'),
    (value) => value !== null && value !== undefined && value !== ''
  ),
  bank: Yup.string().when('obligation', {
    is: (value: string) => {
      if (!value || value === null || value === undefined || value === '') return false;
      // Check for "no obligations" patterns from API
      return !['option_1', 'no_obligations', '1'].includes(value) && 
             !value.includes('אין התחייבויות') && 
             !value.includes('no_obligation');
    },
    then: (shema) => shema.required(getValidationErrorSync('error_select_bank', 'Please select a bank')),
    otherwise: (shema) => shema.notRequired(),
  }),
  monthlyPaymentForAnotherBank: Yup.number().when('obligation', {
    is: (value: string) => {
      if (!value || value === null || value === undefined || value === '') return false;
      // Check for "no obligations" patterns from API
      return !['option_1', 'no_obligations', '1'].includes(value) && 
             !value.includes('אין התחייבויות') && 
             !value.includes('no_obligation');
    },
    then: (shema) => shema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    otherwise: (shema) => shema.notRequired(),
  }),
  endDate: Yup.string().when('obligation', {
    is: (value: string) => {
      if (!value || value === null || value === undefined || value === '') return false;
      // Check for "no obligations" patterns from API
      return !['option_1', 'no_obligations', '1'].includes(value) && 
             !value.includes('אין התחייבויות') && 
             !value.includes('no_obligation');
    },
    then: (schema) => schema.required(getValidationErrorSync('error_date', 'Please enter a valid date')),
    otherwise: (schema) => schema.notRequired(),
  }),
})
