import { jsx as _jsx } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { DropdownMenu } from '@components/ui/DropdownMenu';
import { Column } from '@src/components/ui/Column';
const Education = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { values, setFieldValue, errors, touched, setFieldTouched } = useFormikContext();
    const EducationSelectOptions = [
        { value: 'option_1', label: t('calculate_mortgage_education_option_1') },
        { value: 'option_2', label: t('calculate_mortgage_education_option_2') },
        { value: 'option_3', label: t('calculate_mortgage_education_option_3') },
        { value: 'option_4', label: t('calculate_mortgage_education_option_4') },
        { value: 'option_5', label: t('calculate_mortgage_education_option_5') },
        { value: 'option_6', label: t('calculate_mortgage_education_option_6') },
        { value: 'option_7', label: t('calculate_mortgage_education_option_7') },
    ];
    return (_jsx(Column, { children: _jsx(DropdownMenu, { title: t('calculate_mortgage_education'), placeholder: t('calculate_mortgage_education_ph'), value: values.education, data: EducationSelectOptions, onChange: (value) => setFieldValue('education', value), onBlur: () => setFieldTouched('education', true), error: touched.education && errors.education }) }));
};
export default Education;
