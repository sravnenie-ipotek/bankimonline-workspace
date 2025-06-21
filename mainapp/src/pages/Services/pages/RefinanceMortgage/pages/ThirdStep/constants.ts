import i18next from 'i18next'
import * as Yup from 'yup'

export const validationSchema = Yup.object().shape({
  mainSourceOfIncome: Yup.string().required(i18next.t('error_select_answer')),
  monthlyIncome: Yup.number().when('mainSourceOfIncome', {
    is: (value: string) => !['option_5', 'option_6'].includes(value),
    then: (schema) => schema.required(i18next.t('error_fill_field')),
    otherwise: (schema) => schema.notRequired(),
  }),
  startDate: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) => !['option_5', 'option_6'].includes(value),
    then: (schema) => schema.required(i18next.t('error_date')),
    otherwise: (schema) => schema.notRequired(),
  }),
  fieldOfActivity: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) =>
      value !== null && value !== undefined && value !== '' && !['option_5', 'option_6'].includes(value),
    then: (shema) =>
      shema.required(i18next.t('error_select_field_of_activity')),
    otherwise: (shema) => shema.notRequired(),
  }),
  profession: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) => !['option_5', 'option_6'].includes(value),
    then: (schema) => schema.required(i18next.t('error_fill_field')),
    otherwise: (schema) => schema.notRequired(),
  }),
  companyName: Yup.string().when('mainSourceOfIncome', {
    is: (value: string) => !['option_5', 'option_6'].includes(value),
    then: (schema) => schema.required(i18next.t('error_fill_field')),
    otherwise: (schema) => schema.notRequired(),
  }),
  additionalIncome: Yup.string().required(
    i18next.t('error_select_one_of_the_options')
  ),
  additionalIncomeAmount: Yup.number().when('additionalIncome', {
    is: (value: string) =>
      value !== null && value !== undefined && value !== '' && value !== 'option_1',
    then: (shema) => shema.required(i18next.t('error_fill_field')),
    otherwise: (shema) => shema.notRequired(),
  }),
  obligation: Yup.string().required(
    i18next.t('error_select_one_of_the_options')
  ),
  bank: Yup.string().when('obligation', {
    is: (value: string) =>
      value !== null && value !== undefined && value !== '' && value !== 'option_1',
    then: (shema) => shema.required(i18next.t('error_select_bank')),
    otherwise: (shema) => shema.notRequired(),
  }),
  monthlyPaymentForAnotherBank: Yup.number().when('obligation', {
    is: (value: string) =>
      value !== null && value !== undefined && value !== '' && value !== 'option_1',
    then: (shema) => shema.required(i18next.t('error_fill_field')),
    otherwise: (shema) => shema.notRequired(),
  }),
  endDate: Yup.string().when('obligation', {
    is: (value: string) =>
      value !== null && value !== undefined && value !== '' && value !== 'option_1',
    then: (schema) => schema.required(i18next.t('error_date')),
    otherwise: (schema) => schema.notRequired(),
  }),
})
