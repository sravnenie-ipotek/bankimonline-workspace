import i18next from 'i18next'
import * as Yup from 'yup'

export const getValidationSchema = () => Yup.object().shape({
  nameSurname: Yup.string().required(i18next.t('error_name_surname')),
  birthday: Yup.string().required(i18next.t('error_date')),
  education: Yup.string().required(i18next.t('error_education_required')),
  additionalCitizenships: Yup.string().required(
    i18next.t('error_citizenship_required')
  ),
  citizenshipsDropdown: Yup.array().when('additionalCitizenships', {
    is: 'yes',
    then: (shema) => shema.min(1, i18next.t('error_citizenship_countries_required')),
    otherwise: (shema) => shema.min(0),
  }),
  taxes: Yup.string().required(i18next.t('error_taxes_required')),
  countriesPayTaxes: Yup.array().when('taxes', {
    is: 'yes',
    then: (shema) => shema.min(1, i18next.t('error_tax_countries_required')),
    otherwise: (shema) => shema.min(0),
  }),
  childrens: Yup.string().required(i18next.t('error_children_required')),
  howMuchChildrens: Yup.number().required(i18next.t('error_children_count_required')),
  medicalInsurance: Yup.string().required(i18next.t('error_medical_insurance_required')),
  isForeigner: Yup.string().required(i18next.t('error_foreigner_required')),
  publicPerson: Yup.string().required(i18next.t('error_public_person_required')),
  borrowers: Yup.number()
    .min(1, i18next.t('error_quantity_borrowers'))
    .required(i18next.t('error_quantity_borrowers')),
  familyStatus: Yup.string().required(i18next.t('error_family_status_required')),
  partnerPayMortgage: Yup.string().when('familyStatus', {
    is: i18next.t('calculate_mortgage_family_status_option_2'),
    then: (shema) => shema.required(i18next.t('error_partner_mortgage_required')),
    otherwise: (shema) => shema.notRequired(),
  }),
})

// Keep backward compatibility
export const validationSchema = getValidationSchema()
