import { jsx as _jsx } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Column } from '@components/ui/Column';
import { DropdownMenu } from '@components/ui/DropdownMenu';
const FieldOfActivity = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { values, setFieldValue, errors, setFieldTouched, touched } = useFormikContext();
    const FieldOfActivityOptions = [
        { value: 'option_1', label: t('calculate_mortgage_sphere_option_1') },
        { value: 'option_2', label: t('calculate_mortgage_sphere_option_2') },
        { value: 'option_3', label: t('calculate_mortgage_sphere_option_3') },
        { value: 'option_4', label: t('calculate_mortgage_sphere_option_4') },
    ];
    return (_jsx(Column, { children: _jsx(DropdownMenu, { title: t('calculate_mortgage_sfere'), placeholder: t('calculate_mortgage_sfere'), searchable: true, searchPlaceholder: t('search'), value: values.fieldOfActivity, onChange: (value) => setFieldValue('fieldOfActivity', value), onBlur: () => setFieldTouched('fieldOfActivity'), error: touched.fieldOfActivity && errors.fieldOfActivity, data: FieldOfActivityOptions }) }));
};
export default FieldOfActivity;
