import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Column } from '@components/ui/Column';
import { Error } from '@components/ui/Error';
import { FormattedInput } from '@components/ui/FormattedInput';
const AdditionalIncomeAmount = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { values, setFieldValue, errors, setFieldTouched, touched } = useFormikContext();
    return (_jsxs(Column, { children: [_jsx(FormattedInput, { title: t('calculate_mortgage_monthly_income'), placeholder: t('calculate_mortgage_monthly_income_ph'), value: values.additionalIncomeAmount, handleChange: (value) => setFieldValue('additionalIncomeAmount', value), onBlur: () => setFieldTouched('additionalIncomeAmount'), error: touched.additionalIncomeAmount && errors.additionalIncomeAmount, size: "xs" }), touched.additionalIncomeAmount && errors.additionalIncomeAmount && (_jsx(Error, { error: errors.additionalIncomeAmount }))] }));
};
export default AdditionalIncomeAmount;
