import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Calendar } from '@components/ui/Calendar';
import { Column } from '@components/ui/Column';
import { Error } from '@components/ui/Error';
const EndDate = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { values, setFieldValue, errors } = useFormikContext();
    return (_jsxs(Column, { children: [_jsx(Calendar, { title: t('calculate_mortgage_end_date'), value: values.endDate, onChange: (value) => setFieldValue('endDate', value), placeholder: "\u0414\u0414 / \u041C\u041C / \u0413\u0413", error: errors.endDate }), errors.endDate && _jsx(Error, { error: errors.endDate })] }));
};
export default EndDate;
