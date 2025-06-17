import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';
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
import { deleteAdditionalIncomeModal, deleteObligationModal, deleteSourceOfIncomeModal, updateBorrowersPersonalData, } from '@src/pages/Services/slices/borrowersPersonalDataSlice';
import { createAdditionalIncomeModal, createObligationModal, createSourceOfIncomeModal, openAdditionalIncomeModal, openObligationModal, openSourceOfIncomeModal, } from '@src/pages/Services/slices/modalSlice';
const SecondStepForm = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { values } = useFormikContext();
    const { mainSourceOfIncome, additionalIncome, obligation } = values;
    const dispatch = useAppDispatch();
    const sourceOfIncomeValues = useAppSelector((state) => state.borrowersPersonalData.sourceOfIncomeModal);
    const additionalIncomeValues = useAppSelector((state) => state.borrowersPersonalData.additionalIncomeModal);
    const obligationValues = useAppSelector((state) => state.borrowersPersonalData.obligationModal);
    const openSourceOfIncome = () => {
        dispatch(updateBorrowersPersonalData(values));
        dispatch(createSourceOfIncomeModal());
    };
    const openAdditionalIncome = () => {
        dispatch(updateBorrowersPersonalData(values));
        dispatch(createAdditionalIncomeModal());
    };
    const openObligation = () => {
        dispatch(updateBorrowersPersonalData(values));
        dispatch(createObligationModal());
    };
    const handleDeleteSourceOfIncome = (idToDelete) => {
        dispatch(deleteSourceOfIncomeModal({ id: idToDelete }));
    };
    const handleDeleteAdditionalIncome = (idToDelete) => {
        dispatch(deleteAdditionalIncomeModal({ id: idToDelete }));
    };
    const handleDeleteObligation = (idToDelete) => {
        dispatch(deleteObligationModal({ id: idToDelete }));
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
    return (_jsxs(FormContainer, { children: [_jsx(FormCaption, { title: t('borrowers_personal_data_title') }), _jsxs(Row, { children: [_jsx(MainSourceOfIncome, {}), componentsByIncomeSource[mainSourceOfIncome] &&
                        componentsByIncomeSource[mainSourceOfIncome].map((Component, index) => (_jsx(React.Fragment, { children: Component }, index))), _jsx(Column, {})] }), _jsx(Row, { children: mainSourceOfIncome && (_jsxs(Column, { children: [sourceOfIncomeValues.map((item) => (_jsx(UserProfileCard, { onEdit: () => handleEditSourceOfIncome(item.id), onDelete: () => handleDeleteSourceOfIncome(item.id), enableEdit: true, name: `${t('source_of_income')}${item.id + 1}` }, item.id))), _jsx(AddButton, { onClick: openSourceOfIncome, color: "#FBE54D", value: t('add_place_to_work'), variant: "none" })] })) }), _jsx(Divider, {}), _jsxs(Row, { children: [_jsx(AdditionalIncome, {}), additionalIncome && additionalIncome !== 'option_1' && (_jsx(AdditionalIncomeAmount, {})), _jsx(Column, {})] }), additionalIncome && additionalIncome !== 'option_1' && (_jsx(Row, { children: _jsxs(Column, { children: [additionalIncomeValues.map((item) => (_jsx(UserProfileCard, { onEdit: () => handleEditAdditionalIncome(item.id), onDelete: () => handleDeleteAdditionalIncome(item.id), enableEdit: true, name: `${t('additional_source_of_income')}${item.id + 1}` }, item.id))), _jsx(AddButton, { onClick: openAdditionalIncome, color: "#FBE54D", value: t('add_additional_source_of_income'), variant: "none" })] }) })), _jsx(Divider, {}), _jsxs(Row, { children: [_jsx(Obligation, {}), componentsByObligation[obligation] &&
                        componentsByObligation[obligation].map((Component, index) => (_jsx(React.Fragment, { children: Component }, index))), _jsx(Column, {})] }), obligation && obligation !== 'option_1' && (_jsx(Row, { children: _jsxs(Column, { children: [obligationValues.map((item) => (_jsx(UserProfileCard, { onEdit: () => handleEditObligation(item.id), onDelete: () => handleDeleteObligation(item.id), enableEdit: true, name: `${t('obligation')}${item.id + 1}` }, item.id))), _jsx(AddButton, { onClick: openObligation, color: "#FBE54D", value: t('add_obligation'), variant: "none" })] }) }))] }));
};
export default SecondStepForm;
