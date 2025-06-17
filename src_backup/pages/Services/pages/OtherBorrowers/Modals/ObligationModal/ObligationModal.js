import { jsx as _jsx } from "react/jsx-runtime";
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import * as Yup from 'yup';
import { Modal } from '@src/components/ui/Modal';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { closeModal } from '@src/pages/Services/slices/modalSlice.ts';
import { updateObligationModal } from '@src/pages/Services/slices/otherBorrowersSlice';
import { generateNewId } from '@src/pages/Services/utils/generateNewId.ts';
import { ObligationForm } from './ObligationForm';
const ObligationModal = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('pageId');
    const pageId = parseInt(query);
    const isOpen = useAppSelector((state) => state.modalSlice.isOpenObligation);
    const id = useAppSelector((state) => state.modalSlice.currentId);
    const value = useAppSelector((state) => state.otherBorrowers.otherBorrowers[pageId - 1]?.obligationModal || []);
    const savedValue = value.find((item) => item.id === id);
    const handleClose = () => {
        dispatch(closeModal());
    };
    const isNew = !value.some((item) => item.id === id);
    const modalId = isNew ? generateNewId(value) : id;
    const initialValues = {
        obligation: savedValue?.obligation || '',
        bank: savedValue?.bank || '',
        monthlyPaymentForAnotherBank: savedValue?.monthlyPaymentForAnotherBank || null,
        endDate: savedValue?.endDate || new Date().getTime(),
        noIncome: savedValue?.noIncome || new Date().getTime(),
    };
    const validationSchema = Yup.object().shape({
        obligation: Yup.string().required(t('error_select_one_of_the_options')),
        bank: Yup.string().when('obligation', {
            is: (value) => value !== null && value !== undefined && value !== '' && value === 'no',
            then: (shema) => shema.required(t('error_select_bank')),
            otherwise: (shema) => shema.notRequired(),
        }),
        monthlyPaymentForAnotherBank: Yup.number().when('obligation', {
            is: (value) => value !== null && value !== undefined && value !== '' && value === 'no',
            then: (shema) => shema.required(t('error_fill_field')),
            otherwise: (shema) => shema.notRequired(),
        }),
        endDate: Yup.string().required(t('error_date')),
    });
    return (_jsx(Modal, { isVisible: isOpen, onCancel: handleClose, title: `${t('obligation')} ${modalId + 1}`, children: _jsx(Formik, { initialValues: initialValues, validationSchema: validationSchema, validateOnMount: true, onSubmit: (values) => {
                dispatch(updateObligationModal({ id: modalId, pageId, ...values }));
                handleClose();
            }, children: _jsx(Form, { children: _jsx(ObligationForm, {}) }) }) }));
};
export default ObligationModal;
