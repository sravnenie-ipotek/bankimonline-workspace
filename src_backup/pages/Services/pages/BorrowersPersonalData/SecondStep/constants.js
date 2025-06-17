import i18next from 'i18next';
import * as Yup from 'yup';
export const validationSchema = Yup.object().shape({
    mainSourceOfIncome: Yup.string().required(i18next.t('error_select_answer')),
    monthlyIncome: Yup.number().required(i18next.t('error_fill_field')),
    startDate: Yup.string().required(i18next.t('error_date')),
    fieldOfActivity: Yup.object().when('mainSourceOfIncome', {
        is: (value) => value !== null && value !== undefined && value !== '',
        then: (shema) => shema.required(i18next.t('error_select_field_of_activity')),
        otherwise: (shema) => shema.notRequired(),
    }),
    profession: Yup.string().required(i18next.t('error_fill_field')),
    companyName: Yup.string().required(i18next.t('error_fill_field')),
    additionalIncome: Yup.string().required(i18next.t('error_select_one_of_the_options')),
    additionalIncomeAmount: Yup.number().when('additionalIncome', {
        is: (value) => value !== null && value !== undefined && value !== '' && value === 'no',
        then: (shema) => shema.required(i18next.t('error_fill_field')),
        otherwise: (shema) => shema.notRequired(),
    }),
    obligation: Yup.string().required(i18next.t('error_select_one_of_the_options')),
    bank: Yup.string().when('obligation', {
        is: (value) => value !== null && value !== undefined && value !== '' && value === 'no',
        then: (shema) => shema.required(i18next.t('error_select_bank')),
        otherwise: (shema) => shema.notRequired(),
    }),
    monthlyPaymentForAnotherBank: Yup.number().when('obligation', {
        is: (value) => value !== null && value !== undefined && value !== '' && value === 'no',
        then: (shema) => shema.required(i18next.t('error_fill_field')),
        otherwise: (shema) => shema.notRequired(),
    }),
    endDate: Yup.string().required(i18next.t('error_date')),
});
