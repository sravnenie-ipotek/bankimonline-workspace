import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { Container } from '@components/ui/Container';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { AdditionalIncomeModal } from '@src/pages/Services/pages/Modals/AdditionalIncomeModal';
import { ObligationModal } from '@src/pages/Services/pages/Modals/ObligationModal';
import { SourceOfIncomeModal } from '@src/pages/Services/pages/Modals/SourceOfIncomeModal';
import { updateMortgageData } from '@src/pages/Services/slices/calculateMortgageSlice.ts';
import { DoubleButtons } from '../../../../components/DoubleButtons';
import ThirdStepForm from './ThirdStepForm/ThirdStepForm';
import { validationSchema } from './constants';
const ThirdStep = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const savedValue = useAppSelector((state) => state.mortgage);
    const initialValues = {
        mainSourceOfIncome: savedValue.mainSourceOfIncome || '',
        monthlyIncome: savedValue.monthlyIncome || null,
        startDate: savedValue.startDate || new Date().getTime(),
        fieldOfActivity: savedValue.fieldOfActivity || '',
        profession: savedValue.profession || '',
        companyName: savedValue.companyName || '',
        additionalIncome: savedValue.additionalIncome || '',
        additionalIncomeAmount: savedValue.additionalIncomeAmount || null,
        obligation: savedValue.obligation || '',
        bank: savedValue.bank || '',
        monthlyPaymentForAnotherBank: savedValue.monthlyPaymentForAnotherBank || null,
        endDate: savedValue.endDate || new Date().getTime(),
        amountIncomeCurrentYear: savedValue?.amountIncomeCurrentYear || null,
        noIncome: savedValue.noIncome || new Date().getTime(),
    };
    return (_jsxs(_Fragment, { children: [_jsx(Formik, { initialValues: initialValues, validationSchema: validationSchema, validateOnMount: true, onSubmit: (values) => {
                    dispatch(updateMortgageData(values));
                    navigate('/services/calculate-credit/4');
                }, children: _jsxs(Form, { children: [_jsx(Container, { children: _jsx(ThirdStepForm, {}) }), _jsx(DoubleButtons, {})] }) }), _jsx(SourceOfIncomeModal, {}), _jsx(AdditionalIncomeModal, {}), _jsx(ObligationModal, {})] }));
};
export default ThirdStep;
