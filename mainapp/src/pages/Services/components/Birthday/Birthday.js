import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import Calendar from '@components/ui/Calendar/Calendar.tsx';
import { Error } from '@components/ui/Error';
import { Column } from '@src/components/ui/Column';
const Birthday = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { setFieldValue, values, errors } = useFormikContext();
    return (_jsxs(Column, { children: [_jsx(Calendar, { title: t('calculate_mortgage_birth_date'), onChange: (date) => setFieldValue('birthday', date), value: values.birthday, placeholder: 'DD/MM/YYYY', error: errors.birthday, isMaxAge: true }), errors.birthday && _jsx(Error, { error: errors.birthday })] }));
};
export default Birthday;
