import i18next from 'i18next';
import * as Yup from 'yup';
export const validationSchema = Yup.object().shape({
    nameSurname: Yup.string().required(i18next.t('error_name_surname')),
    birthday: Yup.string().required(i18next.t('error_date')),
    education: Yup.string().required(i18next.t('error_select_answer')),
    additionalCitizenships: Yup.string().required(i18next.t('error_select_answer')),
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
    whoAreYouForBorrowers: Yup.string().required(i18next.t('error_fill_field')),
    familyStatus: Yup.string().required(i18next.t('error_select_answer')),
});
