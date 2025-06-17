import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { AddButton } from '@components/ui/AddButton';
import { Error } from '@components/ui/Error';
import { TitleElement } from '@components/ui/TitleElement';
import { UserProfileCard } from '@components/ui/UserProfileCard';
import { useAppDispatch, useAppSelector } from '@src/hooks/store.ts';
import { updateMortgageData } from '@src/pages/Services/slices/calculateMortgageSlice.ts';
import { deleteBorrowersPersonalData } from '../../slices/borrowersPersonalDataSlice';
const AddPartner = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { values, touched, errors } = useFormikContext();
    const borrowerValue = useAppSelector((state) => state.borrowersPersonalData.borrowersPersonalData);
    return (_jsxs(_Fragment, { children: [_jsx(TitleElement, { title: t('calculate_mortgage_add_partner_title') }), borrowerValue.obligation ? (_jsx(UserProfileCard, { name: borrowerValue.nameSurname, enableEdit: true, onEdit: () => navigate('/services/borrowers-personal-data/1'), onDelete: () => dispatch(deleteBorrowersPersonalData()) })) : (_jsx(AddButton, { value: t('calculate_mortgage_add_partner'), onClick: () => {
                    dispatch(updateMortgageData(values));
                    navigate('/services/borrowers-personal-data/1');
                }, style: { height: '3rem', padding: '0' } })), !borrowerValue.obligation && touched.addPartner && errors.addPartner && (_jsx(Error, { error: errors.addPartner }))] }));
};
export default AddPartner;
