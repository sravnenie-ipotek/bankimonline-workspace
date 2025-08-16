import * as Yup from 'yup'
import { getValidationErrorSync } from '@src/utils/validationHelpers'

export const getValidationSchema = () => Yup.object().shape({
  nameSurname: Yup.string().required(getValidationErrorSync('error_name_surname', 'Please enter your name and surname')),
  birthday: Yup.string().required(getValidationErrorSync('error_date', 'Please enter a valid date')),
  education: Yup.string().required(getValidationErrorSync('error_education_required', 'Education is required')),
  additionalCitizenships: Yup.string().required(
    getValidationErrorSync('error_citizenship_required', 'Citizenship information is required')
  ),
  citizenshipsDropdown: Yup.array().when('additionalCitizenships', {
    is: 'yes',
    then: (shema) => shema.min(1, getValidationErrorSync('error_citizenship_countries_required', 'Please select at least one citizenship country')),
    otherwise: (shema) => shema.min(0),
  }),
  taxes: Yup.string().required(getValidationErrorSync('error_taxes_required', 'Tax payment information is required')),
  countriesPayTaxes: Yup.array().when('taxes', {
    is: 'yes',
    then: (shema) => shema.min(1, getValidationErrorSync('error_tax_countries_required', 'Please select at least one tax country')),
    otherwise: (shema) => shema.min(0),
  }),
  childrens: Yup.string().required(getValidationErrorSync('error_children_required', 'Children information is required')),
  howMuchChildrens: Yup.number().required(getValidationErrorSync('error_children_count_required', 'Number of children is required')),
  medicalInsurance: Yup.string().required(getValidationErrorSync('error_medical_insurance_required', 'Medical insurance information is required')),
  isForeigner: Yup.string().required(getValidationErrorSync('error_foreigner_required', 'Foreigner status is required')),
  publicPerson: Yup.string().required(getValidationErrorSync('error_public_person_required', 'Public person status is required')),
  borrowers: Yup.number()
    .min(1, getValidationErrorSync('error_quantity_borrowers', 'At least one borrower is required'))
    .required(getValidationErrorSync('error_quantity_borrowers', 'Number of borrowers is required')),
  familyStatus: Yup.string().required(getValidationErrorSync('error_family_status_required', 'Family status is required')),
  partnerPayMortgage: Yup.string().when('familyStatus', {
    is: 'married', // Database returns lowercase 'married'
    then: (shema) => shema.required(getValidationErrorSync('error_partner_mortgage_required', 'Partner mortgage information is required')),
    otherwise: (shema) => shema.notRequired(),
  }),
})

// Keep backward compatibility
export const validationSchema = getValidationSchema()
