import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Column } from '@components/ui/Column';
import { Error } from '@components/ui/Error';
import { FormattedInput } from '@components/ui/FormattedInput';
const HowMuchChildrens = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { values, setFieldValue, errors, touched } = useFormikContext();
    return (_jsxs(Column, { children: [_jsx(FormattedInput, { name: "HowManyBorrowers", handleChange: (value) => setFieldValue('howMuchChildrens', value), title: t('calculate_mortgage_how_much_childrens'), placeholder: "0", disableCurrency: true, value: values.howMuchChildrens, error: errors.howMuchChildrens }), touched.howMuchChildrens && errors.howMuchChildrens && (_jsx(Error, { error: errors.howMuchChildrens }))] }));
};
export default HowMuchChildrens;
