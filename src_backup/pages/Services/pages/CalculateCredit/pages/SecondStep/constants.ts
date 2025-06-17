import i18next from 'i18next'
import * as Yup from 'yup'

export const validationSchema = Yup.object().shape({
  nameSurname: Yup.string().required(i18next.t('error_name_surname')),
  birthday: Yup.string().required(i18next.t('error_date')),
  education: Yup.string().required(i18next.t('error_select_answer')),
  additionalCitizenships: Yup.string().required(
    i18next.t('error_select_answer')
  ),
  citizenshipsDropdown: Yup.array().when('additionalCitizenships', {
    is: 'yes',
    then: (shema) => shema.min(1, i18next.t('error_select_answer')),
    otherwise: (shema) => shema.min(0),
  }),
  taxes: Yup.string().required(i18next.t('error_select_answer')),
  countriesPayTaxes: Yup.array().when('taxes', {
    is: 'yes',
    then: (shema) => shema.min(1, i18next.t('error_select_answer')),
    otherwise: (shema) => shema.min(0),
  }),
  childrens: Yup.string().required(i18next.t('error_select_answer')),
  howMuchChildrens: Yup.number().required(i18next.t('error_fill_field')),
  medicalInsurance: Yup.string().required(i18next.t('error_select_answer')),
  isForeigner: Yup.string().required(i18next.t('error_select_answer')),
  publicPerson: Yup.string().required(i18next.t('error_select_answer')),
  borrowers: Yup.number()
    .min(1, i18next.t('error_quantity_borrowers'))
    .required(i18next.t('error_quantity_borrowers')),
  familyStatus: Yup.string().required(i18next.t('error_select_answer')),
  partnerPayMortgage: Yup.string().when('familyStatus', {
    is: i18next.t('calculate_mortgage_family_status_option_2'),
    then: (shema) => shema.required(i18next.t('error_select_answer')),
    otherwise: (shema) => shema.notRequired(),
  }),
})
