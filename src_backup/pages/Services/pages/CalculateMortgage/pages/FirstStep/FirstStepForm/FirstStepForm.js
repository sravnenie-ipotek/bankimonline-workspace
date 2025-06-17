import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import InitialFeeContext from '@components/ui/ContextButtons/InitialFeeContext/InitialFeeContext';
import CreditParams from '@components/ui/CreditParams';
import { DropdownMenu } from '@components/ui/DropdownMenu';
import { Error } from '@components/ui/Error';
import FormattedInput from '@components/ui/FormattedInput/FormattedInput';
import { SliderInput } from '@components/ui/SliderInput';
import { Column } from '@src/components/ui/Column';
import Divider from '@src/components/ui/Divider/Divider';
import FormCaption from '@src/components/ui/FormCaption/FormCaption';
import { FormContainer } from '@src/components/ui/FormContainer';
import { Row } from '@src/components/ui/Row';
import { useAppDispatch } from '@src/hooks/store';
import { setActiveField } from '@src/pages/Services/slices/activeField';
const FirstStepForm = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const dispatch = useAppDispatch();
    const WhenDoYouNeedMoneyOptions = [
        { value: '1', label: t('calculate_mortgage_when_options_1') },
        { value: '2', label: t('calculate_mortgage_when_options_2') },
        { value: '3', label: t('calculate_mortgage_when_options_3') },
        { value: '4', label: t('calculate_mortgage_when_options_4') },
    ];
    const cityWhereYouBuyOptions = [
        { value: '1', label: t('calculate_mortgage_city_1') },
        { value: '2', label: t('calculate_mortgage_city_2') },
        { value: '3', label: t('calculate_mortgage_city_3') },
    ];
    const TypeSelectOptions = [
        { value: '1', label: t('calculate_mortgage_type_options_1') },
        { value: '2', label: t('calculate_mortgage_type_options_2') },
        { value: '3', label: t('calculate_mortgage_type_options_3') },
        { value: '4', label: t('calculate_mortgage_type_options_4') },
    ];
    const WillBeYourFirstOptions = [
        { value: '1', label: t('calculate_mortgage_first_options_1') },
        { value: '2', label: t('calculate_mortgage_first_options_2') },
        { value: '3', label: t('calculate_mortgage_first_options_3') },
    ];
    const { setFieldValue, values, errors, touched, setFieldTouched } = useFormikContext();
    return (_jsx(_Fragment, { children: _jsxs(FormContainer, { children: [_jsx(FormCaption, { title: t('calculate_mortgage_title') }), _jsxs(Row, { children: [_jsxs(Column, { children: [_jsx(FormattedInput, { handleChange: (value) => {
                                        dispatch(setActiveField('period'));
                                        setFieldValue('priceOfEstate', value);
                                    }, name: "PriceOfEstate", title: t('calculate_mortgage_price'), value: values.priceOfEstate, placeholder: "1,000,000", error: errors.priceOfEstate }), errors.priceOfEstate && _jsx(Error, { error: errors.priceOfEstate })] }), _jsx(Column, { children: _jsx(DropdownMenu, { title: t('calculate_mortgage_city'), data: cityWhereYouBuyOptions, placeholder: t('city'), value: values.cityWhereYouBuy, onChange: (value) => setFieldValue('cityWhereYouBuy', value), onBlur: () => setFieldTouched('cityWhereYouBuy', true), searchable: true, searchPlaceholder: t('search'), nothingFoundText: t('nothing_found'), error: touched.cityWhereYouBuy && errors.cityWhereYouBuy }) }), _jsx(Column, { children: _jsx(DropdownMenu, { title: t('calculate_mortgage_when'), data: WhenDoYouNeedMoneyOptions, placeholder: t('calculate_mortgage_when_options_ph'), value: values.whenDoYouNeedMoney, onChange: (value) => setFieldValue('whenDoYouNeedMoney', value), onBlur: () => setFieldTouched('whenDoYouNeedMoney', true), error: touched.whenDoYouNeedMoney && errors.whenDoYouNeedMoney }) })] }), _jsxs(Row, { children: [_jsxs(Column, { children: [_jsx(SliderInput, { name: "InitialFee", value: values.initialFee, min: 0, max: String(values.priceOfEstate) === '' ||
                                        values.priceOfEstate === 0
                                        ? 1
                                        : values.priceOfEstate, title: t('calculate_mortgage_initial_fee'), handleChange: (value) => {
                                        dispatch(setActiveField('period'));
                                        setFieldValue('initialFee', value);
                                    }, tooltip: t('initial_payment_tooltip'), error: errors.initialFee, disableRangeValues: true }), _jsx(InitialFeeContext, {}), errors.initialFee && _jsx(Error, { error: errors.initialFee })] }), _jsx(Column, { children: _jsx(DropdownMenu, { title: t('calculate_mortgage_type'), data: TypeSelectOptions, placeholder: t('calculate_mortgage_type_ph'), value: values.typeSelect, onChange: (value) => setFieldValue('typeSelect', value), onBlur: () => setFieldTouched('typeSelect', true), error: touched.typeSelect && errors.typeSelect }) }), _jsx(Column, { children: _jsx(DropdownMenu, { title: t('calculate_mortgage_first'), data: WillBeYourFirstOptions, placeholder: t('calculate_mortgage_first_ph'), value: values.willBeYourFirst, onChange: (value) => setFieldValue('willBeYourFirst', value), onBlur: () => setFieldTouched('willBeYourFirst', true), error: touched.willBeYourFirst && errors.willBeYourFirst }) })] }), _jsx(Divider, {}), _jsx(CreditParams, {})] }) }));
};
export default FirstStepForm;
