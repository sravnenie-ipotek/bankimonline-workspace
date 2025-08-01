import * as Yup from 'yup'
import { getValidationErrorSync } from '@src/utils/validationHelpers'

// Dynamic validation schema that gets validation errors from database at runtime
export const getValidationSchema = () => Yup.object().shape({
  nameSurname: Yup.string().required(getValidationErrorSync('error_name_surname', 'Please enter your name and surname')),
  birthday: Yup.string().required(getValidationErrorSync('error_date', 'Please enter a valid date')),
  education: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')),
  additionalCitizenships: Yup.string().required(
    getValidationErrorSync('error_select_answer', 'Please select an answer')
  ),
  citizenshipsDropdown: Yup.array().when('additionalCitizenships', {
    is: 'yes',
    then: (schema) => schema.min(1, getValidationErrorSync('error_citizenship_countries_required', 'Please select additional citizenship countries')),
    otherwise: (schema) => schema.min(0),
  }),
  taxes: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')),
  countriesPayTaxes: Yup.array().when('taxes', {
    is: 'yes',
    then: (schema) => schema.min(1, getValidationErrorSync('error_tax_countries_required', 'Please select tax payment countries')),
    otherwise: (schema) => schema.min(0),
  }),
  childrens: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')),
  howMuchChildrens: Yup.number().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
  medicalInsurance: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')),
  isForeigner: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')),
  publicPerson: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')),
})

// Keep backward compatibility
export const validationSchema = getValidationSchema()
