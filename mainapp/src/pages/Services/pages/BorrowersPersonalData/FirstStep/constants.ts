import * as Yup from 'yup'
import { getValidationError } from '@src/utils/validationHelpers'

export const validationSchema = Yup.object().shape({
  nameSurname: Yup.string().required(getValidationError('error_name_surname', 'Please enter your name and surname')),
  birthday: Yup.string().required(getValidationError('error_date', 'Please enter a valid date')),
  education: Yup.string().required(getValidationError('error_select_answer', 'Please select an answer')),
  additionalCitizenships: Yup.string().required(
    getValidationError('error_select_answer', 'Please select an answer')
  ),
  citizenshipsDropdown: Yup.array().when('additionalCitizenships', {
    is: 'yes',
    then: (shema) => shema.min(1, getValidationError('error_select_answer', 'Please select an answer')),
    otherwise: (shema) => shema.min(0),
  }),
  taxes: Yup.string().required(getValidationError('error_select_answer', 'Please select an answer')),
  countriesPayTaxes: Yup.array().when('taxes', {
    is: 'yes',
    then: (shema) => shema.min(1, getValidationError('error_select_answer', 'Please select an answer')),
    otherwise: (shema) => shema.min(0),
  }),
  childrens: Yup.string().required(getValidationError('error_select_answer', 'Please select an answer')),
  howMuchChildrens: Yup.number().required(getValidationError('error_fill_field', 'Please fill this field')),
  medicalInsurance: Yup.string().required(getValidationError('error_select_answer', 'Please select an answer')),
  isForeigner: Yup.string().required(getValidationError('error_select_answer', 'Please select an answer')),
  publicPerson: Yup.string().required(getValidationError('error_select_answer', 'Please select an answer')),
})
