import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Column } from '@components/ui/Column';
import { DropdownMenu } from '@components/ui/DropdownMenu';
import { Error } from '@components/ui/Error';
import { FormContainer } from '@components/ui/FormContainer';
import { FormattedInput } from '@components/ui/FormattedInput';
import { Row } from '@components/ui/Row';
import IncreasePayment from '@src/components/ui/ContextButtons/InvceasePayment/IncreasePayment';
import Divider from '@src/components/ui/Divider/Divider';
import FormCaption from '@src/components/ui/FormCaption/FormCaption';
import { SliderInput } from '@src/components/ui/SliderInput';
import { TitleElement } from '@src/components/ui/TitleElement';
import { YesNo } from '@src/components/ui/YesNo';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { setActiveField } from '@src/pages/Services/slices/activeField';
import calculateMonthlyPayment from '@src/utils/helpers/calculateMonthlyPayment';
import calculatePeriod from '@src/utils/helpers/calculatePeriod';
export const FirstStepForm = () => {
    const [maxMonthlyPayment, setMaxMonthlyPayment] = useState(51130);
    const [minMonthlyPayment, setMinMonthlyPayment] = useState(2654);
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const creditPurposes = [
        { value: 'option_1', label: t('calculate_credit_target_option_1') },
        { value: 'option_2', label: t('calculate_credit_target_option_2') },
        { value: 'option_3', label: t('calculate_credit_target_option_3') },
        { value: 'option_4', label: t('calculate_credit_target_option_4') },
        { value: 'option_5', label: t('calculate_credit_target_option_5') },
        { value: 'option_6', label: t('calculate_credit_target_option_6') },
    ];
    const WhenDoYouNeedMoneyOptions = [
        { value: 'option_1', label: t('calculate_mortgage_when_options_1') },
        { value: 'option_2', label: t('calculate_mortgage_when_options_2') },
        { value: 'option_3', label: t('calculate_mortgage_when_options_3') },
        { value: 'option_4', label: t('calculate_mortgage_when_options_4') },
    ];
    const loanDeferralOptions = [
        { value: 'option_1', label: t('calculate_credit_prolong_option_1') },
        { value: 'option_2', label: t('calculate_credit_prolong_option_2') },
        { value: 'option_3', label: t('calculate_credit_prolong_option_3') },
        { value: 'option_4', label: t('calculate_credit_prolong_option_4') },
        { value: 'option_5', label: t('calculate_credit_prolong_option_5') },
        { value: 'option_6', label: t('calculate_credit_prolong_option_6') },
        { value: 'option_7', label: t('calculate_credit_prolong_option_7') },
    ];
    const cityWhereYouBuyOptions = [
        { value: 'city_1', label: t('calculate_mortgage_city_1') },
        { value: 'city_2', label: t('calculate_mortgage_city_2') },
        { value: 'city_3', label: t('calculate_mortgage_city_3') },
    ];
    const { setFieldValue, values, errors, touched, setFieldTouched } = useFormikContext();
    const activeField = useAppSelector((state) => state.activeField);
    const dispatch = useAppDispatch();
    const handleChangePeriod = (value) => {
        dispatch(setActiveField('period'));
        setFieldValue('period', value);
    };
    const handleChangeMonthlyPayment = (value) => {
        dispatch(setActiveField('monthlyPayment'));
        setFieldValue('monthlyPayment', value);
    };
    // Рассчитывает и меняет значения ежемесячного платежа или срока
    // в зависимости от активного инпута
    useEffect(() => {
        if (activeField === 'period') {
            const monthlyPayment = calculateMonthlyPayment(values.loanAmount, 0, values.period, 5);
            if (!Number.isNaN(monthlyPayment)) {
                setFieldValue('monthlyPayment', monthlyPayment);
            }
        }
        else {
            const period = calculatePeriod(values.loanAmount, 0, values.monthlyPayment, 5);
            if (!Number.isNaN(period)) {
                setFieldValue('period', period);
            }
        }
    }, [
        activeField,
        setFieldValue,
        values.loanAmount,
        values.monthlyPayment,
        values.period,
    ]);
    // Рассчитывает максимальное и минимальное значение ежемесячного платежа
    useLayoutEffect(() => {
        const maxInitialPayment = calculateMonthlyPayment(values.loanAmount, 0, 1, 5);
        const minInitialPayment = calculateMonthlyPayment(values.loanAmount, 0, 30, 5);
        if (!Number.isNaN(maxInitialPayment)) {
            setMaxMonthlyPayment(maxInitialPayment);
        }
        if (maxInitialPayment === 0) {
            setMaxMonthlyPayment(1);
        }
        if (!Number.isNaN(maxInitialPayment)) {
            setMinMonthlyPayment(minInitialPayment);
        }
    }, [values.loanAmount]);
    return (_jsx(_Fragment, { children: _jsxs(FormContainer, { children: [_jsx(FormCaption, { title: t('sidebar_sub_calculate_credit') }), _jsxs(Row, { children: [_jsx(Column, { children: _jsx(DropdownMenu, { title: t('calculate_why'), data: creditPurposes, placeholder: t('calculate_credit_target_ph'), value: values.purposeOfLoan, onChange: (value) => setFieldValue('purposeOfLoan', value), onBlur: () => setFieldTouched('purposeOfLoan', true), error: touched.purposeOfLoan && errors.purposeOfLoan }) }), _jsxs(Column, { children: [_jsx(FormattedInput, { handleChange: (value) => {
                                        dispatch(setActiveField('period'));
                                        setFieldValue('loanAmount', value);
                                    }, name: "loanAmount", title: t('calculate_amount'), value: values.loanAmount, placeholder: "1,000,000", error: errors.loanAmount }), errors.loanAmount && _jsx(Error, { error: errors.loanAmount })] }), _jsx(Column, { children: _jsx(DropdownMenu, { title: t('calculate_when'), data: WhenDoYouNeedMoneyOptions, placeholder: t('calculate_mortgage_when_options_ph'), value: values.whenDoYouNeedMoney, onChange: (value) => setFieldValue('whenDoYouNeedMoney', value), onBlur: () => setFieldTouched('whenDoYouNeedMoney', true), error: touched.whenDoYouNeedMoney && errors.whenDoYouNeedMoney }) })] }), _jsx(Row, { children: _jsx(Column, { children: _jsx(DropdownMenu, { title: t('calculate_prolong'), data: loanDeferralOptions, placeholder: t('calculate_mortgage_first_ph'), value: values.loanDeferral, onChange: (value) => setFieldValue('loanDeferral', value), onBlur: () => setFieldTouched('loanDeferral', true), error: touched.loanDeferral && errors.loanDeferral }) }) }), values.purposeOfLoan && values.purposeOfLoan === 'option_6' && (_jsxs(_Fragment, { children: [_jsx(Divider, {}), _jsxs(Row, { children: [_jsxs(Column, { children: [_jsx(FormattedInput, { handleChange: (value) => {
                                                setFieldValue('priceOfEstate', value);
                                            }, name: "PriceOfEstate", title: t('calculate_mortgage_price'), value: values.priceOfEstate, placeholder: "1,000,000", error: errors.priceOfEstate }), errors.priceOfEstate && _jsx(Error, { error: errors.priceOfEstate })] }), _jsx(Column, { children: _jsx(DropdownMenu, { title: t('calculate_mortgage_city'), data: cityWhereYouBuyOptions, placeholder: t('city'), value: values.cityWhereYouBuy, onChange: (value) => setFieldValue('cityWhereYouBuy', value), onBlur: () => setFieldTouched('cityWhereYouBuy', true), searchable: true, searchPlaceholder: t('search'), nothingFoundText: t('nothing_found'), error: touched.cityWhereYouBuy && errors.cityWhereYouBuy }) }), _jsxs(Column, { children: [_jsx(TitleElement, { title: t('have_mortgage_title') }), _jsx(YesNo, { value: values.haveMortgage, onChange: (value) => setFieldValue('haveMortgage', value), error: touched.haveMortgage && errors.haveMortgage })] })] })] })), _jsx(Divider, {}), _jsxs(Row, { children: [_jsxs(Column, { children: [_jsx(SliderInput, { disableCurrency: true, unitsMax: t('calculate_mortgage_period_units_max'), unitsMin: t('calculate_mortgage_period_units_min'), value: values.period, name: "Period", min: 1, max: 30, error: errors.period, title: t('calculate_mortgage_period'), handleChange: handleChangePeriod }), errors.period && _jsx(Error, { error: errors.period })] }), _jsxs(Column, { children: [_jsx(SliderInput, { unitsMax: "\u20AA", unitsMin: "\u20AA", name: "MonthlyPayment", min: minMonthlyPayment, max: maxMonthlyPayment, error: errors.monthlyPayment, title: t('calculate_mortgage_initial_payment'), handleChange: handleChangeMonthlyPayment, value: values.monthlyPayment }), _jsx(IncreasePayment, {}), errors.monthlyPayment && _jsx(Error, { error: errors.monthlyPayment })] }), _jsx(Column, {})] })] }) }));
};
