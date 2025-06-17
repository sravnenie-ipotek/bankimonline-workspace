import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Column } from '@components/ui/Column';
import { Calendar } from '@src/components/ui/Calendar';
import { Error } from '@src/components/ui/Error';
const NoIncome = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { values, setFieldValue, errors } = useFormikContext();
    return (_jsxs(Column, { children: [_jsx(Calendar, { title: t('no_income'), value: values.noIncome, onChange: (value) => setFieldValue('noIncome', value), placeholder: t('date_ph'), error: errors.noIncome }), errors.noIncome && _jsx(Error, { error: errors.noIncome })] }));
};
export default NoIncome;
