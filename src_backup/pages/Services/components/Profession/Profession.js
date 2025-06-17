import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Column } from '@components/ui/Column';
import { Error } from '@components/ui/Error';
import StringInput from '@components/ui/StringInput/StringInput.tsx';
const Profession = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { values, setFieldValue, errors, setFieldTouched, touched } = useFormikContext();
    return (_jsxs(Column, { children: [_jsx(StringInput, { placeholder: t('calculate_mortgage_profession_ph'), value: values.profession, title: t('calculate_mortgage_profession'), name: "Profession", onChange: (value) => setFieldValue('profession', value), onBlur: () => setFieldTouched('profession'), error: touched.profession && errors.profession }), touched.profession && errors.profession && (_jsx(Error, { error: errors.profession }))] }));
};
export default Profession;
