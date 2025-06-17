import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { TitleElement } from '@components/ui/TitleElement';
import { YesNo } from '@components/ui/YesNo';
import Column from '@src/components/ui/Column/Column.tsx';
const AdditionalCitizenship = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { values, setFieldValue, errors, touched } = useFormikContext();
    return (_jsxs(Column, { children: [_jsx(TitleElement, { title: t('calculate_mortgage_citizenship') }), _jsx(YesNo, { value: values.additionalCitizenships, onChange: (value) => setFieldValue('additionalCitizenships', value), error: touched.additionalCitizenships && errors.additionalCitizenships })] }));
};
export default AdditionalCitizenship;
