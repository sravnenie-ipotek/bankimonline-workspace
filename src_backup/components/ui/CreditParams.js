import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Error } from '@components/ui/Error';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { setActiveField } from '@src/pages/Services/slices/activeField';
import calculateMonthlyPayment from '@src/utils/helpers/calculateMonthlyPayment.ts';
import calculatePeriod from '@src/utils/helpers/calculatePeriod.ts';
import { Column } from './Column';
import IncreasePayment from './ContextButtons/InvceasePayment/IncreasePayment';
import { Row } from './Row';
import SliderInput from './SliderInput/SliderInput';
// Компонент для элементов данных для кредита
export default function CreditParams() {
    const [maxMonthlyPayment, setMaxMonthlyPayment] = useState(51130);
    const [minMonthlyPayment, setMinMonthlyPayment] = useState(2654);
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { setFieldValue, values, errors } = useFormikContext();
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
            const monthlyPayment = calculateMonthlyPayment(values.priceOfEstate, values.initialFee, values.period);
            if (!Number.isNaN(monthlyPayment)) {
                setFieldValue('monthlyPayment', monthlyPayment);
            }
        }
        else {
            const period = calculatePeriod(values.priceOfEstate, values.initialFee, values.monthlyPayment);
            if (!Number.isNaN(period)) {
                setFieldValue('period', period);
            }
        }
    }, [
        activeField,
        setFieldValue,
        values.initialFee,
        values.monthlyPayment,
        values.period,
        values.priceOfEstate,
    ]);
    // Рассчитывает максимальное и минимальное значение ежемесячного платежа
    useLayoutEffect(() => {
        const maxInitialPayment = calculateMonthlyPayment(values.priceOfEstate, values.initialFee, 4);
        const minInitialPayment = calculateMonthlyPayment(values.priceOfEstate, values.initialFee, 30);
        if (!Number.isNaN(maxInitialPayment)) {
            setMaxMonthlyPayment(maxInitialPayment);
        }
        if (maxInitialPayment === 0) {
            setMaxMonthlyPayment(1);
        }
        if (!Number.isNaN(maxInitialPayment)) {
            setMinMonthlyPayment(minInitialPayment);
        }
    }, [values.initialFee, values.priceOfEstate]);
    return (_jsxs(Row, { children: [_jsxs(Column, { children: [_jsx(SliderInput, { disableCurrency: true, unitsMax: t('calculate_mortgage_period_units_max'), unitsMin: t('calculate_mortgage_period_units_min'), value: values.period, name: "Period", min: 4, max: 30, error: errors.period, title: t('calculate_mortgage_period'), handleChange: handleChangePeriod }), errors.period && _jsx(Error, { error: errors.period })] }), _jsxs(Column, { children: [_jsx(SliderInput, { unitsMax: "\u20AA", unitsMin: "\u20AA", name: "MonthlyPayment", min: minMonthlyPayment, max: maxMonthlyPayment, error: errors.monthlyPayment, title: t('calculate_mortgage_initial_payment'), handleChange: handleChangeMonthlyPayment, value: values.monthlyPayment }), _jsx(IncreasePayment, {}), errors.monthlyPayment && _jsx(Error, { error: errors.monthlyPayment })] }), _jsx(Column, {})] }));
}
