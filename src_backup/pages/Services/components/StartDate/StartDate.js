import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Calendar } from '@components/ui/Calendar';
import { Column } from '@components/ui/Column';
import IncomeContextButton from '@components/ui/ContextButtons/IncomeContextButton/IncomeContextButton.tsx';
import { Error } from '@components/ui/Error';
const StartDate = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { values, setFieldValue, errors } = useFormikContext();
    return (_jsxs(Column, { children: [_jsx(Calendar, { title: t('calculate_mortgage_start_date'), value: values.startDate, onChange: (value) => setFieldValue('startDate', value), placeholder: t('date_ph'), error: errors.startDate }), _jsx(IncomeContextButton, {}), errors.startDate && _jsx(Error, { error: errors.startDate })] }));
};
export default StartDate;
