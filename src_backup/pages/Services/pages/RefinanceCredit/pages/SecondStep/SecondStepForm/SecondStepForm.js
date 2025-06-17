import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Column } from '@components/ui/Column';
import { FormContainer } from '@components/ui/FormContainer';
import { Row } from '@components/ui/Row';
import { UserProfileCard } from '@components/ui/UserProfileCard';
import Divider from '@src/components/ui/Divider/Divider';
import FormCaption from '@src/components/ui/FormCaption/FormCaption';
import { RowTwo } from '@src/components/ui/RowTwo';
import { useAppSelector } from '@src/hooks/store';
import { AddPartner } from '@src/pages/Services/components/AddPartner';
import { AdditionalCitizenship } from '@src/pages/Services/components/AdditionalCitizenships';
import { Birthday } from '@src/pages/Services/components/Birthday';
import { Borrowers } from '@src/pages/Services/components/Borrowers';
import { Childrens } from '@src/pages/Services/components/Childrens';
import { CitizenshipsDropdown } from '@src/pages/Services/components/CitizenshipsDropdown';
import { CountriesPayTaxes } from '@src/pages/Services/components/CountriesPayTaxes';
import { Education } from '@src/pages/Services/components/Education';
import { FamilyStatus } from '@src/pages/Services/components/FamilyStatus';
import { HowMuchChildrens } from '@src/pages/Services/components/HowMuchChildrens';
import { Info } from '@src/pages/Services/components/Info';
import { IsForeigner } from '@src/pages/Services/components/IsForeigner';
import { MedicalInsurance } from '@src/pages/Services/components/MedicalInsurance';
import { NameSurname } from '@src/pages/Services/components/NameSurname';
import { PartnerPayMortgage } from '@src/pages/Services/components/PartnerPayMortgage';
import { PublicPerson } from '@src/pages/Services/components/PublicPerson';
import { Taxes } from '@src/pages/Services/components/Taxes';
// Компонент расчета ипотеки - 2 шаг
const SecondStepForm = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { values } = useFormikContext();
    const userData = useAppSelector((state) => state.login.loginData);
    return (_jsxs(FormContainer, { children: [_jsx(FormCaption, { title: t('calculate_mortgage_step2_title') }), _jsxs(RowTwo, { children: [_jsx(Info, {}), _jsx(UserProfileCard, { name: userData?.nameSurname, phone: userData?.phoneNumber })] }), _jsxs(Row, { children: [_jsx(NameSurname, {}), _jsx(Birthday, {}), _jsx(Education, {})] }), _jsxs(Row, { children: [_jsxs(Column, { style: { gap: '2rem' }, children: [_jsx(AdditionalCitizenship, {}), values.additionalCitizenships === 'yes' && _jsx(CitizenshipsDropdown, {})] }), _jsxs(Column, { style: { gap: '2rem' }, children: [_jsx(Taxes, {}), values.taxes === 'yes' && _jsx(CountriesPayTaxes, {})] }), _jsxs(Column, { style: { gap: '2rem' }, children: [_jsx(Childrens, {}), values.childrens === 'yes' && _jsx(HowMuchChildrens, {})] })] }), _jsx(Divider, {}), _jsxs(Row, { children: [_jsx(MedicalInsurance, {}), _jsx(IsForeigner, {}), _jsx(PublicPerson, {})] }), _jsx(Divider, {}), _jsxs(Row, { children: [_jsx(Borrowers, {}), _jsx(Column, {}), _jsx(Column, {})] }), _jsx(Divider, {}), _jsxs(Row, { children: [_jsx(FamilyStatus, {}), _jsx(Column, { children: values.familyStatus === 'option_2' && _jsx(PartnerPayMortgage, {}) }), _jsx(Column, { children: values.partnerPayMortgage === 'yes' &&
                            values.familyStatus === 'option_2' && _jsx(AddPartner, {}) })] })] }));
};
export default SecondStepForm;
