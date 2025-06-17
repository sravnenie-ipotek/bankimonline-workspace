import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { AlertWarning } from '@components/ui/AlertWarning';
import { FormContainer } from '@components/ui/FormContainer';
import { Row } from '@components/ui/Row';
import FormCaption from '@src/components/ui/FormCaption/FormCaption';
import { useAppSelector } from '@src/hooks/store';
import { BankOffers } from '@src/pages/Services/components/BankOffers';
import { Filter } from '@src/pages/Services/components/Filter';
import { UserParams } from '@src/pages/Services/components/UserParams';
const FourthStepForm = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const userData = useAppSelector((state) => state.login.loginData);
    const creditParameters = useAppSelector((state) => state.credit);
    return (_jsxs(FormContainer, { children: [_jsx(FormCaption, { title: t('calculate_mortgage_final') }), _jsx(UserParams, { credit: creditParameters.loanAmount, nameSurname: userData?.nameSurname, phoneNumber: userData?.phoneNumber }), _jsx(AlertWarning, { text: t('calculate_mortgage_warning') }), _jsx(Row, { children: _jsx(Filter, {}) }), _jsx(BankOffers, {})] }));
};
export default FourthStepForm;
