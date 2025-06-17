import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Form, Formik } from 'formik';
import { useLocation, useNavigate } from 'react-router';
import { createSearchParams } from 'react-router-dom';
import { Container } from '@components/ui/Container';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { updateOtherBorrowers } from '@src/pages/Services/slices/otherBorrowersSlice';
import { generateNewId } from '@src/pages/Services/utils/generateNewId.ts';
import { DoubleButtons } from '../../../components/DoubleButtons';
import { AdditionalIncomeModal } from '../Modals/AdditionalIncomeModal';
import { ObligationModal } from '../Modals/ObligationModal';
import { SourceOfIncomeModal } from '../Modals/SourceOfIncomeModal';
import { SecondStepForm } from './SecondStepForm';
import { validationSchema } from './constants';
const SecondStep = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const id = useAppSelector((state) => state.otherBorrowers.otherBorrowersPageId);
    const value = useAppSelector((state) => state.otherBorrowers.otherBorrowers);
    const savedValue = value.find((item) => item.id === id);
    const isNew = !value.some((item) => item.id === id);
    const pageId = isNew ? generateNewId(value) : id;
    if (!location.search.includes(`?pageId=${pageId}`)) {
        navigate({
            pathname: '/services/other-borrowers/2/',
            search: createSearchParams({
                pageId: String(pageId),
            }).toString(),
        });
    }
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
        noIncome: savedValue?.noIncome || new Date().getTime(),
        sourceOfIncomeModal: savedValue?.sourceOfIncomeModal || [],
        additionalIncomeModal: savedValue?.additionalIncomeModal || [],
        obligationModal: savedValue?.obligationModal || [],
    };
    return (_jsxs(_Fragment, { children: [_jsx(Formik, { initialValues: initialValues, validationSchema: validationSchema, validateOnMount: true, onSubmit: (values) => {
                    dispatch(updateOtherBorrowers({ id: pageId, newFields: values }));
                    navigate(-2);
                }, children: _jsxs(Form, { children: [_jsx(Container, { children: _jsx(SecondStepForm, {}) }), _jsx(DoubleButtons, {})] }) }), _jsx(SourceOfIncomeModal, {}), _jsx(AdditionalIncomeModal, {}), _jsx(ObligationModal, {})] }));
};
export default SecondStep;
