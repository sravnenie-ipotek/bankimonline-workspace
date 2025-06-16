import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Column } from '@components/ui/Column';
import { FormContainer } from '@components/ui/FormContainer';
import { Row } from '@components/ui/Row';
import { AddButton } from '@src/components/ui/AddButton';
import Divider from '@src/components/ui/Divider/Divider';
import FormCaption from '@src/components/ui/FormCaption/FormCaption';
import { UserProfileCard } from '@src/components/ui/UserProfileCard';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { AdditionalIncome } from '@src/pages/Services/components/AdditionalIncome';
import { AdditionalIncomeAmount } from '@src/pages/Services/components/AdditionalIncomeAmount';
import { MainSourceOfIncome } from '@src/pages/Services/components/MainSourceOfIncome';
import { Obligation } from '@src/pages/Services/components/Obligation';
import { componentsByIncomeSource } from '@src/pages/Services/constants/componentsByIncomeSource';
import { componentsByObligation } from '@src/pages/Services/constants/componentsByObligation';
import { createAdditionalIncomeModal, createObligationModal, createSourceOfIncomeModal, openAdditionalIncomeModal, openObligationModal, openSourceOfIncomeModal, } from '@src/pages/Services/slices/modalSlice';
import { deleteAdditionalIncomeModal, deleteObligationModal, deleteSourceOfIncomeModal, } from '@src/pages/Services/slices/otherBorrowersSlice';
const SecondStepForm = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const [searchParams] = useSearchParams();
    const query = searchParams.get('pageId');
    const pageId = parseInt(query);
    const { values } = useFormikContext();
    const { mainSourceOfIncome, additionalIncome, obligation } = values;
    const dispatch = useAppDispatch();
    const sourceOfIncomeValues = useAppSelector((state) => state.otherBorrowers.otherBorrowers[pageId - 1]?.sourceOfIncomeModal || []);
    const additionalIncomeValues = useAppSelector((state) => state.otherBorrowers.otherBorrowers[pageId - 1]?.additionalIncomeModal ||
        []);
    const obligationValues = useAppSelector((state) => state.otherBorrowers.otherBorrowers[pageId - 1]?.obligationModal || []);
    const openSourceOfIncome = () => {
        // dispatch(updateOtherBorrowers({ id, newFields: values }))
        dispatch(createSourceOfIncomeModal());
    };
    const openAdditionalIncome = () => {
        // dispatch(updateOtherBorrowers({ id, newFields: values }))
        dispatch(createAdditionalIncomeModal());
    };
    const openObligation = () => {
        // dispatch(updateOtherBorrowers({ id, newFields: values }))
        dispatch(createObligationModal());
    };
    const handleDeleteSourceOfIncome = (idToDelete, pageId) => {
        dispatch(deleteSourceOfIncomeModal({ id: idToDelete, pageId }));
    };
    const handleDeleteAdditionalIncome = (idToDelete, pageId) => {
        dispatch(deleteAdditionalIncomeModal({ id: idToDelete, pageId }));
    };
    const handleDeleteObligation = (idToDelete, pageId) => {
        dispatch(deleteObligationModal({ id: idToDelete, pageId }));
    };
    const handleEditSourceOfIncome = (id) => {
        dispatch(openSourceOfIncomeModal(id));
    };
    const handleEditAdditionalIncome = (id) => {
        dispatch(openAdditionalIncomeModal(id));
    };
    const handleEditObligation = (id) => {
        dispatch(openObligationModal(id));
    };
    return (_jsxs(FormContainer, { children: [_jsx(FormCaption, { title: `${t('borrowers_income')}#${pageId}` }), _jsxs(Row, { children: [_jsx(MainSourceOfIncome, {}), componentsByIncomeSource[mainSourceOfIncome] &&
                        componentsByIncomeSource[mainSourceOfIncome].map((Component, index) => (_jsx(React.Fragment, { children: Component }, index))), _jsx(Column, {})] }), _jsx(Row, { children: mainSourceOfIncome && (_jsxs(Column, { children: [sourceOfIncomeValues &&
                            sourceOfIncomeValues.map((item) => (_jsx(UserProfileCard, { onEdit: () => handleEditSourceOfIncome(item.id), onDelete: () => handleDeleteSourceOfIncome(item.id, pageId), enableEdit: true, name: `${t('source_of_income')}${item.id + 1}` }, item.id))), _jsx(AddButton, { onClick: openSourceOfIncome, color: "#FBE54D", value: t('add_place_to_work'), variant: "none" })] })) }), _jsx(Divider, {}), _jsxs(Row, { children: [_jsx(AdditionalIncome, {}), additionalIncome && additionalIncome !== 'option_1' && (_jsx(AdditionalIncomeAmount, {})), _jsx(Column, {})] }), additionalIncome && additionalIncome !== 'option_1' && (_jsx(Row, { children: _jsxs(Column, { children: [additionalIncomeValues &&
                            additionalIncomeValues.map((item) => (_jsx(UserProfileCard, { onEdit: () => handleEditAdditionalIncome(item.id), onDelete: () => handleDeleteAdditionalIncome(item.id, pageId), enableEdit: true, name: `${t('additional_source_of_income')}${item.id + 1}` }, item.id))), _jsx(AddButton, { onClick: openAdditionalIncome, color: "#FBE54D", value: t('add_additional_source_of_income'), variant: "none" })] }) })), _jsx(Divider, {}), _jsxs(Row, { children: [_jsx(Obligation, {}), componentsByObligation[obligation] &&
                        componentsByObligation[obligation].map((Component, index) => (_jsx(React.Fragment, { children: Component }, index))), _jsx(Column, {})] }), obligation && obligation !== 'option_1' && (_jsx(Row, { children: _jsxs(Column, { children: [obligationValues &&
                            obligationValues.map((item) => (_jsx(UserProfileCard, { onEdit: () => handleEditObligation(item.id), onDelete: () => handleDeleteObligation(item.id, pageId), enableEdit: true, name: `${t('obligation')}${item.id + 1}` }, item.id))), _jsx(AddButton, { onClick: openObligation, color: "#FBE54D", value: t('add_obligation'), variant: "none" })] }) }))] }));
};
export default SecondStepForm;
