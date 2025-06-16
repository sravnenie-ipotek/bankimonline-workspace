import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Column } from '@components/ui/Column';
import { Error } from '@components/ui/Error';
import StringInput from '@components/ui/StringInput/StringInput.tsx';
const CompanyName = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { values, setFieldValue, errors, setFieldTouched, touched } = useFormikContext();
    return (_jsxs(Column, { children: [_jsx(StringInput, { placeholder: t('calculate_mortgage_company'), value: values.companyName, title: t('calculate_mortgage_company'), name: "\u0421ompanyName", onChange: (value) => setFieldValue('companyName', value), onBlur: () => setFieldTouched('companyName'), error: touched.companyName && errors.companyName }), touched.companyName && errors.companyName && (_jsx(Error, { error: errors.companyName }))] }));
};
export default CompanyName;
