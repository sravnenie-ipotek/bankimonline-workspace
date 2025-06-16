import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Column } from '@components/ui/Column';
import { DropdownMenu } from '@components/ui/DropdownMenu';
import { Error } from '@components/ui/Error';
import { FormContainer } from '@components/ui/FormContainer';
import FormattedInput from '@components/ui/FormattedInput/FormattedInput';
import { Row } from '@components/ui/Row';
import { SliderInput } from '@components/ui/SliderInput';
import Divider from '@src/components/ui/Divider/Divider';
import FormCaption from '@src/components/ui/FormCaption/FormCaption';
import { CreditData } from './ui/CreditData';
const FirstStepForm = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const WhyYouTakeCreditOptions = [
        { value: 'option_1', label: t('calculate_credit_why_option_1') },
        { value: 'option_2', label: t('calculate_credit_why_option_2') },
        { value: 'option_3', label: t('calculate_credit_why_option_3') },
        { value: 'option_4', label: t('calculate_credit_why_option_4') },
    ];
    const { setFieldValue, values, errors, touched, setFieldTouched } = useFormikContext();
    return (_jsxs(FormContainer, { children: [_jsx(FormCaption, { title: t('credit_refinance_title') }), _jsx(Row, { children: _jsx(Column, { children: _jsx(DropdownMenu, { data: WhyYouTakeCreditOptions, title: t('mortgage_credit_why'), placeholder: t('calculate_mortgage_citizenship_ph'), value: values.refinancingCredit, onChange: (value) => setFieldValue('refinancingCredit', value), onBlur: () => setFieldTouched('refinancingCredit'), error: touched.refinancingCredit && errors.refinancingCredit }) }) }), _jsx(Divider, {}), _jsx(Row, { children: _jsx(CreditData, {}) }), values.refinancingCredit && values.refinancingCredit === 'option_1' && (_jsx(Divider, {})), values.refinancingCredit && values.refinancingCredit === 'option_2' && (_jsx(Divider, {})), values.refinancingCredit && values.refinancingCredit == 'option_1' && (_jsx(Column, { children: _jsx(FormattedInput, { name: "MonthlyPayment", title: t('calculate_mortgage_initial_payment'), handleChange: (value) => setFieldValue('monthlyPayment', value), value: values.monthlyPayment }) })), _jsxs(Row, { children: [values.refinancingCredit &&
                        values.refinancingCredit === 'option_2' && (_jsxs(Column, { children: [_jsx(SliderInput, { disableCurrency: true, unitsMax: t('calculate_mortgage_period_units_max'), unitsMin: t('calculate_mortgage_period_units_min'), value: values.period, name: "Period", min: 4, max: 30, error: errors.period, title: t('calculate_mortgage_period'), handleChange: (value) => setFieldValue('period', value) }), errors.period && _jsx(Error, { error: errors.period })] })), _jsx(Column, {})] })] }));
};
export default FirstStepForm;
