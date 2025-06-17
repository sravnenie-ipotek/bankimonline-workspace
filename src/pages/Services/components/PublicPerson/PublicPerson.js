import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Column } from '@components/ui/Column';
import { TitleElement } from '@components/ui/TitleElement';
import { YesNo } from '@components/ui/YesNo';
const PublicPerson = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { values, setFieldValue, errors, touched } = useFormikContext();
    return (_jsxs(Column, { children: [_jsx(TitleElement, { title: t('calculate_mortgage_is_public'), tooltip: t('pub') }), _jsx(YesNo, { value: values.publicPerson, onChange: (value) => setFieldValue('publicPerson', value), error: touched.publicPerson && errors.publicPerson })] }));
};
export default PublicPerson;
