import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { createSearchParams } from 'react-router-dom';
import { AddButton } from '@components/ui/AddButton';
import { Column } from '@components/ui/Column';
import { FormContainer } from '@components/ui/FormContainer';
import { Row } from '@components/ui/Row';
import { TitleElement } from '@components/ui/TitleElement';
import { UserProfileCard } from '@components/ui/UserProfileCard';
import Divider from '@src/components/ui/Divider/Divider';
import FormCaption from '@src/components/ui/FormCaption/FormCaption';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { AdditionalIncome } from '@src/pages/Services/components/AdditionalIncome';
import { AdditionalIncomeAmount } from '@src/pages/Services/components/AdditionalIncomeAmount';
import { MainSourceOfIncome } from '@src/pages/Services/components/MainSourceOfIncome';
import { Obligation } from '@src/pages/Services/components/Obligation';
import { componentsByIncomeSource } from '@src/pages/Services/constants/componentsByIncomeSource';
import { componentsByObligation } from '@src/pages/Services/constants/componentsByObligation';
import { deleteAdditionalIncomeModal, deleteObligationModal, deleteSourceOfIncomeModal, } from '@src/pages/Services/slices/borrowersSlice.ts';
import { updateMortgageData } from '@src/pages/Services/slices/calculateMortgageSlice.ts';
import { createAdditionalIncomeModal, createObligationModal, createSourceOfIncomeModal, openAdditionalIncomeModal, openObligationModal, openSourceOfIncomeModal, } from '@src/pages/Services/slices/modalSlice.ts';
import { deleteOtherBorrowers, openBorrowersPage, } from '@src/pages/Services/slices/otherBorrowersSlice';
import { generateNewId } from '@src/pages/Services/utils/generateNewId.ts';
// Компонент расчета ипотеки - 3 шаг
const ThirdStepForm = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const navigate = useNavigate();
    const { values } = useFormikContext();
    const { mainSourceOfIncome, additionalIncome, obligation } = values;
    const dispatch = useAppDispatch();
    const sourceOfIncomeValues = useAppSelector((state) => state.borrowers.sourceOfIncomeModal);
    const additionalIncomeValues = useAppSelector((state) => state.borrowers.additionalIncomeModal);
    const obligationValues = useAppSelector((state) => state.borrowers.obligationModal);
    const otherBorrowers = useAppSelector((state) => state.otherBorrowers.otherBorrowers);
    const userData = useAppSelector((state) => state.login.loginData);
    const openSourceOfIncome = () => {
        dispatch(updateMortgageData(values));
        dispatch(createSourceOfIncomeModal());
    };
    const openAdditionalIncome = () => {
        dispatch(updateMortgageData(values));
        dispatch(createAdditionalIncomeModal());
    };
    const openObligation = () => {
        dispatch(updateMortgageData(values));
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
    const handleOpenOtherBorrowers = (id) => {
        dispatch(openBorrowersPage(id));
        const isNew = !otherBorrowers.some((item) => item.id === id);
        const otherBorrowersPageId = isNew ? generateNewId(otherBorrowers) : id;
        navigate({
            pathname: '/services/other-borrowers/1/',
            search: createSearchParams({
                pageId: String(otherBorrowersPageId),
            }).toString(),
        });
    };
    const handleCreateOtherBorrowers = () => {
        dispatch(openBorrowersPage(generateNewId(otherBorrowers)));
        dispatch(updateMortgageData(values));
        navigate({
            pathname: '/services/other-borrowers/1/',
            search: createSearchParams({
                pageId: generateNewId(otherBorrowers).toString(),
            }).toString(),
        });
    };
    const handleDeleteOtherBorrowers = (id) => {
        dispatch(deleteOtherBorrowers(id));
    };
    return (_jsxs(FormContainer, { children: [_jsx(FormCaption, { title: t('calculate_mortgage_step3_title') }), _jsx(UserProfileCard, { name: userData?.nameSurname, phone: userData?.phoneNumber }), _jsxs(Row, { children: [_jsx(MainSourceOfIncome, {}), componentsByIncomeSource[mainSourceOfIncome] &&
                        componentsByIncomeSource[mainSourceOfIncome].map((Component, index) => (_jsx(React.Fragment, { children: Component }, index))), _jsx(Column, {})] }), _jsx(Row, { children: mainSourceOfIncome && (_jsxs(Column, { children: [sourceOfIncomeValues.map((item) => (_jsx(UserProfileCard, { onEdit: () => handleEditSourceOfIncome(item.id), onDelete: () => handleDeleteSourceOfIncome(item.id), enableEdit: true, name: `${t('source_of_income')}${item.id + 1}` }, item.id))), _jsx(AddButton, { onClick: openSourceOfIncome, color: "#FBE54D", value: t('add_place_to_work'), variant: "none" })] })) }), _jsx(Divider, {}), _jsxs(Row, { children: [_jsx(AdditionalIncome, {}), additionalIncome && additionalIncome !== 'option_1' && (_jsx(AdditionalIncomeAmount, {})), _jsx(Column, {})] }), additionalIncome && additionalIncome !== 'option_1' && (_jsx(Row, { children: _jsxs(Column, { children: [additionalIncomeValues.map((item) => (_jsx(UserProfileCard, { onEdit: () => handleEditAdditionalIncome(item.id), onDelete: () => handleDeleteAdditionalIncome(item.id), enableEdit: true, name: `${t('additional_source_of_income')}${item.id + 1}` }, item.id))), _jsx(AddButton, { onClick: openAdditionalIncome, color: "#FBE54D", value: t('add_additional_source_of_income'), variant: "none" })] }) })), _jsx(Divider, {}), _jsxs(Row, { children: [_jsx(Obligation, {}), componentsByObligation[obligation] &&
                        componentsByObligation[obligation].map((Component, index) => (_jsx(React.Fragment, { children: Component }, index))), _jsx(Column, {})] }), obligation && obligation !== 'option_1' && (_jsx(Row, { children: _jsxs(Column, { children: [obligationValues.map((item) => (_jsx(UserProfileCard, { onEdit: () => handleEditObligation(item.id), onDelete: () => handleDeleteObligation(item.id), enableEdit: true, name: `${t('obligation')}${item.id + 1}` }, item.id))), _jsx(AddButton, { onClick: openObligation, color: "#FBE54D", value: t('add_obligation'), variant: "none" })] }) })), _jsx(Divider, {}), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '0.75rem' }, children: [otherBorrowers && _jsx(TitleElement, { title: t('borrower') }), _jsxs(Row, { style: { columnGap: '2rem' }, children: [otherBorrowers.map((item) => (_jsx(Column, { children: _jsx(UserProfileCard, { onEdit: () => handleOpenOtherBorrowers(item.id), onDelete: () => handleDeleteOtherBorrowers(item.id), enableEdit: true, name: item.nameSurname }, item.id) }, item.id))), !otherBorrowers && _jsx(TitleElement, { title: t('borrower') }), _jsx(Column, { children: _jsx(AddButton, { value: t('add_borrower'), onClick: handleCreateOtherBorrowers, style: {
                                        height: '3.5rem',
                                        borderRadius: '0.25rem',
                                        padding: '0',
                                        width: '13.125rem',
                                    } }) }), _jsx(Column, {})] })] })] }));
};
export default ThirdStepForm;
