import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Column } from '@src/components/ui/Column';
import { Row } from '@src/components/ui/Row';
import { MortgageParameters } from '../MortgageParameters';
import { PersonalProfile } from '../PersonalProfile';
const UserParams = ({ cost, initialPayment, period, credit, nameSurname, phoneNumber, }) => {
    return (_jsxs(Row, { style: { columnGap: '3rem', justifyContent: 'flex-start' }, children: [_jsx(MortgageParameters, { cost: cost, initialPayment: initialPayment, period: period, credit: credit }), _jsx(PersonalProfile, { name: nameSurname, phone: phoneNumber }), _jsx(Column, {})] }));
};
export default UserParams;
