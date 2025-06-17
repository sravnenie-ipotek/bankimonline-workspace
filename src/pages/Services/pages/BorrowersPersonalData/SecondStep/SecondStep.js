import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Form, Formik } from 'formik';
import { useNavigate } from 'react-router';
import { Container } from '@components/ui/Container';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { updateBorrowersPersonalData } from '@src/pages/Services/slices/borrowersPersonalDataSlice';
import { DoubleButtons } from '../../../components/DoubleButtons';
import { AdditionalIncomeModal } from '../Modals/AdditionalIncomeModal';
import { ObligationModal } from '../Modals/ObligationModal';
import { SourceOfIncomeModal } from '../Modals/SourceOfIncomeModal';
import { SecondStepForm } from './SecondStepForm';
import { validationSchema } from './constants';
const SecondStep = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const value = useAppSelector((state) => state.borrowersPersonalData.borrowersPersonalData);
    const savedValue = value !== undefined ? value : undefined;
    const initialValues = {
        mainSourceOfIncome: savedValue?.mainSourceOfIncome || '',
        monthlyIncome: savedValue?.monthlyIncome || null,
        startDate: savedValue?.startDate || new Date().getTime(),
        fieldOfActivity: savedValue?.fieldOfActivity || '',
        profession: savedValue?.profession || '',
        companyName: savedValue?.companyName || '',
        additionalIncome: savedValue?.additionalIncome || '',
        additionalIncomeAmount: savedValue?.additionalIncomeAmount || null,
        obligation: savedValue?.obligation || '',
        bank: savedValue?.bank || '',
        monthlyPaymentForAnotherBank: savedValue?.monthlyPaymentForAnotherBank || null,
        endDate: savedValue?.endDate || new Date().getTime(),
        amountIncomeCurrentYear: savedValue?.amountIncomeCurrentYear || null,
    };
    return (_jsxs(_Fragment, { children: [_jsx(Formik, { initialValues: initialValues, validationSchema: validationSchema, validateOnMount: true, onSubmit: (values) => {
                    dispatch(updateBorrowersPersonalData(values));
                    navigate('/services/calculate-mortgage/2');
                }, children: _jsxs(Form, { children: [_jsx(Container, { children: _jsx(SecondStepForm, {}) }), _jsx(DoubleButtons, {})] }) }), _jsx(SourceOfIncomeModal, {}), _jsx(AdditionalIncomeModal, {}), _jsx(ObligationModal, {})] }));
};
export default SecondStep;
