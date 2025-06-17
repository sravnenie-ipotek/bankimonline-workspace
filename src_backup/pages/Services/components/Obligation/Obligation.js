import { jsx as _jsx } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Column } from '@components/ui/Column';
import { DropdownMenu } from '@components/ui/DropdownMenu';
const Obligation = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { values, setFieldValue, touched, errors, setFieldTouched } = useFormikContext();
    const DebtTypeOptions = [
        { value: 'option_1', label: t('calculate_mortgage_debt_types_option_1') },
        { value: 'option_2', label: t('calculate_mortgage_debt_types_option_2') },
        { value: 'option_3', label: t('calculate_mortgage_debt_types_option_3') },
        { value: 'option_4', label: t('calculate_mortgage_debt_types_option_4') },
        { value: 'option_5', label: t('calculate_mortgage_debt_types_option_5') },
    ];
    return (_jsx(Column, { children: _jsx(DropdownMenu, { title: t('calculate_mortgage_debt_types'), data: DebtTypeOptions, placeholder: t('calculate_mortgage_debt_types_ph'), value: values.obligation, onChange: (value) => setFieldValue('obligation', value), onBlur: () => setFieldTouched('obligation'), error: touched.obligation && errors.obligation }) }));
};
export default Obligation;
