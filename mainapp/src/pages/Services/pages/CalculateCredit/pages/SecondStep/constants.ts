import * as Yup from 'yup'
import { getValidationErrorSync } from '@src/utils/validationHelpers'

export const validationSchema = Yup.object().shape({
  nameSurname: Yup.string().required(getValidationErrorSync('error_name_surname', 'Please enter your name and surname')),
  birthday: Yup.string().required(getValidationErrorSync('error_date', 'Please enter a valid date')),
  education: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')),
  additionalCitizenships: Yup.string().required(
    getValidationErrorSync('error_select_answer', 'Please select an answer')
  ),
  citizenshipsDropdown: Yup.array().when('additionalCitizenships', {
    is: 'yes',
    then: (shema) => shema.min(1, getValidationErrorSync('error_select_answer', 'Please select an answer')),
    otherwise: (shema) => shema.min(0),
  }),
  taxes: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')),
  countriesPayTaxes: Yup.array().when('taxes', {
    is: 'yes',
    then: (shema) => shema.min(1, getValidationErrorSync('error_select_answer', 'Please select an answer')),
    otherwise: (shema) => shema.min(0),
  }),
  childrens: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')),
  howMuchChildrens: Yup.number().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
  medicalInsurance: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')),
  isForeigner: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')),
  publicPerson: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')),
  borrowers: Yup.number()
    .min(1, getValidationErrorSync('error_quantity_borrowers', 'At least one borrower is required'))
    .required(getValidationErrorSync('error_quantity_borrowers', 'Number of borrowers is required')),
  familyStatus: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')),
  partnerPayMortgage: Yup.string().when('familyStatus', {
    is: 'married', // Database returns lowercase 'married'
    then: (shema) => shema.required(getValidationErrorSync('error_select_answer', 'Please select an answer')),
    otherwise: (shema) => shema.notRequired(),
  }),
})
