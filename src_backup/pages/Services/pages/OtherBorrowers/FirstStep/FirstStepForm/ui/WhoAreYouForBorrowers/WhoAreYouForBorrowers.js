import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Column } from '@components/ui/Column';
import { Error } from '@components/ui/Error';
import StringInput from '@src/components/ui/StringInput/StringInput';
const WhoAreYouForBorrowers = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { values, setFieldValue, errors, touched, setFieldTouched } = useFormikContext();
    return (_jsxs(Column, { children: [_jsx(StringInput, { title: t('who_are_you_for_borrowers'), placeholder: t('who_are_you_for_borrowers_ph'), name: "whoAreYouForBorrowers", onChange: (value) => setFieldValue('whoAreYouForBorrowers', value), onBlur: () => setFieldTouched('whoAreYouForBorrowers'), error: touched.whoAreYouForBorrowers && errors.whoAreYouForBorrowers, value: values.whoAreYouForBorrowers }), touched.whoAreYouForBorrowers && errors.whoAreYouForBorrowers && (_jsx(Error, { error: errors.whoAreYouForBorrowers }))] }));
};
export default WhoAreYouForBorrowers;
