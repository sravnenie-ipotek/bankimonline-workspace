import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Column } from '@components/ui/Column';
import CreditContextButton from '@components/ui/ContextButtons/CreditContextButton/CreditContextButton.tsx';
import { Error } from '@components/ui/Error';
import FormattedInput from '@components/ui/FormattedInput/FormattedInput.tsx';
const Borrowers = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { values, setFieldValue, errors, setFieldTouched, touched } = useFormikContext();
    return (_jsxs(Column, { children: [_jsx(FormattedInput, { name: "borrowers", handleChange: (value) => setFieldValue('borrowers', value), onBlur: () => setFieldTouched('borrowers'), title: t('calculate_mortgage_borrowers'), placeholder: t('place_borrowers'), disableCurrency: true, value: values.borrowers, error: touched.borrowers && errors.borrowers, size: "xs" }), _jsx(CreditContextButton, {}), touched.borrowers && errors.borrowers && (_jsx(Error, { error: errors.borrowers }))] }));
};
export default Borrowers;
