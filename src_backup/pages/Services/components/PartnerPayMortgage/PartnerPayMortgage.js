import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { TitleElement } from '@components/ui/TitleElement';
import { YesNo } from '@components/ui/YesNo';
const PartnerPayMortgage = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { values, setFieldValue, errors, touched } = useFormikContext();
    return (_jsxs(_Fragment, { children: [_jsx(TitleElement, { title: t('calculate_mortgage_partner_pay_mortgage') }), _jsx(YesNo, { value: values.partnerPayMortgage, onChange: (value) => setFieldValue('partnerPayMortgage', value), error: touched.partnerPayMortgage && errors.partnerPayMortgage })] }));
};
export default PartnerPayMortgage;
