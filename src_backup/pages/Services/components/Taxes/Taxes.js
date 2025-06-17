import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Column } from '@components/ui/Column';
import { TitleElement } from '@components/ui/TitleElement';
import { YesNo } from '@components/ui/YesNo';
const Taxes = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { values, setFieldValue, errors, touched } = useFormikContext();
    return (_jsxs(Column, { children: [_jsx(TitleElement, { title: t('calculate_mortgage_tax'), tooltip: t('plat') }), _jsx(YesNo, { value: values.taxes, onChange: (value) => setFieldValue('taxes', value), error: touched.taxes && errors.taxes })] }));
};
export default Taxes;
