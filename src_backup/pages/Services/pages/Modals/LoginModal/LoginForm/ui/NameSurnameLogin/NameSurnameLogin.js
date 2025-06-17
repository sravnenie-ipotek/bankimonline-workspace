import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Error } from '@components/ui/Error';
import StringInput from '@src/components/ui/StringInput/StringInput';
const NameSurnameLogin = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { values, setFieldValue, errors, touched, setFieldTouched } = useFormikContext();
    return (_jsxs(_Fragment, { children: [_jsx(StringInput, { title: t('name_surname_login'), placeholder: t('calculate_mortgage_name_surname_ph'), name: "NameSurname", onChange: (value) => setFieldValue('nameSurname', value), onBlur: () => setFieldTouched('nameSurname'), error: touched.nameSurname && errors.nameSurname, value: values.nameSurname }), touched.nameSurname && errors.nameSurname && (_jsx(Error, { error: errors.nameSurname }))] }));
};
export default NameSurnameLogin;
